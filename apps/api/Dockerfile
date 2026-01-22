FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    sqlalchemy \
    pydantic \
    pydantic[email] \
    requests \
    feedparser \
    arxiv \
    stripe \
    httpx \
    python-jose[cryptography] \
    passlib[bcrypt] \
    python-multipart

COPY . /app

CMD ["uvicorn","server.main:app","--host","0.0.0.0","--port","8000","--reload"]
