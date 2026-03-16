# Deployment Guide - Digital Ocean

This guide will help you deploy the GoldSushi NestJS application to a Digital Ocean droplet using Docker.

## Prerequisites

1. **Digital Ocean Droplet**
   - Ubuntu 22.04 LTS (recommended)
   - Minimum 2GB RAM, 1 CPU
   - Docker and Docker Compose installed

2. **Domain Name** (optional but recommended)
   - Point your domain's A record to your droplet's IP

3. **PostgreSQL Database**
   - Either use Digital Ocean Managed Database
   - Or run PostgreSQL in a separate container/droplet

4. **Container Registry** (choose one)
   - Docker Hub
   - GitHub Container Registry (ghcr.io)
   - Digital Ocean Container Registry

## Initial Setup on Digital Ocean Droplet

### 1. Connect to your droplet

```bash
ssh root@your-droplet-ip
```

### 2. Install Docker and Docker Compose

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### 3. Create application directory

```bash
mkdir -p ~/goldsushi
cd ~/goldsushi
```

### 4. Configure firewall

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

## Deployment Methods

### Method 1: Using the Deployment Script (Recommended)

#### 1. Set up environment variables locally

Create a `.env.production` file or export variables:

```bash
export DOCKER_REGISTRY="ghcr.io/yourusername"
export IMAGE_TAG="v1.0.0"
export DROPLET_IP="your-droplet-ip"
export SSH_USER="root"
```

#### 2. Authenticate with your container registry

**For Docker Hub:**
```bash
docker login
```

**For GitHub Container Registry:**
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

**For Digital Ocean Container Registry:**
```bash
doctl registry login
```

#### 3. Run the deployment script

```bash
chmod +x deploy.sh
./deploy.sh production
```

### Method 2: Manual Deployment

#### 1. Build the Docker image locally

```bash
docker build -t goldsushi:latest .
```

#### 2. Tag and push to registry

```bash
# For Docker Hub
docker tag goldsushi:latest yourusername/goldsushi:latest
docker push yourusername/goldsushi:latest

# For GitHub Container Registry
docker tag goldsushi:latest ghcr.io/yourusername/goldsushi:latest
docker push ghcr.io/yourusername/goldsushi:latest
```

#### 3. On your droplet, create environment file

```bash
# On droplet
cd ~/goldsushi
nano .env
```

Add your environment variables:

```env
# Application
FORTEND_URL=https://yourfrontend.com
NODE_ENV=production
PORT=4200

# JWT
JWT_ACCESS=your-secret-key
JWT_REFRESH=your-refresh-secret
JWT_ACCESS_MAX_AGE=3600
JWT_REFRESH_MAX_AGE=604800

# Database (Digital Ocean Managed Database recommended)
DB_HOST=your-db-host
DB_PORT=5432
DB_PASSWORD=your-db-password
DB_USERNAME=your-db-username
DB_DATABASE=goldsushi

# Docker Registry
DOCKER_REGISTRY=ghcr.io/yourusername

# Google Cloud (if using)
GC_KEYPATH=/path/to/key.json
GC_PROJECT=your-project
GC_BUCKET=your-bucket

# Payment
LIQPAY_PUBLIC=your-public-key
LIQPAY_PRIVATE=your-private-key
```

#### 4. Copy necessary files to droplet

```bash
# From your local machine
scp docker-compose.prod.yml root@your-droplet-ip:~/goldsushi/
scp nginx.conf root@your-droplet-ip:~/goldsushi/
```

#### 5. Deploy on droplet

```bash
# On droplet
cd ~/goldsushi

# Pull the image
docker-compose -f docker-compose.prod.yml pull

# Start the application
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## SSL/HTTPS Setup (Recommended)

### Using Let's Encrypt with Certbot

#### 1. Install Certbot

```bash
apt install certbot -y
```

#### 2. Stop nginx temporarily

```bash
docker-compose -f docker-compose.prod.yml stop nginx
```

#### 3. Generate SSL certificate

```bash
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

#### 4. Copy certificates to project directory

```bash
mkdir -p ~/goldsushi/ssl
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/goldsushi/ssl/
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/goldsushi/ssl/
```

#### 5. Update nginx.conf

Uncomment the SSL certificate lines in `nginx.conf`:

```nginx
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

#### 6. Restart services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 7. Set up auto-renewal

```bash
# Add to crontab
crontab -e

# Add this line:
0 3 * * * certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/yourdomain.com/*.pem ~/goldsushi/ssl/ && cd ~/goldsushi && docker-compose -f docker-compose.prod.yml restart nginx"
```

## Database Setup

### Option 1: Digital Ocean Managed Database (Recommended)

1. Create a PostgreSQL database in Digital Ocean
2. Use the provided connection details in your `.env` file
3. Add your droplet's IP to the database's trusted sources

### Option 2: Self-hosted PostgreSQL

Use the full `docker-compose.yml` which includes PostgreSQL:

```bash
docker-compose up -d
```

## Monitoring and Maintenance

### View logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f app
```

### Check service status

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Restart services

```bash
docker-compose -f docker-compose.prod.yml restart
```

### Update application

```bash
# Pull latest image
docker-compose -f docker-compose.prod.yml pull

# Recreate containers
docker-compose -f docker-compose.prod.yml up -d

# Clean old images
docker image prune -f
```

### Backup database

```bash
# If using managed database, use Digital Ocean backups
# If self-hosted:
docker exec goldsushi-postgres pg_dump -U postgres goldsushi > backup.sql
```

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs app

# Common issues:
# - Database connection failed: Check DB_HOST and credentials
# - Port already in use: Change PORT in .env
# - Missing environment variables: Check .env file
```

### Database connection issues

```bash
# Test database connection
docker exec -it goldsushi-app node -e "const pg = require('pg'); const client = new pg.Client('postgresql://USER:PASS@HOST:PORT/DB'); client.connect().then(() => console.log('Connected!')).catch(console.error);"
```

### Nginx configuration errors

```bash
# Test nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Reload nginx
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## Performance Optimization

### Enable HTTP/2 and gzip

Already configured in `nginx.conf`

### Set up Docker logging limits

Already configured in `docker-compose.prod.yml` with log rotation

### Monitor resources

```bash
# Check resource usage
docker stats

# Check disk space
df -h

# Clean up unused Docker resources
docker system prune -a
```

## Security Best Practices

1. **Use strong passwords** for database and JWT secrets
2. **Enable firewall** (ufw) on your droplet
3. **Use HTTPS** with Let's Encrypt certificates
4. **Regular updates**: Keep Docker, OS, and dependencies updated
5. **Limit SSH access**: Use SSH keys, disable root login
6. **Environment variables**: Never commit `.env` to version control
7. **Database backups**: Set up automatic backups
8. **Monitor logs**: Check for suspicious activity

## Scaling

### Horizontal Scaling

Use Digital Ocean Load Balancers:

1. Create multiple droplets with the same setup
2. Set up a Digital Ocean Load Balancer
3. Point your domain to the load balancer

### Vertical Scaling

1. Resize your droplet in Digital Ocean control panel
2. No configuration changes needed

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Digital Ocean

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker image
        run: |
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker build -t ghcr.io/${{ github.repository }}/goldsushi:latest .
          docker push ghcr.io/${{ github.repository }}/goldsushi:latest
      
      - name: Deploy to droplet
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DROPLET_IP }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/goldsushi
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker image prune -f
```

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review Digital Ocean documentation
- Check NestJS documentation

## Quick Commands Reference

```bash
# Deploy/Update
docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart

# Stop
docker-compose -f docker-compose.prod.yml down

# Clean up
docker system prune -a -f
```

