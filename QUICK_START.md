# 🚀 Quick Start Reference

## First Time Setup (5 minutes)

```bash
# 1. Navigate to project
cd fullstack-ts-project

# 2. Run setup script
chmod +x setup.sh
./setup.sh
```

## Running the App

### Option 1: Single Command (Easiest)
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Two Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Push to GitHub (Choose One Method)

### Method 1: GitHub CLI (Recommended)
```bash
# Install GitHub CLI (one time)
brew install gh
gh auth login

# Push to GitHub
git init
git add .
git commit -m "Initial commit"
gh repo create fullstack-ts-project --public --source=. --remote=origin --push
```

### Method 2: Manual
```bash
# 1. Create repo at github.com/new
# 2. Run these commands:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fullstack-ts-project.git
git branch -M main
git push -u origin main
```

## Useful Commands

```bash
# Install dependencies (if needed)
cd backend && npm install
cd ../frontend && npm install

# Build for production
cd backend && npm run build
cd frontend && npm run build

# Run linter
npm run lint

# Run tests
npm test
```

## Project URLs

- **README**: Full documentation in README.md
- **GitHub Setup**: Detailed guide in GITHUB_SETUP.md
- **VS Code**: Recommended extensions in .vscode/

## Need Help?

1. Check README.md for full documentation
2. Check GITHUB_SETUP.md for GitHub instructions
3. Open an issue on GitHub

## Tech Stack Summary

**Frontend**: React 18 + TypeScript + Vite
**Backend**: Node.js + Express + TypeScript
**Features**: RESTful API, Hot Reload, Production Ready

---

**Pro Tip**: Use Claude Code extension in VS Code for AI-powered development assistance!
