import logging
import os
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import LoginResponse, UserResponse
from app.security import hash_password, verify_password, create_access_token

logger = logging.getLogger("palmistry.google_oauth")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

ALLOWED_ROLES = {"user", "tarot_reader", "consultant", "admin"}
GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").rstrip("/")
BACKEND_ORIGIN = os.getenv("BACKEND_ORIGIN", "http://localhost:8000").rstrip("/")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_OAUTH_CLIENT_SECRET", "").strip()
GOOGLE_CALLBACK_URL = f"{BACKEND_ORIGIN}/api/auth/google/callback"
OAUTH_STATE_COOKIE = "palmistry_google_oauth_state"


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="user", min_length=1, max_length=30)


def _require_google_config():
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        logger.error(
            "Google OAuth configuration missing: client_id_set=%s, client_secret_set=%s",
            bool(GOOGLE_CLIENT_ID),
            bool(GOOGLE_CLIENT_SECRET),
        )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured on the server.",
        )


def _error_redirect():
    return RedirectResponse(
        url=f"{FRONTEND_ORIGIN}/login?google_error=1",
        status_code=status.HTTP_303_SEE_OTHER,
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower().strip()
    role = payload.role.lower().strip()

    if role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid role. Choose User, Tarot Reader, Spiritual Consultant, or Administrator.",
        )

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        full_name=payload.full_name.strip(),
        email=email,
        hashed_password=hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == form.username.lower().strip())
        .first()
    )
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive",
        )
    return LoginResponse(access_token=create_access_token(str(user.id)))


@router.get("/google/login")
def google_login():
    _require_google_config()
    state = secrets.token_urlsafe(32)
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_CALLBACK_URL,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "prompt": "select_account",
    }
    response = RedirectResponse(
        url=f"{GOOGLE_AUTHORIZE_URL}?{urlencode(params)}",
        status_code=status.HTTP_302_FOUND,
    )
    response.set_cookie(
        key=OAUTH_STATE_COOKIE,
        value=state,
        max_age=600,
        httponly=True,
        secure=os.getenv("OAUTH_COOKIE_SECURE", "false").lower() == "true",
        samesite="lax",
        path="/api/auth/google",
    )
    logger.info("Started Google OAuth; callback configured as %s", GOOGLE_CALLBACK_URL)
    return response


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if error:
        logger.warning("Google returned an OAuth error: %s", error)
        return _error_redirect()

    if not code or not state:
        logger.warning("Google callback missing authorization code or state")
        return _error_redirect()

    cookie_state = request.cookies.get(OAUTH_STATE_COOKIE)
    if not cookie_state:
        logger.warning("Google OAuth callback has no state cookie")
        return _error_redirect()

    if not secrets.compare_digest(cookie_state, state):
        logger.warning("Google OAuth state cookie did not match callback state")
        return _error_redirect()

    try:
        _require_google_config()

        async with httpx.AsyncClient(timeout=15.0) as client:
            token_response = await client.post(
                GOOGLE_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_CALLBACK_URL,
                    "grant_type": "authorization_code",
                },
                headers={"Accept": "application/json"},
            )

            if token_response.status_code != 200:
                # Log only the HTTP status and Google's error code, never the code,
                # client secret, access token, or full response body.
                try:
                    token_error = token_response.json().get("error", "unknown_error")
                except ValueError:
                    token_error = "unparseable_error_response"
                logger.error(
                    "Google token exchange failed: HTTP %s; error=%s; redirect_uri=%s",
                    token_response.status_code,
                    token_error,
                    GOOGLE_CALLBACK_URL,
                )
                return _error_redirect()

            token_data = token_response.json()
            google_access_token = token_data.get("access_token")
            if not google_access_token:
                logger.error("Google token exchange response did not contain an access token")
                return _error_redirect()

            profile_response = await client.get(
                GOOGLE_USERINFO_URL,
                headers={
                    "Authorization": f"Bearer {google_access_token}",
                    "Accept": "application/json",
                },
            )

            if profile_response.status_code != 200:
                logger.error(
                    "Google userinfo request failed with HTTP %s",
                    profile_response.status_code,
                )
                return _error_redirect()

            google_profile = profile_response.json()

        email = str(google_profile.get("email", "")).strip().lower()
        full_name = str(google_profile.get("name", "")).strip()
        email_verified = google_profile.get("email_verified") is True

        if not email or not email_verified or not full_name:
            logger.warning(
                "Google profile rejected: email_present=%s, name_present=%s, email_verified=%s",
                bool(email),
                bool(full_name),
                email_verified,
            )
            return _error_redirect()

        user = db.query(User).filter(User.email == email).first()
        if user:
            if not user.is_active:
                logger.warning("Google login rejected for an inactive existing account")
                return _error_redirect()
        else:
            user = User(
                full_name=full_name[:120],
                email=email,
                hashed_password=hash_password(secrets.token_urlsafe(48)),
                role="user",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        app_token = create_access_token(str(user.id))
        response = RedirectResponse(
            url=f"{FRONTEND_ORIGIN}/login#access_token={app_token}",
            status_code=status.HTTP_303_SEE_OTHER,
        )
        response.delete_cookie(
            key=OAUTH_STATE_COOKIE,
            path="/api/auth/google",
            httponly=True,
            secure=os.getenv("OAUTH_COOKIE_SECURE", "false").lower() == "true",
            samesite="lax",
        )
        logger.info("Google OAuth completed successfully; redirecting to frontend")
        return response

    except httpx.HTTPError as exc:
        logger.error("Google OAuth HTTP request failed: %s", type(exc).__name__)
        db.rollback()
        return _error_redirect()
    except HTTPException as exc:
        logger.error("Google OAuth configuration/request error: HTTP %s", exc.status_code)
        db.rollback()
        return _error_redirect()
    except Exception as exc:
        # Keep diagnostic output useful without printing credentials or OAuth tokens.
        logger.exception("Google OAuth callback failed with exception type %s", type(exc).__name__)
        db.rollback()
        return _error_redirect()


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
