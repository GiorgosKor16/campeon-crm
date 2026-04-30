# 1. Use a lightweight base image
FROM python:3.12-slim

# 2. Set the working directory inside the container
WORKDIR /backend

COPY ./requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

COPY . .

# 6. Expose the port your app runs on
EXPOSE 8000

# 7. Define the command to start the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]