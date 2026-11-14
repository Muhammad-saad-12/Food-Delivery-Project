#!/bin/bash
set -e

# ==============================================================================
# Automated Certbot SSL Certificate Provisioner
# ==============================================================================

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./scripts/init-ssl.sh <domain-name> <admin-email>"
  echo "Example: ./scripts/init-ssl.sh gourmet.example.com admin@example.com"
  exit 1
fi

DOMAIN=$1
EMAIL=$2
STAGING=${3:-0} # Set to 1 for Let's Encrypt Staging/testing environment

echo "=== Initializing SSL for Domain: $DOMAIN (Contact: $EMAIL) ==="

# 1. Prepare temporary self-signed dummy certificate so Nginx can start
DUMMY_DIR="nginx/dummy_certs"
mkdir -p "$DUMMY_DIR"

if [ ! -f "$DUMMY_DIR/privkey.pem" ]; then
  echo "Generating temporary self-signed certificate for initial Nginx bootstrap..."
  openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout "$DUMMY_DIR/privkey.pem" \
    -out "$DUMMY_DIR/fullchain.pem" \
    -subj "/CN=localhost"
fi

# 2. Substitute Domain in default.conf if needed
sed -i "s/restaurant-domain/$DOMAIN/g" nginx/conf.d/default.conf

# 3. Create docker volumes if not already present
docker volume create certbot_www > /dev/null 2>&1 || true
docker volume create certbot_certs > /dev/null 2>&1 || true

# 4. Copy dummy cert into volume mount if real cert doesn't exist
TEMP_CONTAINER=$(docker run -d -v certbot_certs:/etc/letsencrypt alpine sleep 30)
docker exec $TEMP_CONTAINER mkdir -p "/etc/letsencrypt/live/$DOMAIN"
docker cp "$DUMMY_DIR/privkey.pem" "$TEMP_CONTAINER:/etc/letsencrypt/live/$DOMAIN/privkey.pem"
docker cp "$DUMMY_DIR/fullchain.pem" "$TEMP_CONTAINER:/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
docker rm -f $TEMP_CONTAINER > /dev/null

echo "Starting Nginx edge proxy..."
docker compose -f docker-compose.prod.yml up -d nginx

# 5. Delete temporary dummy certs from volume before requesting real certificate
TEMP_CONTAINER=$(docker run -d -v certbot_certs:/etc/letsencrypt alpine sleep 30)
docker exec $TEMP_CONTAINER rm -rf "/etc/letsencrypt/live/$DOMAIN"
docker rm -f $TEMP_CONTAINER > /dev/null

echo "Requesting genuine Let's Encrypt SSL certificate via Certbot..."
STAGING_FLAG=""
if [ "$STAGING" -eq 1 ]; then
  STAGING_FLAG="--staging"
fi

docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $STAGING_FLAG \
    --email $EMAIL \
    -d $DOMAIN \
    --rsa-key-size 4096 \
    --agree-tos \
    --force-renewal \
    --non-interactive" certbot

echo "Reloading Nginx with authentic SSL certificate..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo "=== SSL Certificate Provisioned Successfully for https://$DOMAIN ==="
