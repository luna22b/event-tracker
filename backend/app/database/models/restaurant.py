from sqlalchemy import String, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography

from app.database.db import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(primary_key=True)

    osm_id: Mapped[int] = mapped_column(
        BigInteger,
        unique=True,
        index=True,
        nullable=False
    )

    name: Mapped[str] = mapped_column(String(255))

    address: Mapped[str | None] = mapped_column(String(255))

    city: Mapped[str | None] = mapped_column(String(100))

    state: Mapped[str | None] = mapped_column(String(50))

    postal_code: Mapped[str | None] = mapped_column(String(20))

    cuisine: Mapped[str | None] = mapped_column(String(100))

    location = mapped_column(
        Geography(
            geometry_type="POINT",
            srid=4326
        )
    )