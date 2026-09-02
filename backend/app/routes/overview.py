"""GET /overview — dashboard counters + latest requests. Mirrors routes/overview.ts."""
import asyncio

from fastapi import APIRouter, Depends

from ..auth import require_auth
from ..db import get_db
from ..serializers import to_json

router = APIRouter(prefix="/overview", dependencies=[Depends(require_auth)])


@router.get("")
async def overview():
    db = get_db()

    total_students, pending_requests, total_resources, units, recent = await asyncio.gather(
        db.students.count_documents({}),
        db.unitaccessrequests.count_documents({"status": "Pending"}),
        db.resources.count_documents({}),
        db.resources.distinct("units"),
        db.unitaccessrequests.find().sort("requestedAt", -1).limit(5).to_list(length=5),
    )

    return {
        "totalStudents": total_students,
        "pendingRequests": pending_requests,
        "activeUnits": len(units),
        "totalResources": total_resources,
        "recentRequests": [to_json(r) for r in recent],
    }
