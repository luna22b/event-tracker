from fastapi import APIRouter

from app.schemas.location_schema import (
    PostalCodeRequest,
    NearbyRequest,
)

from app.schemas.restaurant_schema import RestaurantResponse

from app.services.restaurant_service import find_nearby_restaurants
from app.services.osm_service import fetch_and_store_restaurants
from app.services.geocoding_service import get_coordinates


router = APIRouter()


@router.post(
    "/search",
    response_model=list[RestaurantResponse]
)
async def get_postal_code(
    request: PostalCodeRequest
):

    coordinates = get_coordinates(
        request.postal_code
    )

    if coordinates is None:
        return []


    radius_meters = request.radius * 1609.34


    nearby = await find_nearby_restaurants(
        coordinates["latitude"],
        coordinates["longitude"],
        radius_meters
    )


    if len(nearby) == 0:
        nearby = await fetch_and_store_restaurants(
            coordinates["latitude"],
            coordinates["longitude"],
            radius_meters
        )


    return nearby



@router.post(
    "/nearby",
    response_model=list[RestaurantResponse]
)
async def get_nearby_locations(
    request: NearbyRequest
):

    radius_meters = request.radius * 1609.34


    nearby = await find_nearby_restaurants(
        request.latitude,
        request.longitude,
        radius_meters
    )


    if len(nearby) == 0:
        nearby = await fetch_and_store_restaurants(
            request.latitude,
            request.longitude,
            radius_meters
        )


    return nearby