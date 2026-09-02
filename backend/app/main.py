"""FastAPI app — mirrors app.ts + server.ts + middleware/errors.ts.

Error responses use the same shape the Express version sent:
  { "message": "..." }               (+ "issues" on validation errors)
so the admin frontend's ApiError handling keeps working unchanged.
"""
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import DuplicateKeyError

from . import config
from .db import close_db, connect_db
from .routes import admins, auth, overview, resources, students, unit_requests

_started_at = time.time()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_db()
    print(f"[api] admin backend listening on http://localhost:{config.PORT}")
    yield
    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(title="Capstone Admin API", lifespan=lifespan, redirect_slashes=True)

    app.add_middleware(
        CORSMiddleware,
         allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"ok": True, "uptime": time.time() - _started_at}

    app.include_router(auth.router)
    app.include_router(admins.router)
    app.include_router(students.router)
    app.include_router(unit_requests.router)
    app.include_router(resources.router)
    app.include_router(overview.router)

    # --- error handling, matching middleware/errors.ts -----------------------

    @app.exception_handler(RequestValidationError)
    async def validation_error(_req: Request, exc: RequestValidationError):
        issues = [
            {"path": list(e.get("loc", [])), "message": e.get("msg", ""), "code": e.get("type", "")}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=400,
            content={"message": "Validation failed", "issues": issues},
        )

    @app.exception_handler(DuplicateKeyError)
    async def duplicate_key(_req: Request, _exc: DuplicateKeyError):
        return JSONResponse(
            status_code=409,
            content={"message": "Duplicate value — that record already exists"},
        )

    @app.exception_handler(HTTPException)
    async def http_error(_req: Request, exc: HTTPException):
        # Frontend reads `message`, not FastAPI's default `detail`.
        message = exc.detail if isinstance(exc.detail, str) else "Route not found" if exc.status_code == 404 else "Error"
        return JSONResponse(status_code=exc.status_code, content={"message": message})

    @app.exception_handler(Exception)
    async def unhandled_error(_req: Request, exc: Exception):
        print("[error]", exc)
        return JSONResponse(status_code=500, content={"message": str(exc) or "Internal server error"})

    return app


app = create_app()
