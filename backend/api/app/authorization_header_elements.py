"""Module to get the bearer token from the Authorization header."""


from typing import NamedTuple

from custom_exceptions import BadCredentialsException, RequiresAuthenticationException
from starlette.requests import Request as StarletteRequest


class AuthorizationHeaderElements(NamedTuple):
    """Named tuple to hold the elements of the Authorization header."""

    authorization_scheme: str
    bearer_token: str
    are_valid: bool


def get_authorization_header_elements(
    authorization_header: str,
) -> AuthorizationHeaderElements:
    """Get the elements of the Authorization header."""
    try:
        authorization_scheme, bearer_token = authorization_header.split()
    except ValueError as exc:
        raise BadCredentialsException from exc
    valid = authorization_scheme.lower() == "bearer" and bool(bearer_token.strip())
    return AuthorizationHeaderElements(authorization_scheme, bearer_token, valid)


def get_bearer_token(request: StarletteRequest) -> str:
    """Get the bearer token from the Authorization header."""
    authorization_header = request.headers.get("Authorization")
    if authorization_header:
        authorization_header_elements = get_authorization_header_elements(
            authorization_header
        )
        if authorization_header_elements.are_valid:
            return authorization_header_elements.bearer_token
        raise BadCredentialsException
    raise RequiresAuthenticationException
