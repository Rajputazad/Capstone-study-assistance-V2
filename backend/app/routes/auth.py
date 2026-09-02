"""Single auth surface for student and admin accounts."""
import bcrypt
import secrets
import smtplib
from email.message import EmailMessage
from datetime import timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException

from .. import config
from ..auth import require_auth, sign_reset_token, sign_token, verify_reset_token
from ..db import get_db
from ..schemas import ForgotPasswordBody, LoginBody, RegisterBody, ResetPasswordBody, VerifyResetOtpBody
from ..serializers import parse_object_id, to_json, utcnow

router = APIRouter(prefix="/auth")


def check_password(plain: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), password_hash.encode())
    except ValueError:
        return False


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=10)).decode()


OTP_TTL_MINUTES = 10


def is_expired(value) -> bool:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value < utcnow()


def send_reset_email(to_email: str, otp: str) -> None:
    if not config.SMTP_LOGIN or not config.SMTP_PASSWORD or not config.SMTP_SENDER_EMAIL:
        raise HTTPException(status_code=500, detail="Password reset email is not configured")

    message = EmailMessage()
    message["Subject"] = f"{otp} is your Capstone reset code"
    message["From"] = f"{config.SMTP_SENDER_NAME} <{config.SMTP_SENDER_EMAIL}>"
    message["To"] = to_email
    message["Reply-To"] = config.SMTP_SENDER_EMAIL
    message.set_content(
        "\n".join(
            [
                "Capstone Study Assistant password reset",
                "",
                "Your reset code is:",
                otp,
                "",
                f"This code expires in {OTP_TTL_MINUTES} minutes.",
                "",
                "If you did not request this, you can ignore this email.",
            ],
        ),
    )
    message.add_alternative(
        f"""
        <html>
          <body style="font-family: Arial, Helvetica, sans-serif; color: #111827;">
            <h2>Capstone Study Assistant password reset</h2>
            <p>Your reset code is:</p>
            <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #e72329;">{otp}</p>
            <p>This code expires in {OTP_TTL_MINUTES} minutes.</p>
            <p>If you did not request this, you can ignore this email.</p>
          </body>
        </html>
        """,
        subtype="html",
    )

    if config.SMTP_USE_TLS:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=15) as smtp:
            smtp.starttls()
            smtp.login(config.SMTP_LOGIN, config.SMTP_PASSWORD)
            smtp.send_message(message)
    else:
        with smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, timeout=15) as smtp:
            smtp.login(config.SMTP_LOGIN, config.SMTP_PASSWORD)
            smtp.send_message(message)

    print(f"[auth] reset OTP email accepted by {config.SMTP_HOST} for {to_email}")


async def find_account_by_email(db, email: str):
    student_first = "@student." in email or email.endswith("@student.swin.edu.au")
    collections = [("students", "Student"), ("admins", "Admin")]
    if not student_first:
        collections.reverse()

    for collection_name, role in collections:
        account = await db[collection_name].find_one({"email": email})
        if account:
            return account, role

    return None, None


@router.post("/login")
async def login(body: LoginBody):
    db = get_db()
    email = body.email.lower()
    account, role = await find_account_by_email(db, email)

    if not account or not check_password(body.password, account.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if account.get("status") != "Active":
        raise HTTPException(status_code=403, detail="This account is inactive")

    now = utcnow()
    collection_name = "admins" if role == "Admin" else "students"
    await db[collection_name].update_one({"_id": account["_id"]}, {"$set": {"lastLogin": now, "updatedAt": now}})
    account["lastLogin"] = now
    account["updatedAt"] = now

    token = sign_token(sub=str(account["_id"]), email=account["email"], role=role)
    user = to_json(account)
    key = "admin" if role == "Admin" else "student"
    return {"token": token, "role": role, "user": user, key: user}


@router.post("/register", status_code=201)
async def register(body: RegisterBody):
    db = get_db()
    now = utcnow()
    email = body.email.lower()

    primary_unit = body.primaryUnit.strip().upper()
    doc = {
        "name": body.name,
        "studentId": body.studentId,
        "email": email,
        "passwordHash": hash_password(body.password),
        "role": "Student",
        "approvedUnits": [primary_unit] if primary_unit else [],
        "pendingUnits": [],
        "status": "Active",
        "lastLogin": now,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.students.insert_one(doc)
    doc["_id"] = result.inserted_id
    token = sign_token(sub=str(doc["_id"]), email=email, role="Student")
    user = to_json(doc)
    return {"token": token, "role": "Student", "user": user, "student": user}


@router.post("/forgot-password")
@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordBody):
    db = get_db()
    email = body.email.lower()
    account, role = await find_account_by_email(db, email)

    otp = None

    if account:
        otp = f"{secrets.randbelow(1_000_000):06d}"
        now = utcnow()
        await db.passwordresets.delete_many({"email": email})
        await db.passwordresets.insert_one(
            {
                "email": email,
                "accountId": account["_id"],
                "role": role,
                "otpHash": hash_password(otp),
                "createdAt": now,
                "expiresAt": now + timedelta(minutes=OTP_TTL_MINUTES),
            },
        )
        send_reset_email(email, otp)

    response = {"message": "If an account exists, a 6-digit reset code has been sent."}
    if config.DEV_SHOW_RESET_OTP and otp:
        response["devOtp"] = otp
    return response


@router.post("/verify-reset-otp")
async def verify_reset_otp(body: VerifyResetOtpBody):
    db = get_db()
    email = body.email.lower()
    reset = await db.passwordresets.find_one({"email": email})

    if not reset:
        raise HTTPException(status_code=401, detail="Invalid or expired reset code")

    if is_expired(reset.get("expiresAt")):
        await db.passwordresets.delete_one({"_id": reset["_id"]})
        raise HTTPException(status_code=401, detail="Invalid or expired reset code")

    if not check_password(body.otp, reset.get("otpHash", "")):
        raise HTTPException(status_code=401, detail="Invalid or expired reset code")

    await db.passwordresets.delete_many({"email": email})
    token = sign_reset_token(sub=str(reset["accountId"]), email=email, role=reset.get("role", "Student"))
    return {"token": token, "message": "Code verified. You can reset your password now."}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordBody):
    payload = verify_reset_token(body.token)
    db = get_db()
    collection_name = "admins" if payload.get("role") == "Admin" else "students"
    now = utcnow()

    result = await db[collection_name].update_one(
        {"_id": parse_object_id(payload["sub"]), "email": payload.get("email")},
        {"$set": {"passwordHash": hash_password(body.password), "updatedAt": now}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")

    return {"message": "Password updated. You can sign in now."}


@router.get("/me")
async def me(payload: dict = Depends(require_auth)):
    db = get_db()
    collection_name = "admins" if payload.get("role") == "Admin" else "students"
    user = await db[collection_name].find_one({"_id": parse_object_id(payload["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"role": payload.get("role"), "user": to_json(user)}
