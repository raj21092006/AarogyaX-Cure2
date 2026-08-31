from datetime import datetime

from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import SOSAlert, User


sos_bp = Blueprint("sos", __name__)


# ============================================================
# CREATE SOS ALERT
# ============================================================

@sos_bp.route("/", methods=["POST"])
def create_sos():
    db = SessionLocal()

    try:
        data = request.get_json() or {}

        user_id = data.get("user_id")
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        alert_type = data.get("alert_type", "emergency")
        message = data.get("message")

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        if user_id is None or latitude is None or longitude is None:
            return jsonify({
                "status": "error",
                "message": "user_id, latitude and longitude are required"
            }), 400

        # ----------------------------------------------------
        # Check user
        # ----------------------------------------------------

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        # ----------------------------------------------------
        # Create SOS
        # ----------------------------------------------------

        sos = SOSAlert(
            user_id=user_id,
            latitude=float(latitude),
            longitude=float(longitude),
            alert_type=alert_type,
            status="active",
            message=message
        )

        db.add(sos)
        db.commit()
        db.refresh(sos)

        return jsonify({
            "status": "success",
            "message": "SOS alert created successfully",
            "sos": {
                "id": sos.id,
                "user_id": sos.user_id,
                "latitude": sos.latitude,
                "longitude": sos.longitude,
                "alert_type": sos.alert_type,
                "status": sos.status,
                "message": sos.message,
                "created_at": sos.created_at.isoformat()
            }
        }), 201

    except (TypeError, ValueError):
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Invalid latitude or longitude"
        }), 400

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to create SOS alert",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET ACTIVE SOS ALERTS
# ============================================================

@sos_bp.route("/active", methods=["GET"])
def get_active_sos():
    db = SessionLocal()

    try:
        user_id = request.args.get("user_id", type=int)

        query = db.query(SOSAlert).filter(
            SOSAlert.status == "active"
        )

        if user_id:
            query = query.filter(
                SOSAlert.user_id == user_id
            )

        alerts = query.order_by(
            SOSAlert.created_at.desc()
        ).all()

        data = []

        for sos in alerts:
            data.append({
                "id": sos.id,
                "user_id": sos.user_id,
                "latitude": sos.latitude,
                "longitude": sos.longitude,
                "alert_type": sos.alert_type,
                "status": sos.status,
                "message": sos.message,
                "created_at": sos.created_at.isoformat()
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "active_sos": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch active SOS alerts",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE SOS ALERT
# ============================================================

@sos_bp.route("/<int:sos_id>", methods=["GET"])
def get_sos(sos_id):
    db = SessionLocal()

    try:
        sos = db.query(SOSAlert).filter(
            SOSAlert.id == sos_id
        ).first()

        if not sos:
            return jsonify({
                "status": "error",
                "message": "SOS alert not found"
            }), 404

        return jsonify({
            "status": "success",
            "sos": {
                "id": sos.id,
                "user_id": sos.user_id,
                "latitude": sos.latitude,
                "longitude": sos.longitude,
                "alert_type": sos.alert_type,
                "status": sos.status,
                "message": sos.message,
                "created_at": sos.created_at.isoformat(),
                "resolved_at": (
                    sos.resolved_at.isoformat()
                    if sos.resolved_at else None
                )
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch SOS alert",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# RESOLVE SOS ALERT
# ============================================================

@sos_bp.route("/<int:sos_id>/resolve", methods=["PUT"])
def resolve_sos(sos_id):
    db = SessionLocal()

    try:
        sos = db.query(SOSAlert).filter(
            SOSAlert.id == sos_id
        ).first()

        if not sos:
            return jsonify({
                "status": "error",
                "message": "SOS alert not found"
            }), 404

        if sos.status == "resolved":
            return jsonify({
                "status": "success",
                "message": "SOS alert is already resolved",
                "sos": {
                    "id": sos.id,
                    "status": sos.status
                }
            }), 200

        sos.status = "resolved"
        sos.resolved_at = datetime.utcnow()

        db.commit()
        db.refresh(sos)

        return jsonify({
            "status": "success",
            "message": "SOS alert resolved successfully",
            "sos": {
                "id": sos.id,
                "status": sos.status,
                "resolved_at": sos.resolved_at.isoformat()
            }
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to resolve SOS alert",
            "error": str(e)
        }), 500

    finally:
        db.close()