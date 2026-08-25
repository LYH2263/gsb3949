#!/bin/bash
set -e

echo "Waiting for database..."
while ! pg_isready -h db -p 5432 -q; do
    echo "Database is not ready yet. Retrying in 1 second..."
    sleep 1
done
echo "Database is ready!"

# Schema is also created via Base.metadata.create_all on app startup.
# Only run alembic when revision scripts exist.
if ls /app/alembic/versions/*.py >/dev/null 2>&1; then
    echo "Running database migrations..."
    alembic upgrade head
else
    echo "No alembic revisions found; skipping migrations (create_all will handle schema)."
fi

echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
