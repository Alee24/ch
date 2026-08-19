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

# Check if Apache or Nginx is running on the host VPS
APACHE_ON_HOST=false
APACHE_SERVICE=""
if systemctl is-active --quiet apache2 2>/dev/null || pgrep apache2 >/dev/null; then
    APACHE_ON_HOST=true
    APACHE_SERVICE="apache2"
    echo "Detected Apache (apache2) running on the host VPS."
elif systemctl is-active --quiet httpd 2>/dev/null || pgrep httpd >/dev/null; then
    APACHE_ON_HOST=true
    APACHE_SERVICE="httpd"
    echo "Detected Apache (httpd) running on the host VPS."
fi

NGINX_ON_HOST=false
if [ "$APACHE_ON_HOST" = false ]; then
    if systemctl is-active --quiet nginx 2>/dev/null || pgrep nginx >/dev/null; then
        NGINX_ON_HOST=true
        echo "Detected Nginx running on the host VPS."
    fi
fi

if [ "$APACHE_ON_HOST" = true ]; then
    echo "Configuring host Apache reverse proxy for ch.kkdes.co.ke..."
    
    # Write Apache configuration
    cat << 'EOF' > /tmp/apache_ch.conf
<VirtualHost *:80>
    ServerName ch.kkdes.co.ke

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3009/
    ProxyPassReverse / http://127.0.0.1:3009/
</VirtualHost>
EOF

    if [ "$APACHE_SERVICE" = "apache2" ]; then
        # Enable modules
        sudo a2enmod proxy proxy_http headers ssl 2>/dev/null || true
        # Move configuration
        sudo mv /tmp/apache_ch.conf /etc/apache2/sites-available/ch.kkdes.co.ke.conf
        # Enable site
        sudo a2ensite ch.kkdes.co.ke.conf
        
        echo "Testing Apache configuration..."
        if sudo apache2ctl configtest 2>/dev/null || sudo apachectl configtest; then
            echo "Reloading Apache..."
            sudo systemctl reload apache2 || sudo service apache2 reload
            
            # Acquire SSL certificate using Certbot
            if command -v certbot >/dev/null 2>&1; then
                echo "Running Certbot to acquire SSL certificate for Apache..."
                sudo certbot --apache -d ch.kkdes.co.ke --non-interactive --agree-tos -m mettoalex@gmail.com --redirect || true
            else
                echo "Certbot is not installed. Please install certbot to enable SSL."
            fi
        else
            echo "ERROR: Apache configuration test failed!"
            exit 1
        fi
    else
        # httpd (RedHat/CentOS)
        sudo mv /tmp/apache_ch.conf /etc/httpd/conf.d/ch.kkdes.co.ke.conf
        echo "Testing Apache configuration..."
        if sudo apachectl configtest; then
            echo "Reloading httpd..."
            sudo systemctl reload httpd || sudo service httpd reload
            
            # Acquire SSL certificate using Certbot
            if command -v certbot >/dev/null 2>&1; then
                echo "Running Certbot to acquire SSL certificate for Apache..."
                sudo certbot --apache -d ch.kkdes.co.ke --non-interactive --agree-tos -m mettoalex@gmail.com --redirect || true
            else
                echo "Certbot is not installed. Please install certbot to enable SSL."
            fi
        else
            echo "ERROR: Apache configuration test failed!"
            exit 1
        fi
    fi
    
    # Build and start services (excluding the caddy container)
    echo "Building and starting containers (excluding Caddy proxy)..."
    docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build postgres app

elif [ "$NGINX_ON_HOST" = true ]; then
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
