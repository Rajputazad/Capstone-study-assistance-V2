"""Shared toJSON transform: exposes `id` instead of `_id`, hides `passwordHash`,
and stringifies ObjectIds / datetimes so responses match what the admin app expects.
"""
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import HTTPException


def to_json(doc: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in doc.items():
        if key == "passwordHash":
            continue
        if key == "_id":
            out["id"] = str(value)
            continue
        out[key] = _convert(value)
    return out


def _convert(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        # Match Mongoose's JSON output: ISO-8601 with a Z suffix.
        return value.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    if isinstance(value, list):
        return [_convert(v) for v in value]
    if isinstance(value, dict):
        return {k: _convert(v) for k, v in value.items()}
    return value


def parse_object_id(value: str) -> ObjectId:
    """Equivalent of Mongoose CastError -> 400 'Invalid id'."""
    try:
        return ObjectId(value)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
