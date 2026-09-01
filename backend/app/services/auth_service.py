from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict

from app.models.user import User
from app.models.role import Role
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token


def register_user(
    db: Session,
    email: str,
    password: str,
    role_name: str,
    full_name: str
) -> User:

    # Check whether email is already registered
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Find requested role
    role = (
        db.query(Role)
        .filter(Role.name == role_name)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{role_name}' does not exist"
        )

    # Clean name
    cleaned_name = full_name.strip()

    if not cleaned_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name cannot be empty"
        )

    # bcrypt only supports passwords up to 72 bytes
    safe_password = password[:72]

    hashed_password = hash_password(safe_password)

    # Create user
    new_user = User(
        email=email,
        password_hash=hashed_password,
        role_id=role.id,
        full_name=cleaned_name,
        email_verified=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


def login_user(
    db: Session,
    email: str,
    password: str
) -> Dict[str, str]:

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # bcrypt only supports passwords up to 72 bytes
    safe_password = password[:72]

    if not verify_password(
        safe_password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    role = (
        db.query(Role)
        .filter(Role.id == user.role_id)
        .first()
    )

    if not role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User role not found"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role_id": user.role_id,
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role_name": role.name
    }