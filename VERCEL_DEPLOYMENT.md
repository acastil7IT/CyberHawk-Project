# Vercel Deployment Guide for CyberHawk

This guide will walk you through deploying CyberHawk to Vercel.

## Prerequisites

- GitHub account with access to the repository
- Vercel account (free tier works fine)
- Git installed locally

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Your Code to GitHub

```bash
# Make sure all changes are committed
git status

# Add any uncommitted changes
git add .
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select `acastil7IT/CyberHawk-Project`
5. Click **"Import"**

### Step 3: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Create React App
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/build`
- **Install Command**: `npm install`

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to your project settings
2. Click **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login

```bash
vercel login
```

### Step 3: Deploy

```bash
# From the project root directory
vercel

# For production deployment
vercel --prod
```

### Step 4: Follow Prompts

- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time) or **Y** (subsequent)
- What's your project's name? **cyberhawk-security**
- In which directory is your code located? **./frontend**

## Troubleshooting

### Build Fails

**Issue**: Build command not found

**Solution**: Ensure `package.json` in root has the build script:
```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build"
  }
}
```

### Wrong Directory

**Issue**: Can't find package.json

**Solution**: Check `vercel.json` configuration:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build"
}
```

### Environment Variables

**Issue**: API calls failing

**Solution**: The app uses mock data by default, so no environment variables are needed for the demo. If you want to connect to a backend:

1. Go to Project Settings → Environment Variables
2. Add: `REACT_APP_API_URL=https://your-backend-url.com`
3. Redeploy

## Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically build and deploy the changes.

### Manual Redeploy

1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"**
4. Click **"..."** on latest deployment
5. Click **"Redeploy"**

## Performance Optimization

### Enable Caching

Vercel automatically caches static assets. No configuration needed.

### Enable Analytics

1. Go to Project Settings
2. Click **"Analytics"**
3. Enable **"Web Analytics"**

### Enable Speed Insights

1. Go to Project Settings
2. Click **"Speed Insights"**
3. Enable insights

## Custom Configuration

### vercel.json

The project includes a `vercel.json` file with optimal settings:

```json
{
  "version": 2,
  "name": "cyberhawk-security",
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "framework": "create-react-app",
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

This ensures:
- ✅ Correct build directory
- ✅ SPA routing works properly
- ✅ All routes redirect to index.html

## Monitoring

### View Logs

1. Go to your project in Vercel
2. Click **"Deployments"**
3. Click on a deployment
4. View **"Build Logs"** and **"Function Logs"**

### Check Performance

1. Go to **"Analytics"** tab
2. View page load times, visitor stats
3. Check **"Speed Insights"** for performance metrics

## Security

### HTTPS

- ✅ Automatic HTTPS on all deployments
- ✅ SSL certificates auto-renewed
- ✅ HTTP → HTTPS redirect enabled

### Headers

Vercel automatically adds security headers:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## Cost

- **Free Tier**: Perfect for this project
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Global CDN

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Project Issues**: https://github.com/acastil7IT/CyberHawk-Project/issues

---

**Your CyberHawk deployment should now be live! 🚀**

Share your deployment URL: `https://your-project-name.vercel.app`
