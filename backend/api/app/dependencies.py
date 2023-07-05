"""Dependencies for the FastAPI application."""


from authorization_header_elements import get_bearer_token
from fastapi import Depends
from json_web_token import JsonWebToken

from database import SessionLocal

# pylint: disable=invalid-name


def validate_token(token: str = Depends(get_bearer_token)):
    """Validate a token."""
    return JsonWebToken(token).validate()


def get_db():
    """Get a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
