from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import HealthRecord, Patient, Doctor


health_records_bp = Blueprint(
    "health_records",
    __name__
)

#Get all health records#
@health_records_bp.route("/", methods=["GET"])
def get_health_records():
    db = SessionLocal()

    try:
        patient_id = request.args.get("patient_id", type=int)
        doctor_id = request.args.get("doctor_id", type=int)

        query = db.query(HealthRecord)

        if patient_id:
            query = query.filter(
                HealthRecord.patient_id == patient_id
            )

        if doctor_id:
            query = query.filter(
                HealthRecord.doctor_id == doctor_id
            )

        records = query.order_by(
            HealthRecord.record_date.desc()
        ).all()

        data = []

        for record in records:
            data.append({
                "id": record.id,
                "patient_id": record.patient_id,
                "doctor_id": record.doctor_id,
                "diagnosis": record.diagnosis,
                "prescription": record.prescription,
                "notes": record.notes,
                "record_date": record.record_date.isoformat()
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "health_records": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch health records",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE HEALTH RECORD
# ============================================================

@health_records_bp.route("/<int:record_id>", methods=["GET"])
def get_health_record(record_id):
    db = SessionLocal()

    try:
        record = db.query(HealthRecord).filter(
            HealthRecord.id == record_id
        ).first()

        if not record:
            return jsonify({
                "status": "error",
                "message": "Health record not found"
            }), 404

        return jsonify({
            "status": "success",
            "health_record": {
                "id": record.id,
                "patient_id": record.patient_id,
                "doctor_id": record.doctor_id,
                "diagnosis": record.diagnosis,
                "prescription": record.prescription,
                "notes": record.notes,
                "record_date": record.record_date.isoformat()
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch health record",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# CREATE HEALTH RECORD
# ============================================================

@health_records_bp.route("/", methods=["POST"])
def create_health_record():
    db = SessionLocal()

    try:
        data = request.get_json() or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        diagnosis = data.get("diagnosis")
        prescription = data.get("prescription")
        notes = data.get("notes")

        if not patient_id:
            return jsonify({
                "status": "error",
                "message": "patient_id is required"
            }), 400

        patient = db.query(Patient).filter(
            Patient.id == patient_id
        ).first()

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        if doctor_id:
            doctor = db.query(Doctor).filter(
                Doctor.id == doctor_id
            ).first()

            if not doctor:
                return jsonify({
                    "status": "error",
                    "message": "Doctor not found"
                }), 404

        record = HealthRecord(
            patient_id=patient_id,
            doctor_id=doctor_id,
            diagnosis=diagnosis,
            prescription=prescription,
            notes=notes
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return jsonify({
            "status": "success",
            "message": "Health record created successfully",
            "health_record": {
                "id": record.id,
                "patient_id": record.patient_id,
                "doctor_id": record.doctor_id,
                "diagnosis": record.diagnosis,
                "prescription": record.prescription,
                "notes": record.notes,
                "record_date": record.record_date.isoformat()
            }
        }), 201

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to create health record",
            "error": str(e)
        }), 500

    finally:
        db.close()