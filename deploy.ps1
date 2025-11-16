# PowerShell deployment script for Campus Shop

Write-Host "🚀 Starting Campus Shop Deployment Process..." -ForegroundColor Green

# Step 1: Initialize Git (if not already done)
if (!(Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - Campus Shop application"
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "📦 Git repository already exists" -ForegroundColor Yellow
}

# Step 2: Check if remote origin exists
$remoteExists = git remote get-url origin 2>$null
if (!$remoteExists) {
    Write-Host "❌ GitHub remote not configured!" -ForegroundColor Red
    Write-Host "Please follow these steps:" -ForegroundColor Yellow
    Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
    Write-Host "2. Run: git remote add origin https://github.com/YOUR_USERNAME/campus-shop.git" -ForegroundColor White
    Write-Host "3. Run: git push -u origin main" -ForegroundColor White
    exit 1
}

# Step 3: Add all files and commit
Write-Host "📝 Adding files and committing changes..." -ForegroundColor Yellow
git add .
git commit -m "Prepare for deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# Step 4: Push to GitHub
Write-Host "⬆️ Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host "" -ForegroundColor White
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Go to vercel.com and sign in with GitHub" -ForegroundColor White
Write-Host "2. Click 'New Project' and import your repository" -ForegroundColor White
Write-Host "3. Configure these settings:" -ForegroundColor White
Write-Host "   - Framework Preset: Other" -ForegroundColor Gray
Write-Host "   - Build Command: python manage.py collectstatic --noinput && cd frontend && npm run build" -ForegroundColor Gray
Write-Host "   - Output Directory: frontend/dist" -ForegroundColor Gray
Write-Host "   - Install Command: pip install -r requirements-vercel.txt && cd frontend && npm install" -ForegroundColor Gray
Write-Host "4. Add environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan