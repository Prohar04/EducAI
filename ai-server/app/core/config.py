from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AliasChoices, Field
from typing import Optional


class Settings(BaseSettings):
    # Master API key for internal use, not exposed to clients
    MASTER_APIKEY: str = Field(
        ...,
        validation_alias=AliasChoices("MASTER_APIKEY", "MASTER_API_KEY", "API_KEY"),
    )

    # Serper.dev configuration
    SERPER_APIKEY: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("SERPER_API_KEY", "SERPER_APIKEY"),
    )
    SERPER_BASE_URL: str = Field(
        default="https://google.serper.dev",
        validation_alias="SERPER_BASE_URL",
    )

    # LLM Provider configuration
    LLM_PROVIDER: Optional[str] = Field(default=None, validation_alias="LLM_PROVIDER")
    LLM_MODEL: Optional[str] = Field(default=None, validation_alias="LLM_MODEL")

    # OpenRouter configuration
    OPENROUTER_API_KEY: Optional[str] = Field(default=None, validation_alias="OPENROUTER_API_KEY")
    OPEN_ROUTER_APIKEY: Optional[str] = Field(default=None, validation_alias="OPEN_ROUTER_APIKEY")  # Legacy support

    # Gemini configuration
    GEMINI_API_KEY: Optional[str] = Field(default=None, validation_alias="GEMINI_API_KEY")

    # XAI configuration
    XAI_API_KEY: Optional[str] = Field(default=None, validation_alias="XAI_API_KEY")

    # Groq configuration
    GROQ_API_KEY: Optional[str] = Field(default=None, validation_alias="GROQ_API_KEY")

    # Chromadb configuration
    CHROMADB_HOST: str = Field(..., validation_alias="CHROMADB_HOST")
    CHROMADB_PORT: int = Field(..., validation_alias="CHROMADB_PORT")

    # Firecrawl configuration
    FIRECRAWL_API_KEY: Optional[str] = Field(default=None, validation_alias="FIRECRAWL_API_KEY")

    # Apify configuration
    APIFY_APIKEY: str = Field(..., validation_alias="APIFY_APIKEY")

    # Database configuration
    DATABASE_URL: str = Field(..., validation_alias="DATABASE_URL")

    # Server ingestion endpoint (Module 1 data push)
    SERVER_BASE_URL: str = Field(
        default="http://localhost:8000",
        validation_alias="SERVER_BASE_URL",
    )
    INGEST_API_KEY: Optional[str] = Field(default=None, validation_alias="INGEST_API_KEY")

    PROJECT_NAME: str = "Educai AI Server"
    DEBUG: bool | str = False

    # Tell Pydantic to read from a .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Fallback: if OPENROUTER_API_KEY is set but OPEN_ROUTER_APIKEY is not, copy it
        if self.OPENROUTER_API_KEY and not self.OPEN_ROUTER_APIKEY:
            self.OPEN_ROUTER_APIKEY = self.OPENROUTER_API_KEY
        # And vice versa for backwards compatibility
        if self.OPEN_ROUTER_APIKEY and not self.OPENROUTER_API_KEY:
            self.OPENROUTER_API_KEY = self.OPEN_ROUTER_APIKEY


settings = Settings()  # type: ignore

if __name__ == "__main__":
    print(settings.MASTER_APIKEY)
