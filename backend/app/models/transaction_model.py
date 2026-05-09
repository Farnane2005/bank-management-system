from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey
)

from app.database import Base

class Transaction(Base):

    __tablename__ = "transactions"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    account_number = Column(
        String,
        ForeignKey("clients.account_number")
    )

    type = Column(String)

    amount = Column(Float)