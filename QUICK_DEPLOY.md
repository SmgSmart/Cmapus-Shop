# 🚀 Quick Deploy to Internet (GitHub + Vercel)

## 5-Minute Deployment Steps

### 1. Prepare for GitHub (Run in PowerShell)
```powershell
# Run the deployment script
.\deploy.ps1
```

### 2. Create GitHub Repository
1. Go to [github.com](https://github.com) 
2. Click "New Repository"
3. Name: `campus-shop`
4. Click "Create repository"

### 3. Connect to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/campus-shop.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `campus-shop` repository
5. Configure:
   - **Framework**: Other
   - **Build Command**: `python manage.py collectstatic --noinput && cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `pip install -r requirements-vercel.txt && cd frontend && npm install`

### 5. Add Environment Variables in Vercel
In your Vercel project settings → Environment Variables:

```
DEBUG = False
SECRET_KEY = django-super-secret-key-change-this-in-production
ALLOWED_HOSTS = .vercel.app,localhost,127.0.0.1
PAYSTACK_PUBLIC_KEY = pk_test_ddb3d899f6f7fbbd11a2ad9d24e6d0e677bfc50d
PAYSTACK_SECRET_KEY = sk_test_3083f3d7f674f923fe89db24ca6d88a2d1845cdc
FRONTEND_URL = https://your-app-name.vercel.app
```

### 6. Deploy & Access
- Click "Deploy" in Vercel
- Wait 2-3 minutes
- Your app will be live at `https://your-app-name.vercel.app`

## ✅ That's it! Your Campus Shop is now live on the internet!

### 📱 Access from any device:
- Your laptop: `https://your-app-name.vercel.app`
- Your phone: `https://your-app-name.vercel.app`
- Friend's computer: `https://your-app-name.vercel.app`

### 🔄 Future Updates:
Just run:
```bash
git add .
git commit -m "Your changes"
git push
```
Vercel will automatically redeploy!

---

**Need help?** Check the detailed `DEPLOYMENT_GUIDE.md`