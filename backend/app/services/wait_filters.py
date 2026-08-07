from datetime import datetime, timedelta
from statistics import median


RECENT_REPORT_WINDOW = timedelta(hours=2)


def filter_recent_reports(reports):
    if not reports:
        return []

    now = datetime.now(reports[0].created_at.tzinfo)

    cutoff = now - RECENT_REPORT_WINDOW

    return [
        report
        for report in reports
        if report.created_at >= cutoff
    ]


def remove_outliers(reports):
    if len(reports) < 3:
        return reports

    wait_times = [
        report.wait_minutes
        for report in reports
    ]

    median_wait = median(wait_times)

    deviations = [
        abs(wait - median_wait)
        for wait in wait_times
    ]

    mad = median(deviations)

    if mad == 0:
        return reports

    threshold = 3 * mad

    return [
        report
        for report in reports
        if abs(report.wait_minutes - median_wait) <= threshold
    ]