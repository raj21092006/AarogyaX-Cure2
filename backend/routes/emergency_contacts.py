from flask import Blueprint, jsonify, request

from database.connection import SessionLocal
from database.models import EmergencyContact, User


emergency_contacts_bp = Blueprint(
    "emergency_contacts",
    __name__
)


# ============================================================
# GET USER'S EMERGENCY CONTACTS
# ============================================================

@emergency_contacts_bp.route("/user/<int:user_id>", methods=["GET"])
def get_emergency_contacts(user_id):
    db = SessionLocal()

    try:
        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        contacts = db.query(EmergencyContact).filter(
            EmergencyContact.user_id == user_id
        ).all()

        data = []

        for contact in contacts:
            data.append({
                "id": contact.id,
                "user_id": contact.user_id,
                "name": contact.name,
                "phone": contact.phone,
                "relationship_type": contact.relationship_type,
                "created_at": contact.created_at.isoformat()
            })

        return jsonify({
            "status": "success",
            "count": len(data),
            "contacts": data
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Failed to fetch emergency contacts",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# ADD EMERGENCY CONTACT
# ============================================================

@emergency_contacts_bp.route("/", methods=["POST"])
def create_emergency_contact():
    db = SessionLocal()

    try:
        data = request.get_json() or {}

        user_id = data.get("user_id")
        name = data.get("name")
        phone = data.get("phone")
        relationship_type = data.get("relationship_type")

        if not user_id or not name or not phone:
            return jsonify({
                "status": "error",
                "message": "user_id, name and phone are required"
            }), 400

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        contact = EmergencyContact(
            user_id=user_id,
            name=name,
            phone=phone,
            relationship_type=relationship_type
        )

        db.add(contact)
        db.commit()
        db.refresh(contact)

        return jsonify({
            "status": "success",
            "message": "Emergency contact added successfully",
            "contact": {
                "id": contact.id,
                "user_id": contact.user_id,
                "name": contact.name,
                "phone": contact.phone,
                "relationship_type": contact.relationship_type
            }
        }), 201

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add emergency contact",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# DELETE EMERGENCY CONTACT
# ============================================================

@emergency_contacts_bp.route("/<int:contact_id>", methods=["DELETE"])
def delete_emergency_contact(contact_id):
    db = SessionLocal()

    try:
        contact = db.query(EmergencyContact).filter(
            EmergencyContact.id == contact_id
        ).first()

        if not contact:
            return jsonify({
                "status": "error",
                "message": "Emergency contact not found"
            }), 404

        db.delete(contact)
        db.commit()

        return jsonify({
            "status": "success",
            "message": "Emergency contact deleted successfully"
        }), 200

    except Exception as e:
        db.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete emergency contact",
            "error": str(e)
        }), 500

    finally:
        db.close()