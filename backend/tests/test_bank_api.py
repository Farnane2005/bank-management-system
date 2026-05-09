from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# ==================================================
# TEST ROOT
# ==================================================

def test_home():

    response = client.get("/")

    assert response.status_code == 200

    assert response.json() == {
        "message": "Bank API Running"
    }

# ==================================================
# TEST REGISTER
# ==================================================

def test_register():

    response = client.post(
        "/register",
        json={
            "username": "admin",
            "password": "123456"
        }
    )

    assert response.status_code in [200, 400]

# ==================================================
# TEST LOGIN
# ==================================================

def test_login():

    response = client.post(
        "/login",
        json={
            "username": "admin",
            "password": "123456"
        }
    )

    assert response.status_code == 200

    assert "access_token" in response.json()

# ==================================================
# TEST CREATE CLIENT
# ==================================================

def test_create_client():

    response = client.post(
        "/clients",
        json={
            "name": "Mohamed",
            "account_number": "ACC001"
        }
    )

    assert response.status_code in [201, 400]

# ==================================================
# TEST GET CLIENTS
# ==================================================

def test_get_clients():

    response = client.get("/clients")

    assert response.status_code == 200

# ==================================================
# TEST DEPOSIT
# ==================================================

def test_deposit():

    response = client.post(
        "/clients/ACC001/deposit",
        json={
            "amount": 500
        }
    )

    assert response.status_code == 200

# ==================================================
# TEST WITHDRAW
# ==================================================

def test_withdraw():

    response = client.post(
        "/clients/ACC001/withdraw",
        json={
            "amount": 100
        }
    )

    assert response.status_code == 200