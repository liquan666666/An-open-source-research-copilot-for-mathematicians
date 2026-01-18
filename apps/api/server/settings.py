import os
from typing import List

class Settings:
    # Database
    db_path: str = os.getenv("MRP_DB_PATH", "./data/mrp.sqlite")

    # CORS
    cors_origins: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

    # JWT Authentication
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Stripe
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    stripe_price_monthly: str = os.getenv("STRIPE_PRICE_MONTHLY", "")
    stripe_price_yearly: str = os.getenv("STRIPE_PRICE_YEARLY", "")
    stripe_price_lifetime: str = os.getenv("STRIPE_PRICE_LIFETIME", "")

    # AI Services
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")

    # Application
    environment: str = os.getenv("ENVIRONMENT", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
