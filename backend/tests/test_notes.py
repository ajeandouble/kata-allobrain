import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

os.environ["TEST_DATABASE_URL"] = "sqlite:///./test.db"

test_engine = create_engine(
    os.environ["TEST_DATABASE_URL"], connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


def test_create_note():
    response = client.post("/notes/", json={"title": "Test Note"})
    assert response.status_code == 201
    assert response.json()["title"] == "Test Note"


def test_read_all_notes():
    response = client.get("/notes/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_read_note():
    response = client.post("/notes/", json={"title": "Test Note for Read"})
    note_id = response.json()["id"]
    response = client.get(f"/notes/{note_id}")
    assert response.status_code == 200
    assert response.json()["title"] == "Test Note for Read"


def test_update_note():
    response = client.post("/notes/", json={"title": "Test Note for Update"})
    note_id = response.json()["id"]
    response = client.patch(
        f"/notes/{note_id}",
        json={"title": "Updated Note", "content": "Updated content"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Note"


def test_delete_note():
    response = client.post("/notes/", json={"title": "Test Note for Deletion"})
    note_id = response.json()["id"]
    response = client.delete(f"/notes/{note_id}")
    assert response.status_code == 204
    response = client.get(f"/notes/{note_id}")
    assert response.status_code == 404


def test_get_note_versions():
    response = client.post("/notes/", json={"title": "Test Note for Versions"})
    note_id = response.json()["id"]
    response = client.patch(
        f"/notes/{note_id}",
        json={"title": "Updated Note for Versions", "content": "Version content"},
    )
    response = client.get(f"/notes/{note_id}/versions")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_get_latest_note_version():
    response = client.post("/notes/", json={"title": "Test Note for Latest Version"})
    note_id = response.json()["id"]
    response = client.patch(
        f"/notes/{note_id}",
        json={"title": "Updated Note for Latest Version", "content": "Latest content"},
    )
    response = client.get(f"/notes/{note_id}/versions/latest")
    assert response.status_code == 200
    assert response.json()["version"] == 1
