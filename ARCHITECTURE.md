# 🏗️ Deployment Architecture

## Overview

This document describes the architecture of the GoldSushi application when deployed to Digital Ocean.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS (443) / HTTP (80)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Digital Ocean Droplet                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 UFW Firewall                               │  │
│  │  Ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)                 │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│                        │                                          │
│                        ▼                                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Nginx Container                               │  │
│  │  - Reverse Proxy                                          │  │
│  │  - SSL/TLS Termination                                    │  │
│  │  - Rate Limiting                                          │  │
│  │  - Gzip Compression                                       │  │
│  │  - Security Headers                                       │  │
│  │  Port: 80, 443                                           │  │
│  └─────────────────────┬─────────────────────────────────────┘  │
│                        │                                          │
│                        │ HTTP (4200)                             │
│                        │                                          │
│                        ▼                                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           NestJS Application Container                     │  │
│  │  - API Endpoints                                          │  │
│  │  - Business Logic                                         │  │
│  │  - Authentication (JWT)                                   │  │
│  │  - File Processing                                        │  │
│  │  - Health Checks                                          │  │
│  │  Port: 4200                                              │  │
│  └───────┬──────────────────┬──────────────────┬────────────┘  │
│          │                  │                  │                 │
└──────────┼──────────────────┼──────────────────┼─────────────────┘
           │                  │                  │
           │                  │                  │
           ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │PostgreSQL│      │Cloudinary│      │  LiqPay  │
    │ Database │      │  (Images)│      │(Payments)│
    │          │      │          │      │          │
    │ DO       │      │ External │      │ External │
    │ Managed  │      │ Service  │      │ Service  │
    └──────────┘      └──────────┘      └──────────┘
```

## Components

### 1. Digital Ocean Droplet
**Role:** Main application server  
**OS:** Ubuntu 22.04 LTS  
**Specs:** 2GB RAM, 1 vCPU (minimum)  
**IP:** Public IP assigned by Digital Ocean  

**Contains:**
- Docker Engine
- Docker Compose
- Application containers
- UFW Firewall

### 2. Nginx Container
**Image:** `nginx:alpine`  
**Purpose:** Reverse proxy and load balancer  
**Port Mapping:** 80:80, 443:443  

**Responsibilities:**
- SSL/TLS termination
- Request routing to application
- Rate limiting (10 req/s for API)
- Gzip compression
- Security headers
- Static file serving (if needed)
- Load balancing (for multiple app instances)

### 3. NestJS Application Container
**Image:** Custom built from `Dockerfile`  
**Base:** `node:18-alpine`  
**Port Mapping:** 4200:4200  

**Features:**
- RESTful API endpoints
- JWT authentication
- Cart management
- Order processing
- Product catalog
- User management
- Promotion system
- Health check endpoints

**Health Checks:**
- `/api/health` - Overall health
- `/api/health/ready` - Readiness
- `/api/health/live` - Liveness

### 4. PostgreSQL Database
**Options:**

**A. Digital Ocean Managed Database (Recommended)**
- Fully managed
- Automatic backups
- High availability
- SSL connections
- Monitoring included

**B. Self-Hosted Container**
- `postgres:15-alpine` image
- Volume persistence
- Manual backups needed

### 5. External Services

**Cloudinary**
- Image upload and storage
- Image transformations
- CDN delivery

**LiqPay**
- Payment processing
- Transaction handling
- Webhook callbacks

**Email Service** (Optional)
- SMTP for transactional emails
- Password resets
- Order confirmations

## Network Flow

### User Request Flow
```
1. User → HTTPS Request → Internet
2. Internet → Port 443 → Droplet Firewall
3. Firewall → Nginx Container
4. Nginx → SSL Termination
5. Nginx → Rate Limiting Check
6. Nginx → HTTP Request → Application Container (Port 4200)
7. Application → Process Request
8. Application → Query Database (if needed)
9. Application → HTTP Response → Nginx
10. Nginx → Gzip Compression
11. Nginx → HTTPS Response → User
```

### API Request Example
```
GET https://yourdomain.com/api/products

1. Nginx receives HTTPS request
2. Nginx forwards to http://app:4200/api/products
3. NestJS router handles request
4. ProductsService queries PostgreSQL
5. Response sent back through Nginx
6. Client receives JSON response
```

## Data Flow

### Image Upload Flow
```
Client → Upload Request → Nginx → Application
Application → Process Image (Sharp)
Application → Upload to Cloudinary
Cloudinary → Return URL
Application → Store URL in Database
Application → Return Response → Client
```

### Order Processing Flow
```
Client → Create Order → Application
Application → Validate Cart
Application → Calculate Total
Application → Apply Promo Code (if any)
Application → Create Order in DB
Application → Initiate Payment (LiqPay)
LiqPay → Webhook → Application
Application → Update Order Status
Application → Send Email Confirmation
```

## Security Layers

### 1. Network Security
- UFW Firewall (ports 22, 80, 443 only)
- SSH key authentication
- Rate limiting at Nginx level
- DDoS protection (via Digital Ocean)

### 2. Application Security
- JWT authentication
- Password hashing (bcrypt)
- Input validation (class-validator)
- SQL injection prevention (TypeORM)
- CORS configuration
- Security headers (via Nginx)

### 3. Data Security
- SSL/TLS encryption in transit
- Database encryption at rest (DO Managed DB)
- Environment variable secrets
- No sensitive data in logs

### 4. Container Security
- Non-root user in container
- Minimal base image (Alpine)
- No unnecessary packages
- Health checks for early failure detection

## Scalability Options

### Vertical Scaling (Single Server)
```
Current: 2GB RAM, 1 vCPU
   ↓ Resize Droplet
