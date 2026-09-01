from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes.auth import (
    router as auth_router,
)
from app.api.routes.company import (
    router as company_router,
)
from app.api.routes.job import (
    router as job_router,
)
from app.api.routes.application import (
    router as application_router,
)
from app.api.routes.interview import (
    router as interview_router,
)
from app.api.routes.profile import (
    router as profile_router,
)
from app.api.routes.saved_job import (
    router as saved_job_router,
)
from app.api.routes.email_verification import (
    router as email_verification_router,
)
from app.api.routes.recommendation import (
    router as recommendation_router,
)
from app.api.routes.notification import (
    router as notification_router,
)


app = FastAPI(
    title="Job Board API"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

origins = [
    # Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Production frontend
    "https://job-board-brown-theta.vercel.app",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# UPLOADS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Job Board API running"
    }


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    auth_router
)

app.include_router(
    company_router
)

app.include_router(
    job_router
)

app.include_router(
    application_router
)

app.include_router(
    interview_router
)

app.include_router(
    profile_router
)

app.include_router(
    saved_job_router
)

app.include_router(
    email_verification_router
)

app.include_router(
    recommendation_router
)

app.include_router(
    notification_router
)