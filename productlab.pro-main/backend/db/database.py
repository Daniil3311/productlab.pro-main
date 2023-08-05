import contextlib
import traceback

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import Config


DATABASE_URL = Config.DB_CONFIG


engine = create_engine(DATABASE_URL, pool_size=100, max_overflow=0)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# @contextlib.contextmanager
def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
