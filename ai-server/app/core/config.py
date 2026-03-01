from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):

    # Master API key for internal use
    MASTER_APIKEY: str = Field(
        ..., validation_alias="MASTER_APIKEY"
    )

    # Serper.dev configuration
    SERPER_APIKEY: Optional[str] = Field(
        default=None, validation_alias="SERPER_APIKEY"
    )
    SERPER_BASE_URL: str = Field(
        default="https://google.serper.dev",
        validation_alias="SERPER_BASE_URL",
    )

    # OpenRouter configuration
    OPEN_ROUTER_APIKEY: Optional[str] = Field(
        default=None,
        validation_alias="OPEN_ROUTER_APIKEY",
    )

    # Chromadb configuration
    CHROMADB_HOST: str = Field(
        default="localhost",
        validation_alias="CHROMADB_HOST",
    )
    CHROMADB_PORT: int = Field(
        default=8881,
        validation_alias="CHROMADB_PORT",
    )

    # Apify configuration
    APIFY_APIKEY: Optional[str] = Field(
        default=None, validation_alias="APIFY_APIKEY"
    )

    PROJECT_NAME: str = "TRYORA AI Server"
    DEBUG: bool = False

    # Tell Pydantic to read from a .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()  # type: ignore

if __name__ == "__main__":
    print(settings.MASTER_APIKEY)
