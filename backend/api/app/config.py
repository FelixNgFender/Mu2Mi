"""Configuration for the application."""
from pydantic import BaseSettings, validator

# pylint: disable=too-few-public-methods


class Settings(BaseSettings):
    """Settings for the application."""

    sqlalchemy_database_url: str
    client_origin_url: str
    auth0_audience: str
    auth0_domain: str
    port: int
    reload: bool

    @classmethod
    @validator(
        "sqlalchemy_database_url", "client_origin_url", "auth0_audience", "auth0_domain"
    )
    def check_not_empty(cls, value):
        """Check that the value is not empty."""
        assert value != "", f"{value} is not defined"
        return value

    class Config:
        """Configuration for the settings."""

        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
