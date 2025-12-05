# 🚀 Deployment Guide

This guide will walk you through deploying machi00_shad to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Database](#database)
- [Environment Variables](#environment-variables)
- [Monitoring](#monitoring)
- [Security](#security)
- [Maintenance](#maintenance)

---

## ✅ Prerequisites

### General

- GitHub account
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt free)

### Frontend

- Netlify / AWS S3 account
- Node.js >= 14.x

### Backend

- VPS or cloud server (AWS, GCP, Azure, DigitalOcean)
- Node.js >= 14.x
- PM2 (process manager)
- Nginx (reverse proxy)

### Database

- MongoDB Atlas (recommended) or self-hosted MongoDB instance

---

## 🎨 Frontend Deployment

### Option 1: Netlify (Recommended)

Netlify offers automatic deployment from Git with integrated CI/CD and excellent performance.

#### 1. Configuration

Create a `netlify.toml` file at the frontend root:

```toml
[build]
  command = "yarn build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### 2. Deployment

```bash
npm install -g netlify-cli

cd frontend
netlify deploy --prod
```

Or connect your GitHub repository in the Netlify dashboard.

#### 3. Environment Variables Configuration

In the Netlify dashboard:

1. Go to Site settings > Build & deploy > Environment
2. Add:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_WS_URL`: WebSocket URL (if applicable)

#### 4. Automatic Deployment

Connect your GitHub repository to Netlify for automatic deployment on every push.

---

### Option 2: AWS S3 + CloudFront

#### 1. Configuration

Create a `netlify.toml` file at the frontend root:

```toml
[build]
  command = "yarn build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### 2. Deployment

```bash
npm install -g netlify-cli

cd frontend
netlify deploy --prod
```

Or connect your GitHub repository in the Netlify dashboard.

---

### Option 3: AWS S3 + CloudFront

#### 1. Production Build

```bash
cd frontend
yarn build
```

#### 2. S3 Configuration

```bash
# Create S3 bucket
aws s3 mb s3://machi00-frontend

# Configure for web hosting
aws s3 website s3://machi00-frontend \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://machi00-frontend --delete
```

#### 3. CloudFront Configuration

Create a CloudFront distribution pointing to your S3 bucket for:

- Automatic HTTPS
- Global CDN
- Better performance

---

## ⚙️ Backend Deployment

### Option 1: VPS with PM2 and Nginx (Recommended for Full Control)

#### 1. Server Preparation

```bash
# SSH connection
ssh user@your-server-ip

# System update
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Clone Project

```bash
cd /var/www
sudo git clone https://github.com/machichiotte/machi00_shad.git
cd machi00_shad/backend
sudo npm install --production
```

#### 3. Environment Variables Configuration

```bash
sudo nano .env
```

Copy the content from `.env.example` and fill in your production values.

#### 4. Build Project

```bash
sudo npm run build
```

#### 5. PM2 Configuration

Create an `ecosystem.config.js` file:

```javascript
module.exports = {
  apps: [
    {
      name: "machi00-backend",
      script: "./dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 10000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_memory_restart: "1G",
    },
  ],
};
```

#### 6. Start with PM2

```bash
# Start application
pm2 start ecosystem.config.js

# Save configuration
pm2 save

# Configure automatic startup
pm2 startup
```

#### 7. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/machi00
```

Content:

```nginx
server {
    listen 80;
    server_name api.machi00.com;

    location / {
        proxy_pass http://localhost:10000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activation:

```bash
sudo ln -s /etc/nginx/sites-available/machi00 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. SSL Configuration with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.machi00.com

# Automatic renewal
sudo certbot renew --dry-run
```

---

### Option 2: Heroku

#### 1. Preparation

Create a `Procfile` at the backend root:

```
web: node dist/index.js
```

#### 2. Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create machi00-api

# Add MongoDB
heroku addons:create mongolab:sandbox

# Configure environment variables
heroku config:set NODE_ENV=production
heroku config:set ENCRYPTION_KEY=your_key

# Deploy
git push heroku main

# Check
heroku logs --tail
```

---

### Option 3: Docker

#### 1. Dockerfile

Create a `Dockerfile` at the backend root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy dependency files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --production

# Copy source code
COPY . .

# Build
RUN yarn build

# Expose port
EXPOSE 10000

# Default environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Start
CMD ["node", "dist/index.js"]
```

#### 2. Docker Compose

Create a `docker-compose.yml`:

```yaml
version: "3.8"

services:
  backend:
    build: ./backend
    ports:
      - "10000:10000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

#### 3. Build and Start

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 🗄️ Database

### MongoDB Atlas (Recommended)

#### 1. Cluster Creation

1. Create an account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Configure network access (whitelist IP or 0.0.0.0/0 for all)
4. Create a database user

#### 2. Get Connection String

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/machi00?retryWrites=true&w=majority
```

#### 3. Configuration in .env

```env
MONGODB_USER=username
MONGODB_PASSWORD=password
MONGODB_CLUSTER=cluster0.xxxxx.mongodb.net
MONGODB_DATABASE=machi00
```

---

## 🔐 Environment Variables

### Frontend (.env.production)

```env
VITE_API_URL=https://api.machi00.com
VITE_WS_URL=wss://api.machi00.com
VITE_DEV_MODE=false
```

### Backend (.env)

```env
# Server
PORT=10000
NODE_ENV=production
OFFLINE_MODE=false

# MongoDB
MONGODB_USER=your_user
MONGODB_PASSWORD=your_password
MONGODB_CLUSTER=cluster0.xxxxx.mongodb.net
MONGODB_DATABASE=machi00

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
JWT_SECRET=your_jwt_secret_key

# API Keys
APIKEY_BINANCE=your_binance_api_key
SECRETKEY_BINANCE=your_binance_secret
APIKEY_CMC=your_coinmarketcap_key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# Process status
pm2 status

# Real-time logs
pm2 logs

# CPU/RAM monitoring
pm2 monit

# Web dashboard
pm2 plus
```

### External Monitoring

Recommended tools:

- **New Relic** - Complete APM
- **Datadog** - Infrastructure and application
- **Sentry** - Error tracking
- **UptimeRobot** - Uptime monitoring

---

## 🔒 Security

### Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Secure environment variables
- [ ] Firewall configured (UFW on Ubuntu)
- [ ] SSH access by key only
- [ ] MongoDB with authentication
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Security headers (Helmet.js)
- [ ] Audit logs enabled
- [ ] Automatic backups configured

### Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

---

## 🔧 Maintenance

### Backups

#### Database

```bash
# Manual backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/machi00" --out=/backups/$(date +%Y%m%d)

# Automatic backup script (cron)
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

#### Code

```bash
# Code backup
tar -czf /backups/machi00-$(date +%Y%m%d).tar.gz /var/www/machi00_shad
```

### Updates

```bash
# Pull latest changes
cd /var/www/machi00_shad
git pull origin main

# Backend
cd backend
npm install
npm run build
pm2 restart machi00-backend

# Frontend (if hosted on same server)
cd ../frontend
npm install
npm run build
```

### Logs

```bash
# Log rotation (logrotate)
sudo nano /etc/logrotate.d/machi00
```

Content:

```
/var/www/machi00_shad/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🚨 Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs machi00-backend

# Check configuration
pm2 show machi00-backend

# Restart
pm2 restart machi00-backend
```

### MongoDB Connection Issue

```bash
# Test connection
mongo "mongodb+srv://cluster.mongodb.net/test" --username user

# Check environment variables
pm2 env 0
```

### Nginx Not Working

```bash
# Check configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart
sudo systemctl restart nginx
```

---

## 📚 Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Netlify Docs](https://docs.netlify.com/)

---

[⬆ Back to main README](./README.md)
