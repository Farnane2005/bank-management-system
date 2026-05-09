from sqlalchemy.orm import Session

from app.models.user_model import User

from app.auth.password_handler import (
    hash_password,
    verify_password
)

# ==================================================
# REGISTER USER
# ==================================================

def create_user(
    db: Session,
    username: str,
    password: str
):

    existing = db.query(User).filter(
        User.username == username
    ).first()

    if existing:
        return None

    user = User(
        username=username,
        password=hash_password(password)
    )

    db.add(user)

    db.commit()

    db.refresh(user)

    return user

# ==================================================
# LOGIN USER
# ==================================================

def authenticate_user(
    db: Session,
    username: str,
    password: str
):

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        return None

    if not verify_password(
        password,
        user.password
    ):
        return None

    return user