# Job Board Full Stack Application

## Overview

This is a full stack Job Board web application where recruiters can post jobs and candidates can browse and apply for jobs.

The system includes authentication, role-based access control, job posting, job applications, and full deployment using modern cloud platforms.

---

## Live Demo

Frontend: https://job-board-brown-theta.vercel.app/
Backend API: https://job-board-z8bn.onrender.com
API Docs (Swagger): https://job-board-z8bn.onrender.com/docs

---

## Features

* User Registration and Login (JWT Authentication)
* Role-Based Access Control (Recruiter / Candidate)
* Recruiters can create companies and post jobs
* Candidates can browse jobs and apply
* Prevent duplicate job applications
* View all jobs with pagination
* View job details
* Fully deployed full stack system

---

## Tech Stack

### Backend

* FastAPI
* PostgreSQL (Neon)
* SQLAlchemy
* Alembic
* JWT Authentication

### Frontend

* React (Vite)
* Axios
* React Router

### Deployment

* Backend: Render
* Database: Neon (PostgreSQL)
* Frontend: Vercel
* Containerization: Docker, Docker Compose

---

## Architecture

Client (React Frontend - Vercel)
→ FastAPI Backend (Render)
→ PostgreSQL Database (Neon)

---

## Project Structure

```
job_board/
│
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## Running Locally (Docker)

Run the entire application:

```
docker-compose up --build
```

### Frontend

http://localhost:3000

### Backend API

http://localhost:8000

### Swagger Docs

http://localhost:8000/docs

---

## Test Accounts

### Recruiter

Email: [recruiter@test.com]
Password: password123

### Candidate

Email: [candidate@test.com]
Password: password123

---

## API Documentation

Swagger UI:

```
/docs
```

You can test all endpoints directly from the browser.

---

## Key Backend Concepts Implemented

* JWT Authentication (Access Token)
* Role-Based Authorization
* Relational Database Design with Foreign Keys
* Unique Constraints (Prevent Duplicate Applications)
* REST API Design with Proper Status Codes
* Pagination and Filtering
* Dockerized Environment

---

## Future Improvements

* Full-text search (PostgreSQL)
* Email notifications
* Resume upload
* Admin panel
* Background jobs
* Redis caching
* Rate limiting
* Unit and integration tests

---

## Author

Full Stack Developer focused on backend systems, API design, and production-ready applications.
