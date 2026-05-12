from pydantic import BaseModel
from typing import Optional


class TokenResponse(BaseModel):
    """ Returned after a successful login. """

    access_token: str
    token_type:   str = "bearer"
    expires_in:   float
    user_id:      int
    username:     str


class TokenPayload(BaseModel):
    """
    The decoded claims we expect inside every JWT.
    - sub  : subject = user_id as a string
    - jti  : unique token ID (used to look up the DB record)
    - exp  : expiry unix timestamp (handled automatically by python-jose)
    """
    sub: Optional[str] = None
    jti: Optional[str] = None


class LogoutResponse(BaseModel):
    message: str
