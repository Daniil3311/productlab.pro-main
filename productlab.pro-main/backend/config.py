import os


class Config:
    DB_USER = os.getenv("DB_USER", "postgres1")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
    DB_NAME = os.getenv("DB_NAME", "landing")
    DB_HOST = os.getenv("DB_HOST", "db")
    DB_PORT = os.getenv("DB_PORT", 5432)
    DB_CONFIG = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    

    # API_HOST = os.getenv("API_HOST", "localhost")
    # API_PORT = os.getenv("API_PORT", "8000")

    ADMIN_URL = os.getenv(
        "ADMIN_URL", "example"
    )  # Формирование ссылки в боте {ADMIN_URL}+token

    BOT_TOKEN = os.getenv("BOT_TOKEN", "1268914429:AAFZym-JlIF-5UcxE6FMR9XiAiUlC4VXTew")
    BOT_WS_URL = os.getenv("BOT_WS_URL", "ws://localhost:8000/ws/article")
    SECRET_TOKEN_WS = os.getenv("SECRET_TOKEN_WS", "7708b9254bd068fa9c5040090dca2685")
    S3_ACCESS = os.getenv("S3_ACCESS", "default")
    S3_SECRET = os.getenv("S3_SECRET", "default")
