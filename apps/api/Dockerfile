FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn[standard] \
    sqlalchemy \
    pydantic \
    requests \
    feedparser \
    passlib[bcrypt]==1.7.4 \
    bcrypt==4.0.1 \
    python-jose[cryptography] \
    python-multipart
COPY . /app
CMD ["uvicorn","server.main:app","--host","0.0.0.0","--port","8000","--reload"]
