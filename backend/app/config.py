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
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
DEV_SHOW_RESET_OTP = os.getenv("DEV_SHOW_RESET_OTP", "false").lower() == "true"
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
SMTP_LOGIN = os.getenv("SMTP_LOGIN") or os.getenv("GMAIL_ADDRESS")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")
SMTP_SENDER_EMAIL = os.getenv("SMTP_SENDER_EMAIL") or os.getenv("GMAIL_ADDRESS")
SMTP_SENDER_NAME = os.getenv("SMTP_SENDER_NAME", "Capstone Study Assistant")
