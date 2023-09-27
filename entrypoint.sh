#!/bin/sh

if [ "$DJANGO_ENV" = "prod" ]; then
  # Apply database migrations (generate migration files)
  python manage.py makemigrations

  # Apply database migrations (apply changes to the database schema)
  python manage.py migrate

  # Collect static files (if you haven't done it already)
  python manage.py collectstatic --noinput
fi

# Start Gunicorn server
exec gunicorn typeguru.wsgi --bind 0.0.0.0:8000
