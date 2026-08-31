import os
import jwt
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from database.connection import SessionLocal
from database.models import User, Patient, Doctor

auth_bp = Blueprint("auth", __name__)

SECRET_KEY = os.getenv("SECRET_KEY", "aarogyax-cure-super-secret-key-2026")


def generate_jwt_token(user):
    """Generates a cryptographically signed HMAC-SHA256 JWT token."""
    payload = {
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


# ============================================================
# REGISTER
# ============================================================

@auth_bp.route("/register", methods=["POST"])
def register():
    db = SessionLocal()

    try:
        data = request.get_json() or {}

        name = data.get("name")
        email = data.get("email")
        phone = data.get("phone")
        password = data.get("password")
        role = data.get("role", "patient")

        if not name or not email or not password:
            return jsonify({
                "status": "error",
                "message": "Name, email and password are required"
            }), 400

        email = email.strip().lower()

        if len(password) < 6:
            return jsonify({
                "status": "error",
                "message": "Password must be at least 6 characters long"
            }), 400

        allowed_roles = ["patient", "doctor", "hospital"]

        if role not in allowed_roles:
            return jsonify({
                "status": "error",
                "message": "Invalid role"
            }), 400

        existing_user = db.query(User).filter(
            User.email == email
        ).first()

        if existing_user:
            return jsonify({
                "status": "error",
                "message": "Email already registered"
            }), 409

        user = User(
            name=name.strip(),
            email=email,
            phone=phone,
            password_hash=generate_password_hash(password),
            role=role,
            is_active=True
        )

        db.add(user)
        db.flush()

        # ----------------------------------------------------
        # Create role-specific profile
        # ----------------------------------------------------

        if role == "patient":
            patient = Patient(
                user_id=user.id,
                age=data.get("age"),
                gender=data.get("gender"),
                blood_group=data.get("bloodGroup"),
                address=data.get("address"),
                medical_history=data.get("medicalHistory")
            )
            db.add(patient)

        elif role == "doctor":
            doctor = Doctor(
                user_id=user.id,
                specialty=data.get("specialty"),
                license_no=data.get("licenseNo"),
                hospital_id=data.get("hospitalId"),
                experience_years=data.get("experienceYears"),
                available=True
            )
            db.add(doctor)

        db.commit()

        token = generate_jwt_token(user)

        return jsonify({
            "status": "success",
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }), 201

    except IntegrityError:
        db.rollback()
        return jsonify({
            "status": "error",
            "message": "Database constraint error"
        }), 409

    except Exception as e:
        db.rollback()
        return jsonify({
            "status": "error",
            "message": "Registration failed",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# LOGIN
# ============================================================

@auth_bp.route("/login", methods=["POST"])
def login():
    db = SessionLocal()

    try:
        data = request.get_json() or {}

        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not email or not password:
            return jsonify({
                "status": "error",
                "message": "Email and password are required"
            }), 400

        email = email.strip().lower()

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if not user.is_active:
            return jsonify({
                "status": "error",
                "message": "Account is inactive"
            }), 403

        if role and user.role != role:
            return jsonify({
                "status": "error",
                "message": "Invalid role for this account"
            }), 403

        if not check_password_hash(
            user.password_hash,
            password
        ):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        token = generate_jwt_token(user)

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "role": user.role,
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role
            }
        }), 200

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Login failed",
            "error": str(e)
        }), 500

    finally:
        db.close()


# ============================================================
# VERIFY JWT TOKEN
# ============================================================

@auth_bp.route("/verify", methods=["GET", "POST"])
def verify():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({
            "status": "error",
            "message": "Missing authorization header token"
        }), 401

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({
            "status": "success",
            "valid": True,
            "user": {
                "id": payload.get("user_id"),
                "name": payload.get("name"),
                "email": payload.get("email"),
                "role": payload.get("role")
            }
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({
            "status": "error",
            "message": "Session expired. Please log in again."
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            "status": "error",
            "message": "Invalid authentication token."
        }), 401