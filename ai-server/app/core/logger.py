import logging
import sys
import os
from logging.handlers import RotatingFileHandler

is_vercel = os.environ.get("VERCEL") == "1"

logger = logging.getLogger("api_security")
logger.setLevel(logging.INFO)

log_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(log_format)

if not logger.handlers:
    logger.addHandler(stream_handler)

    if not is_vercel:
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        file_handler = RotatingFileHandler(os.path.join(log_dir, "api.log"), maxBytes=10 * 1024 * 1024, backupCount=5)
        file_handler.setFormatter(log_format)
        logger.addHandler(file_handler)

logger.propagate = False
