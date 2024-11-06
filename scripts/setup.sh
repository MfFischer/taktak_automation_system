#!/bin/bash

# Taktak Setup Script
# This script helps you set up the Taktak development environment

set -e

echo "🚀 Taktak Setup Script"
echo "======================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check npm version
echo "Checking npm version..."
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 9 ]; then
    echo "❌ Error: npm 9 or higher is required"
    echo "   Current version: $(npm -v)"
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Check Docker (optional)
echo "Checking Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker version: $(docker --version)"
else
    echo "⚠️  Docker not found (optional, but recommended)"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env and update the following:"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - ENCRYPTION_KEY (generate with: openssl rand -base64 32 | cut -c1-32)"
    echo "   - SESSION_SECRET (generate with: openssl rand -base64 32)"
    echo "   - COUCHDB_PASSWORD (change from default)"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔐 Generating secure secrets..."
echo ""
echo "Add these to your .env file:"
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -base64 32 | cut -c1-32)"
echo "SESSION_SECRET=$(openssl rand -base64 32)"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start with Docker: npm run docker:up"
echo "   OR start manually:"
echo "   - Terminal 1: npm run dev:server"
echo "   - Terminal 2: npm run dev:client"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - API: http://localhost:3001"
echo "   - CouchDB: http://localhost:5984/_utils"
echo ""
echo "📚 Read the README.md for more information"
echo ""

