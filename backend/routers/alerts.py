"""
Alerts API router.
Handles listing, reading, and counting system alerts.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import get_db
from models import Alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", summary="List all alerts")
def get_alerts(
    severity: str = None,
    unread_only: bool = False,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Return alerts sorted by newest first.
    Optional filters: severity ('info', 'warning', 'critical'), unread_only.
    """
    query = db.query(Alert)

    if severity:
        query = query.filter(Alert.severity == severity)
    if unread_only:
        query = query.filter(Alert.is_read == False)  # noqa: E712

    alerts = (
        query.order_by(desc(Alert.timestamp))
        .limit(limit)
        .all()
    )
    return [a.to_dict() for a in alerts]


@router.get("/unread-count", summary="Get count of unread alerts")
def get_unread_count(db: Session = Depends(get_db)):
    """Return the number of unread alerts for the notification badge."""
    count = (
        db.query(func.count(Alert.id))
        .filter(Alert.is_read == False)  # noqa: E712
        .scalar()
    )
    return {"unread_count": count}


@router.patch("/{alert_id}/read", summary="Mark alert as read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    """Mark a specific alert as read."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = True
    db.commit()
    return {"status": "success", "message": "Alert marked as read"}


@router.patch("/read-all", summary="Mark all alerts as read")
def mark_all_alerts_read(db: Session = Depends(get_db)):
    """Mark all unread alerts as read."""
    updated = (
        db.query(Alert)
        .filter(Alert.is_read == False)  # noqa: E712
        .update({Alert.is_read: True})
    )
    db.commit()
    return {"status": "success", "updated_count": updated}
