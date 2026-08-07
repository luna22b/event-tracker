from datetime import datetime
from pydantic import BaseModel


class WaitReportCreate(BaseModel):
    restaurant_id: int
    wait_minutes: int


class WaitReportCreatedResponse(BaseModel):
    message: str
    id: int


class WaitReportResponse(BaseModel):
    wait_time: int | None
    report_count: int
    confidence: str
    last_updated: datetime | None