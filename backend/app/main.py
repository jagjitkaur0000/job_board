from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.company import router as company_router
from app.api.routes.job import router as job_router
from app.api.routes.application import router as application_router

app = FastAPI(title="Job Board API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://job-board-z8bn.onrender.com",
    "https://job-board-brown-theta.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Job Board API running"}

app.include_router(auth_router)
app.include_router(company_router)
app.include_router(job_router)
app.include_router(application_router)