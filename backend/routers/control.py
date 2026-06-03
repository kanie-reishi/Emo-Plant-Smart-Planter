"""
Pump control API router.
Handles remote watering triggers and watering history retrieval.
In Phase 1 (mock mode), the pump commands are simulated.
In Phase 2, commands will be forwarded to the ESP32.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import WateringHistory, SensorReading

router = APIRouter(prefix="/api", tags=["Control"])

# In-memory pump state (Phase 1 mock)
_pump_status = {
    "is_running": False,
    "last_toggled": None,
}


@router.post("/pump/toggle", summary="Toggle the water pump")
def toggle_pump(
    action: str = "on",
    duration_seconds: int = 10,
    db: Session = Depends(get_db),
):
    """
    Turn the pump on or off remotely.
    In Phase 1, this simulates the action and logs it.
    In Phase 2, this will send an HTTP command to the ESP32.

    Parameters:
    - action: 'on' or 'off'
    - duration_seconds: how long to run the pump (only used when action='on')
    """
    global _pump_status

    if action == "on":
        _pump_status["is_running"] = True
        _pump_status["last_toggled"] = datetime.now(timezone.utc).isoformat()

        # Get current soil moisture for logging
        latest = (
            db.query(SensorReading)
            .order_by(desc(SensorReading.timestamp))
            .first()
        )
        moisture_before = latest.soil_moisture if latest else None

        # Log the watering event
        watering = WateringHistory(
            trigger_type="remote",
            duration_seconds=duration_seconds,
            soil_moisture_before=moisture_before,
            soil_moisture_after=None,  # Will be updated after pump stops
        )
        db.add(watering)
        db.commit()
        db.refresh(watering)

        return {
            "status": "success",
            "message": f"Pump turned ON for {duration_seconds} seconds",
            "watering_id": watering.id,
        }

    elif action == "off":
        _pump_status["is_running"] = False
        _pump_status["last_toggled"] = datetime.now(timezone.utc).isoformat()
        return {
            "status": "success",
            "message": "Pump turned OFF",
        }

    return {"status": "error", "message": "Invalid action. Use 'on' or 'off'."}


@router.get("/pump/status", summary="Get current pump status")
def get_pump_status():
    """Return whether the pump is currently running."""
    return _pump_status


@router.get("/watering/history", summary="Get watering history")
def get_watering_history(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Return a list of recent watering events."""
    records = (
        db.query(WateringHistory)
        .order_by(desc(WateringHistory.timestamp))
        .limit(limit)
        .all()
    )
    return [r.to_dict() for r in records]
