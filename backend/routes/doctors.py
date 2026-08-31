from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import Doctor, User, Hospital


doctors_bp = Blueprint("doctors", __name__)


# ============================================================
# GET ALL DOCTORS
# ============================================================

@doctors_bp.route("/", methods=["GET"])
def get_doctors():
    db = SessionLocal()

    try:
        specialty = request.args.get("specialty")
        hospital_id = request.args.get("hospital_id", type=int)

        query = db.query(Doctor).join(
            User,
            Doctor.user_id == User.id
        )

        if specialty:
            query = query.filter(
                Doctor.specialty == specialty
            )

        if hospital_id:
            query = query.filter(
                Doctor.hospital_id == hospital_id
            )

        doctors = query.all()

        data = []

        for doctor in doctors:
            data.append({
                "id": doctor.id,
                "user_id": doctor.user_id,
                "name": doctor.user.name,
                "email": doctor.user.email,
                "phone": doctor.user.phone,
                "specialty": doctor.specialty,
                "license_no": doctor.license_no,
                "experience_years": doctor.experience_years,
                "available": doctor.available,
                "hospital": {
                    "id": doctor.hospital.id,
                    "name": doctor.hospital.name,
                    "city": doctor.hospital.city
                } if doctor.hospital else None
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "doctors": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch doctors",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE DOCTOR
# ============================================================

@doctors_bp.route("/<int:doctor_id>", methods=["GET"])
def get_doctor(doctor_id):
    db = SessionLocal()

    try:
        doctor = db.query(Doctor).filter(
            Doctor.id == doctor_id
        ).first()

        if not doctor:
            return jsonify({
                "status": "error",
                "message": "Doctor not found"
            }), 404

        return jsonify({
            "status": "success",
            "doctor": {
                "id": doctor.id,
                "user_id": doctor.user_id,
                "name": doctor.user.name,
                "email": doctor.user.email,
                "phone": doctor.user.phone,
                "specialty": doctor.specialty,
                "license_no": doctor.license_no,
                "experience_years": doctor.experience_years,
                "available": doctor.available,
                "hospital": {
                    "id": doctor.hospital.id,
                    "name": doctor.hospital.name,
                    "address": doctor.hospital.address,
                    "city": doctor.hospital.city,
                    "phone": doctor.hospital.phone
                } if doctor.hospital else None
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch doctor",
            "error": str(e)
        }), 500

    finally:
        db.close()