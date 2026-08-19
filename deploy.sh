#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

# Navigate to the directory where this script is located
cd "$(dirname "$0")"


echo "============================================="
echo "Starting Campus Hub Deployment on VPS..."
echo "============================================="

# Check for .env.production file
if [ ! -f .env.production ]; then
    echo "ERROR: .env.production file not found!"
    echo "Please create a .env.production file with your production environment variables before deploying."
    exit 1
fi

# Load variables from .env.production
export $(grep -v '^#' .env.production | xargs)

# Pull latest changes from git
echo "Pulling latest changes from Git repository..."
git pull origin main

# Shutdown and clean up any orphaned containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production down --remove-orphans

# Build and start services in the background
echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Wait for PostgreSQL database to be healthy
echo "Waiting for PostgreSQL database to be ready/healthy..."
until [ "$(docker inspect --format='{{.State.Health.Status}}' $(docker compose -f docker-compose.prod.yml ps -q postgres))" == "healthy" ]; do
    printf "."
    sleep 2
done
echo " PostgreSQL is healthy."

# Run schema migrations/push
echo "Syncing database schema with Prisma..."
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run db:push

# Run seed script
echo "Running database seeds..."
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T app npm run db:seed

# Prune unused images to save disk space
echo "Cleaning up unused Docker images..."
docker image prune -f

echo "============================================="
echo "Deployment Completed Successfully!"
echo "Your app is live at https://ch.kkdes.co.ke"
echo "============================================="
