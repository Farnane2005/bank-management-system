from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import engine, Base
from app.models.client_model import Client
from app.models.transaction_model import Transaction
from app.models.user_model import User
from app.routes.client_routes import router as client_router
from app.routes.transaction_routes import router as transaction_router
from app.routes.auth_routes import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bank Management System API",
    version="1.0.0",
    description="Simple banking API using FastAPI"
)

# ==================================================
# STATIC FILES
# ==================================================

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

print(f"__file__     = {__file__}")
print(f"STATIC_DIR   = {STATIC_DIR}")
print(f"Exists       = {os.path.exists(STATIC_DIR)}")
print(f"Contents     = {os.listdir(STATIC_DIR) if os.path.exists(STATIC_DIR) else 'NOT FOUND'}")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ==================================================
# ROOT ENDPOINT
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