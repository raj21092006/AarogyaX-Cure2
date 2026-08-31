from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import User,Patient

patients_bp = Blueprint("patients", __name__)


# ============================================================
# GET ALL PATIENTS
# ============================================================

@patients_bp.route("/", methods=["GET"])
def get_patients():
    db = SessionLocal()

    try:
        patients = db.query(Patient).join(
            User,
            Patient.user_id == User.id
        ).all()

        data = []

        for patient in patients:
            data.append({
                "id": patient.id,
                "user_id": patient.user_id,
                "name": patient.user.name,
                "email": patient.user.email,
                "phone": patient.user.phone,
                "age": patient.age,
                "gender": patient.gender,
                "blood_group": patient.blood_group,
                "address": patient.address,
                "medical_history": patient.medical_history,
                "created_at": patient.created_at.isoformat()
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "patients": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch patients",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE PATIENT
# ============================================================

@patients_bp.route("/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    db = SessionLocal()

    try:
        patient = db.query(Patient).filter(
            Patient.id == patient_id
        ).first()

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        return jsonify({
            "status": "success",
            "patient": {
                "id": patient.id,
                "user_id": patient.user_id,
                "name": patient.user.name,
                "email": patient.user.email,
                "phone": patient.user.phone,
                "age": patient.age,
                "gender": patient.gender,
                "blood_group": patient.blood_group,
                "address": patient.address,
                "medical_history": patient.medical_history,
                "created_at": patient.created_at.isoformat()
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch patient",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# UPDATE PATIENT
# ============================================================

@patients_bp.route("/<int:patient_id>", methods=["PUT"])
def update_patient(patient_id):
    db = SessionLocal()

    try:
        patient = db.query(Patient).filter(
            Patient.id == patient_id
        ).first()

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        data = request.get_json() or {}

        if "age" in data:
            patient.age = data["age"]

        if "gender" in data:
            patient.gender = data["gender"]

        if "bloodGroup" in data:
            patient.blood_group = data["bloodGroup"]

        if "address" in data:
            patient.address = data["address"]

        if "medicalHistory" in data:
            patient.medical_history = data["medicalHistory"]

        # Update User information
        if "name" in data:
            patient.user.name = data["name"]

        if "phone" in data:
            patient.user.phone = data["phone"]

        db.commit()

        return jsonify({
            "status": "success",
            "message": "Patient profile updated successfully",
            "patient": {
                "id": patient.id,
                "name": patient.user.name,
                "email": patient.user.email,
                "phone": patient.user.phone,
                "age": patient.age,
                "gender": patient.gender,
                "blood_group": patient.blood_group,
                "address": patient.address,
                "medical_history": patient.medical_history
            }
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update patient",
            "error": str(e)
        }), 500

    finally:
        db.close()