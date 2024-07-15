from fastapi import FastAPI
from contextlib import asynccontextmanager
from .config import settings
from .database import check_db_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    if not check_db_connection(3, 1):
        raise RuntimeError("Failed to connect to the database.")
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/health")
async def get_health():
    return {"Status": "Ok"}
