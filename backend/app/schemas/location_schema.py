from pydantic import BaseModel


class PostalCodeRequest(BaseModel):
    postal_code: str
    radius: int = 10


class NearbyRequest(BaseModel):
    latitude: float
    longitude: float
    radius: int = 10

class LocationsResponse(BaseModel):
    latitude: float
    longitude: float
    radius: int