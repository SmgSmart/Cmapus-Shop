# Campus Shop - Deployment Guide

## Deploying to Vercel + GitHub

### Prerequisites
- GitHub account
- Vercel account (sign up with GitHub)
- Git installed on your computer

### Step 1: Prepare Your Repository

1. **Initialize Git repository** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - Campus Shop application"
```

2. **Create GitHub repository**:
   - Go to GitHub.com
   - Click "New Repository"
   - Name it "campus-shop" (or your preferred name)
   - Make it public or private
   - Don't initialize with README (since you already have files)
   - Click "Create repository"

3. **Connect local repository to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/campus-shop.git
git branch -M main
git push -u origin main
```

### Step 2: Configure Environment Variables

Create a `.env` file in your project root with these production values:

```env
DEBUG=False
SECRET_KEY=your-super-secret-production-key-here
ALLOWED_HOSTS=.vercel.app,localhost,127.0.0.1
PAYSTACK_PUBLIC_KEY=pk_test_ddb3d899f6f7fbbd11a2ad9d24e6d0e677bfc50d
PAYSTACK_SECRET_KEY=sk_test_3083f3d7f674f923fe89db24ca6d88a2d1845cdc
FRONTEND_URL=https://your-app-name.vercel.app
```

### Step 3: Deploy to Vercel

1. **Go to Vercel.com**
   - Sign in with your GitHub account
   - Click "New Project"

2. **Import your GitHub repository**
   - Find your "campus-shop" repository
   - Click "Import"

3. **Configure deployment settings**:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as default (.)
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `pip install -r requirements-vercel.txt && cd frontend && npm install`

4. **Add Environment Variables** in Vercel dashboard:
   - Go to your project settings
   - Click "Environment Variables"
   - Add each variable from your `.env` file:
     ```
     DEBUG = False
     SECRET_KEY = your-super-secret-production-key-here
     ALLOWED_HOSTS = .vercel.app,localhost,127.0.0.1
     PAYSTACK_PUBLIC_KEY = pk_test_ddb3d899f6f7fbbd11a2ad9d24e6d0e677bfc50d
     PAYSTACK_SECRET_KEY = sk_test_3083f3d7f674f923fe89db24ca6d88a2d1845cdc
     FRONTEND_URL = https://your-app-name.vercel.app
     ```

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-app-name.vercel.app`

### Step 4: Update Frontend Environment

After deployment, update your frontend environment file:

1. Copy your Vercel app URL
2. Update `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://your-actual-vercel-url.vercel.app
VITE_PAYSTACK_PUBLIC_KEY=pk_test_ddb3d899f6f7fbbd11a2ad9d24e6d0e677bfc50d
```

3. Commit and push the changes:
```bash
git add .
git commit -m "Update frontend API URL for production"
git push
```

### Step 5: Database Migration (Important!)

Since Vercel doesn't persist SQLite databases, you'll need to:

1. **For testing**: The app will work but data won't persist between deployments
2. **For production**: Consider upgrading to PostgreSQL

#### Quick PostgreSQL Setup (Recommended):

1. **Get a free PostgreSQL database**:
   - Supabase.com (free tier)
   - ElephantSQL.com (free tier)
   - Railway.app (free tier)

2. **Update your environment variables** in Vercel:
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

3. **Update settings.py** to use DATABASE_URL:
```python
import dj_database_url
DATABASES = {
    'default': dj_database_url.parse(os.getenv('DATABASE_URL', 'sqlite:///db.sqlite3'))
}
```

### Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test user registration and login
3. Test product creation and purchasing
4. Test seller dashboard functionality

### Troubleshooting

**Common Issues:**

1. **Build fails**: Check build logs in Vercel dashboard
2. **API calls fail**: Verify CORS settings and API base URL
3. **Static files missing**: Ensure `collectstatic` runs in build script
4. **Database errors**: Check database connection and migrations

**Quick fixes:**
- Check Vercel function logs for Django errors
- Verify all environment variables are set
- Ensure your GitHub repository is up to date

### Continuous Deployment

Once set up, any push to your main branch will automatically trigger a new deployment on Vercel!

```bash
git add .
git commit -m "Your changes"
git push
```

Your app will be automatically redeployed with the latest changes.

### Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Domains" 
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

---

## Quick Command Summary

```bash
# Initial setup
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/campus-shop.git
git push -u origin main

# Future updates
git add .
git commit -m "Your update message"
git push
```

Your Campus Shop app will be live and accessible from any device with internet access!