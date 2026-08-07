from sqlalchemy import text

from app.database.db import SessionLocal
from app.services.wait_service import calculate_current_wait


async def find_nearby_restaurants(
    latitude,
    longitude,
    radius,
):

    db = SessionLocal()

    query = text("""
        SELECT
            id,
            name,
            address,
            cuisine
        FROM restaurants

        WHERE ST_DWithin(
            location,
            ST_SetSRID(
                ST_MakePoint(:longitude, :latitude),
                4326
            )::geography,
            :radius
        );
    """)

    result = db.execute(
        query,
        {
            "longitude": float(longitude),
            "latitude": float(latitude),
            "radius": float(radius),
        },
    )

    restaurants = result.fetchall()

    response = []

    for restaurant in restaurants:

        wait_data = calculate_current_wait(
            restaurant.id,
            db,
        )

        response.append(
            {
                "id": restaurant.id,
                "name": restaurant.name,
                "address": restaurant.address,
                "cuisine": restaurant.cuisine,
                "wait_time": wait_data["wait_time"],
                "report_count": wait_data["report_count"],
                "confidence": wait_data["confidence"],
                "last_updated": wait_data["last_updated"],
            }
        )

    db.close()

    return response