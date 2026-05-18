"""
Pre-initialization module — must be imported before any other app modules.

Suppresses the Firecrawl Pydantic field-shadowing UserWarning before the
firecrawl package is imported by the router modules, and loads .env so that
settings are available when the config module is first imported.
"""
import warnings

from dotenv import load_dotenv

load_dotenv()

# Eagerly import firecrawl inside a catch_warnings context so the Pydantic
# field-shadowing UserWarnings are suppressed at class-definition time.
# Once imported, sys.modules caches the result and subsequent imports of
# firecrawl won't re-execute the class bodies or re-emit the warnings.
with warnings.catch_warnings():
    warnings.simplefilter("ignore", UserWarning)
    try:
        import firecrawl  # noqa: F401
    except ImportError:
        pass
