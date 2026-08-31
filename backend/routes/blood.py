from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import BloodDonor


blood_bp = Blueprint("blood", __name__)


# ============================================================
# GET BLOOD DONORS
# ============================================================

@blood_bp.route("/donors", methods=["GET"])
def get_blood_donors():
    db = SessionLocal()

    try:
        blood_group = request.args.get("blood_group")
        city = request.args.get("city")

        query = db.query(BloodDonor)

        if blood_group:
            query = query.filter(
                BloodDonor.blood_group == blood_group
            )

        if city:
            query = query.filter(
                BloodDonor.city == city
            )

        donors = query.all()

        data = []

        for donor in donors:
            data.append({
                "id": donor.id,
                "name": donor.name,
                "phone": donor.phone,
                "blood_group": donor.blood_group,
                "city": donor.city,
                "latitude": donor.latitude,
                "longitude": donor.longitude,
                "available": donor.available
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "donors": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch blood donors",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE BLOOD DONOR
# ============================================================

@blood_bp.route("/<int:donor_id>", methods=["GET"])
def get_blood_donor(donor_id):
    db = SessionLocal()

    try:
        donor = db.query(BloodDonor).filter(
            BloodDonor.id == donor_id
        ).first()

        if not donor:
            return jsonify({
                "status": "error",
                "message": "Blood donor not found"
            }), 404

        return jsonify({
            "status": "success",
            "donor": {
                "id": donor.id,
                "name": donor.name,
                "phone": donor.phone,
                "blood_group": donor.blood_group,
                "city": donor.city,
                "latitude": donor.latitude,
                "longitude": donor.longitude,
                "available": donor.available
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch blood donor",
            "error": str(e)
        }), 500

    finally:
        db.close()