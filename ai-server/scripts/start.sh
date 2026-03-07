#!/bin/bash

# Configuration
POSTGRES_NAME="Educai-postgres"
REDIS_NAME="Educai-redis"
DB_NAME="educai"  # Ensure this is lowercase to match your app's expectations

if [ "$1" == "start" ]; then
    echo "🚀 Starting services..."

    # Start or Run Redis
    if [ "$(docker ps -aq -f name=^${REDIS_NAME}$)" ]; then
        docker start $REDIS_NAME > /dev/null
    else
        docker run -d --name $REDIS_NAME -p 6379:6379 redis:alpine
    fi

    # Start or Run Postgres
    if [ "$(docker ps -aq -f name=^${POSTGRES_NAME}$)" ]; then
        docker start $POSTGRES_NAME > /dev/null
    else
        # If the container didn't exist, we run it with the correct lowercase DB name
        docker run -d --name $POSTGRES_NAME \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=$DB_NAME \
            -p 5432:5432 postgres:alpine
    fi

    # --- WAIT FOR POSTGRES TO BE READY ---
    echo "⏳ Waiting for PostgreSQL to be ready..."
    until docker exec $POSTGRES_NAME pg_isready -U postgres > /dev/null 2>&1; do
        sleep 1
    done
    echo "✅ Database is ready!"

    # Always start the application
    echo "⚡ Starting Uvicorn..."
    uvicorn app.main:app --host 0.0.0.0 --port 8888 --reload

elif [ "$1" == "stop" ]; then
    echo "🛑 Stopping services..."
    docker stop $REDIS_NAME $POSTGRES_NAME
else
    echo "Usage: $0 {start|stop}"
fi
