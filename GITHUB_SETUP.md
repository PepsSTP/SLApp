# GitHub Setup Guide

This guide will help you push this project to GitHub and set it up properly.

## Method 1: Using GitHub CLI (Recommended for Mac)

### Step 1: Install GitHub CLI (if not already installed)

```bash
brew install gh
```

### Step 2: Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

### Step 3: Navigate to Your Project

```bash
cd /path/to/fullstack-ts-project
```

### Step 4: Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Full-stack TypeScript application"
```

### Step 5: Create GitHub Repository and Push

```bash
# Create a public repository
gh repo create fullstack-ts-project --public --source=. --remote=origin --push

# Or create a private repository
gh repo create fullstack-ts-project --private --source=. --remote=origin --push
```

That's it! Your repository is now on GitHub.

### Step 6: Open in Browser

```bash
gh repo view --web
```

---

## Method 2: Using GitHub Web Interface

### Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `fullstack-ts-project`
3. Description: "Full-stack TypeScript application with React and Node.js"
4. Choose Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### Step 2: Push Your Code

GitHub will show you commands. Use these:

```bash
cd /path/to/fullstack-ts-project
git init
git add .
git commit -m "Initial commit: Full-stack TypeScript application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/fullstack-ts-project.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Method 3: Using GitHub Desktop (GUI)

### Step 1: Install GitHub Desktop

Download from: https://desktop.github.com/

### Step 2: Add Repository

1. Open GitHub Desktop
2. File → Add Local Repository
3. Choose the `fullstack-ts-project` folder
4. Click "create a repository" if prompted
5. Click "Publish repository"
6. Choose public or private
7. Click "Publish Repository"

---

## Post-Setup Tasks

### 1. Add Collaborators (Optional)

```bash
gh repo edit --add-collaborator USERNAME
```

Or through GitHub web interface:
Settings → Collaborators → Add people

### 2. Set Up Branch Protection (Recommended)

On GitHub:
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass
   - Require conversation resolution before merging

### 3. Enable GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) will automatically run when you push changes.

To view workflow runs:
```bash
gh workflow list
gh run list
```

### 4. Add Repository Topics

On GitHub, add topics like:
- `typescript`
- `react`
- `nodejs`
- `express`
- `fullstack`
- `vite`

This helps others discover your project.

### 5. Set Up GitHub Pages (Optional)

If you want to deploy the frontend to GitHub Pages:

1. Go to Settings → Pages
2. Source: GitHub Actions
3. Create a deployment workflow (or use the built-in one)

---

## Cloning the Repository (For Team Members)

Once the repository is on GitHub, team members can clone it:

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/fullstack-ts-project.git
cd fullstack-ts-project

# Run the setup script
chmod +x setup.sh
./setup.sh

# Or manually install dependencies
cd backend && npm install
cd ../frontend && npm install
```

---

## Common Git Commands

### Daily Workflow

```bash
# Check status
git status

# Create a new branch
git checkout -b feature/your-feature-name

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/your-feature-name

# Create pull request
gh pr create

# Switch branches
git checkout main
git checkout feature/other-feature

# Pull latest changes
git pull origin main

# Merge branch
git merge feature/your-feature-name
```

### Syncing with Remote

```bash
# Fetch latest from GitHub
git fetch origin

# Pull and merge
git pull origin main

# Push your changes
git push origin main
```

---

## Setting Up Secrets for GitHub Actions

If you need environment variables in CI/CD:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add your secrets (e.g., `DATABASE_URL`, `API_KEY`)

Access in workflows:
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

---

## README Badges (Make Your Repo Look Professional)

Add these to the top of your README.md:

```markdown
![CI](https://github.com/YOUR_USERNAME/fullstack-ts-project/workflows/CI/badge.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)
```

---

## GitHub Repository Settings Recommendations

### General
- ✅ Allow squash merging
- ✅ Allow rebase merging
- ✅ Automatically delete head branches

### Branches
- Main branch: `main`
- Create `develop` branch for active development

### Actions
- ✅ Allow all actions and reusable workflows

### Security
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates

---

## Troubleshooting

### "Repository not found" error

Make sure you're authenticated:
```bash
gh auth status
```

### Push rejected

Pull latest changes first:
```bash
git pull origin main --rebase
git push origin main
```

### Large files

GitHub has a 100MB file size limit. Use Git LFS for large files:
```bash
brew install git-lfs
git lfs install
git lfs track "*.psd"
git add .gitattributes
```

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Set up branch protection
3. ✅ Add collaborators (if needed)
4. ✅ Enable GitHub Actions
5. ✅ Add badges to README
6. ✅ Set up deployment (Vercel, Netlify, etc.)
7. ✅ Configure Dependabot
8. ✅ Add project to your portfolio

---

## Useful GitHub CLI Commands

```bash
# View repository
gh repo view

# Create issue
gh issue create

# List pull requests
gh pr list

# Check out a PR
gh pr checkout NUMBER

# View workflow runs
gh run list

# View repository in browser
gh browse
```

---

## Resources

- **GitHub Docs**: https://docs.github.com
- **GitHub CLI**: https://cli.github.com/manual/
- **GitHub Actions**: https://docs.github.com/en/actions
- **Git Handbook**: https://guides.github.com/introduction/git-handbook/

---

**Questions?** Open an issue on your repository or check GitHub's documentation!
