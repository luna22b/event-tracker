def calculate_confidence(reports):
    report_count = len(reports)

    if report_count >= 10:
        return "high"

    if report_count >= 5:
        return "medium"

    return "low"