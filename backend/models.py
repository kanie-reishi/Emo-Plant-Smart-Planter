"""
Database models for the Smart Planter system.
Defines all SQLAlchemy ORM models for sensor data, AI diagnoses,
watering history, alerts, and plant configuration.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Boolean,
    DateTime,
    Text,
)
from database import Base


def _utcnow():
    """Return the current UTC time (timezone-aware)."""
    return datetime.now(timezone.utc)


class SensorReading(Base):
    """
    Periodic readings from the planter's sensors.
    Inserted every ~30 seconds by the ESP32 (or mock generator).
    """

    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=_utcnow, index=True)
    soil_moisture = Column(Float, nullable=False, comment="Soil moisture percentage (0-100)")
    temperature = Column(Float, nullable=False, comment="Air temperature in Celsius")
    humidity = Column(Float, nullable=False, comment="Air humidity percentage (0-100)")
    light_level = Column(Float, nullable=False, comment="Ambient light in lux")
    water_level = Column(Float, nullable=False, comment="Water reservoir level percentage (0-100)")

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "soil_moisture": self.soil_moisture,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "light_level": self.light_level,
            "water_level": self.water_level,
        }


class AIDiagnosis(Base):
    """
    Records of AI-powered leaf health diagnoses.
    Each row stores the uploaded image path, prediction result, and recommendation.
    """

    __tablename__ = "ai_diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=_utcnow, index=True)
    image_path = Column(String(500), nullable=False, comment="Relative path to the saved image file")
    disease_name = Column(String(200), nullable=False)
    confidence = Column(Float, nullable=False, comment="Model confidence score (0-1)")
    recommendation = Column(Text, nullable=True)
    is_healthy = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "image_path": self.image_path,
            "disease_name": self.disease_name,
            "confidence": self.confidence,
            "recommendation": self.recommendation,
            "is_healthy": self.is_healthy,
        }


class WateringHistory(Base):
    """
    Log of every watering event (automatic, manual button, or remote trigger).
    """

    __tablename__ = "watering_history"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=_utcnow, index=True)
    trigger_type = Column(
        String(20),
        nullable=False,
        comment="How the watering was triggered: 'auto' | 'manual' | 'remote'",
    )
    duration_seconds = Column(Integer, nullable=False, comment="Pump run time in seconds")
    soil_moisture_before = Column(Float, nullable=True, comment="Soil moisture % before watering")
    soil_moisture_after = Column(Float, nullable=True, comment="Soil moisture % after watering")

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "trigger_type": self.trigger_type,
            "duration_seconds": self.duration_seconds,
            "soil_moisture_before": self.soil_moisture_before,
            "soil_moisture_after": self.soil_moisture_after,
        }


class Alert(Base):
    """
    System alerts triggered when sensor values cross configured thresholds
    or when AI detects a disease.
    """

    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=_utcnow, index=True)
    alert_type = Column(
        String(30),
        nullable=False,
        comment="Category: 'low_moisture' | 'disease' | 'low_water' | 'high_temp'",
    )
    message = Column(Text, nullable=False)
    severity = Column(
        String(15),
        nullable=False,
        default="info",
        comment="Severity level: 'info' | 'warning' | 'critical'",
    )
    is_read = Column(Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "alert_type": self.alert_type,
            "message": self.message,
            "severity": self.severity,
            "is_read": self.is_read,
        }


class PlantSettings(Base):
    """
    Singleton-style configuration for the single planter.
    Only one row should exist (id=1).
    """

    __tablename__ = "plant_settings"

    id = Column(Integer, primary_key=True, index=True)
    plant_name = Column(String(100), default="Cây của tôi")
    plant_type = Column(String(100), default="Cây cảnh")
    moisture_threshold_low = Column(
        Float, default=30.0, comment="Auto-water trigger threshold (%)"
    )
    moisture_threshold_high = Column(
        Float, default=70.0, comment="Stop watering threshold (%)"
    )
    capture_interval_hours = Column(
        Integer, default=6, comment="AI photo capture interval in hours"
    )
    auto_water_enabled = Column(Boolean, default=True)
    alert_enabled = Column(Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "plant_name": self.plant_name,
            "plant_type": self.plant_type,
            "moisture_threshold_low": self.moisture_threshold_low,
            "moisture_threshold_high": self.moisture_threshold_high,
            "capture_interval_hours": self.capture_interval_hours,
            "auto_water_enabled": self.auto_water_enabled,
            "alert_enabled": self.alert_enabled,
        }
