"""Database connection and session management module."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings

# Create the SQLAlchemy engine
engine = create_engine(settings.sqlalchemy_database_url)
# Each instance of the SessionLocal class will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Inherit from this class to create database models or classes
Base = declarative_base()
