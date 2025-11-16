#!/usr/bin/env python
"""
Campus Shop - Admin Setup Script
This script helps you quickly set up the admin interface with sample data.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_shop.settings')
django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

def create_superuser():
    """Create a superuser if one doesn't exist"""
    print("🔐 Setting up admin user...")
    
    if User.objects.filter(is_superuser=True).exists():
        print("✅ Superuser already exists")
        return
    
    try:
        admin_user = User.objects.create_user(
            email='admin@campusshop.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True,
            is_seller=True
        )
        print("✅ Created superuser: admin@campusshop.com / admin123")
    except Exception as e:
        print(f"❌ Error creating superuser: {e}")

def run_migrations():
    """Apply database migrations"""
    print("🔄 Applying database migrations...")
    try:
        call_command('migrate', verbosity=0)
        print("✅ Migrations applied successfully")
    except Exception as e:
        print(f"❌ Error applying migrations: {e}")

def create_sample_data():
    """Create sample categories and products"""
    print("📦 Creating sample data...")
    try:
        call_command('create_sample_data', verbosity=1)
        print("✅ Sample data created successfully")
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")

def collect_static():
    """Collect static files"""
    print("📁 Collecting static files...")
    try:
        call_command('collectstatic', verbosity=0, interactive=False)
        print("✅ Static files collected")
    except Exception as e:
        print(f"⚠️ Warning: Could not collect static files: {e}")

def main():
    """Main setup function"""
    print("🏪 Campus Shop - Admin Setup")
    print("=" * 40)
    
    # Check if we're in a Django project
    if not os.path.exists('manage.py'):
        print("❌ Error: This script must be run from the Django project root directory")
        sys.exit(1)
    
    try:
        with transaction.atomic():
            # Run setup steps
            run_migrations()
            create_superuser()
            create_sample_data()
            collect_static()
            
        print("\n" + "=" * 40)
        print("🎉 Setup completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start the server: python manage.py runserver")
        print("2. Visit admin: http://127.0.0.1:8000/admin/")
        print("3. Login with: admin@campusshop.com / admin123")
        print("4. Visit frontend: http://localhost:3000")
        print("\n📚 Documentation:")
        print("- Admin Guide: See ADMIN_GUIDE.md")
        print("- API Testing: See API_TESTING_GUIDE.md")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()