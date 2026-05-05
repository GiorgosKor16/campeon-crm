FROM python:3.12-slim

WORKDIR /backend

RUN useradd -ms /bin/bash appUser
RUN chown -R appUser:appUser /backend
USER appUser

COPY ./requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]