import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "aarogyax_cure")
DB_CA = os.getenv("DB_CA", "")

DATABASE_URL = os.getenv("DATABASE_URL")

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
# DATABASE ENGINE
# ------------------------------------------------------------

try:
    if "sqlite" in str(DATABASE_URL):

        engine = create_engine(
            str(DATABASE_URL),
            connect_args={"check_same_thread": False},
            echo=False
        )

    else:

        # Find CA certificate
        ca_path = DB_CA

        if ca_path and not os.path.isabs(ca_path):
            project_root = os.path.dirname(os.path.dirname(__file__))
            ca_path = os.path.join(project_root, ca_path)

        engine = create_engine(
            DATABASE_URL,
            connect_args={
                "ssl_ca": ca_path,
                "ssl_verify_cert": True,
                "ssl_verify_identity": True,
            },
            pool_pre_ping=True,
            pool_recycle=280,
            echo=False,
        )

        # Test connection
        with engine.connect() as conn:
            pass

except Exception as e:

    print("Database connection failed:")
    print(e)

    # Fallback to local SQLite
    db_path = os.path.join(
        os.path.dirname(__file__),
        "aarogyax_cure.db"
    )

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
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