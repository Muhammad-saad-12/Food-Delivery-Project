# AWS EC2 Production Deployment & Operations Guide

This guide outlines the production deployment of the **Restaurant Management System** onto an **AWS EC2** instance using **Docker Compose**, **Nginx Reverse Proxy**, and **Certbot (Let's Encrypt)** SSL automation.

---

## 1. AWS EC2 Instance Provisioning

### Recommended Specifications
- **Instance Type**: `t3.medium` (2 vCPU, 4 GiB RAM) or `t3.small` (2 GiB RAM with 2GB swap enabled)
- **AMI**: Ubuntu Server 24.04 LTS (HVM) or Ubuntu 22.04 LTS
- **Storage**: 30 GiB gp3 General Purpose SSD
- **Network**: Assign Elastic IP (EIP) so the public IP remains static across restarts.

### Security Group Inbound Rules
Configure your AWS EC2 Security Group with the following inbound ports:

| Protocol | Port | Source | Description |
|---|---|---|---|
| SSH | `22` | Your IP / Bastion | Secure shell remote access |
| HTTP | `80` | `0.0.0.0/0`, `::/0` | Web traffic & Certbot ACME challenge |
| HTTPS | `443` | `0.0.0.0/0`, `::/0` | Production encrypted TLS web traffic |

---

## 2. DNS & Route 53 Mapping

1. Point your domain A record to your EC2 instance Elastic IP:
   - `yourdomain.com` -> `A` record -> `198.51.100.25`
   - `*.yourdomain.com` (optional) -> `A` record -> `198.51.100.25`
2. Verify DNS resolution from your terminal:
   ```bash
   dig +short yourdomain.com
   ```

---

## 3. Clone Repository & Environment Setup

Connect to your EC2 instance via SSH:
```bash
ssh -i /path/to/key.pem ubuntu@your-ec2-ip
```

Clone the repository and navigate into the project directory:
```bash
git clone https://github.com/your-username/Restaurant-management-system.git
cd Restaurant-management-system
```

Copy the production environment template:
```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your domain, credentials, and secrets:
```bash
nano .env.production
```
Key variables:
- `JWT_SECRET`: Random 32+ character secret string
- `CLIENT_ORIGIN`: `https://yourdomain.com`
- `DOMAIN`: `yourdomain.com`
- `LETSENCRYPT_EMAIL`: `admin@yourdomain.com`
- `GEMINI_API_KEY`: Your Gemini API key for AI menu & chat features

---

## 4. One-Click EC2 Automated Deployment

Run the automated deployment script:
```bash
./scripts/deploy-ec2.sh
```

This script automatically:
1. Detects and installs Docker Engine & Docker Compose plugin if missing.
2. Builds the multi-stage client React SPA and Node.js Express API.
3. Launches the production MongoDB with automatic healthchecks.
4. Starts the Nginx edge proxy with gzip compression and WebSocket proxying.
5. Verifies end-to-end container health against `/api/health`.

---

## 5. Automated Certbot SSL Setup (Let's Encrypt)

Once your DNS is pointing to the EC2 Elastic IP, obtain genuine SSL certificates with automated renewal:

```bash
./scripts/init-ssl.sh yourdomain.com admin@yourdomain.com
```

### Automatic Certificate Renewal
The `restaurant-certbot` container runs in the background and attempts renewal every 12 hours. Certificates are automatically reloaded by Nginx when renewed.

---

## 6. Architecture & Port Mapping

```
[ Internet Traffic ]
        │
        ▼ (Port 80 / 443)
┌──────────────────────────────────────────────────┐
│              restaurant-nginx-edge               │
│  - SSL Termination (Let's Encrypt / Certbot)     │
│  - Gzip Compression & Security Headers           │
└──────────┬───────────────────────────┬───────────┘
           │ /api/ & /socket.io/       │ / (Static SPA)
           ▼                           ▼
┌────────────────────────┐  ┌──────────────────────┐
│  restaurant-api-prod   │  │ restaurant-client    │
│  (Node.js / Express 4) │  │ (Vite React Build)   │
└──────────┬─────────────┘  └──────────────────────┘
           │ Mongoose
           ▼
┌────────────────────────┐
│ restaurant-mongodb-prod│
│ (Persistent Docker Vol)│
└────────────────────────┘
```

---

## 7. Useful Operational Commands

- **Check Container Status**:
  ```bash
  docker compose -f docker-compose.prod.yml ps
  ```
- **Stream Live Application Logs**:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f api
  ```
- **Nginx Access & Error Logs**:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f nginx
  ```
- **Database Backup (mongodump)**:
  ```bash
  docker exec restaurant-mongodb-prod mongodump --db restaurant_prod_db --out /data/db/backup
  ```
- **Restart Application Stack**:
  ```bash
  docker compose -f docker-compose.prod.yml restart
  ```
- **Zero-Downtime Rebuild & Update**:
  ```bash
  git pull origin master
  ./scripts/deploy-ec2.sh
  ```
