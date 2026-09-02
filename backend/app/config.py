"""Environment configuration. Loads .env once at import time."""
import os

from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "8000"))
MONGODB_URI = os.getenv("MONGODB_URI")
JWT_SECRET = os.getenv("JWT_SECRET")
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
    if o.strip()
]
SEED_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@capstone.edu.au")
SEED_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "Admin@123")
