"""/resources CRUD + visibility toggle — mirrors routes/resources.ts."""
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response

from ..auth import require_auth
from ..db import get_db
from ..schemas import ResourceCreate, ResourceUpdate
from ..serializers import parse_object_id, to_json, utcnow

router = APIRouter(prefix="/resources", dependencies=[Depends(require_auth)])


@router.get("")
async def list_resources(
    unit: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    visible: Optional[str] = None,
):
    db = get_db()
    query: dict = {}

    if unit:
        query["units"] = unit
    if category:
        query["category"] = category
    if visible is not None:
        query["visible"] = visible == "true"
    if search:
        rx = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [{"title": rx}, {"filename": rx}, {"description": rx}]

    resources = await db.resources.find(query).sort("createdAt", -1).to_list(length=None)
    return [to_json(r) for r in resources]


@router.post("", status_code=201)
async def create_resource(body: ResourceCreate, payload: dict = Depends(require_auth)):
    db = get_db()
    now = utcnow()
    doc = {
        "title": body.title,
        "filename": body.filename,
        "description": body.description or "",
        "category": body.category,
        "type": body.type or "PDF",
        "units": body.units or [],
        "visible": body.visible if body.visible is not None else True,
        "uploadedBy": parse_object_id(payload["sub"]),
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.resources.insert_one(doc)
    doc["_id"] = result.inserted_id
    return to_json(doc)


@router.patch("/{resource_id}")
async def update_resource(resource_id: str, body: ResourceUpdate):
    db = get_db()
    oid = parse_object_id(resource_id)

    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    updates["updatedAt"] = utcnow()

    resource = await db.resources.find_one_and_update({"_id": oid}, {"$set": updates}, return_document=True)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return to_json(resource)


@router.patch("/{resource_id}/visibility")
async def toggle_visibility(resource_id: str):
    db = get_db()
    oid = parse_object_id(resource_id)

    resource = await db.resources.find_one({"_id": oid})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    new_visible = not resource.get("visible", True)
    await db.resources.update_one({"_id": oid}, {"$set": {"visible": new_visible, "updatedAt": utcnow()}})
    resource["visible"] = new_visible
    return to_json(resource)


@router.delete("/{resource_id}", status_code=204)
async def delete_resource(resource_id: str):
    db = get_db()
    result = await db.resources.delete_one({"_id": parse_object_id(resource_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resource not found")
    return Response(status_code=204)
