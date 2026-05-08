FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1
    
ENV DATABASE_URL=""
ENV API_HOST=0.0.0.0
ENV API_PORT=8000

RUN useradd -ms /bin/bash appUser

WORKDIR /backend

COPY --chown=appUser:appUser ./requirements.txt .
RUN pip install -r requirements.txt

COPY --chown=appUser:appUser . .

USER appUser

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host $API_HOST --port $API_PORT"]
