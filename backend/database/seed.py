from werkzeug.security import generate_password_hash

from database.connection import SessionLocal
from database.models import (
    User,
    Patient,
    Doctor,
    Hospital,
    BloodDonor,
    Lab,
)


def seed_database():
    db = SessionLocal()

    try:
        # ----------------------------------------------------
        # Prevent duplicate seed data
        # ----------------------------------------------------
        existing_user = db.query(User).filter(
            User.email == "patient@aarogyax.com"
        ).first()

        if existing_user:
            print("Demo data already exists. Nothing to seed.")
            return

        # ----------------------------------------------------
        # HOSPITALS
        # ----------------------------------------------------
        hospital1 = Hospital(
            name="IQ City Hospital",
            address="Durgapur",
            city="Durgapur",
            latitude=23.5204,
            longitude=87.3119,
            phone="+91 90000 10001",
            emergency_available=True,
            available_beds=42,
        )

        hospital2 = Hospital(
            name="LifeCare Medical Centre",
            address="Bidhannagar, Durgapur",
            city="Durgapur",
            latitude=23.5350,
            longitude=87.2950,
            phone="+91 90000 10002",
            emergency_available=True,
            available_beds=28,
        )

        hospital3 = Hospital(
            name="Sanjeevani Hospital",
            address="Benachity, Durgapur",
            city="Durgapur",
            latitude=23.4830,
            longitude=87.3110,
            phone="+91 90000 10003",
            emergency_available=False,
            available_beds=15,
        )

        db.add_all([
            hospital1,
            hospital2,
            hospital3
        ])

        db.flush()

        # ----------------------------------------------------
        # PATIENT USER
        # ----------------------------------------------------
        patient_user = User(
            name="Animesh Patient",
            email="patient@aarogyax.com",
            phone="+91 90000 20001",
            password_hash=generate_password_hash("demo12345"),
            role="patient",
            is_active=True,
        )

        db.add(patient_user)
        db.flush()

        patient = Patient(
            user_id=patient_user.id,
            age=22,
            gender="Male",
            blood_group="B+",
            address="Durgapur, West Bengal",
            medical_history="No major medical history",
        )

        db.add(patient)

        # ----------------------------------------------------
        # DOCTOR USER
        # ----------------------------------------------------
        doctor_user = User(
            name="Dr. Arindam Banerjee",
            email="doctor@aarogyax.com",
            phone="+91 90000 20002",
            password_hash=generate_password_hash("demo12345"),
            role="doctor",
            is_active=True,
        )

        db.add(doctor_user)
        db.flush()

        doctor = Doctor(
            user_id=doctor_user.id,
            specialty="General Medicine",
            license_no="WB-MED-2026-001",
            hospital_id=hospital1.id,
            experience_years=8,
            available=True,
        )

        db.add(doctor)

        # ----------------------------------------------------
        # HOSPITAL ADMIN USER
        # ----------------------------------------------------
        hospital_admin = User(
            name="Aarogya Hospital Admin",
            email="hospital@aarogyax.com",
            phone="+91 90000 20003",
            password_hash=generate_password_hash("demo12345"),
            role="hospital",
            is_active=True,
        )

        db.add(hospital_admin)
        db.flush()
        # ----------------------------------------------------
        # BLOOD DONORS
        # ----------------------------------------------------
        donors = [
            BloodDonor(
                name="RAJ PATRA",
                phone="+91 8327816844",
                blood_group="O-",
                city="Durgapur",
                latitude=23.5220,
                longitude=87.3140,
                available=True,
            ),

            BloodDonor(
                name="Shila Patra",
                phone="+91 9735158088",
                blood_group="O+",
                city="Durgapur",
                latitude=23.5150,
                longitude=87.3090,
                available=True,
            ),

            BloodDonor(
                name="Samir Kumar Patra",
                phone="+91 9735158028",
                blood_group="A+",
                city="Durgapur",
                latitude=23.5300,
                longitude=87.3000,
                available=True,
            ),

            BloodDonor(
                name="Riya Sen",
                phone="+91 90000 30004",
                blood_group="O-",
                city="Durgapur",
                latitude=23.4900,
                longitude=87.3150,
                available=True,
            ),

            BloodDonor(
                name="Amit Ghosh",
                phone="+91 90000 30005",
                blood_group="AB+",
                city="Durgapur",
                latitude=23.5250,
                longitude=87.2900,
                available=True,
            ),
        ]

        db.add_all(donors)

        # ----------------------------------------------------
        # DIAGNOSTIC LABS
        # ----------------------------------------------------
        lab1 = Lab(
            name="Aarogya Diagnostics",
            address="City Centre, Durgapur",
            city="Durgapur",
            latitude=23.5210,
            longitude=87.3130,
            phone="+91 90000 40001",
            services="Blood Test, CBC, Lipid Profile, Thyroid, ECG",
        )

        lab2 = Lab(
            name="HealthCheck Diagnostic Lab",
            address="Benachity, Durgapur",
            city="Durgapur",
            latitude=23.4850,
            longitude=87.3080,
            phone="+91 90000 40002",
            services="Blood Test, X-Ray, Ultrasound, Diabetes Test",
        )

        db.add_all([
            lab1,
            lab2
        ])

        # ----------------------------------------------------
        # SAVE EVERYTHING
        # ----------------------------------------------------
        db.commit()

        print("==============================================")
        print("AarogyaX Cure demo data inserted successfully!")
        print("==============================================")
        print("Patient : patient@aarogyax.com / demo12345")
        print("Doctor  : doctor@aarogyax.com / demo12345")
        print("Hospital: hospital@aarogyax.com / demo12345")
        print("Hospitals added : 3")
        print("Blood donors    : 5")
        print("Labs            : 2")
        print("==============================================")

    except Exception as e:
        db.rollback()
        print("Database seeding failed!")
        print(e)

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()