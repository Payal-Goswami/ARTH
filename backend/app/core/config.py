from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    APP_NAME: str = "ARTH"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "changeme"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DATABASE_URL: str = ""
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Declare as str first — we parse it manually in the validator
    ALLOWED_ORIGINS: Union[List[str], str] = (
        "http://localhost:5173,"
        "http://localhost:3000,"
        "https://arth-mu.vercel.app"
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            # Strip surrounding brackets if someone passed ["url"] style
            v = v.strip().strip("[]")
            # Split on comma
            return [i.strip().strip('"').strip("'") for i in v.split(",") if i.strip()]
        if isinstance(v, list):
            return v
        return ["http://localhost:5173"]

    ALGORITHM: str = "HS256"
    BCRYPT_ROUNDS: int = 12

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "extra": "ignore",
    }


settings = Settings()
