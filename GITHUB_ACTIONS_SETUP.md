# GitHub Actions Setup Guide for Digital Ocean Deployment

This guide will help you set up automated CI/CD deployment using GitHub Actions.

## Overview

The GitHub Actions workflow will:
1. ✅ Run tests on every push
2. 🐳 Build Docker image and push to GitHub Container Registry
3. 🚀 Deploy to your Digital Ocean droplet
4. ✓ Verify deployment with health checks

## Prerequisites

Before you start:
- [ ] GitHub repository with your code
- [ ] Digital Ocean droplet set up with Docker
- [ ] SSH access to your droplet
- [ ] Docker Compose installed on droplet

## Step 1: Prepare Your Droplet

### 1.1 Connect to your droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### 1.2 Create application directory

```bash
mkdir -p ~/goldsushi
cd ~/goldsushi
```

### 1.3 Create initial .env file

```bash
nano .env
```

Add your production environment variables:

```env
# Application
FORTEND_URL=https://yourfrontend.com
NODE_ENV=production
PORT=4200

# JWT
JWT_ACCESS=your-super-secret-jwt-access-key
JWT_REFRESH=your-super-secret-jwt-refresh-key
JWT_ACCESS_MAX_AGE=3600
JWT_REFRESH_MAX_AGE=604800

# Database
DB_HOST=your-db-host
DB_PORT=25060
DB_PASSWORD=your-db-password
DB_USERNAME=doadmin
DB_DATABASE=goldsushi

# Google Cloud (if using)
GC_KEYPATH=/path/to/key.json
GC_PROJECT=your-project
GC_BUCKET=your-bucket

# Payment
LIQPAY_PUBLIC=your-public-key
LIQPAY_PRIVATE=your-private-key

# Docker Registry
DOCKER_REGISTRY=ghcr.io/YOUR_GITHUB_USERNAME
```

Save and exit (Ctrl+X, then Y, then Enter)

### 1.4 Copy deployment files to droplet

From your local machine:

```bash
cd /Users/romanmaliarchuk/WebstormProjects/goldsushi

# Copy docker-compose.prod.yml
scp docker-compose.prod.yml root@YOUR_DROPLET_IP:~/goldsushi/

# Copy nginx.conf
scp nginx.conf root@YOUR_DROPLET_IP:~/goldsushi/
```

## Step 2: Set Up GitHub Repository Settings

### 2.1 Enable GitHub Container Registry

1. Go to your GitHub profile → Settings → Developer settings → Personal access tokens
2. Generate a new token (classic) with these permissions:
   - `read:packages`
   - `write:packages`
   - `delete:packages`
   - `repo` (full control)
