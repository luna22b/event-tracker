import pgeocode


nomi = pgeocode.Nominatim("us")


def get_coordinates(zip_code: str):

    location = nomi.query_postal_code(zip_code)

    if location.latitude is None:
        return None

    return {
        "latitude": location.latitude,
        "longitude": location.longitude
    }