from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List


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

    # Accepts both JSON array and comma-separated string from Render
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            # Handle comma-separated: "https://a.vercel.app,https://b.com"
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    ALGORITHM: str = "HS256"
    BCRYPT_ROUNDS: int = 12

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()