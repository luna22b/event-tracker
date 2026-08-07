from datetime import datetime


def calculate_weighted_average(reports):
    if not reports:
        return None

    now = datetime.now(reports[0].created_at.tzinfo)

    weighted_sum = 0
    total_weight = 0

    for report in reports:

        age_minutes = (
            now - report.created_at
        ).total_seconds() / 60

        weight = max(
            1,
            120 - age_minutes
        )

        weighted_sum += (
            report.wait_minutes * weight
        )

        total_weight += weight

    return round(
        weighted_sum / total_weight
    )