"""Authentication routes."""
from datetime import timedelta, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from server.db.models import User, Subscription
from server.db.session import SessionLocal
from server.auth.password import hash_password, verify_password
from server.auth.jwt import create_access_token, create_refresh_token, verify_token
from server.auth.dependencies import get_current_user, get_db
from server.settings import settings


router = APIRouter(prefix="/auth", tags=["authentication"])


# Pydantic models for request/response
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    is_active: bool
    created_at: datetime
    subscription_plan: str
    subscription_status: str

    class Config:
        from_attributes = True


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    Creates a new user account and returns access and refresh tokens.
    Also creates a trial subscription for the new user.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_pwd = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_pwd,
        name=user_data.name,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create trial subscription (14 days)
    trial_end = datetime.utcnow() + timedelta(days=14)
    subscription = Subscription(
        user_id=new_user.id,
        plan="trial",
        status="active",
        start_date=datetime.utcnow(),
        end_date=trial_end
    )

    db.add(subscription)
    db.commit()

    # Create tokens
    access_token = create_access_token(data={"sub": str(new_user.id)})
    refresh_token = create_refresh_token(data={"sub": str(new_user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.

    Returns access and refresh tokens upon successful authentication.
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()

    # Verify user exists and password is correct
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=Token)
async def refresh_access_token(token_data: TokenRefresh, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token.

    Returns new access and refresh tokens.
    """
    # Verify refresh token
    payload = verify_token(token_data.refresh_token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check token type
    token_type = payload.get("type")
    if token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user ID
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    # Verify user exists and is active
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get current user information.

    Returns the authenticated user's profile information.
    """
    # Get subscription info
    subscription = db.query(Subscription).filter(Subscription.user_id == current_user.id).first()

    subscription_plan = "trial"
    subscription_status = "active"

    if subscription:
        subscription_plan = subscription.plan
        subscription_status = subscription.status

        # Check if subscription is expired
        if subscription.end_date and subscription.end_date < datetime.utcnow():
            subscription_status = "expired"

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        subscription_plan=subscription_plan,
        subscription_status=subscription_status
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout the current user.

    Note: Since we're using stateless JWT tokens, this endpoint
    doesn't actually invalidate the token on the server side.
    The client should discard the tokens after calling this endpoint.
    """
    return {"message": "Successfully logged out"}


@router.put("/change-password")
async def change_password(
    current_password: str = Field(..., min_length=1),
    new_password: str = Field(..., min_length=8),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change the current user's password.
    """
    # Verify current password
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )

    # Update password
    current_user.password_hash = hash_password(new_password)
    current_user.updated_at = datetime.utcnow()

    db.commit()

    return {"message": "Password updated successfully"}
