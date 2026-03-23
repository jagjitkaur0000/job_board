from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.jwt import SECRET_KEY, ALGORITHM


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:

    print("\n=== AUTH DEBUG START ===")
    print("TOKEN RECEIVED:", token)
    print("SECRET_KEY:", SECRET_KEY)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        print("DECODED PAYLOAD:", payload)

        user_id = payload.get("sub")

        if user_id is None:
            print("ERROR: user_id missing in token")
            raise credentials_exception

        user_id = int(user_id)
        print("USER ID:", user_id)

    except JWTError as e:
        print("JWT ERROR:", str(e))
        raise credentials_exception
    except ValueError as e:
        print("VALUE ERROR:", str(e))
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        print("ERROR: User not found in DB")
        raise credentials_exception

    print("AUTH SUCCESS:", user.email)
    print("=== AUTH DEBUG END ===\n")

    return user


def require_role(role_name: str) -> Callable:

    def role_dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:

        print("ROLE CHECK:", current_user.role.name, "required:", role_name)

        if current_user.role is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no role assigned",
            )

        if current_user.role.name != role_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions",
            )

        return current_user

    return role_dependency