#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up DokkuBase development environment...${NC}\n"

# Create data directory if it doesn't exist
mkdir -p data

# Function to get token from .env
get_setup_token() {
    if [ -f .env ]; then
        grep "SETUP_TOKEN" .env | cut -d'"' -f2
    fi
}

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Creating .env file...${NC}"
    
    # Generate random tokens
    SETUP_TOKEN=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    # Create .env file
    cat > .env << EOF
# Security
SETUP_TOKEN="${SETUP_TOKEN}"
SESSION_SECRET="${SESSION_SECRET}"

# Database
DB_PATH="./data/dokkubase.db"

# Development
NODE_ENV="development"
EOF
    
    echo -e "${GREEN}✅ Created .env file with secure tokens${NC}"
else
    echo -e "${BLUE}ℹ️  .env file already exists, reading token...${NC}"
    SETUP_TOKEN=$(get_setup_token)
    if [ -z "$SETUP_TOKEN" ]; then
        echo -e "${RED}❌ Could not read SETUP_TOKEN from .env${NC}"
        echo -e "${BLUE}ℹ️  Generating new token...${NC}"
        SETUP_TOKEN=$(openssl rand -hex 32)
        sed -i.bak "s/SETUP_TOKEN=.*/SETUP_TOKEN=\"${SETUP_TOKEN}\"/" .env && rm .env.bak
        echo -e "${GREEN}✅ Updated SETUP_TOKEN in .env${NC}"
    fi
fi

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm install

# Run database migrations
echo -e "\n${BLUE}🔄 Running database migrations...${NC}"
npm run db:migrate

# Success!
echo -e "\n${GREEN}✅ Development environment is ready!${NC}"
echo -e "\n${BLUE}To start development server:${NC}"
echo -e "1. Run: ${GREEN}npm run dev${NC}"
echo -e "2. Visit: ${GREEN}http://localhost:4321/setup?token=${SETUP_TOKEN}${NC}"
echo -e "\n${BLUE}Happy coding! 🎉${NC}" 