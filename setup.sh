#!/bin/bash

echo "📰 NewsHub Setup Script"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend Setup
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend
echo "Installing backend dependencies..."
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Frontend Setup
cd ../frontend
echo -e "${BLUE}Setting up Frontend...${NC}"
echo "Installing frontend dependencies..."
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

cd ..
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo ""
echo "📖 Next Steps:"
echo "=============="
echo ""
echo "1. Start the Backend Server (in one terminal):"
echo "   cd backend && npm start"
echo ""
echo "2. Start the Frontend Dev Server (in another terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open your browser to http://localhost:5173"
echo ""
echo "Happy browsing! 🎉"
