#!/bin/bash

# GitHub Secrets Setup Helper
# This script helps you set up GitHub secrets for automated deployment
# Requires: GitHub CLI (gh) - Install: brew install gh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║    GitHub Actions Secrets Setup Helper                    ║"
echo "║    For Digital Ocean Deployment                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo ""
    echo "Please install it first:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: https://github.com/cli/cli/blob/trunk/docs/install_windows.md"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}You need to authenticate with GitHub CLI${NC}"
    echo "Running: gh auth login"
    gh auth login
fi

echo ""
echo -e "${GREEN}✓ GitHub CLI is ready${NC}"
echo ""

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

if [ -z "$REPO" ]; then
    echo -e "${RED}Error: Not in a GitHub repository or repository not found${NC}"
    echo "Please run this script from your repository directory"
    exit 1
fi

echo -e "${BLUE}Repository: ${YELLOW}$REPO${NC}"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_value=$2

    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name"
        echo -e "${GREEN}✓ Set $secret_name${NC}"
    else
        echo -e "${YELLOW}⊘ Skipped $secret_name (no value provided)${NC}"
    fi
}

# Function to prompt for input
prompt_input() {
    local prompt_text=$1
    local default_value=$2
    local is_secret=$3

    if [ "$is_secret" = "true" ]; then
        read -sp "$prompt_text: " input_value
        echo ""
    else
        if [ -n "$default_value" ]; then
            read -p "$prompt_text [$default_value]: " input_value
            input_value=${input_value:-$default_value}
        else
            read -p "$prompt_text: " input_value
        fi
    fi

    echo "$input_value"
}

# Interactive mode
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 1: Digital Ocean Droplet Information${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

DROPLET_IP=$(prompt_input "Enter your Digital Ocean Droplet IP address" "" false)
SSH_USER=$(prompt_input "Enter SSH username" "root" false)

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 2: SSH Private Key${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Options:"
echo "  1) Use existing SSH key (~/.ssh/id_rsa)"
echo "  2) Use existing SSH key (~/.ssh/id_ed25519)"
echo "  3) Specify custom path"
echo "  4) Generate new SSH key pair"
echo "  5) Paste key manually"
echo ""

read -p "Choose option (1-5): " ssh_option

case $ssh_option in
    1)
        SSH_KEY_PATH="$HOME/.ssh/id_rsa"
        ;;
    2)
        SSH_KEY_PATH="$HOME/.ssh/id_ed25519"
        ;;
    3)
        read -p "Enter path to SSH private key: " SSH_KEY_PATH
        ;;
    4)
        echo ""
        echo -e "${BLUE}Generating new SSH key pair...${NC}"
        SSH_KEY_PATH="$HOME/.ssh/github_actions_goldsushi"
        ssh-keygen -t ed25519 -C "github-actions-goldsushi" -f "$SSH_KEY_PATH" -N ""
        echo ""
        echo -e "${GREEN}✓ Key pair generated${NC}"
        echo -e "${YELLOW}Public key:${NC}"
        cat "${SSH_KEY_PATH}.pub"
        echo ""
        echo -e "${YELLOW}You need to add this public key to your droplet:${NC}"
        echo "ssh-copy-id -i ${SSH_KEY_PATH}.pub ${SSH_USER}@${DROPLET_IP}"
        echo ""
        read -p "Press Enter after you've added the public key to your droplet..."
        ;;
    5)
        echo ""
        echo "Paste your SSH private key (press Ctrl+D when done):"
        SSH_PRIVATE_KEY=$(cat)
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

# Read SSH private key if path was provided
if [ -n "$SSH_KEY_PATH" ] && [ -f "$SSH_KEY_PATH" ]; then
    SSH_PRIVATE_KEY=$(cat "$SSH_KEY_PATH")
    echo -e "${GREEN}✓ SSH private key loaded${NC}"
elif [ -n "$SSH_KEY_PATH" ]; then
    echo -e "${RED}Error: SSH key file not found: $SSH_KEY_PATH${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 3: Production Environment Variables (Optional)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Do you want to set PRODUCTION_ENV secret?"
echo "This will allow GitHub Actions to update your .env file on deployment."
echo ""

read -p "Set PRODUCTION_ENV? (y/n): " set_prod_env

if [[ "$set_prod_env" =~ ^[Yy]$ ]]; then
    if [ -f ".env.production" ]; then
        echo ""
        echo "Found .env.production file. Use it? (y/n): "
        read -p "" use_env_file

        if [[ "$use_env_file" =~ ^[Yy]$ ]]; then
            PRODUCTION_ENV=$(cat .env.production)
        else
            echo "Please paste your production environment variables (press Ctrl+D when done):"
            PRODUCTION_ENV=$(cat)
        fi
    else
        echo ""
        echo "Please paste your production environment variables (press Ctrl+D when done):"
        PRODUCTION_ENV=$(cat)
    fi
fi

echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 4: Domain URL (Optional)${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

DOMAIN_URL=$(prompt_input "Enter your domain URL (e.g., https://yourdomain.com)" "" false)

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Summary - Secrets to be set:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Repository: ${YELLOW}$REPO${NC}"
echo -e "DROPLET_IP: ${GREEN}$DROPLET_IP${NC}"
echo -e "SSH_USER: ${GREEN}$SSH_USER${NC}"
echo -e "SSH_PRIVATE_KEY: ${GREEN}[loaded]${NC}"
[ -n "$PRODUCTION_ENV" ] && echo -e "PRODUCTION_ENV: ${GREEN}[loaded]${NC}" || echo -e "PRODUCTION_ENV: ${YELLOW}[skipped]${NC}"
[ -n "$DOMAIN_URL" ] && echo -e "DOMAIN_URL: ${GREEN}$DOMAIN_URL${NC}" || echo -e "DOMAIN_URL: ${YELLOW}[skipped]${NC}"
echo ""

read -p "Proceed with setting these secrets? (y/n): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Aborted${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Setting secrets...${NC}"
echo ""

# Set secrets
set_secret "DROPLET_IP" "$DROPLET_IP"
set_secret "SSH_USER" "$SSH_USER"
set_secret "SSH_PRIVATE_KEY" "$SSH_PRIVATE_KEY"
[ -n "$PRODUCTION_ENV" ] && set_secret "PRODUCTION_ENV" "$PRODUCTION_ENV"
[ -n "$DOMAIN_URL" ] && set_secret "DOMAIN_URL" "$DOMAIN_URL"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All secrets have been set successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify secrets: gh secret list"
echo "  2. Push to main branch to trigger deployment"
echo "  3. Monitor deployment: gh run watch"
echo ""
echo "View all secrets:"
echo "  gh secret list"
echo ""
echo "To update a secret later:"
echo "  gh secret set SECRET_NAME"
echo ""
echo -e "${BLUE}Happy deploying! 🚀${NC}"

