#!/bin/bash

echo $SERVICE

if [ "$SERVICE" = "bot" ]; then
    python3 bot.py
elif [ "$SERVICE" = "rabbitmq_consumer" ]; then
    python3 consumer.py
else
    alembic revision --autogenerate
    alembic upgrade head
    uvicorn api.main:app --host 0.0.0.0 --port 5001 --reload --log-level=info
fi
