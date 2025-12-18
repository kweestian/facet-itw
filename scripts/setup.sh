#!/bin/bash

set -e

echo "🚀 Setting up Facet..."

# Check for .env file
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please edit .env and add your OPENAI_API_KEY"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push schema to database
echo "💾 Setting up database..."
npm run db:push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OPENAI_API_KEY"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"



