"""Seeds the first admin + demo data. Mirrors src/seed.ts.

Run:  python seed.py
"""
import asyncio
import sys

from app import config
from app.db import close_db, connect_db
from app.routes.auth import hash_password
from app.serializers import utcnow

STUDENTS = [
    {"name": "Sarah Lee", "studentId": "104567890", "email": "sarah.lee@student.edu.au", "approvedUnits": ["COS40005"], "pendingUnits": ["COS40006"], "status": "Active"},
    {"name": "Jordan Tan", "studentId": "104123456", "email": "jordan.tan@student.edu.au", "approvedUnits": ["COS40005", "COS40006"], "pendingUnits": [], "status": "Active"},
    {"name": "Priya Sharma", "studentId": "104234567", "email": "priya.sharma@student.edu.au", "approvedUnits": ["EAT40005"], "pendingUnits": ["EAT40006"], "status": "Active"},
    {"name": "Marcus Wong", "studentId": "104345678", "email": "marcus.wong@student.edu.au", "approvedUnits": ["EAT40005", "EAT40006"], "pendingUnits": [], "status": "Active"},
    {"name": "Anika Patel", "studentId": "104456789", "email": "anika.patel@student.edu.au", "approvedUnits": ["COS40006"], "pendingUnits": [], "status": "Active"},
]

RESOURCES = [
    {"title": "AI Usage Guideline", "filename": "AI Usage Guideline.pdf", "category": "AI Guidelines", "type": "PDF", "units": ["COS40005", "COS40006", "EAT40005", "EAT40006"], "visible": True, "description": "How AI tools may be used in capstone work."},
    {"title": "Capstone Submission Templates", "filename": "Capstone Templates.zip", "category": "Templates", "type": "ZIP", "units": ["COS40005", "EAT40005"], "visible": True, "description": "Report and presentation templates."},
    {"title": "Project B Assessment Brief", "filename": "Project B Brief.pdf", "category": "Assessment", "type": "PDF", "units": ["COS40006", "EAT40006"], "visible": True, "description": "Marking rubric and deliverables."},
]

REQUESTS = [
    {"studentId": "104234567", "requestingUnit": "EAT40006", "reason": "Continuing into semester 2 — need Project B materials.", "status": "Pending"},
    {"studentId": "104567890", "requestingUnit": "COS40006", "reason": "Enrolled in the continuation unit and need Project B resources.", "status": "Pending"},
]


async def seed() -> None:
    db = await connect_db()

    await asyncio.gather(
        db.admins.delete_many({}),
        db.students.delete_many({}),
        db.resources.delete_many({}),
        db.unitaccessrequests.delete_many({}),
    )

    email = config.SEED_ADMIN_EMAIL
    password = config.SEED_ADMIN_PASSWORD
    now = utcnow()

    admin_result = await db.admins.insert_one({
        "name": "Super Admin",
        "email": email,
        "passwordHash": hash_password(password),
        "role": "Admin",
        "status": "Active",
        "lastLogin": None,
        "createdAt": now,
        "updatedAt": now,
    })

    student_docs = [
        {**s, "passwordHash": hash_password("Student@123"), "role": "Student", "lastLogin": None, "createdAt": now, "updatedAt": now}
        for s in STUDENTS
    ]
    await db.students.insert_many(student_docs)
    created_students = await db.students.find().to_list(length=None)

    await db.resources.insert_many(
        [{**r, "uploadedBy": admin_result.inserted_id, "createdAt": now, "updatedAt": now} for r in RESOURCES]
    )

    for r in REQUESTS:
        student = next((s for s in created_students if s["studentId"] == r["studentId"]), None)
        if not student:
            continue
        await db.unitaccessrequests.insert_one({
            "student": student["_id"],
            "name": student["name"],
            "studentId": student["studentId"],
            "currentUnits": student["approvedUnits"],
            "requestingUnit": r["requestingUnit"],
            "reason": r["reason"],
            "status": r["status"],
            "requestedAt": now,
            "decidedAt": None,
            "decidedBy": None,
            "createdAt": now,
            "updatedAt": now,
        })

    print("[seed] done")
    print(f"[seed] admin login -> {email} / {password}")
    print("[seed] student login -> jordan.tan@student.edu.au / Student@123")
    await close_db()


if __name__ == "__main__":
    try:
        asyncio.run(seed())
    except Exception as err:  # noqa: BLE001
        print(f"[seed] failed: {err}")
        sys.exit(1)
