"""
Pre-initialization module — must be imported before any other app modules.

Suppresses the Firecrawl Pydantic field-shadowing UserWarning before the
firecrawl package is imported by the router modules, and loads .env so that
settings are available when the config module is first imported.
"""
import warnings

from dotenv import load_dotenv

warnings.filterwarnings(
    "ignore",
    message="Field name.*shadows an attribute",
    category=UserWarning,
)
load_dotenv()
