FROM python:3.11-slim

WORKDIR /app

# Copy requirements file and install dependencies
COPY backend/app/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of the backend application code
COPY backend/app /app/app

# Expose port (default is 8000, but Railway will override this with its PORT env var)
EXPOSE 8000

# Run uvicorn server, using the PORT environment variable provided by Railway
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
