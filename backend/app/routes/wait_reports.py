from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.schemas.wait_schema import (
    WaitReportCreate,
    WaitReportCreatedResponse,
    WaitReportResponse,
)
from app.database.models.wait_report import WaitReport
from app.services.wait_service import calculate_current_wait

from app.websocket.manager import manager


router = APIRouter()


@router.post(
    "/create",
    response_model=WaitReportCreatedResponse
)
async def create_wait_report(
    report: WaitReportCreate,
    db: Session = Depends(get_db)
):

    new_report = WaitReport(
        restaurant_id=report.restaurant_id,
        wait_minutes=report.wait_minutes
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    wait_data = calculate_current_wait(
        report.restaurant_id,
        db
    )

    await manager.broadcast(
        new_report.restaurant_id,
        {
            "type": "wait_update",
            "restaurant_id": new_report.restaurant_id,
            "wait_time": wait_data["wait_time"],
            "report_count": wait_data["report_count"],
            "confidence": wait_data["confidence"],
            "last_updated": (
                wait_data["last_updated"].isoformat()
                if wait_data["last_updated"]
                else None
            )
        }
    )

    return {
        "message": "Wait report created",
        "id": new_report.id
    }


@router.get(
    "/current/{restaurant_id}",
    response_model=WaitReportResponse
)
async def get_current_wait_time(
    restaurant_id: int,
    db: Session = Depends(get_db)
):

    return calculate_current_wait(
        restaurant_id,
        db
    )