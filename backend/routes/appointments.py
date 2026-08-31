from datetime import datetime
from flask import Blueprint,jsonify,request
from database.connection import SessionLocal
from database.models import Appointment,Patient,Doctor,Hospital
appointments_bp = Blueprint("appointments",__name__)

# ============================================================
# GET ALL APPOINTMENTS
# ============================================================

@appointments_bp.route("/", methods=["GET"])
def get_appointments():
    db = SessionLocal()

    try:
        patient_id = request.args.get("patient_id", type=int)
        doctor_id = request.args.get("doctor_id", type=int)
        status = request.args.get("status")

        query = db.query(Appointment)

        if patient_id:
            query = query.filter(
                Appointment.patient_id == patient_id
            )

        if doctor_id:
            query = query.filter(
                Appointment.doctor_id == doctor_id
            )

        if status:
            query = query.filter(
                Appointment.status == status
            )

        appointments = query.order_by(
            Appointment.appointment_date.asc()
        ).all()

        data = []

        for appointment in appointments:
            data.append({
                "id": appointment.id,
                "patient_id": appointment.patient_id,
                "doctor_id": appointment.doctor_id,
                "hospital_id": appointment.hospital_id,
                "appointment_date": appointment.appointment_date.isoformat(),
                "reason": appointment.reason,
                "status": appointment.status
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "appointments": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch appointments",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE APPOINTMENT
# ============================================================

@appointments_bp.route("/<int:appointment_id>", methods=["GET"])
def get_appointment(appointment_id):
    db = SessionLocal()

    try:
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()

        if not appointment:
            return jsonify({
                "status": "error",
                "message": "Appointment not found"
            }), 404

        return jsonify({
            "status": "success",
            "appointment": {
                "id": appointment.id,
                "patient_id": appointment.patient_id,
                "doctor_id": appointment.doctor_id,
                "hospital_id": appointment.hospital_id,
                "appointment_date": appointment.appointment_date.isoformat(),
                "reason": appointment.reason,
                "status": appointment.status
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch appointment",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# CREATE APPOINTMENT
# ============================================================

@appointments_bp.route("/", methods=["POST"])
def create_appointment():
    db = SessionLocal()

    try:
        data = request.get_json() or {}

        patient_id = data.get("patient_id")
        doctor_id = data.get("doctor_id")
        hospital_id = data.get("hospital_id")
        appointment_date = data.get("appointment_date")
        reason = data.get("reason")

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

        if not patient_id or not doctor_id or not appointment_date:
            return jsonify({
                "status": "error",
                "message": "patient_id, doctor_id and appointment_date are required"
            }), 400

        # ----------------------------------------------------
        # Check patient
        # ----------------------------------------------------

        patient = db.query(Patient).filter(
            Patient.id == patient_id
        ).first()

        if not patient:
            return jsonify({
                "status": "error",
                "message": "Patient not found"
            }), 404

        # ----------------------------------------------------
        # Check doctor
        # ----------------------------------------------------

        doctor = db.query(Doctor).filter(
            Doctor.id == doctor_id
        ).first()

        if not doctor:
            return jsonify({
                "status": "error",
                "message": "Doctor not found"
            }), 404

        if not doctor.available:
            return jsonify({
                "status": "error",
                "message": "Doctor is currently unavailable"
            }), 409

        # ----------------------------------------------------
        # Check hospital if provided
        # ----------------------------------------------------

        if hospital_id:
            hospital = db.query(Hospital).filter(
                Hospital.id == hospital_id
            ).first()

            if not hospital:
                return jsonify({
                    "status": "error",
                    "message": "Hospital not found"
                }), 404

        # ----------------------------------------------------
        # Convert appointment date
        # ----------------------------------------------------

        try:
            appointment_datetime = datetime.fromisoformat(
                appointment_date.replace("Z", "+00:00")
            )
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Invalid appointment_date format. Use ISO format."
            }), 400

        # ----------------------------------------------------
        # Create appointment
        # ----------------------------------------------------

        appointment = Appointment(
            patient_id=patient_id,
            doctor_id=doctor_id,
            hospital_id=hospital_id,
            appointment_date=appointment_datetime,
            reason=reason,
            status="pending"
        )

        db.add(appointment)
        db.commit()
        db.refresh(appointment)

        return jsonify({
            "status": "success",
            "message": "Appointment created successfully",
            "appointment": {
                "id": appointment.id,
                "patient_id": appointment.patient_id,
                "doctor_id": appointment.doctor_id,
                "hospital_id": appointment.hospital_id,
                "appointment_date": appointment.appointment_date.isoformat(),
                "reason": appointment.reason,
                "status": appointment.status
            }
        }), 201

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to create appointment",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# UPDATE APPOINTMENT STATUS
# ============================================================

@appointments_bp.route("/<int:appointment_id>/status", methods=["PUT"])
def update_appointment_status(appointment_id):
    db = SessionLocal()

    try:
        appointment = db.query(Appointment).filter(
            Appointment.id == appointment_id
        ).first()

        if not appointment:
            return jsonify({
                "status": "error",
                "message": "Appointment not found"
            }), 404

        data = request.get_json() or {}
        new_status = data.get("status")

        allowed_statuses = [
            "pending",
            "confirmed",
            "completed",
            "cancelled"
        ]

        if new_status not in allowed_statuses:
            return jsonify({
                "status": "error",
                "message": "Invalid appointment status"
            }), 400

        appointment.status = new_status

        db.commit()
        db.refresh(appointment)

        return jsonify({
            "status": "success",
            "message": "Appointment status updated successfully",
            "appointment": {
                "id": appointment.id,
                "status": appointment.status
            }
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update appointment status",
            "error": str(e)
        }), 500

    finally:
        db.close()