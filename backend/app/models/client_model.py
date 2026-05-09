from sqlalchemy import (
    Column,
    Integer,
    String,
    Float
)

from app.database import Base

class Client(Base):

    __tablename__ = "clients"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    account_number = Column(
        String,
        unique=True,
        nullable=False
    )

    balance = Column(
        Float,
        default=0
    )