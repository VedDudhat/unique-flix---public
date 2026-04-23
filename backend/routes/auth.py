from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.models.user import User
from backend.models.token import TokenRecord
from backend.schemas.user import UserRegister, UserLogin, UserResponse, UserProfile
from backend.schemas.token import TokenResponse, LogoutResponse
from backend.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# Register
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED,
             summary="Create a new account",
             )
async def register(body: UserRegister, db: Session = Depends(get_db)):
    """ Creates a new user account. """

    # Check for duplicate email
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Check for duplicate username
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken.",
        )

    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# Login
@router.post("/login", response_model=TokenResponse, summary="Log in and receive a JWT",
             )
async def login(body: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates the user with email + password.
    Authorization: Bearer <access_token>
    """
    # Look up by email
    user = db.query(User).filter(User.email == body.email).first()

    # Always use the same error message — don't reveal whether email exists
    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
    )

    if not user or not verify_password(body.password, user.password_hash):
        raise invalid

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact support.",
        )

    token, _, _ = create_access_token(user.id, db)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user_id": user.id,
        "username": user.username,
    }


# ─── Logout ───────────────────────────────────────────────────────────────────
@router.post("/logout", response_model=LogoutResponse, summary="Revoke current JWT (log out)",
             )
async def logout(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
):
    """ Marks the current token as revoked in the database. """

    # get_current_user already validated the token; re-fetch the record from DB
    # via the Authorization header — we need the jti from the request context.
    # We grab it by finding the most recent active token for this user.
    # (A cleaner approach stores jti in request.state — kept simple here.)
    record = (
        db.query(TokenRecord)
        .filter(
            TokenRecord.user_id == current_user.id,
            TokenRecord.is_revoked == False,
        )
        .order_by(TokenRecord.created_at.desc())
        .first()
    )

    if record:
        record.is_revoked = True
        db.commit()

    return {"message": f"Successfully logged out. Goodbye, {current_user.username}!"}


# Get current loggen in user
@router.get("/me", response_model=UserProfile, summary="Get the currently logged-in user's profile",
            )
async def me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the user identified by the Bearer token.
    Use this on the frontend to verify a token is still valid and get user info.
    """
    return current_user