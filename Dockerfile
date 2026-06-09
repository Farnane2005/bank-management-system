FROM python:3.11-slim
 
WORKDIR /app
 
COPY backend/app/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
 
COPY backend/app /app/app
 
RUN test -f /app/app/static/index.html || (echo "ERROR: index.html missing" && exit 1)
RUN test -f /app/app/static/styles.css || (echo "ERROR: styles.css missing" && exit 1)
RUN test -f /app/app/static/app.js     || (echo "ERROR: app.js missing"     && exit 1)
 
EXPOSE 8000
 
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]