# Custom admin site configuration
from django.contrib import admin
from django.urls import path
from django.shortcuts import render
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.db.models import Count, Sum, Q
from products.models import Product
from stores.models import Store, Category
from orders.models import Order
from accounts.models import User

class CampusShopAdminSite(admin.AdminSite):
    site_header = 'Campus Shop Administration'
    site_title = 'Campus Shop Admin'
    index_title = 'Welcome to Campus Shop Administration'
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_view(self.dashboard_view), name='dashboard'),
        ]
        return custom_urls + urls
    
    def dashboard_view(self, request):
        """Custom dashboard with statistics"""
        context = {
            'title': 'Dashboard',
            'stats': self.get_dashboard_stats(),
            'recent_products': Product.objects.filter(is_active=True).order_by('-created_at')[:10],
            'pending_stores': Store.objects.filter(status='pending').order_by('-created_at')[:5],
            'recent_orders': Order.objects.order_by('-created_at')[:10] if hasattr(Order, 'objects') else [],
        }
        return render(request, 'admin/dashboard.html', context)
    
    def get_dashboard_stats(self):
        """Get statistics for dashboard"""
        return {
            'total_products': Product.objects.count(),
            'active_products': Product.objects.filter(is_active=True).count(),
            'total_stores': Store.objects.count(),
            'approved_stores': Store.objects.filter(status='approved').count(),
            'pending_stores': Store.objects.filter(status='pending').count(),
            'total_categories': Category.objects.count(),
            'active_categories': Category.objects.filter(is_active=True).count(),
            'total_users': User.objects.count(),
            'seller_users': User.objects.filter(is_seller=True).count(),
        }

# Create custom admin site instance
admin_site = CampusShopAdminSite(name='campus_shop_admin')

# Register all models with the custom admin site
from django.apps import apps

def auto_register_models():
    """Auto register all models with the custom admin site"""
    for model in apps.get_models():
        try:
            admin_site.register(model)
        except admin.sites.AlreadyRegistered:
            pass

# Call auto registration
auto_register_models()