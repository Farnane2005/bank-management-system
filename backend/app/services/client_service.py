from sqlalchemy.orm import Session

from app.models.client_model import Client

# ==================================================
# CREATE CLIENT
# ==================================================

def create_client(
    db: Session,
    name: str,
    account_number: str
):

    existing = db.query(Client).filter(
        Client.account_number == account_number
    ).first()

    if existing:
        return None

    client = Client(
        name=name,
        account_number=account_number,
        balance=0
    )

    db.add(client)

    db.commit()

    db.refresh(client)

    return client

# ==================================================
# GET ALL CLIENTS
# ==================================================

def get_all_clients(
    db: Session
):

    return db.query(Client).all()

# ==================================================
# GET CLIENT
# ==================================================

def get_client_by_account_number(
    db: Session,
    account_number: str
):

    return db.query(Client).filter(
        Client.account_number == account_number
    ).first()

# ==================================================
# UPDATE CLIENT
# ==================================================

def update_client(
    db: Session,
    account_number: str,
    new_name: str
):

    client = get_client_by_account_number(
        db,
        account_number
    )

    if not client:
        return None

    client.name = new_name

    db.commit()

    db.refresh(client)

    return client

# ==================================================
# DELETE CLIENT
# ==================================================

def delete_client(
    db: Session,
    account_number: str
):

    client = get_client_by_account_number(
        db,
        account_number
    )

    if not client:
        return False

    db.delete(client)

    db.commit()

    return True