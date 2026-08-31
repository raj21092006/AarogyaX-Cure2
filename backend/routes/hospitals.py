from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import Hospital


hospitals_bp = Blueprint("hospitals", __name__)


# ============================================================
# GET ALL HOSPITALS
# ============================================================

@hospitals_bp.route("/", methods=["GET"])
def get_hospitals():
    db = SessionLocal()

    try:
        city = request.args.get("city")

        query = db.query(Hospital)

        if city:
            query = query.filter(Hospital.city == city)

        hospitals = query.all()

        data = []

        for hospital in hospitals:
            data.append({
                "id": hospital.id,
                "name": hospital.name,
                "address": hospital.address,
                "city": hospital.city,
                "latitude": hospital.latitude,
                "longitude": hospital.longitude,
                "phone": hospital.phone,
                "emergency_available": hospital.emergency_available,
                "available_beds": hospital.available_beds
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "hospitals": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch hospitals",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE HOSPITAL
# ============================================================

@hospitals_bp.route("/<int:hospital_id>", methods=["GET"])
def get_hospital(hospital_id):
    db = SessionLocal()

    try:
        hospital = db.query(Hospital).filter(
            Hospital.id == hospital_id
        ).first()

        if not hospital:
            return jsonify({
                "status": "error",
                "message": "Hospital not found"
            }), 404

        return jsonify({
            "status": "success",
            "hospital": {
                "id": hospital.id,
                "name": hospital.name,
                "address": hospital.address,
                "city": hospital.city,
                "latitude": hospital.latitude,
                "longitude": hospital.longitude,
                "phone": hospital.phone,
                "emergency_available": hospital.emergency_available,
                "available_beds": hospital.available_beds
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch hospital",
            "error": str(e)
        }), 500

    finally:
        db.close()