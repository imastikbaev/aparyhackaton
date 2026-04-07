from pydantic import BaseModel


class DriverOut(BaseModel):
    id: int
    name: str
    car_model: str
    car_color: str
    car_number: str
    rating: float

    model_config = {"from_attributes": True}
