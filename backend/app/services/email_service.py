import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings


class EmailSendError(Exception):
    pass


def _send_email(to_email: str, subject: str, body: str) -> None:
    if not settings.SMTP_EMAIL or not settings.SMTP_APP_PASSWORD:
        raise EmailSendError(
            "SMTP_EMAIL / SMTP_APP_PASSWORD are not configured in .env -- "
            "see the setup note in config.py."
        )

    msg = MIMEMultipart()
    from_email = settings.SMTP_EMAIL.strip()
    app_pwd = settings.SMTP_APP_PASSWORD.replace(" ", "").strip()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(from_email, app_pwd)
            server.sendmail(from_email, to_email, msg.as_string())
    except smtplib.SMTPAuthenticationError as e:
        raise EmailSendError(
            "Gmail rejected the login -- make sure SMTP_APP_PASSWORD is a 16-character "
            "App Password (not your normal Gmail password) and that 2-Step "
            "Verification is enabled on the account."
        ) from e
    except Exception as e:
        raise EmailSendError(f"Failed to send email: {e}") from e


def send_verification_email(to_email: str, code: str) -> None:
    subject = "Verify your Mystic Insights account"
    body = (
        f"Welcome to Mystic Insights!\n\n"
        f"Your verification code is: {code}\n\n"
        f"This code expires in 10 minutes. Enter it in the app to activate your account."
    )
    _send_email(to_email, subject, body)


def send_otp_email(to_email: str, code: str) -> None:
    subject = "Your Mystic Insights login code"
    body = (
        f"Your one-time login code is: {code}\n\n"
        f"This code expires in 10 minutes. If you didn't try to log in, "
        f"you can safely ignore this email."
    )
    _send_email(to_email, subject, body)


def send_notification_email(to_email: str, title: str, message: str, meta: str = None) -> None:
    subject = f"✦ Mystic Insights Alert: {title}"
    body = (
        f"✦ MYSTIC INSIGHTS CELESTIAL PORTAL ✦\n"
        f"---------------------------------------------------\n\n"
        f"Notification: {title}\n\n"
        f"{message}\n\n"
    )
    if meta:
        body += f"Session Details: {meta}\n\n"
    body += (
        f"---------------------------------------------------\n"
        f"Access your dashboard to review consultations or join live rooms:\n"
        f"http://localhost:5173\n\n"
        f"Blessings on your celestial path,\n"
        f"The Mystic Insights Team"
    )
    _send_email(to_email, subject, body)