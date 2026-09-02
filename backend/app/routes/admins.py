"""/admins CRUD — mirrors routes/admins.ts."""
from fastapi import APIRouter, Depends, HTTPException, Response

from ..auth import require_admin
from ..db import get_db
from ..schemas import AdminCreate, AdminUpdate
from ..serializers import parse_object_id, to_json, utcnow
from .auth import hash_password

router = APIRouter(prefix="/admins", dependencies=[Depends(require_admin)])


@router.get("")
async def list_admins():
    db = get_db()
    admins = await db.admins.find().sort("createdAt", -1).to_list(length=None)
    return [to_json(a) for a in admins]


@router.post("", status_code=201)
async def create_admin(body: AdminCreate):
    db = get_db()
    now = utcnow()
    doc = {
        "name": body.name,
        "email": body.email.lower(),
        "passwordHash": hash_password(body.password),
        "role": "Admin",
        "status": "Active",
        "lastLogin": None,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.admins.insert_one(doc)
    doc["_id"] = result.inserted_id
    return to_json(doc)


@router.patch("/{admin_id}")
async def update_admin(admin_id: str, body: AdminUpdate):
    db = get_db()
    oid = parse_object_id(admin_id)

    admin = await db.admins.find_one({"_id": oid})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    updates: dict = {"updatedAt": utcnow()}
    if body.name:
        updates["name"] = body.name
    if body.status:
        updates["status"] = body.status
    if body.password:
        updates["passwordHash"] = hash_password(body.password)

    await db.admins.update_one({"_id": oid}, {"$set": updates})
    admin.update(updates)
    return to_json(admin)


@router.patch("/{admin_id}/toggle")
async def toggle_admin(admin_id: str):
    db = get_db()
    oid = parse_object_id(admin_id)

    admin = await db.admins.find_one({"_id": oid})
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    new_status = "Inactive" if admin.get("status") == "Active" else "Active"
    await db.admins.update_one({"_id": oid}, {"$set": {"status": new_status, "updatedAt": utcnow()}})
    admin["status"] = new_status
    return to_json(admin)


@router.delete("/{admin_id}", status_code=204)
async def delete_admin(admin_id: str, payload: dict = Depends(require_admin)):
    if admin_id == payload["sub"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    db = get_db()
    result = await db.admins.delete_one({"_id": parse_object_id(admin_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return Response(status_code=204)
