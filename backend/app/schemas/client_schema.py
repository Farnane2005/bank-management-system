from pydantic import (
    BaseModel,
    Field
)

class ClientCreate(BaseModel):

    name: str = Field(
        min_length=3,
        max_length=50
    )

    account_number: str = Field(
        min_length=6,
        max_length=20
    )

class ClientUpdate(BaseModel):

    name: str = Field(
        min_length=3,
        max_length=50
    )

class ClientResponse(BaseModel):

    id: int
    name: str
    account_number: str
    balance: float

    class Config:
        from_attributes = True