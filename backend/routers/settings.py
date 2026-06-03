"""
Plant settings API router.
Handles reading and updating the single planter's configuration.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models import PlantSettings

router = APIRouter(prefix="/api/settings", tags=["Settings"])


class SettingsUpdate(BaseModel):
    """Schema for updating plant settings. All fields are optional."""

    plant_name: Optional[str] = None
    plant_type: Optional[str] = None
    moisture_threshold_low: Optional[float] = None
    moisture_threshold_high: Optional[float] = None
    capture_interval_hours: Optional[int] = None
    auto_water_enabled: Optional[bool] = None
    alert_enabled: Optional[bool] = None


def _get_or_create_settings(db: Session) -> PlantSettings:
    """
    Retrieve the singleton settings row, or create it with defaults
    if it doesn't exist yet.
    """
    settings = db.query(PlantSettings).filter(PlantSettings.id == 1).first()
    if not settings:
        settings = PlantSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", summary="Get current plant settings")
def get_settings(db: Session = Depends(get_db)):
    """Return the current plant configuration."""
    settings = _get_or_create_settings(db)
    return settings.to_dict()


@router.put("", summary="Update plant settings")
def update_settings(
    updates: SettingsUpdate,
    db: Session = Depends(get_db),
):
    """
    Update plant settings. Only the fields provided in the request body
    will be modified; others remain unchanged.
    """
    settings = _get_or_create_settings(db)

    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings.to_dict()
