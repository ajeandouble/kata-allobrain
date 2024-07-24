from typing import Optional
import os
from dotenv import load_dotenv


ENVIRONMENT_VARS = ["DATABASE_URL"]


class Settings:
    env = os.getenv("ENVIRONMENT")
    database_url = ""

    def __init__(self):
        if not self.env or self.env.lower() not in [
            "dev",
            "development",
            "prod",
            "production",
        ]:
            raise ValueError(
                "Invalid ENVIRONMENT value. Expected 'development' or 'production'"
            )
        if self.env in ["dev", "development"]:
            env_path = os.path.join(os.path.dirname(__file__), "../.env.development")
        else:
            env_path = os.path.join(os.path.dirname(__file__), "../.env.production")

        if not load_dotenv(dotenv_path=env_path):
            raise FileNotFoundError(f"Environment file {env_path} not found")
        for key in ENVIRONMENT_VARS:
            val = os.getenv(key)
            if not val:
                raise ValueError(f"{key} environment variable is not set")
            setattr(self, key.lower(), val)


settings = Settings()
