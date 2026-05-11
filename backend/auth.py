from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from jose import JWTError, jwt
from passlib.context import CryptContext

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database.database import get_db
from backend.models.user import User
from backend.models.token import TokenRecord
from backend.schemas.token import TokenPayload


# Config
SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "claus-the-king-of-kings",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)


# Password hashing
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
)


def hash_password(password: str):
    if len(password.encode("utf-8")) > 72:
        raise ValueError(
            "Password too long. Maximum 72 bytes."
        )

    return pwd_context.hash(password)


def verify_password(
    plain: str,
    hashed: str,
) -> bool:
    return pwd_context.verify(plain, hashed)


# Create JWT
async def create_access_token(
    user_id: int,
    db: AsyncSession,
) -> tuple[str, str, datetime]:

    """
    Creates JWT + stores token record.
    """

    jti = str(uuid.uuid4())

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "sub": str(user_id),
        "jti": jti,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    # Save token record
    record = TokenRecord(
        jti=jti,
        user_id=user_id,
        token=token,
        is_revoked=False,
        expires_at=expires_at,
    )

    db.add(record)

    await db.commit()
    await db.refresh(record)

    return token, jti, expires_at


# Decode JWT
def decode_token(
    token: str,
) -> Optional[TokenPayload]:

    try:
        raw = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        return TokenPayload(
            sub=raw.get("sub"),
            jti=raw.get("jti"),
        )

    except JWTError:
        return None


# Bearer auth
bearer_scheme = HTTPBearer()


# Current user dependency
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: AsyncSession = Depends(get_db),
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token
    payload = decode_token(credentials.credentials)

    if (
        payload is None
        or payload.sub is None
        or payload.jti is None
    ):
        raise credentials_exception

    # Check token record
    result = await db.execute(
        select(TokenRecord).where(
            TokenRecord.jti == payload.jti
        )
    )

    record = result.scalar_one_or_none()

    if record is None or record.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Load user
    result = await db.execute(
        select(User).where(
            User.id == int(payload.sub)
        )
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    return user