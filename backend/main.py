"""
Smart Planter AI — Main API Server
Entry point for the FastAPI application.
Registers all routers, initializes the database, and serves uploaded images.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from ai_model import load_model, predict_image
from database import init_db

# Import routers
from routers import sensor, diagnosis, control, alerts, settings

import os
import uvicorn

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Runs initialization on startup and cleanup on shutdown.
    """
    # --- Startup ---
    # Initialize database tables
    init_db()

    # Load AI model once and inject into the diagnosis router
    ai_model = load_model()
    diagnosis.set_model(ai_model)

    # Store model in app state for the legacy /predict endpoint
    app.state.ai_model = ai_model

    print("Smart Planter AI Server is running!")

    yield

    # --- Shutdown ---
    print("Server shutting down...")


app = FastAPI(
    title="Smart Planter AI API",
    description="API server for the Smart Planter system — sensor data, AI diagnosis, pump control, alerts, and settings.",
    version="2.0",
    lifespan=lifespan,
)

# CORS configuration — allow frontend (React dev server) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images as static files at /uploads/<filename>
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- Register API routers ---
app.include_router(sensor.router)
app.include_router(diagnosis.router)
app.include_router(control.router)
app.include_router(alerts.router)
app.include_router(settings.router)


# --- Legacy endpoints (kept for backward compatibility) ---

@app.get("/")
def read_root():
    """API Health Check"""
    return {"status": "success", "message": "Smart Planter AI Server is running!"}


@app.post("/predict")
async def predict_endpoint(file: UploadFile = File(...)):
    """
    Legacy endpoint for direct AI prediction (no database logging).
    Kept for backward compatibility with the existing web-demo.
    """
    image_bytes = await file.read()
    result = predict_image(app.state.ai_model, image_bytes)
    return result


if __name__ == "__main__":
    print("Starting Backend API Server at http://localhost:8000")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
