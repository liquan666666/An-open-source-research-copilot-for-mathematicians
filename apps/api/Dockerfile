FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn sqlalchemy pydantic requests feedparser
COPY . /app
CMD ["uvicorn","server.main:app","--host","0.0.0.0","--port","8000","--reload"]
