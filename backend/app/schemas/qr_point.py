from pydantic import BaseModel


class QRPointInfo(BaseModel):
    id: str
    name: str
    address: str
    latitude: float
    longitude: float

    model_config = {"from_attributes": True}
