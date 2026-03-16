# Docker Quick Start Guide

## For Development

### Prerequisites
- Docker Desktop installed
- Docker Compose installed
- `.env` file configured (copy from `.env.example`)

### Starting the Application

```bash
# Option 1: Using Docker Compose
docker-compose up -d

# Option 2: Using Makefile
make up

# Option 3: Using the build script
./build-local.sh
```

### Accessing the Application

- **API**: http://localhost:4200/api
- **Swagger Docs**: http://localhost:4200/swagger
- **Health Check**: http://localhost:4200/api/health
- **Database**: localhost:5432

### Useful Commands

```bash
# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### With Makefile

```bash
# See all available commands
make help

# Start services
make up

# View logs
make logs

# Stop services
make down

# Clean everything
make clean
```

## For Production Deployment

### Prerequisites
- Digital Ocean droplet with Docker installed
- PostgreSQL database (managed or self-hosted)
- Domain name (optional but recommended)
- Container registry account (GitHub, Docker Hub, or Digital Ocean)

### Quick Deploy

```bash
# 1. Set environment variables
export DOCKER_REGISTRY="ghcr.io/yourusername"
export DROPLET_IP="your-droplet-ip"
export SSH_USER="root"

# 2. Run deployment
./deploy.sh production
```

### Manual Deploy

```bash
# 1. Build image
docker build -t goldsushi:latest .

# 2. Tag for registry
docker tag goldsushi:latest ghcr.io/yourusername/goldsushi:latest

# 3. Push to registry
docker push ghcr.io/yourusername/goldsushi:latest

# 4. On droplet, pull and start
ssh root@your-droplet-ip
cd ~/goldsushi
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### With Makefile

```bash
# Build and push
make build push

# Deploy to production
make deploy

# Update production
make update
```

## Environment Variables

### Required Variables

```env
# Application
FORTEND_URL=https://yourfrontend.com
PORT=4200

# JWT
JWT_ACCESS=your-secret-key
JWT_REFRESH=your-refresh-key

# Database
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=your-password
DB_USERNAME=postgres
DB_DATABASE=goldsushi
```

### Optional Variables

```env
# Google Cloud (for file storage)
GC_KEYPATH=/path/to/key.json
GC_PROJECT=your-project
GC_BUCKET=your-bucket

# Payment
LIQPAY_PUBLIC=your-public-key
LIQPAY_PRIVATE=your-private-key
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Database not ready: Wait a few seconds and restart
# - Port in use: Change PORT in .env
# - Missing env vars: Check .env file
```

### Database connection fails

```bash
# Check if database is running
docker-compose ps

# Test database connection
docker-compose exec postgres psql -U postgres -d goldsushi

# Restart database
docker-compose restart postgres
```

### Can't access application

```bash
# Check if container is running
docker-compose ps

# Check container logs
docker-compose logs app

# Verify port mapping
docker-compose port app 4200

# Test health endpoint
curl http://localhost:4200/api/health
```

### Build fails

```bash
# Clean Docker cache
docker builder prune -a

# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build --force-recreate
```

## Health Checks

The application provides multiple health check endpoints:

- **GET /api/health** - Overall health status
- **GET /api/health/ready** - Readiness probe (for load balancers)
- **GET /api/health/live** - Liveness probe (for container orchestration)

Example response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-16T10:00:00.000Z",
  "uptime": 12345.67,
  "environment": "production"
}
```

## Database Operations

### Backup Database

```bash
# Using docker-compose
docker-compose exec -T postgres pg_dump -U postgres goldsushi > backup.sql

# Using Makefile
make db-backup
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres goldsushi < backup.sql
```

### Access Database Shell

```bash
# Using docker-compose
docker-compose exec postgres psql -U postgres -d goldsushi

# Using Makefile
make db-shell
```

## Scaling

### Increase Container Resources

Edit `docker-compose.yml` or `docker-compose.prod.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Multiple Instances

```bash
# Scale to 3 instances
docker-compose up -d --scale app=3
```

Note: For production, use a load balancer (Nginx, Digital Ocean Load Balancer, etc.)

## CI/CD

The project includes GitHub Actions workflow for automated deployment.

### Setup GitHub Actions

1. Add these secrets to your GitHub repository:
   - `DROPLET_IP`: Your droplet IP address
   - `SSH_USER`: SSH user (usually 'root')
   - `SSH_PRIVATE_KEY`: Your SSH private key
   - `PRODUCTION_ENV`: Your production .env file content
   - `DOCKER_COMPOSE_PROD`: Your docker-compose.prod.yml content

2. Push to `main` branch to trigger deployment

## Next Steps

- 📖 Read the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- 🔒 Set up SSL certificates with Let's Encrypt
- 📊 Configure monitoring and logging
- 🔄 Set up automated backups
- 🌐 Configure a load balancer for scaling

