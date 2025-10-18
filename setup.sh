#!/bin/bash

# CampusConnect Setup Script
# This script sets up the development environment for CampusConnect

set -e

echo "🚀 Setting up CampusConnect..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI $(supabase --version) detected"

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your actual API keys and configuration"
fi

# Check if Supabase project is linked
if [ ! -f supabase/config.toml ]; then
    echo "🔗 Linking Supabase project..."
    echo "Please run: supabase link --project-ref YOUR_PROJECT_REF"
    echo "You can find your project ref in the Supabase dashboard URL"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - GOOGLE_AI_API_KEY"
echo ""
echo "2. Link your Supabase project:"
echo "   supabase link --project-ref YOUR_PROJECT_REF"
echo ""
echo "3. Run database migrations:"
echo "   supabase db push"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more information, see README.md"
