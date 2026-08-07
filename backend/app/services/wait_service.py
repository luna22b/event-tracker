from sqlalchemy.orm import Session

from app.database.models.wait_report import WaitReport

from app.services.wait_filters import filter_recent_reports, remove_outliers


from app.services.wait_calculations import calculate_weighted_average


from app.services.wait_confidence import calculate_confidence


def calculate_current_wait(
    restaurant_id: int,
    db: Session
):

    reports = (
        db.query(WaitReport)
        .filter(
            WaitReport.restaurant_id == restaurant_id
        )
        .all()
    )


    reports = filter_recent_reports(
        reports
    )


    reports = remove_outliers(
        reports
    )


    if not reports:
        return {
            "wait_time": None,
            "report_count": 0,
            "confidence": "low",
            "last_updated": None
        }


    wait_time = calculate_weighted_average(
        reports
    )


    confidence = calculate_confidence(
        reports
    )


    latest_report = max(
        reports,
        key=lambda report: report.created_at
    )


    return {
        "wait_time": wait_time,
        "report_count": len(reports),
        "confidence": confidence,
        "last_updated": latest_report.created_at
    }