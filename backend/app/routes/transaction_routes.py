from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.transaction_schema import (
    TransactionCreate
)

from app.schemas.client_schema import (
    ClientResponse
)

from app.services.transaction_service import (
    deposit,
    withdraw,
    get_transactions
)

router = APIRouter()

# ==================================================
# DEPOSIT
# ==================================================

@router.post(
    "/clients/{account_number}/deposit",
    response_model=ClientResponse
)
def make_deposit(
    account_number: str,
    data: TransactionCreate,
    db: Session = Depends(get_db)
):

    client = deposit(
        db,
        account_number,
        data.amount
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    return client

# ==================================================
# WITHDRAW
# ==================================================

@router.post(
    "/clients/{account_number}/withdraw",
    response_model=ClientResponse
)
def make_withdraw(
    account_number: str,
    data: TransactionCreate,
    db: Session = Depends(get_db)
):

    client = withdraw(
        db,
        account_number,
        data.amount
    )

    if client == "insufficient_balance":
        raise HTTPException(
            status_code=400,
            detail="Insufficient balance"
        )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    return client

# ==================================================
# GET TRANSACTIONS
# ==================================================

@router.get(
    "/clients/{account_number}/transactions"
)
def transactions(
    account_number: str,
    db: Session = Depends(get_db)
):

    return get_transactions(
        db,
        account_number
    )