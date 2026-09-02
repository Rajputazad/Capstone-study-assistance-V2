"""POST /auth/login and GET /auth/me — mirrors routes/auth.ts."""
import bcrypt
from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_auth, sign_token
from ..db import get_db
from ..schemas import LoginBody
from ..serializers import parse_object_id, to_json, utcnow

router = APIRouter(prefix="/auth")


def check_password(plain: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), password_hash.encode())
    except ValueError:
        return False


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=10)).decode()


@router.post("/login")
async def login(body: LoginBody):
    db = get_db()
    admin = await db.admins.find_one({"email": body.email.lower()})

    if not admin or not check_password(body.password, admin.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if admin.get("status") != "Active":
        raise HTTPException(status_code=403, detail="This account is inactive")

    now = utcnow()
    await db.admins.update_one({"_id": admin["_id"]}, {"$set": {"lastLogin": now, "updatedAt": now}})
    admin["lastLogin"] = now
    admin["updatedAt"] = now

    token = sign_token(sub=str(admin["_id"]), email=admin["email"])
    return {"token": token, "admin": to_json(admin)}


@router.get("/me")
async def me(payload: dict = Depends(require_auth)):
    db = get_db()
    admin = await db.admins.find_one({"_id": parse_object_id(payload["sub"])})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    return to_json(admin)
