from pydantic import BaseModel, Field


class VerifyEmailRequest(BaseModel):
    email: str
    otp: str = Field(
        ...,
        min_length=6,
        max_length=6,
    )


class ResendVerificationRequest(BaseModel):
    email: str