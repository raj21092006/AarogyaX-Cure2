from flask import Flask, jsonify
from flask_cors import CORS

from database.connection import init_db

# ------------------------------------------------------------
# ROUTES
# ------------------------------------------------------------
from routes.auth import auth_bp
from routes.hospitals import hospitals_bp
from routes.blood import blood_bp
from routes.labs import labs_bp
from routes.patients import patients_bp
from routes.health_records import health_records_bp
from routes.doctors import doctors_bp
from routes.appointments import appointments_bp
from routes.emergency_contacts import emergency_contacts_bp
from routes.sos import sos_bp
from routes.assistant import assistant_bp
# ------------------------------------------------------------
# FLASK APP
# ------------------------------------------------------------

app = Flask(__name__)

CORS(app)


# ------------------------------------------------------------
# DATABASE
# ------------------------------------------------------------

init_db()


# ------------------------------------------------------------
# REGISTER BLUEPRINTS
# ------------------------------------------------------------

# Authentication
app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

# Hospitals
app.register_blueprint(
    hospitals_bp,
    url_prefix="/api/hospitals"
)

# Blood Donors
app.register_blueprint(
    blood_bp,
    url_prefix="/api/blood"
)

# Diagnostic Labs
app.register_blueprint(
    labs_bp,
    url_prefix="/api/labs"
)

# Patients
app.register_blueprint(
    patients_bp,
    url_prefix="/api/patients"
)

# Health Records
app.register_blueprint(
    health_records_bp,
    url_prefix="/api/health_records"
)

# Doctors
app.register_blueprint(
    doctors_bp,
    url_prefix="/api/doctors"
)

# Appointments
app.register_blueprint(
    appointments_bp,
    url_prefix="/api/appointments"
)

# Emergency Contacts
app.register_blueprint(
    emergency_contacts_bp,
    url_prefix="/api/emergency-contacts"
)

# sos 
app.register_blueprint(
    sos_bp,
    url_prefix="/api/sos"
)

# AI Assistant
app.register_blueprint(
    assistant_bp,
    url_prefix="/api/assistant"
)



# ------------------------------------------------------------
# HOME
# ------------------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "AarogyaX Cure Backend is running"
    })


# ------------------------------------------------------------
# HEALTH CHECK
# ------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "database": "MySQL",
        "message": "Backend API is healthy"
    })


# ------------------------------------------------------------
# RUN SERVER
# ------------------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )