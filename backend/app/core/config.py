from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):

    # ========================================================
    # DATABASE
    # ========================================================

    DATABASE_URL: str

    # ========================================================
    # AUTHENTICATION / JWT
    # ========================================================

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ========================================================
    # SMTP / EMAIL
    # ========================================================

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str
    SMTP_PASSWORD: str

    SMTP_FROM_EMAIL: str
    SMTP_FROM_NAME: str = "Job Board"

    SMTP_USE_TLS: bool = True

    # ========================================================
    # EMAIL OTP
    # ========================================================

    EMAIL_OTP_SECRET: str
    EMAIL_OTP_EXPIRE_MINUTES: int = 10

    # ========================================================
    # PYDANTIC SETTINGS
    # ========================================================

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        extra="ignore",
    )


settings = Settings()


# ============================================================
# OPTIONAL MODULE-LEVEL VARIABLES
# ============================================================

DATABASE_URL = settings.DATABASE_URL

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = (
    settings.ACCESS_TOKEN_EXPIRE_MINUTES
)

SMTP_HOST = settings.SMTP_HOST
SMTP_PORT = settings.SMTP_PORT
SMTP_USERNAME = settings.SMTP_USERNAME
SMTP_PASSWORD = settings.SMTP_PASSWORD

SMTP_FROM_EMAIL = settings.SMTP_FROM_EMAIL
SMTP_FROM_NAME = settings.SMTP_FROM_NAME
SMTP_USE_TLS = settings.SMTP_USE_TLS

EMAIL_OTP_SECRET = settings.EMAIL_OTP_SECRET
EMAIL_OTP_EXPIRE_MINUTES = (
    settings.EMAIL_OTP_EXPIRE_MINUTES
)