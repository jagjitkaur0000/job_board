from pydantic import BaseModel, EmailStr, Field


# =========================
# Base User Schema
# =========================
class UserBase(BaseModel):
    email: EmailStr


# =========================
# Register User
# =========================
class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=72)
    role_name: str = Field(..., description="Role name: recruiter or applicant")


# =========================
# Login User
# =========================
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)


# =========================
# Response Schema
# =========================
class UserResponse(UserBase):
    id: int
    role_id: int

    class Config:
        from_attributes = True