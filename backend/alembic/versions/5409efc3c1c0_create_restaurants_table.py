"""create restaurants table

Revision ID: 5409efc3c1c0
Revises:
Create Date: 2026-08-05 21:30:51.653121

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography


revision: str = '5409efc3c1c0'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Enable PostGIS
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.create_table(
        'restaurants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('osm_id', sa.BigInteger(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=50), nullable=True),
        sa.Column('postal_code', sa.String(length=20), nullable=True),
        sa.Column('cuisine', sa.String(length=100), nullable=True),
        sa.Column(
            'location',
            Geography(
                geometry_type='POINT',
                srid=4326,
                spatial_index=False
            ),
            nullable=True
        ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index(
        'idx_restaurants_location',
        'restaurants',
        ['location'],
        unique=False,
        postgresql_using='gist'
    )

    op.create_index(
        op.f('ix_restaurants_osm_id'),
        'restaurants',
        ['osm_id'],
        unique=True
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f('ix_restaurants_osm_id'),
        table_name='restaurants'
    )

    op.drop_index(
        'idx_restaurants_location',
        table_name='restaurants',
        postgresql_using='gist'
    )

    op.drop_table('restaurants')