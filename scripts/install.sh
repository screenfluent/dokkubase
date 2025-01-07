#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Installing DokkuBase...${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root${NC}"
    exit 1
fi

# Check if Dokku is installed
if ! command -v dokku &> /dev/null; then
    echo -e "${BLUE}🔄 Installing Dokku...${NC}"
    
    # Install Dokku
    wget -NP . https://raw.githubusercontent.com/dokku/dokku/v0.31.3/bootstrap.sh
    sudo DOKKU_TAG=v0.31.3 bash bootstrap.sh
    
    echo -e "${GREEN}✅ Dokku installed successfully${NC}"
else
    echo -e "${BLUE}ℹ️  Dokku is already installed${NC}"
fi

# Create DokkuBase app
echo -e "\n${BLUE}🔄 Creating DokkuBase app...${NC}"
dokku apps:create dokkubase || true

# Generate secure tokens
SETUP_TOKEN=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Set environment variables
echo -e "\n${BLUE}🔄 Setting environment variables...${NC}"
dokku config:set dokkubase \
    SETUP_TOKEN="${SETUP_TOKEN}" \
    SESSION_SECRET="${SESSION_SECRET}" \
    NODE_ENV="production" \
    DB_PATH="/app/data/dokkubase.db"

# Create persistent storage
echo -e "\n${BLUE}🔄 Setting up persistent storage...${NC}"
dokku storage:ensure-directory dokkubase
dokku storage:mount dokkubase /var/lib/dokku/data/storage/dokkubase:/app/data

# Success!
echo -e "\n${GREEN}✅ DokkuBase installed successfully!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo -e "1. Deploy your code to Dokku"
echo -e "2. Visit: ${GREEN}http://your-domain/setup?token=${SETUP_TOKEN}${NC}"
echo -e "3. Complete the setup process"
echo -e "\n${BLUE}Keep this token safe - you'll need it for the initial setup!${NC}"
echo -e "${GREEN}SETUP_TOKEN=${SETUP_TOKEN}${NC}" 