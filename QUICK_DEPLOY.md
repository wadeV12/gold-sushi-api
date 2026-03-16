# 🚀 Quick Deployment Guide - TL;DR

## First Time Setup (15 minutes)

### 1. Set Up GitHub Secrets (5 min)

**Easy way:**
```bash
./setup-github-secrets.sh
```

**Manual way:**
Go to GitHub repo → Settings → Secrets → Add:
- `DROPLET_IP` - Your Digital Ocean droplet IP
- `SSH_USER` - Usually `root`
- `SSH_PRIVATE_KEY` - Your SSH private key
- `PRODUCTION_ENV` - Your .env file content (optional)

### 2. Update docker-compose.prod.yml (2 min)

Replace `yourusername` with your GitHub username:
```yaml
image: ghcr.io/YOUR_GITHUB_USERNAME/goldsushi:latest
```

### 3. Prepare Your Droplet (8 min)

```bash
# SSH to droplet
ssh root@YOUR_DROPLET_IP

# Install Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose -y

# Create app directory
mkdir -p ~/goldsushi
cd ~/goldsushi

# Create .env file
nano .env
# (paste your production environment variables)

# Copy files from local machine
exit
scp docker-compose.prod.yml root@YOUR_DROPLET_IP:~/goldsushi/
scp nginx.conf root@YOUR_DROPLET_IP:~/goldsushi/
```

## Deploy!

### Automatic (GitHub Actions)

```bash
git add .
git commit -m "deploy: initial deployment"
git push origin main
```

Watch it deploy:
```bash
# In browser: go to GitHub → Actions tab
# Or with CLI:
gh run watch
```

### Manual (Fallback)

```bash
./deploy.sh production
```

## Verify Deployment

```bash
# Check health
curl http://YOUR_DROPLET_IP:4200/api/health

# View logs
ssh root@YOUR_DROPLET_IP "cd ~/goldsushi && docker-compose logs -f"
```

## Common Commands

### On Your Droplet

```bash
# Check status
cd ~/goldsushi
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart
docker-compose -f docker-compose.prod.yml restart

# Update manually
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### Locally

```bash
# Test build
./build-local.sh

# Deploy
./deploy.sh production

# Monitor
./monitor.sh check
```

## Workflow

```
Local Code → Git Push → GitHub Actions → Build Docker Image → 
Push to Registry → Deploy to Droplet → Health Check → ✅ Done!
```

**Time per deployment:** ~10 minutes (automatic)

## Troubleshooting

### Build Fails
```bash
# Test locally first
docker build -t test .
npm run test
npm run lint
```

### Deploy Fails
```bash
# Check GitHub Actions logs
# Check secrets are set: gh secret list
# SSH to droplet and check logs:
ssh root@YOUR_DROPLET_IP "cd ~/goldsushi && docker-compose logs"
```

### App Won't Start
```bash
# Check environment variables
ssh root@YOUR_DROPLET_IP "cd ~/goldsushi && cat .env"

# Check database connection
ssh root@YOUR_DROPLET_IP "cd ~/goldsushi && docker-compose exec app node -e \"console.log(process.env.DB_HOST)\""
```

## Quick Links

- 📖 [Full Setup Guide](./GITHUB_ACTIONS_SETUP.md)
- 🐳 [Docker Guide](./DOCKER_QUICKSTART.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 🏗️ [Architecture](./ARCHITECTURE.md)

## Success Indicators

✅ GitHub Actions workflow completes (green checkmark)  
✅ `http://YOUR_DROPLET_IP:4200/api/health` returns `{"status":"ok"}`  
✅ `http://YOUR_DROPLET_IP:4200/swagger` loads  
✅ Docker containers are running on droplet  

## Cost

- **GitHub Actions:** Free for public repos
- **GitHub Container Registry:** Free for public repos
- **Digital Ocean Droplet:** ~$12-24/month
- **Total:** ~$12-24/month

---

**You're all set! Every push to `main` will auto-deploy! 🎉**

Quick command reference:
```bash
# Setup
./setup-github-secrets.sh

# Deploy
git push origin main

# Monitor
gh run watch

# Check
curl http://YOUR_IP:4200/api/health
```

