# API: serves data/providers.json at GET /api/providers (api/main.py).
FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ api/
COPY data/providers.json data/

EXPOSE 8000
# 0.0.0.0: reachable from outside the container
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
