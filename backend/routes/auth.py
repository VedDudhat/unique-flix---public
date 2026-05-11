from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

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
async def register(

    body: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    """Creates a new user account."""

    result = await db.execute(
        select(User).where(User.email == body.email)
    )

    existing_email = result.scalar_one_or_none()

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    result = await db.execute(
        select(User).where(User.username == body.username)
    )

    existing_username = result.scalar_one_or_none()

    if existing_username:
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

    await db.commit()
    await db.refresh(user)

    return user


# Login
@router.post("/login", response_model=TokenResponse, summary="Log in and receive a JWT",
             )
async def login(
    body: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticates the user with email + password.
    """

    result = await db.execute(
        select(User).where(User.email == body.email)
    )

    user = result.scalar_one_or_none()

    invalid = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
    )

    if not user or not verify_password(
        body.password,
        user.password_hash,
    ):
        raise invalid

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated.",
        )

    token, _, _ = await create_access_token(user.id, db)

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
    db: AsyncSession = Depends(get_db),
):
    """Marks the current token as revoked."""

    result = await db.execute(
        select(TokenRecord)
        .where(
            TokenRecord.user_id == current_user.id,
            TokenRecord.is_revoked == False,
        )
        .order_by(TokenRecord.created_at.desc())
    )

    record = result.scalars().first()

    if record:
        record.is_revoked = True
        await db.commit()

    return {
        "message": f"Successfully logged out. Goodbye, {current_user.username}!"
    }


# Get current loggen in user
@router.get("/me", response_model=UserProfile, summary="Get the currently logged-in user's profile",
            )
async def me(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the user identified by the Bearer token."""

    return current_user
