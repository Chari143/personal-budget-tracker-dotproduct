FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
WORKDIR /app/backend
EXPOSE 8000
CMD ["bash","-c","python manage.py migrate && gunicorn budget_tracker.wsgi:application --bind 0.0.0.0:8000"]