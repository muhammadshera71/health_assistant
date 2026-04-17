from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")

    db_host: str = Field(default="localhost", alias="DB_HOST")
    db_port: int = Field(default=5432, alias="DB_PORT")
    db_name: str = Field(default="renal_consultants", alias="DB_NAME")
    db_user: str = Field(default="postgres", alias="DB_USER")
    db_password: str = Field(default="postgres", alias="DB_PASSWORD")
    db_ssl_mode: str = Field(default="disable", alias="DB_SSL_MODE")

    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    db_min_pool_size: int = Field(default=1, alias="DB_MIN_POOL_SIZE")
    db_max_pool_size: int = Field(default=10, alias="DB_MAX_POOL_SIZE")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
