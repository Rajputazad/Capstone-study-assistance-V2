"""Mongo connection via Motor (async). Mirrors config/db.ts."""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from . import config

_client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db() -> AsyncIOMotorDatabase:
    """Connect, verify with a ping, and create the unique indexes."""
    global _client, db
    if not config.MONGODB_URI:
        raise RuntimeError("MONGODB_URI is not set. Copy .env.example to .env.")

    _client = AsyncIOMotorClient(config.MONGODB_URI, serverSelectionTimeoutMS=10000)
    await _client.admin.command("ping")

    db = _client.get_default_database()  # db name comes from the URI path
    print(f"[db] connected -> {db.name}")

    # Same unique constraints Mongoose declared on the schemas.
    await db.admins.create_index("email", unique=True)
    await db.students.create_index("studentId", unique=True)
    await db.students.create_index("email", unique=True)
    return db


async def close_db() -> None:
    global _client, db
    if _client is not None:
        _client.close()
        _client = None
        db = None


def get_db() -> AsyncIOMotorDatabase:
    if db is None:
        raise RuntimeError("Database not connected")
    return db
