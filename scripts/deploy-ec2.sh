#!/bin/bash
set -e

# ==============================================================================
# AWS EC2 Production Deployment Script
# Restaurant Management System (Client SPA + Express API + Socket.IO + Nginx)
# ==============================================================================

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "    Restaurant Management System - AWS EC2 Deployer               "
echo "=================================================================="
echo -e "${RESET}"

# 1. Verify Docker Engine
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}[!] Docker not found. Installing Docker Engine on Linux...${RESET}"
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER || true
  rm -f get-docker.sh
  echo -e "${GREEN}[✓] Docker installed successfully.${RESET}"
else
  echo -e "${GREEN}[✓] Docker engine detected: $(docker --version)${RESET}"
fi

# 2. Verify Docker Compose plugin
if ! docker compose version &> /dev/null; then
  echo -e "${YELLOW}[!] Installing Docker Compose CLI plugin...${RESET}"
  sudo apt-get update -y && sudo apt-get install -y docker-compose-plugin || true
fi

# 3. Environment File Check
if [ ! -f ".env.production" ]; then
  if [ -f ".env.production.example" ]; then
    echo -e "${YELLOW}[!] .env.production not found. Generating from template...${RESET}"
    cp .env.production.example .env.production
    # Generate random secure JWT Secret
    RANDOM_JWT=$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)
    sed -i "s/CHANGE_THIS_TO_SECURE_JWT_SECRET/$RANDOM_JWT/g" .env.production
    echo -e "${GREEN}[✓] Created default .env.production with secure random JWT secret.${RESET}"
  else
    echo -e "${YELLOW}[!] Warning: No .env.production file found. Using default environment variables.${RESET}"
  fi
fi

# Export variables from .env.production if it exists
if [ -f ".env.production" ]; then
  set -a
  source .env.production
  set +a
fi

# 4. Pull & Build Production Containers
echo -e "\n${CYAN}[1/4] Building and launching production containers...${RESET}"
docker compose -f docker-compose.prod.yml down --remove-orphans || true
docker compose -f docker-compose.prod.yml build --no-cache client api
docker compose -f docker-compose.prod.yml up -d

# 5. Service Readiness & Health Check
echo -e "\n${CYAN}[2/4] Awaiting container initialization and database health...${RESET}"
for i in {1..30}; do
  if docker exec restaurant-mongodb-prod mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}[✓] Production MongoDB is healthy.${RESET}"
    break
  fi
  echo -n "."
  sleep 2
done

# 6. Verify API Healthcheck
echo -e "\n${CYAN}[3/4] Verifying Express REST API health endpoint...${RESET}"
for i in {1..20}; do
  HTTP_STATUS=$(docker exec restaurant-nginx-edge wget -q -O - http://api:5000/api/health 2>/dev/null || echo "")
  if [[ "$HTTP_STATUS" == *"healthy"* ]] || [[ "$HTTP_STATUS" == *"status"* ]]; then
    echo -e "${GREEN}[✓] Backend API responded healthy:${RESET} $HTTP_STATUS"
    break
  fi
  sleep 2
done

# 7. Print Container Status & Memory
echo -e "\n${CYAN}[4/4] Container status overview:${RESET}"
docker compose -f docker-compose.prod.yml ps

echo -e "\n${GREEN}${BOLD}=================================================================="
echo "    Deployment Completed Successfully!                           "
echo "==================================================================${RESET}"
echo -e "Application Ports:"
echo -e "  - HTTP (Edge Nginx):     http://localhost:80"
echo -e "  - HTTPS (Edge Nginx):    https://localhost:443"
echo -e "  - Health Check:          http://localhost:80/api/health"
echo -e "  - Nginx Health:          http://localhost:80/nginx-health"
echo -e ""
echo -e "To configure domain SSL via Certbot, run:"
echo -e "  ${BOLD}./scripts/init-ssl.sh yourdomain.com admin@yourdomain.com${RESET}"
echo -e "To view live streaming logs:"
echo -e "  ${BOLD}docker compose -f docker-compose.prod.yml logs -f${RESET}\n"
