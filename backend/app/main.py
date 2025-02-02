from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import check_db_connection
from .routers import notes


@asynccontextmanager
async def lifespan(_: FastAPI):
    if not check_db_connection(15, 5):
        raise RuntimeError("Failed to connect to the database.")
    yield


app = FastAPI(lifespan=lifespan)

# Should obviously be set-up properly for production
cors_options = {
    "allow_origins": ["*"],
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

app.add_middleware(CORSMiddleware, **cors_options)  # type: ignore


@app.get("/api/health")
async def get_health():
    return {"Status": "Ok"}


app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
