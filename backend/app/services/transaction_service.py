from sqlalchemy.orm import Session

from app.models.client_model import Client

from app.models.transaction_model import (
    Transaction
)

# ==================================================
# DEPOSIT
# ==================================================

def deposit(
    db: Session,
    account_number: str,
    amount: float
):

    client = db.query(Client).filter(
        Client.account_number == account_number
    ).first()

    if not client:
        return None

    # RULE:
    # deposit always increases balance
    client.balance += amount

    transaction = Transaction(
        account_number=account_number,
        type="deposit",
        amount=amount
    )

    db.add(transaction)

    db.commit()

    db.refresh(client)

    return client

# ==================================================
# WITHDRAW
# ==================================================

def withdraw(
    db: Session,
    account_number: str,
    amount: float
):

    client = db.query(Client).filter(
        Client.account_number == account_number
    ).first()

    if not client:
        return None

    # RULE:
    # balance can never be negative
    if amount > client.balance:
        return "insufficient_balance"

    client.balance -= amount

    transaction = Transaction(
        account_number=account_number,
        type="withdraw",
        amount=amount
    )

    db.add(transaction)

    db.commit()

    db.refresh(client)

    return client

# ==================================================
# GET TRANSACTIONS
# ==================================================

def get_transactions(
    db: Session,
    account_number: str
):

    return db.query(Transaction).filter(
        Transaction.account_number == account_number
    ).all()