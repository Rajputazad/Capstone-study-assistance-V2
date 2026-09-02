"""/students CRUD + unit grant/revoke — mirrors routes/students.ts."""
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response

from ..auth import require_auth
from ..db import get_db
from ..schemas import StudentCreate, StudentUpdate, UnitActionBody
from ..serializers import parse_object_id, to_json, utcnow

router = APIRouter(prefix="/students", dependencies=[Depends(require_auth)])


@router.get("")
async def list_students(search: Optional[str] = None, unit: Optional[str] = None, status: Optional[str] = None):
    db = get_db()
    query: dict = {}

    if search:
        rx = {"$regex": re.escape(search), "$options": "i"}
        query["$or"] = [{"name": rx}, {"email": rx}, {"studentId": rx}]
    if unit:
        query["approvedUnits"] = unit
    if status:
        query["status"] = status

    students = await db.students.find(query).sort("name", 1).to_list(length=None)
    return [to_json(s) for s in students]


@router.get("/{student_id}")
async def get_student(student_id: str):
    db = get_db()
    student = await db.students.find_one({"_id": parse_object_id(student_id)})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return to_json(student)


@router.post("", status_code=201)
async def create_student(body: StudentCreate):
    db = get_db()
    now = utcnow()
    doc = {
        "name": body.name,
        "studentId": body.studentId,
        "email": body.email.lower(),
        "approvedUnits": body.approvedUnits or [],
        "pendingUnits": body.pendingUnits or [],
        "status": body.status or "Active",
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.students.insert_one(doc)
    doc["_id"] = result.inserted_id
    return to_json(doc)


@router.patch("/{student_id}")
async def update_student(student_id: str, body: StudentUpdate):
    db = get_db()
    oid = parse_object_id(student_id)

    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if "email" in updates:
        updates["email"] = updates["email"].lower()
    updates["updatedAt"] = utcnow()

    student = await db.students.find_one_and_update({"_id": oid}, {"$set": updates}, return_document=True)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return to_json(student)


@router.patch("/{student_id}/units")
async def grant_or_revoke_unit(student_id: str, body: UnitActionBody):
    db = get_db()
    oid = parse_object_id(student_id)

    student = await db.students.find_one({"_id": oid})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    pending = [u for u in student.get("pendingUnits", []) if u != body.unitCode]
    approved = [u for u in student.get("approvedUnits", []) if u != body.unitCode]
    if body.action == "grant":
        approved.append(body.unitCode)

    await db.students.update_one(
        {"_id": oid},
        {"$set": {"pendingUnits": pending, "approvedUnits": approved, "updatedAt": utcnow()}},
    )
    student["pendingUnits"] = pending
    student["approvedUnits"] = approved
    return to_json(student)


@router.delete("/{student_id}", status_code=204)
async def delete_student(student_id: str):
    db = get_db()
    oid = parse_object_id(student_id)

    student = await db.students.find_one_and_delete({"_id": oid})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    await db.unitaccessrequests.delete_many({"student": oid})
    return Response(status_code=204)
