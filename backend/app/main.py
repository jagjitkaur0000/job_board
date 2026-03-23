from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.company import router as company_router
from app.api.routes.job import router as job_router
from app.api.routes.application import router as application_router


app = FastAPI(title="Job Board API")


# ------------------------
# CORS configuration
# ------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------
# Root health endpoint
# ------------------------
@app.get("/")
def root():
    return {"message": "Job Board API running"}


# ------------------------
# Include routers
# ------------------------
app.include_router(auth_router)          # /auth/login, /auth/register
app.include_router(company_router)       # /companies/
app.include_router(job_router)           # /jobs/, /jobs/companies/{company_id}
app.include_router(application_router)   # /applications/jobs/{job_id}/apply