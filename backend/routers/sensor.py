"""
Sensor data API router.
Handles receiving sensor readings from ESP32 and serving historical data
to the frontend Dashboard and Charts pages.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import SensorReading

router = APIRouter(prefix="/api/sensor", tags=["Sensor"])


@router.post("", summary="Submit sensor reading")
def create_sensor_reading(
    soil_moisture: float,
    temperature: float,
    humidity: float,
    light_level: float,
    water_level: float,
    db: Session = Depends(get_db),
):
    """
    Receive a new sensor reading from the ESP32 or mock generator.
    All values are required.
    """
    reading = SensorReading(
        soil_moisture=soil_moisture,
        temperature=temperature,
        humidity=humidity,
        light_level=light_level,
        water_level=water_level,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading.to_dict()


@router.get("/latest", summary="Get latest sensor reading")
def get_latest_reading(db: Session = Depends(get_db)):
    """
    Return the most recent sensor reading.
    Used by Dashboard to display current values.
    """
    reading = (
        db.query(SensorReading)
        .order_by(desc(SensorReading.timestamp))
        .first()
    )
    if not reading:
        return {"message": "No sensor data available yet."}
    return reading.to_dict()


@router.get("/history", summary="Get sensor history for charts")
def get_sensor_history(
    range: str = Query(
        "24h",
        description="Time range: 1h, 6h, 24h, 7d, 30d",
    ),
    date: Optional[str] = Query(None, description="Specific date YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """
    Return sensor readings within the specified time range.
    Used by Charts page to render line/area graphs.
    """
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            start_dt = datetime.combine(target_date, datetime.min.time()).replace(tzinfo=timezone.utc)
            end_dt = datetime.combine(target_date, datetime.max.time()).replace(tzinfo=timezone.utc)
            
            readings = (
                db.query(SensorReading)
                .filter(SensorReading.timestamp >= start_dt, SensorReading.timestamp <= end_dt)
                .order_by(SensorReading.timestamp.asc())
                .all()
            )
            return [r.to_dict() for r in readings]
        except ValueError:
            pass # fallback to range logic if parsing fails

    now = datetime.now(timezone.utc)

    range_map = {
        "1h": timedelta(hours=1),
        "6h": timedelta(hours=6),
        "24h": timedelta(hours=24),
        "7d": timedelta(days=7),
        "30d": timedelta(days=30),
    }

    delta = range_map.get(range, timedelta(hours=24))
    since = now - delta

    readings = (
        db.query(SensorReading)
        .filter(SensorReading.timestamp >= since)
        .order_by(SensorReading.timestamp.asc())
        .all()
    )

    return [r.to_dict() for r in readings]
