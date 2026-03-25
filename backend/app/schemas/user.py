from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr


class UserRegister(UserBase):
    password: str = Field(..., min_length=6, max_length=72)
    role_name: str = Field(..., description="Role name: recruiter or applicant")


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)


class UserResponse(UserBase):
    id: int
    role_id: int

    class Config:
        from_attributes = True