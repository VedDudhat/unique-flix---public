from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid
import os

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.user import User
from backend.models.token import TokenRecord
from backend.schemas.token import TokenPayload

# Config
SECRET_KEY = os.getenv("SECRET_KEY", "claus-the-king-of-kings")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Password hashing
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str):
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password too long. Maximum 72 bytes.")
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# jwt create
def create_access_token(user_id: int, db: Session) -> tuple[str, str, datetime]:
    """ Creates a signed JWT and persists a TokenRecord in the database.
    Returns (token_string, jti, expires_at)
    """
    jti = str(uuid.uuid4())  # unique ID for this specific token
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "jti": jti,
        "exp": expires_at,
        "iat": datetime.now(timezone.utc),
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # Persist to DB so we can revoke it on logout
    record = TokenRecord(
        jti=jti,
        user_id=user_id,
        token=token,
        is_revoked=False,
        expires_at=expires_at,
    )
    db.add(record)
    db.commit()

    return token, jti, expires_at


# jwt decoding
def decode_token(token: str) -> Optional[TokenPayload]:
    """
    Decodes and verifies the JWT signature + expiry.
    Returns a TokenPayload or None if invalid.
    """
    try:
        raw = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(sub=raw.get("sub"), jti=raw.get("jti"))
    except JWTError:
        return None


# HTTPBearer extractor
bearer_scheme = HTTPBearer()


# get_current_user dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
                    db: Session = Depends(get_db),
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # token decode
    payload = decode_token(credentials.credentials)
    if payload is None or payload.sub is None or payload.jti is None:
        raise credentials_exception

    # Step 3 — check DB record exists and is not revoked
    record = db.query(TokenRecord).filter(TokenRecord.jti == payload.jti).first()
    if record is None or record.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Step 4 — load the user
    user = db.query(User).filter(User.id == int(payload.sub)).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    return user