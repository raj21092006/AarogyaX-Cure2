from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import Lab


labs_bp = Blueprint("labs", __name__)


# ============================================================
# GET ALL LABS
# ============================================================

@labs_bp.route("/", methods=["GET"])
def get_labs():
    db = SessionLocal()

    try:
        city = request.args.get("city")

        query = db.query(Lab)

        if city:
            query = query.filter(Lab.city == city)

        labs = query.all()

        data = []

        for lab in labs:
            data.append({
                "id": lab.id,
                "name": lab.name,
                "address": lab.address,
                "city": lab.city,
                "latitude": lab.latitude,
                "longitude": lab.longitude,
                "phone": lab.phone,
                "services": lab.services
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "labs": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch diagnostic labs",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# GET SINGLE LAB
# ============================================================

@labs_bp.route("/<int:lab_id>", methods=["GET"])
def get_lab(lab_id):
    db = SessionLocal()

    try:
        lab = db.query(Lab).filter(
            Lab.id == lab_id
        ).first()

        if not lab:
            return jsonify({
                "status": "error",
                "message": "Diagnostic lab not found"
            }), 404

        return jsonify({
            "status": "success",
            "lab": {
                "id": lab.id,
                "name": lab.name,
                "address": lab.address,
                "city": lab.city,
                "latitude": lab.latitude,
                "longitude": lab.longitude,
                "phone": lab.phone,
                "services": lab.services
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch diagnostic lab",
            "error": str(e)
        }), 500

    finally:
        db.close()