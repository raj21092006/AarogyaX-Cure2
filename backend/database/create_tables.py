from database.connection import engine, Base
from database import models


def create_tables():
    print("Creating AarogyaX Cure database tables...")

    try:
        Base.metadata.create_all(bind=engine)
        print("All database tables created successfully!")

    except Exception as e:
        print("Database table creation failed!")
        print(e)


if __name__ == "__main__":
    create_tables()