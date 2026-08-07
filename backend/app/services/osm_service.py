import os

import httpx
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from geoalchemy2 import WKTElement

from app.database.db import SessionLocal
from app.database.models.restaurant import Restaurant


load_dotenv()

OVERPASS_URL = os.getenv("OVERPASS_URL")


async def fetch_from_osm(latitude, longitude, radius_meters=3000):

    print("OVERPASS URL:", OVERPASS_URL)

    query = f"""
    [out:json][timeout:90];

    (
      node["name"]["amenity"="restaurant"](around:{radius_meters},{latitude},{longitude});
      way["name"]["amenity"="restaurant"](around:{radius_meters},{latitude},{longitude});
      relation["name"]["amenity"="restaurant"](around:{radius_meters},{latitude},{longitude});
    );

    out center;
    """

    timeout = httpx.Timeout(
        connect=30.0,
        read=120.0,
        write=30.0,
        pool=30.0
    )

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(
                OVERPASS_URL,
                data={
                    "data": query
                },
                headers={
                    "User-Agent": "Waitless-App/1.0"
                }
            )

            print("OVERPASS STATUS:", response.status_code)

        except Exception as e:
            print("OVERPASS FAILED:", repr(e))
            raise


    if response.status_code != 200:
        return []


    return response.json()["elements"]



async def fetch_and_store_restaurants(
    latitude,
    longitude,
    radius_meters
):

    restaurants = await fetch_from_osm(
        latitude,
        longitude,
        radius_meters
    )


    db: Session = SessionLocal()

    saved = []


    try:

        for place in restaurants:

            tags = place.get("tags", {})

            name = tags.get("name")

            if not name:
                continue


            if "lat" in place:
                lat = place["lat"]
                lon = place["lon"]

            elif "center" in place:
                lat = place["center"]["lat"]
                lon = place["center"]["lon"]

            else:
                continue



            existing = db.query(Restaurant).filter(
                Restaurant.osm_id == place["id"]
            ).first()


            if existing:
                continue



            restaurant = Restaurant(
                osm_id=place["id"],
                name=name,
                address=tags.get("addr:street"),
                city=tags.get("addr:city"),
                state=tags.get("addr:state"),
                postal_code=tags.get("addr:postcode"),
                cuisine=tags.get("cuisine"),

                location=WKTElement(
                    f"POINT({lon} {lat})",
                    srid=4326
                )
            )


            db.add(restaurant)

            saved.append(restaurant)



        db.commit()


        for restaurant in saved:
            db.refresh(restaurant)



        return [
            {
                "id": r.id,
                "name": r.name,
                "address": r.address,
                "cuisine": r.cuisine
            }
            for r in saved
        ]


    finally:
        db.close()