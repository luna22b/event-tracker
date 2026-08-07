from datetime import datetime

from pydantic import BaseModel


class RestaurantResponse(BaseModel):
    id: int
    name: str
    address: str | None = None
    cuisine: str | None = None
    wait_time: int | None = None
    report_count: int = 0
    confidence: str | None = None
    last_updated: datetime | None = None