Medium: 4GB RAM, 2 vCPU
   ↓ Resize Droplet
Large: 8GB RAM, 4 vCPU
```

### Horizontal Scaling (Multiple Servers)
```
┌─────────────────────────────────┐
│  Digital Ocean Load Balancer     │
└──────┬──────────┬─────────┬──────┘
       │          │         │
       ▼          ▼         ▼
   Droplet 1  Droplet 2  Droplet 3
   (App + Nginx) (App + Nginx) (App + Nginx)
       │          │         │
       └──────────┴─────────┘
                  │
                  ▼
         Shared Database
      (DO Managed PostgreSQL)
```

### Container Scaling
```bash
# Scale to 3 application instances
docker-compose up -d --scale app=3

# Nginx will load balance between instances
```

## Deployment Flow

### CI/CD Pipeline (GitHub Actions)
```
1. Developer pushes code to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Run tests and linting
   ↓
4. Build Docker image
   ↓
5. Push to GitHub Container Registry
   ↓
6. SSH to Digital Ocean droplet
   ↓
7. Pull new image
   ↓
8. Stop old containers
   ↓
9. Start new containers
   ↓
10. Health check verification
   ↓
11. Deployment complete
```

### Manual Deployment
```
1. Developer runs ./deploy.sh
   ↓
2. Build Docker image locally
   ↓
3. Push to container registry
   ↓
4. SSH to droplet
   ↓
5. Pull and restart containers
   ↓
6. Verify deployment
```

## Monitoring Setup

### Application Monitoring
```
Health Checks (Every 30s)
   ↓
Docker Health Status
   ↓
Application Logs
   ↓
Monitoring Dashboard (Optional: Grafana)
```

### Infrastructure Monitoring
```
DO Monitoring Dashboard
   ↓
CPU, Memory, Disk, Network
   ↓
Alerts (Email/SMS)
```

### Log Management
```
Container Logs → JSON Files (with rotation)
   ↓
monitor.sh script for viewing
   ↓
Optional: ELK Stack or Cloud Logging
```

## Backup Strategy

### Database Backups
```
Daily Cron Job
   ↓
pg_dump to SQL file
   ↓
Upload to Digital Ocean Spaces
   ↓
Keep last 30 days
   ↓
Test restoration monthly
```

### Application Backups
```
Git Repository (Code)
   ↓
Container Registry (Images)
   ↓
Environment Variables (Secure storage)
```

## Disaster Recovery

### Recovery Time Objective (RTO): 30 minutes
### Recovery Point Objective (RPO): 24 hours

**Recovery Steps:**
1. Provision new droplet
2. Install Docker
3. Pull application image
4. Restore database from backup
5. Configure environment variables
6. Start services
7. Verify functionality

## Cost Estimation (Monthly)

| Service | Cost (USD) | Notes |
|---------|------------|-------|
| Droplet (2GB) | $12 | Basic tier |
| Managed DB | $15 | Smallest tier |
| Spaces (Storage) | $5 | 250GB included |
| Bandwidth | $0 | 1TB included |
| Load Balancer | $12 | If scaling |
| **Total** | **$32-44** | Without/with LB |

## Performance Metrics

**Target Metrics:**
- Response Time: < 200ms (average)
- Uptime: 99.9%
- Error Rate: < 0.1%
- Database Queries: < 50ms
- Image Upload: < 2s

**Capacity:**
- Concurrent Users: 100-500 (2GB droplet)
- Requests/sec: 50-100
- Database Connections: 10-20

## Environment Variables Flow

```
Local Development
   ↓
.env file → Docker Compose → Container

Production
   ↓
.env.production → SSH Upload → Droplet → Docker Compose → Container

CI/CD
   ↓
GitHub Secrets → GitHub Actions → Droplet → Docker Compose → Container
```

## Summary

This architecture provides:

✅ **High Availability** - Health checks and auto-restart  
✅ **Security** - Multiple security layers  
✅ **Scalability** - Can scale vertically or horizontally  
✅ **Performance** - Nginx caching and compression  
✅ **Maintainability** - Docker containers and automation  
✅ **Cost-Effective** - Starts at ~$32/month  
✅ **Monitoring** - Health checks and logging  
✅ **Disaster Recovery** - Backup and restore procedures  

---

**For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

