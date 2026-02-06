# GitHub and Vercel Deployment Guide

## GitHub Repository Setup

### 1. Initialize GitHub Repository
```bash
cd ~/agent-edge
git init
git add .
git commit -m "Initial commit: Agent Edge Mission Control Dashboard"
```

### 2. Create Remote Repository
1. Go to https://github.com/new
2. Create a new repository named "agent-edge-dashboard"
3. Follow the instructions to connect your local repo to GitHub

```bash
git remote add origin https://github.com/[your-username]/agent-edge-dashboard.git
git branch -M main
git push -u origin main
```

### 3. Create GitHub Secrets (for later Vercel deployment)
1. Go to Settings > Secrets and variables > Actions
2. Add the following secrets:
   - GEMINI_API_KEY: your Gemini API key

## Vercel Deployment Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Command Line
```bash
cd ~/agent-edge
vercel --prod
```

### 4. Or Link to GitHub
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework: Other
   - Root Directory: agent-edge
   - Build Command: npm run build
   - Output Directory: dist
   - Development Command: npm run dev

## Environment Variables for Production

Create a `.env.production` file with:
```
GEMINI_API_KEY=your_production_api_key
```

## Additional Configuration

### Update vercel.json
The current vercel.json file is already configured:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Update package.json for Production
Make sure your package.json has the correct build script:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Continuous Deployment
Once linked to GitHub, any push to the main branch will automatically deploy to Vercel.