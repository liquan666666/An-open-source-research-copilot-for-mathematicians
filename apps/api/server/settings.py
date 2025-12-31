import os
class Settings:
    db_path = os.getenv("MRP_DB_PATH","./data/mrp.sqlite")
    cors_origins = os.getenv("CORS_ORIGINS","http://localhost:3000").split(",")
settings = Settings()
