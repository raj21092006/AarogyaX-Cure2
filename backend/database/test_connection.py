from database.connection import engine

try:
    with engine.connect() as connection:
        print("MYSQL DATABASE CONNECTED SUCCESSFULLY!")
except Exception as e:
    print("DATABASE CONNECTION FAILED!")
    print(e)