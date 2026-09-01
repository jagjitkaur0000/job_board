from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr


class UserRegister(UserBase):
    password: str = Field(
        ...,
        min_length=6,
        max_length=72,
    )

    role_name: str = Field(
        ...,
        description="Role name: recruiter or applicant",
    )

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Candidate profile name or recruiter company/profile name",
    )


class UserLogin(BaseModel):
    email: EmailStr

    password: str = Field(
        ...,
        max_length=72,
    )


class UserResponse(UserBase):
    id: int
    role_id: int
    full_name: str | None = None
    email_verified: bool

    class Config:
        from_attributes = True


class OTPVerifyRequest(BaseModel):
    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
    )