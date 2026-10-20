from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from html import escape
from pathlib import Path

from dotenv import load_dotenv


# ============================================================
# Load backend/.env
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE, override=True)


# ============================================================
# Resend configuration
# ============================================================

RESEND_API_URL = "https://api.resend.com/emails"

APP_USER_AGENT = (
    "AI-Palmistry-Tarot-Intelligence-Platform/1.0"
)


def _config() -> dict:
    return {
        "api_key": os.getenv(
            "RESEND_API_KEY",
            "",
        ).strip(),

        "from_email": os.getenv(
            "RESEND_FROM_EMAIL",
            "",
        ).strip(),

        "from_name": os.getenv(
            "RESEND_FROM_NAME",
            "AI Palmistry & Tarot",
        ).strip(),

        "frontend_origin": os.getenv(
            "FRONTEND_ORIGIN",
            "http://localhost:5173",
        ).strip(),
    }


# ============================================================
# HTML email
# ============================================================

def _html(
    title: str,
    message: str,
    action_path: str | None,
    origin: str,
) -> str:

    button = ""

    if action_path:
        url = (
            f"{origin.rstrip('/')}"
            f"{action_path}"
        )

        button = f"""
        <p style="margin-top:24px;">
            <a
                href="{escape(url)}"
                style="
                    display:inline-block;
                    padding:12px 20px;
                    background:#79543a;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:700;
                "
            >
                Open notification
            </a>
        </p>
        """

    return f"""
    <!doctype html>

    <html>
    <body
        style="
            margin:0;
            background:#f6eee3;
            font-family:Arial,sans-serif;
            color:#4b3024;
        "
    >

        <div
            style="
                max-width:620px;
                margin:35px auto;
                padding:32px;
                background:#fffaf4;
                border:1px solid #e5d5c2;
                border-radius:16px;
            "
        >

            <p
                style="
                    font-size:12px;
                    letter-spacing:2px;
                    color:#9a6c45;
                    font-weight:700;
                "
            >
                AI PALMISTRY &amp; TAROT
            </p>

            <h1
                style="
                    font-family:Georgia,serif;
                    font-size:28px;
                    margin:12px 0;
                    color:#4b3024;
                "
            >
                {escape(title)}
            </h1>

            <p
                style="
                    font-size:16px;
                    line-height:1.7;
                    color:#765d49;
                "
            >
                {escape(message)}
            </p>

            {button}

            <hr
                style="
                    border:0;
                    border-top:1px solid #eadbc6;
                    margin:28px 0;
                "
            >

            <p
                style="
                    font-size:12px;
                    color:#9b8876;
                "
            >
                This message was sent by your AI Palmistry &amp; Tarot
                notification system.
            </p>

        </div>

    </body>
    </html>
    """


# ============================================================
# Send email through Resend
# ============================================================

def send_notification_email(
    recipient: str | None,
    title: str,
    message: str,
    action_path: str | None = None,
) -> dict:

    config = _config()

    # --------------------------------------------------------
    # Validate recipient
    # --------------------------------------------------------

    if not recipient:
        return {
            "ok": False,
            "message": (
                "The user account has no email address."
            ),
        }

    # --------------------------------------------------------
    # Validate API key
    # --------------------------------------------------------

    if not config["api_key"]:

        return {
            "ok": False,
            "message": (
                "RESEND_API_KEY is missing from "
                "backend/.env."
            ),
        }

    # --------------------------------------------------------
    # Validate sender
    # --------------------------------------------------------

    if not config["from_email"]:

        return {
            "ok": False,
            "message": (
                "RESEND_FROM_EMAIL is missing from "
                "backend/.env."
            ),
        }

    # --------------------------------------------------------
    # Build request body
    # --------------------------------------------------------

    payload = {
        "from": (
            f'{config["from_name"]} '
            f'<{config["from_email"]}>'
        ),

        "to": [
            recipient
        ],

        "subject": title,

        "html": _html(
            title=title,
            message=message,
            action_path=action_path,
            origin=config["frontend_origin"],
        ),

        "text": (
            f"{title}\n\n"
            f"{message}"
        ),
    }

    # --------------------------------------------------------
    # Create HTTP request
    # --------------------------------------------------------

    request = urllib.request.Request(
        RESEND_API_URL,

        data=json.dumps(
            payload
        ).encode("utf-8"),

        headers={
            "Authorization": (
                f'Bearer {config["api_key"]}'
            ),

            "Content-Type": (
                "application/json"
            ),

            # IMPORTANT:
            # Resend/Cloudflare requires a
            # proper User-Agent for raw API requests.
            "User-Agent": APP_USER_AGENT,

            "Accept": (
                "application/json"
            ),
        },

        method="POST",
    )

    # --------------------------------------------------------
    # Send request
    # --------------------------------------------------------

    try:

        with urllib.request.urlopen(
            request,
            timeout=20,
        ) as response:

            response_body = (
                response
                .read()
                .decode("utf-8")
            )

            # ------------------------------------------------
            # Success
            # ------------------------------------------------

            if 200 <= response.status < 300:

                try:
                    response_data = json.loads(
                        response_body
                    )
                except Exception:
                    response_data = {}

                return {
                    "ok": True,

                    "message": (
                        "Email sent successfully."
                    ),

                    "provider": "resend",

                    "id": response_data.get(
                        "id"
                    ),
                }

            # ------------------------------------------------
            # Unexpected status
            # ------------------------------------------------

            return {
                "ok": False,

                "message": (
                    f"Resend returned HTTP "
                    f"{response.status}: "
                    f"{response_body[:700]}"
                ),
            }

    # --------------------------------------------------------
    # HTTP error
    # --------------------------------------------------------

    except urllib.error.HTTPError as exc:

        try:

            body = (
                exc
                .read()
                .decode("utf-8")
            )

        except Exception:

            body = str(exc)

        # ----------------------------------------------------
        # Resend / Cloudflare 1010
        # ----------------------------------------------------

        if (
            exc.code == 403
            and "1010" in body
        ):

            return {
                "ok": False,

                "message": (
                    "Resend rejected the request "
                    "with error 1010. "
                    "The request was blocked before "
                    "email delivery. Check the "
                    "User-Agent configuration."
                ),
            }

        # ----------------------------------------------------
        # Authentication error
        # ----------------------------------------------------

        if exc.code in (
            401,
            403,
        ):

            return {
                "ok": False,

                "message": (
                    "Resend rejected the request. "
                    "Check your RESEND_API_KEY and "
                    "Resend account permissions. "
                    f"Provider response: {body[:500]}"
                ),
            }

        # ----------------------------------------------------
        # Other provider errors
        # ----------------------------------------------------

        return {
            "ok": False,

            "message": (
                "Resend rejected the email: "
                f"{body[:700]}"
            ),
        }

    # --------------------------------------------------------
    # Network error
    # --------------------------------------------------------

    except urllib.error.URLError as exc:

        return {
            "ok": False,

            "message": (
                "Could not connect to Resend: "
                f"{exc.reason}"
            ),
        }

    # --------------------------------------------------------
    # Unexpected error
    # --------------------------------------------------------

    except Exception as exc:

        return {
            "ok": False,

            "message": (
                "Email sending failed: "
                f"{exc}"
            ),
        }