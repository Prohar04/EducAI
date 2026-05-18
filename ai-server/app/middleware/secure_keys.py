import hmac
from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader
from starlette import status
from os import getenv

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def checkApiKey(incoming_key: str = Security(api_key_header)):
    master_key = getenv("MASTER_APIKEY") or getenv("API_KEY")
    if not master_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server misconfigured: MASTER_APIKEY not set",
        )

    if not incoming_key or not hmac.compare_digest(incoming_key, master_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing API Key",
        )

    return "Express-API"
