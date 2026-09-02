from pydantic import BaseModel, ConfigDict


class SpiritualInterestCreate(BaseModel):
    name: str


class SpiritualInterestResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class UserSpiritualInterestCreate(BaseModel):
    interest_id: int