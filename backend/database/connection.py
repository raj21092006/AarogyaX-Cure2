import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()


# ------------------------------------------------------------
# DATABASE CONFIGURATION
# ------------------------------------------------------------

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "aarogyax_cure")

DATABASE_URL = os.getenv("DATABASE_URL")


# ------------------------------------------------------------
# BUILD DATABASE URL
# ------------------------------------------------------------

if not DATABASE_URL:
    DATABASE_URL = URL.create(
        drivername="mysql+pymysql",
        username=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=int(DB_PORT),
        database=DB_NAME,
    )


# ------------------------------------------------------------
# TI DB CLOUD TLS CERTIFICATE
# ------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
CA_CERT_PATH = BASE_DIR / "isrgrootx1.pem"


# ------------------------------------------------------------
# DATABASE ENGINE
# ------------------------------------------------------------

if "sqlite" in str(DATABASE_URL):

    engine = create_engine(
        str(DATABASE_URL),
        connect_args={
            "check_same_thread": False
        },
        echo=False
    )

else:

    connect_args = {
        "ssl": {
            "ca": str(CA_CERT_PATH)
        }
    }

    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_recycle=280,
        echo=False
    )


# ------------------------------------------------------------
# SESSION
# ------------------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# ------------------------------------------------------------
# BASE MODEL
# ------------------------------------------------------------

Base = declarative_base()


# ------------------------------------------------------------
# DATABASE DEPENDENCY
# ------------------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ------------------------------------------------------------
# INITIALIZE DATABASE
# ------------------------------------------------------------

def init_db():
    Base.metadata.create_all(bind=engine)