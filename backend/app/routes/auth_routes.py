from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.auth_schema import (
    UserRegister,
    UserLogin
)

from app.services.auth_service import (
    create_user,
    authenticate_user
)

from app.auth.jwt_handler import (
    create_access_token
)

router = APIRouter()

# ==================================================
# REGISTER
# ==================================================

@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    created_user = create_user(
        db,
        user.username,
        user.password
    )

    if not created_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    return {
        "message": "User created successfully"
    }

# ==================================================
# LOGIN
# ==================================================

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    authenticated_user = authenticate_user(
        db,
        user.username,
        user.password
    )

    if not authenticated_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token(
        data={
            "sub": authenticated_user.username
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }