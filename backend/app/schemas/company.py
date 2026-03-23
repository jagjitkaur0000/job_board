from pydantic import BaseModel


class CompanyCreate(BaseModel):
    name: str


class CompanyResponse(BaseModel):
    id: int
    name: str
    owner_id: int

    class Config:
        from_attributes = True