"""
AI diagnosis API router.
Handles uploading images for AI analysis, storing results,
and retrieving diagnosis history.
"""

import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import AIDiagnosis
from ai_model import load_model, predict_image

router = APIRouter(prefix="/api/diagnose", tags=["Diagnosis"])

# Directory to persist uploaded leaf images
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Lazy-loaded model reference (set by main.py on startup)
_ai_model = None


def set_model(model):
    """Called once at startup to inject the loaded AI model."""
    global _ai_model
    _ai_model = model


def get_model():
    """Dependency to retrieve the AI model instance."""
    global _ai_model
    if _ai_model is None:
        _ai_model = load_model()
    return _ai_model


@router.post("", summary="Upload image and run AI diagnosis")
async def create_diagnosis(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Accept an image file, run the AI prediction model,
    save the image to disk, and store the result in the database.
    """
    image_bytes = await file.read()

    # Generate a unique filename to avoid collisions
    ext = os.path.splitext(file.filename or "image.jpg")[1] or ".jpg"
    unique_name = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    save_path = os.path.join(UPLOAD_DIR, unique_name)

    # Persist the uploaded image
    with open(save_path, "wb") as f:
        f.write(image_bytes)

    # Run AI inference
    model = get_model()
    result = predict_image(model, image_bytes)

    disease = result.get("disease", "Unknown")
    confidence = result.get("confidence", 0.0)
    recommendation = result.get("recommendation", "")
    is_healthy = "healthy" in disease.lower() or "khỏe mạnh" in disease.lower()

    # Store diagnosis record
    diagnosis = AIDiagnosis(
        image_path=f"uploads/{unique_name}",
        disease_name=disease,
        confidence=confidence,
        recommendation=recommendation,
        is_healthy=is_healthy,
    )
    db.add(diagnosis)
    db.commit()
    db.refresh(diagnosis)

    return diagnosis.to_dict()


@router.get("/history", summary="Get diagnosis history")
def get_diagnosis_history(
    filter: str = "all",
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """
    Return a paginated list of past diagnoses.
    Filter options: 'all', 'healthy', 'disease'.
    """
    query = db.query(AIDiagnosis)

    if filter == "healthy":
        query = query.filter(AIDiagnosis.is_healthy == True)  # noqa: E712
    elif filter == "disease":
        query = query.filter(AIDiagnosis.is_healthy == False)  # noqa: E712

    diagnoses = (
        query.order_by(desc(AIDiagnosis.timestamp))
        .limit(limit)
        .all()
    )

    return [d.to_dict() for d in diagnoses]


@router.get("/{diagnosis_id}", summary="Get single diagnosis detail")
def get_diagnosis_detail(
    diagnosis_id: int,
    db: Session = Depends(get_db),
):
    """Return full details for a specific diagnosis by ID."""
    diagnosis = db.query(AIDiagnosis).filter(AIDiagnosis.id == diagnosis_id).first()
    if not diagnosis:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return diagnosis.to_dict()
