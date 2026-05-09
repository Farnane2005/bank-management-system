from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.client_schema import (
    ClientCreate,
    ClientUpdate,
    ClientResponse
)

from app.services.client_service import (
    create_client,
    get_all_clients,
    get_client_by_account_number,
    update_client,
    delete_client
)

router = APIRouter()

# ==================================================
# CREATE CLIENT
# ==================================================

@router.post(
    "/clients",
    response_model=ClientResponse,
    status_code=status.HTTP_201_CREATED
)
def create(
    data: ClientCreate,
    db: Session = Depends(get_db)
):

    client = create_client(
        db,
        data.name,
        data.account_number
    )

    if not client:
        raise HTTPException(
            status_code=400,
            detail="Account number already exists"
        )

    return client

# ==================================================
# GET ALL CLIENTS
# ==================================================

@router.get(
    "/clients",
    response_model=list[ClientResponse]
)
def get_clients(
    db: Session = Depends(get_db)
):

    return get_all_clients(db)

# ==================================================
# GET CLIENT
# ==================================================

@router.get(
    "/clients/{account_number}",
    response_model=ClientResponse
)
def get_client(
    account_number: str,
    db: Session = Depends(get_db)
):

    client = get_client_by_account_number(
        db,
        account_number
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    return client

# ==================================================
# UPDATE CLIENT
# ==================================================

@router.put(
    "/clients/{account_number}",
    response_model=ClientResponse
)
def update(
    account_number: str,
    data: ClientUpdate,
    db: Session = Depends(get_db)
):

    client = update_client(
        db,
        account_number,
        data.name
    )

    if not client:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )

    return client

# ==================================================
# DELETE CLIENT
# ==================================================

@router.delete(
    "/clients/{account_number}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete(
    account_number: str,
    db: Session = Depends(get_db)
):

    success = delete_client(
        db,
        account_number
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Client not found"
        )