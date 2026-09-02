"""JWT helpers. Mirrors middleware/auth.ts (7-day tokens, Bearer scheme)."""
import time

import jwt
from fastapi import HTTPException, Request

from . import config

TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60  # 7d, same as the Node version


def sign_token(sub: str, email: str) -> str:
    if not config.JWT_SECRET:
        raise RuntimeError("JWT_SECRET is not set")
    now = int(time.time())
    payload = {"sub": sub, "email": email, "role": "Admin", "iat": now, "exp": now + TOKEN_TTL_SECONDS}
    return jwt.encode(payload, config.JWT_SECRET, algorithm="HS256")


def require_auth(request: Request) -> dict:
    """FastAPI dependency. Returns the decoded payload or raises 401."""
    header = request.headers.get("authorization", "")
    token = header[7:] if header.startswith("Bearer ") else None

    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")

    try:
        return jwt.decode(token, config.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