3. Save the token securely (you'll need it later)

**Note:** GitHub Actions automatically has access to `GITHUB_TOKEN`, so this step is optional for deployment but useful for local testing.

## Step 3: Configure GitHub Secrets

### 3.1 Navigate to Repository Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 3.2 Add Required Secrets

Add the following secrets one by one:

#### Secret 1: DROPLET_IP
```
Name: DROPLET_IP
Value: YOUR_DROPLET_IP_ADDRESS
```
Example: `143.198.123.45`

#### Secret 2: SSH_USER
```
Name: SSH_USER
Value: root
```
(or whatever user you use to SSH into the droplet)

#### Secret 3: SSH_PRIVATE_KEY

This is your SSH private key. To get it:

**On macOS/Linux:**
```bash
cat ~/.ssh/id_rsa
```

Or if you need to generate a new key pair:
```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key

# Display private key
cat ~/.ssh/github_actions_key

# Copy public key to your droplet
ssh-copy-id -i ~/.ssh/github_actions_key.pub root@YOUR_DROPLET_IP
```

Copy the **entire private key** including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...key content...
-----END OPENSSH PRIVATE KEY-----
```

Then add as secret:
```
Name: SSH_PRIVATE_KEY
Value: [paste your private key here]
```

#### Secret 4: PRODUCTION_ENV (Optional but Recommended)

If you want GitHub Actions to update the .env file on each deployment:

```
Name: PRODUCTION_ENV
Value: [paste your entire .env content]
```

Example content:
```
FORTEND_URL=https://yourfrontend.com
NODE_ENV=production
PORT=4200
DB_HOST=your-db-host
DB_PASSWORD=your-password
JWT_ACCESS=your-secret
JWT_REFRESH=your-refresh-secret
...etc
```

#### Secret 5: DOMAIN_URL (Optional)

For health check verification after deployment:

```
Name: DOMAIN_URL
Value: https://yourdomain.com
```

## Step 4: Update docker-compose.prod.yml

Make sure your `docker-compose.prod.yml` references the correct image:

```yaml
services:
  app:
    image: ghcr.io/YOUR_GITHUB_USERNAME/goldsushi:latest
    # ... rest of config
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username (lowercase).

## Step 5: Test the Workflow

### 5.1 Push to GitHub

```bash
git add .
git commit -m "feat: add GitHub Actions deployment"
git push origin main
```

### 5.2 Watch the Workflow

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see a workflow running
4. Click on it to see the progress

### 5.3 Workflow Stages

The workflow has 3 jobs:

1. **Test** (2-3 minutes)
   - Installs dependencies
   - Runs linter
   - Runs tests

2. **Build** (3-5 minutes)
   - Builds Docker image
   - Pushes to GitHub Container Registry

3. **Deploy** (2-3 minutes)
   - Connects to droplet via SSH
   - Pulls latest image
   - Restarts containers
   - Verifies deployment

**Total time:** ~10 minutes

## Step 6: Verify Deployment

### 6.1 Check Application

```bash
# On your droplet
ssh root@YOUR_DROPLET_IP

cd ~/goldsushi
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f app
```

### 6.2 Test Endpoints

```bash
# Health check
curl http://YOUR_DROPLET_IP:4200/api/health

# Swagger docs
curl http://YOUR_DROPLET_IP:4200/swagger
```

Or visit in browser:
- http://YOUR_DROPLET_IP:4200/api/health
- http://YOUR_DROPLET_IP:4200/swagger

## Troubleshooting

### Workflow Fails at Test Stage

**Error:** Tests fail
```bash
# Run tests locally first
npm run test
npm run lint
```
Fix any errors before pushing.

### Workflow Fails at Build Stage

**Error:** Docker build fails
```bash
# Test build locally
docker build -t goldsushi:test .
```

**Error:** Permission denied pushing to registry
- Make sure your repository is public, OR
- Enable package permissions: Settings → Actions → General → Workflow permissions → Read and write permissions

### Workflow Fails at Deploy Stage

**Error:** SSH connection failed
- Verify `DROPLET_IP` is correct
- Verify `SSH_USER` is correct
- Verify `SSH_PRIVATE_KEY` is correct and complete

**Error:** Docker login failed
- The workflow uses `GITHUB_TOKEN` automatically
- Make sure Container Registry is enabled

**Error:** Cannot pull image
```bash
# On droplet, try manually:
echo "YOUR_GITHUB_TOKEN" | docker login ghcr.io -u YOUR_USERNAME --password-stdin
docker pull ghcr.io/YOUR_USERNAME/goldsushi:latest
```

**Error:** Application won't start
```bash
# Check logs on droplet
cd ~/goldsushi
docker-compose -f docker-compose.prod.yml logs app
```

Common issues:
- Missing environment variables in .env
- Database connection issues
- Port already in use

## Manual Deployment (Fallback)

If GitHub Actions fails, you can deploy manually:

```bash
# On your local machine
./deploy.sh production
```

## Workflow Triggers

The workflow runs automatically on:

### 1. Push to main or production branch
```bash
git push origin main
```

### 2. Pull Request to main
```bash
git checkout -b feature-branch
git push origin feature-branch
# Create PR on GitHub - only runs tests, no deployment
```

### 3. Manual Trigger
1. Go to Actions tab
2. Select "Build and Deploy to Digital Ocean"
3. Click "Run workflow"
4. Choose environment
5. Click "Run workflow"

## Advanced Configuration

### Deploy to Staging

To add a staging environment:

1. Create `docker-compose.staging.yml`
2. Add staging secrets to GitHub
3. Update workflow to handle staging branch

### Notifications

Add Slack/Discord notifications on deployment:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Rollback

To rollback to a previous version:

```bash
# On droplet
cd ~/goldsushi

# Pull specific version
docker pull ghcr.io/YOUR_USERNAME/goldsushi:main-abc123

# Update docker-compose.prod.yml to use that tag
# Then restart
docker-compose -f docker-compose.prod.yml up -d
```

## Security Best Practices

1. ✅ Never commit secrets to git
2. ✅ Use SSH keys, not passwords
3. ✅ Limit SSH key permissions (use dedicated key for GitHub Actions)
4. ✅ Use least-privilege principle for SSH user
5. ✅ Rotate secrets regularly
6. ✅ Enable 2FA on GitHub
7. ✅ Use environment protection rules in GitHub

## Monitoring Deployments

### View Deployment History

1. Go to GitHub repository
2. Click **Actions** tab
3. See all workflow runs

### Set Up Alerts

1. Go to Repository Settings
2. Click **Notifications**
3. Enable email notifications for workflow failures

### Deployment Status Badge

Add to your README.md:

```markdown
![Deploy](https://github.com/YOUR_USERNAME/goldsushi/actions/workflows/deploy.yml/badge.svg)
```

## Cost Considerations

GitHub Actions is free for public repositories with:
- 2,000 minutes/month of workflow time
- Unlimited minutes for private repos with GitHub Pro/Team/Enterprise

Your deployment workflow uses ~10 minutes per run.

## Quick Reference

### Essential Commands

```bash
# Watch deployment
gh run watch  # (requires GitHub CLI)

# View logs
gh run view --log

# Cancel workflow
gh run cancel

# Re-run workflow
gh run rerun
```

### GitHub Secrets Checklist

- [ ] DROPLET_IP
- [ ] SSH_USER
- [ ] SSH_PRIVATE_KEY
- [ ] PRODUCTION_ENV (optional)
- [ ] DOMAIN_URL (optional)

### Deployment Flow

```
Code Push → GitHub → Run Tests → Build Docker Image → 
Push to Registry → SSH to Droplet → Pull Image → 
Restart Containers → Verify Health → Done! ✅
```

## Next Steps

After successful setup:

1. [ ] Set up SSL/HTTPS certificates
2. [ ] Configure domain name
3. [ ] Set up monitoring (UptimeRobot, Pingdom)
4. [ ] Configure database backups
5. [ ] Set up staging environment
6. [ ] Document your deployment process
7. [ ] Create runbooks for common issues

## Support

If you encounter issues:

1. Check GitHub Actions logs
2. Check droplet logs: `docker-compose logs`
3. Review [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Check Digital Ocean documentation
5. Review GitHub Actions documentation

## Success! 🎉

Once everything is set up, every push to `main` will automatically:
- Run tests
- Build Docker image
- Deploy to your droplet
- Verify deployment

**No manual intervention needed!**

---

**Created:** March 2026  
**Last Updated:** March 16, 2026  
**Maintainer:** GitHub Actions CI/CD Pipeline

