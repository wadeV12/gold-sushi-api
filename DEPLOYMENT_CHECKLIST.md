# 🚀 Digital Ocean Deployment Checklist

Use this checklist to ensure a smooth deployment of your GoldSushi application to Digital Ocean.

## Pre-Deployment Checklist

### 1. Digital Ocean Setup
- [ ] Create a Digital Ocean account
- [ ] Create a Droplet (Ubuntu 22.04 LTS recommended)
  - Minimum: 2GB RAM, 1 vCPU
  - Recommended: 4GB RAM, 2 vCPU
- [ ] Note your Droplet IP address
- [ ] Set up SSH key authentication
- [ ] Configure firewall rules (ports 22, 80, 443)

### 2. Database Setup
Choose one option:

**Option A: Digital Ocean Managed Database (Recommended)**
- [ ] Create a PostgreSQL managed database
- [ ] Note connection details (host, port, username, password, database name)
- [ ] Add Droplet IP to database's trusted sources

**Option B: Self-Hosted Database**
- [ ] Plan to use Docker Compose with PostgreSQL container
- [ ] Ensure adequate storage for database

### 3. Domain & DNS (Optional but Recommended)
- [ ] Register a domain name
- [ ] Point domain's A record to Droplet IP
- [ ] Wait for DNS propagation (can take up to 24 hours)

### 4. Container Registry
Choose one option:
- [ ] GitHub Container Registry (ghcr.io) - Free for public repos
- [ ] Docker Hub - Free tier available
- [ ] Digital Ocean Container Registry - Integrated with DO

### 5. Third-Party Services
- [ ] Cloudinary account (for image uploads)
- [ ] LiqPay account (for payments)
- [ ] Google Cloud account (if using GC storage)
- [ ] SMTP service for emails (if needed)

## Local Setup Checklist

### 1. Repository Configuration
- [ ] Clone/have the repository locally
- [ ] All Docker files are present:
  - [ ] `Dockerfile`
  - [ ] `.dockerignore`
  - [ ] `docker-compose.yml`
  - [ ] `docker-compose.prod.yml`
  - [ ] `nginx.conf`
  - [ ] `deploy.sh`

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all required environment variables
- [ ] Create `.env.production` with production values
- [ ] **Never commit `.env` or `.env.production` to git!**

### 3. Container Registry Authentication
- [ ] Login to your chosen registry:
  ```bash
  # GitHub Container Registry
  echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
  
  # Docker Hub
  docker login
  
  # Digital Ocean
  doctl registry login
  ```

### 4. Test Local Build
- [ ] Run `./build-local.sh` or `docker build -t goldsushi:test .`
- [ ] Verify build completes successfully
- [ ] Test locally with `docker-compose up -d`
- [ ] Access http://localhost:4200/swagger
- [ ] Test health endpoint: http://localhost:4200/api/health

## Droplet Setup Checklist

### 1. Connect to Droplet
```bash
ssh root@YOUR_DROPLET_IP
```

### 2. Update System
- [ ] Run system updates:
  ```bash
  apt update && apt upgrade -y
  ```

### 3. Install Docker
- [ ] Install Docker:
  ```bash
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  ```
- [ ] Install Docker Compose:
  ```bash
  apt install docker-compose -y
  ```
- [ ] Verify installation:
  ```bash
  docker --version
  docker-compose --version
  ```

### 4. Configure Firewall
- [ ] Set up UFW firewall:
  ```bash
  ufw allow 22/tcp    # SSH
  ufw allow 80/tcp    # HTTP
  ufw allow 443/tcp   # HTTPS
  ufw enable
  ufw status
  ```

### 5. Create Application Directory
- [ ] Create app directory:
  ```bash
  mkdir -p ~/goldsushi
  cd ~/goldsushi
  ```

### 6. Setup Swap (if needed for 1-2GB droplets)
- [ ] Create swap file:
  ```bash
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
  ```

## Deployment Checklist

### 1. Transfer Files to Droplet
- [ ] Copy docker-compose.prod.yml:
  ```bash
  scp docker-compose.prod.yml root@YOUR_DROPLET_IP:~/goldsushi/
  ```
- [ ] Copy nginx.conf:
  ```bash
  scp nginx.conf root@YOUR_DROPLET_IP:~/goldsushi/
  ```
- [ ] Create .env file on droplet with production values

### 2. Build and Push Image
- [ ] Build Docker image locally:
  ```bash
  docker build -t goldsushi:latest .
  ```
- [ ] Tag for registry:
  ```bash
  docker tag goldsushi:latest YOUR_REGISTRY/goldsushi:latest
  ```
- [ ] Push to registry:
  ```bash
  docker push YOUR_REGISTRY/goldsushi:latest
  ```

### 3. Deploy on Droplet
- [ ] SSH to droplet
- [ ] Navigate to app directory:
  ```bash
  cd ~/goldsushi
  ```
- [ ] Pull image:
  ```bash
  docker-compose -f docker-compose.prod.yml pull
  ```
