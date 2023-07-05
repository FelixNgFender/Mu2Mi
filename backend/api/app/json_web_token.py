"""JSON Web Token (JWT) validation using PyJWT"""
from dataclasses import dataclass

import jwt
from config import settings
from custom_exceptions import BadCredentialsException, UnableCredentialsException


@dataclass
class JsonWebToken:
    """Perform JSON Web Token (JWT) validation using PyJWT"""

    jwt_access_token: str
    auth0_issuer_url: str = f"https://{settings.auth0_domain}/"
    auth0_audience: str = settings.auth0_audience
    algorithm: str = "RS256"
    jwks_uri: str = f"{auth0_issuer_url}.well-known/jwks.json"

    def validate(self):
        """Validate the JWT."""
        try:
            jwks_client = jwt.PyJWKClient(self.jwks_uri)
            jwt_signing_key = jwks_client.get_signing_key_from_jwt(
                self.jwt_access_token
            ).key
            payload = jwt.decode(
                self.jwt_access_token,
                jwt_signing_key,
                algorithms=self.algorithm,
                audience=self.auth0_audience,
                issuer=self.auth0_issuer_url,
            )
        except jwt.exceptions.PyJWKClientError as exc:
            raise UnableCredentialsException from exc
        except jwt.exceptions.InvalidTokenError as exc:
            raise BadCredentialsException from exc
        return payload
