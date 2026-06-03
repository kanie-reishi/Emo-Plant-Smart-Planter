"""
Mock Data Generator for the Smart Planter system.

Simulates realistic sensor data so the Dashboard can be developed and
tested without physical ESP32 hardware.

Run as a standalone script:
    python mock_generator.py

Behavior:
  - Inserts a new sensor reading every INTERVAL_SECONDS (default 30s).
  - Soil moisture decreases linearly over time, jumps up when "auto-watered".
  - Temperature follows a daily sine curve (25-35 C).
  - Humidity is loosely correlated with temperature.
  - Light follows a day/night sine cycle (0 at night, ~800 lux at noon).
  - Water level decreases slightly with each watering event.
  - Alerts are created when values cross configured thresholds.
"""

import math
import random
import time
import sys
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from database import SessionLocal, init_db
from models import SensorReading, Alert, WateringHistory, PlantSettings


# --- Configuration ---
INTERVAL_SECONDS = 30  # Time between mock readings


def get_settings(db: Session) -> PlantSettings:
    """Fetch or create the singleton plant settings row."""
    settings = db.query(PlantSettings).filter(PlantSettings.id == 1).first()
    if not settings:
        settings = PlantSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


class MockState:
    """Mutable state that evolves over time to produce realistic data."""

    def __init__(self):
        self.soil_moisture = 65.0   # Start at 65%
        self.water_level = 85.0     # Start at 85%
        self.tick = 0               # Counter for sine-wave calculations

    def next_reading(self, settings: PlantSettings) -> dict:
        """Generate the next set of sensor values."""
        self.tick += 1

        # --- Soil moisture: slow linear decrease + noise ---
        drain_rate = random.uniform(0.15, 0.35)
        self.soil_moisture -= drain_rate
        self.soil_moisture += random.uniform(-0.3, 0.2)  # Noise
        self.soil_moisture = max(0.0, min(100.0, self.soil_moisture))

        # --- Temperature: daily sine wave 25-35 C ---
        # One full cycle every ~2880 ticks (24h at 30s intervals)
        hour_angle = (self.tick / 2880.0) * 2 * math.pi
        temperature = 30.0 + 5.0 * math.sin(hour_angle - math.pi / 2)
        temperature += random.uniform(-0.5, 0.5)
        temperature = round(temperature, 1)

        # --- Humidity: inversely related to temperature + noise ---
        humidity = 70.0 - (temperature - 25.0) * 2.0
        humidity += random.uniform(-3.0, 3.0)
        humidity = max(30.0, min(95.0, round(humidity, 1)))

        # --- Light: day/night cycle ---
        # Peak at "noon" (tick offset), zero at "night"
        light_raw = math.sin(hour_angle - math.pi / 2)
        light_level = max(0.0, light_raw) * 800.0
        light_level += random.uniform(-20.0, 20.0)
        light_level = max(0.0, round(light_level, 1))

        # --- Water level: slowly decreases ---
        self.water_level -= random.uniform(0.01, 0.05)
        self.water_level = max(0.0, round(self.water_level, 1))

        return {
            "soil_moisture": round(self.soil_moisture, 1),
            "temperature": temperature,
            "humidity": humidity,
            "light_level": light_level,
            "water_level": self.water_level,
        }

    def simulate_watering(self):
        """Simulate the effect of watering the plant."""
        moisture_gain = random.uniform(20.0, 35.0)
        moisture_before = self.soil_moisture
        self.soil_moisture = min(100.0, self.soil_moisture + moisture_gain)
        self.water_level = max(0.0, self.water_level - random.uniform(3.0, 8.0))
        return moisture_before, self.soil_moisture


def check_and_create_alerts(db: Session, reading: SensorReading, settings: PlantSettings):
    """Create alert records when sensor values cross thresholds."""
    if not settings.alert_enabled:
        return

    # Low soil moisture
    if reading.soil_moisture < settings.moisture_threshold_low:
        alert = Alert(
            alert_type="low_moisture",
            message=f"Do am dat thap: {reading.soil_moisture:.1f}% (nguong: {settings.moisture_threshold_low}%)",
            severity="warning",
        )
        db.add(alert)

    # Low water level
    if reading.water_level < 15.0:
        alert = Alert(
            alert_type="low_water",
            message=f"Muc nuoc bon chua thap: {reading.water_level:.1f}%. Vui long them nuoc.",
            severity="critical",
        )
        db.add(alert)

    # High temperature
    if reading.temperature > 38.0:
        alert = Alert(
            alert_type="high_temp",
            message=f"Nhiet do qua cao: {reading.temperature:.1f} C. Cay co the bi stress nhiet.",
            severity="warning",
        )
        db.add(alert)

    db.commit()


def run_generator():
    """Main loop — generates mock data indefinitely."""
    print("=== Mock Data Generator Started ===")
    print(f"Inserting sensor data every {INTERVAL_SECONDS}s...")
    print("Press Ctrl+C to stop.\n")

    init_db()
    state = MockState()

    while True:
        db = SessionLocal()
        try:
            settings = get_settings(db)
            values = state.next_reading(settings)

            # Insert sensor reading
            reading = SensorReading(**values)
            db.add(reading)
            db.commit()
            db.refresh(reading)

            ts = datetime.now().strftime("%H:%M:%S")
            print(
                f"[{ts}] Moisture={values['soil_moisture']:.1f}%  "
                f"Temp={values['temperature']}C  "
                f"Humidity={values['humidity']}%  "
                f"Light={values['light_level']}lux  "
                f"Water={values['water_level']}%"
            )

            # Check alerts
            check_and_create_alerts(db, reading, settings)

            # Auto-water if moisture drops below threshold
            if (
                settings.auto_water_enabled
                and values["soil_moisture"] < settings.moisture_threshold_low
            ):
                moisture_before, moisture_after = state.simulate_watering()
                watering = WateringHistory(
                    trigger_type="auto",
                    duration_seconds=random.randint(5, 15),
                    soil_moisture_before=round(moisture_before, 1),
                    soil_moisture_after=round(moisture_after, 1),
                )
                db.add(watering)
                db.commit()
                print(f"  >> AUTO WATERING: {moisture_before:.1f}% -> {moisture_after:.1f}%")

        except Exception as e:
            print(f"Error: {e}")
            db.rollback()
        finally:
            db.close()

        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    try:
        run_generator()
    except KeyboardInterrupt:
        print("\nMock generator stopped.")
        sys.exit(0)
