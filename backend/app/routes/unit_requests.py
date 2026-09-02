"""/unit-requests — mirrors routes/unitRequests.ts."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from ..auth import require_admin
from ..db import get_db
from ..schemas import UnitRequestCreate, UnitRequestDecision
from ..serializers import parse_object_id, to_json, utcnow

router = APIRouter(prefix="/unit-requests", dependencies=[Depends(require_admin)])


@router.get("")
async def list_requests(status: Optional[str] = None):
    db = get_db()
    query = {"status": status} if status else {}
    requests = await db.unitaccessrequests.find(query).sort("requestedAt", -1).to_list(length=None)
    return [to_json(r) for r in requests]


@router.post("", status_code=201)
async def create_request(body: UnitRequestCreate):
    db = get_db()

    student = await db.students.find_one({"studentId": body.studentId})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if body.requestingUnit in student.get("approvedUnits", []):
        raise HTTPException(status_code=409, detail="Student already has access to this unit")

    if body.requestingUnit not in student.get("pendingUnits", []):
        await db.students.update_one(
            {"_id": student["_id"]},
            {"$push": {"pendingUnits": body.requestingUnit}, "$set": {"updatedAt": utcnow()}},
        )

    now = utcnow()
    doc = {
        "student": student["_id"],
        "name": student["name"],
        "studentId": student["studentId"],
        "currentUnits": student.get("approvedUnits", []),
        "requestingUnit": body.requestingUnit,
        "reason": body.reason or "",
        "status": "Pending",
        "requestedAt": now,
        "decidedAt": None,
        "decidedBy": None,
        "createdAt": now,
        "updatedAt": now,
    }
    result = await db.unitaccessrequests.insert_one(doc)
    doc["_id"] = result.inserted_id
    return to_json(doc)


@router.patch("/{request_id}")
async def decide_request(request_id: str, body: UnitRequestDecision, payload: dict = Depends(require_admin)):
    db = get_db()
    oid = parse_object_id(request_id)

    request = await db.unitaccessrequests.find_one({"_id": oid})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    if request.get("status") != "Pending":
        raise HTTPException(status_code=409, detail=f"Request already {request['status'].lower()}")

    now = utcnow()
    decided_by = parse_object_id(payload["sub"])
    await db.unitaccessrequests.update_one(
        {"_id": oid},
        {"$set": {"status": body.status, "decidedAt": now, "decidedBy": decided_by, "updatedAt": now}},
    )
    request.update({"status": body.status, "decidedAt": now, "decidedBy": decided_by, "updatedAt": now})

    student = await db.students.find_one({"_id": request["student"]})
    if student:
        pending = [u for u in student.get("pendingUnits", []) if u != request["requestingUnit"]]
        approved = list(student.get("approvedUnits", []))
        if body.status == "Approved" and request["requestingUnit"] not in approved:
            approved.append(request["requestingUnit"])
        await db.students.update_one(
            {"_id": student["_id"]},
            {"$set": {"pendingUnits": pending, "approvedUnits": approved, "updatedAt": now}},
        )

    return to_json(request)