- [ ] Start services:
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```
- [ ] Check logs:
  ```bash
  docker-compose -f docker-compose.prod.yml logs -f
  ```

### 4. Verify Deployment
- [ ] Check container status:
  ```bash
  docker-compose -f docker-compose.prod.yml ps
  ```
- [ ] Test health endpoint:
  ```bash
  curl http://localhost:4200/api/health
  ```
- [ ] Access from browser: http://YOUR_DROPLET_IP:4200/swagger
- [ ] Test API endpoints

## SSL/HTTPS Setup Checklist

### 1. Install Certbot
- [ ] Install Certbot:
  ```bash
  apt install certbot -y
  ```

### 2. Stop Nginx (temporarily)
- [ ] Stop nginx container:
  ```bash
  docker-compose -f docker-compose.prod.yml stop nginx
  ```

### 3. Generate SSL Certificate
- [ ] Run Certbot:
  ```bash
  certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
  ```
- [ ] Follow prompts and verify email

### 4. Copy Certificates
- [ ] Create SSL directory:
  ```bash
  mkdir -p ~/goldsushi/ssl
  ```
- [ ] Copy certificates:
  ```bash
  cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/goldsushi/ssl/
  cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/goldsushi/ssl/
  ```

### 5. Update Nginx Configuration
- [ ] Edit nginx.conf and uncomment SSL certificate lines
- [ ] Update server_name with your domain

### 6. Restart Services
- [ ] Restart with SSL:
  ```bash
  docker-compose -f docker-compose.prod.yml up -d
  ```
- [ ] Verify HTTPS works: https://yourdomain.com

### 7. Auto-Renewal
- [ ] Set up auto-renewal cron job:
  ```bash
  crontab -e
  # Add: 0 3 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/yourdomain.com/*.pem ~/goldsushi/ssl/ && cd ~/goldsushi && docker-compose -f docker-compose.prod.yml restart nginx"
  ```

## Post-Deployment Checklist

### 1. Monitoring Setup
- [ ] Set up log monitoring:
  ```bash
  docker-compose -f docker-compose.prod.yml logs -f
  ```
- [ ] Consider external monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Set up alerts for downtime

### 2. Backup Strategy
- [ ] Set up database backups:
  ```bash
  # Add to crontab
  0 2 * * * cd ~/goldsushi && docker-compose exec -T postgres pg_dump -U postgres goldsushi > ~/backups/goldsushi_$(date +\%Y\%m\%d).sql
  ```
- [ ] Store backups in Digital Ocean Spaces or external storage
- [ ] Test backup restoration

### 3. Security Hardening
- [ ] Change default SSH port (optional)
- [ ] Disable root SSH login (optional, create sudo user)
- [ ] Set up fail2ban
- [ ] Review and limit Docker container permissions
- [ ] Regular security updates

### 4. Performance Optimization
- [ ] Enable HTTP/2 (already in nginx.conf)
- [ ] Enable gzip compression (already in nginx.conf)
- [ ] Configure rate limiting (already in nginx.conf)
- [ ] Monitor resource usage:
  ```bash
  docker stats
  ```

### 5. Documentation
- [ ] Document your deployment process
- [ ] Keep credentials secure (use password manager)
- [ ] Document emergency procedures
- [ ] Share access with team members

## CI/CD Setup Checklist (Optional)

### 1. GitHub Secrets
- [ ] Add `DROPLET_IP` secret
- [ ] Add `SSH_USER` secret
- [ ] Add `SSH_PRIVATE_KEY` secret
- [ ] Add `PRODUCTION_ENV` secret
- [ ] Add `DOCKER_COMPOSE_PROD` secret

### 2. Test Workflow
- [ ] Push to main branch
- [ ] Verify GitHub Actions runs
- [ ] Check deployment succeeds
- [ ] Verify application is updated

## Troubleshooting Checklist

### If Deployment Fails
- [ ] Check Docker logs: `docker-compose logs`
- [ ] Verify environment variables are set
- [ ] Check database connectivity
- [ ] Verify ports are not blocked
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`

### If Application Won't Start
- [ ] Check container status: `docker-compose ps`
- [ ] Review application logs
- [ ] Verify database is accessible
- [ ] Check for port conflicts
- [ ] Restart services: `docker-compose restart`

### If SSL Issues
- [ ] Verify domain points to correct IP
- [ ] Check certificate paths in nginx.conf
- [ ] Verify certificates are readable
- [ ] Check nginx logs: `docker-compose logs nginx`

## Maintenance Checklist

### Daily
- [ ] Check application is accessible
- [ ] Monitor error logs

### Weekly
- [ ] Review resource usage
- [ ] Check for security updates
- [ ] Verify backups are running

### Monthly
- [ ] Update dependencies
- [ ] Review and rotate logs
- [ ] Test backup restoration
- [ ] Security audit

## Success Criteria

Your deployment is successful when:
- [ ] ✅ Application is accessible via HTTP/HTTPS
- [ ] ✅ Swagger documentation loads
- [ ] ✅ Health endpoints respond correctly
- [ ] ✅ Database connections work
- [ ] ✅ API endpoints function properly
- [ ] ✅ File uploads work (Cloudinary)
- [ ] ✅ Payment processing works (LiqPay)
- [ ] ✅ SSL certificate is valid
- [ ] ✅ Backups are configured
- [ ] ✅ Monitoring is in place

## Quick Reference Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Stop services
docker-compose -f docker-compose.prod.yml down

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Backup database
docker-compose exec -T postgres pg_dump -U postgres goldsushi > backup.sql

# Clean up
docker system prune -f
```

## Support Resources

- 📖 [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide
- 📖 [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - Quick start guide
- 📖 [README.md](./README.md) - Project overview
- 🌊 [Digital Ocean Docs](https://docs.digitalocean.com/)
- 🐳 [Docker Docs](https://docs.docker.com/)
- 📦 [NestJS Docs](https://docs.nestjs.com/)

---

**Note**: This checklist is comprehensive. Not all items are required for a basic deployment. Start with the essentials and add advanced features as needed.

