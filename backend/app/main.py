from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import (
    engine,
    Base
)

# IMPORT MODELS
from app.models.client_model import Client
from app.models.transaction_model import (
    Transaction
)
from app.models.user_model import User

# IMPORT ROUTES
from app.routes.client_routes import (
    router as client_router
)

from app.routes.transaction_routes import (
    router as transaction_router
)

from app.routes.auth_routes import (
    router as auth_router
)

# ==================================================
# CREATE DATABASE TABLES
# ==================================================

Base.metadata.create_all(bind=engine)

# ==================================================
# FASTAPI APP
# ==================================================

app = FastAPI(
    title="Bank Management System API",
    version="1.0.0",
    description="""
    Simple banking API using FastAPI
    """
)

# ==================================================
# STATIC FILES
# ==================================================

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")


if not os.path.exists(STATIC_DIR):
    raise RuntimeError(f"Static directory not found: {STATIC_DIR}")

# ==================================================
# ROOT ENDPOINT — Serve Frontend
# ==================================================

@app.get("/", include_in_schema=False)
def home():
    return FileResponse(os.path.join(STATIC_DIR, "index.html"))

# ==================================================
# INCLUDE ROUTES
# ==================================================

app.include_router(auth_router)

app.include_router(client_router)

app.include_router(transaction_router)
