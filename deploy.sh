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


# Pull latest changes from git
echo "Pulling latest changes from Git repository..."
git pull origin main

# Shutdown and clean up any orphaned containers
echo "Stopping existing containers..."
docker compose -f docker-compose.prod.yml --env-file .env.production down --remove-orphans

# Check if Nginx is running on the host VPS
NGINX_ON_HOST=false
if systemctl is-active --quiet nginx 2>/dev/null || pgrep nginx >/dev/null; then
    NGINX_ON_HOST=true
    echo "Detected Nginx running on the host VPS."
fi

if [ "$NGINX_ON_HOST" = true ]; then
    echo "Configuring host Nginx reverse proxy for ch.kkdes.co.ke..."
    
    # Write Nginx configuration
    cat << 'EOF' > /tmp/nginx_ch.conf
server {
    listen 80;
    server_name ch.kkdes.co.ke;

    location / {
        proxy_pass http://127.0.0.1:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    sudo mv /tmp/nginx_ch.conf /etc/nginx/sites-available/ch.kkdes.co.ke
    sudo ln -sf /etc/nginx/sites-available/ch.kkdes.co.ke /etc/nginx/sites-enabled/
    
    echo "Testing Nginx configuration..."
    if sudo nginx -t; then
        echo "Reloading Nginx..."
        sudo systemctl reload nginx || sudo service nginx reload
        
        # Try to obtain SSL certificate using Certbot if available
        if command -v certbot >/dev/null 2>&1; then
            echo "Running Certbot to acquire SSL certificate..."
            sudo certbot --nginx -d ch.kkdes.co.ke --non-interactive --agree-tos -m mettoalex@gmail.com --redirect || true
        else
            echo "Certbot is not installed. Please install certbot (apt install python3-certbot-nginx) to enable SSL."
        fi
    else
        echo "ERROR: Nginx configuration test failed!"
        exit 1
    fi
    
    # Build and start services (excluding the caddy container)
    echo "Building and starting containers (excluding Caddy proxy)..."
    docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build postgres app
else
    # Build and start all services including Caddy reverse proxy
    echo "Building and starting all containers (postgres, app, caddy)..."
    docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
fi

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
