from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    """ Request body for POST /api/auth/register """

    username: str = Field(..., min_length=3, max_length=50,
                          pattern=r"^[a-zA-Z0-9_]+$",
                          description="Letters, numbers and underscores only")
    email:    str = Field(..., description="Valid e-mail address")
    password: str = Field(..., min_length=8, description="At least 8 characters")

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "password": "secret123",
            }
        }
    }


class UserLogin(BaseModel):
    """Request body for POST /api/auth/login"""

    email:    str = Field(..., description="Registered e-mail address")
    password: str = Field(..., description="Account password")

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "john@example.com",
                "password": "secret123",
            }
        }
    }


class UserResponse(BaseModel):
    """Safe public representation of a user — no password hash exposed"""

    id:         int
    username:   str
    email:      str
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfile(BaseModel):
    """Returned from GET /api/auth/me"""

    id:       int
    username: str
    email:    str

    model_config = {"from_attributes": True}