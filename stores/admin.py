from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Store, Category, StoreSocialMedia, StoreAnalytics, StoreVerification


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'products_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['products_count', 'created_at', 'updated_at']
    
    def products_count(self, obj):
        return obj.get_products_count()
    products_count.short_description = 'Products Count'


class StoreSocialMediaInline(admin.StackedInline):
    model = StoreSocialMedia
    extra = 0
    can_delete = False


class StoreAnalyticsInline(admin.StackedInline):
    model = StoreAnalytics
    extra = 0
    can_delete = False
    readonly_fields = ['total_views', 'total_sales', 'total_revenue', 'last_updated']


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'owner', 'status', 'verification_status_display', 
        'rating', 'total_products', 'is_featured', 'created_at'
    ]
    list_filter = [
        'status', 'verification_status', 'is_featured', 
        'verification_submitted_at', 'created_at'
    ]
    search_fields = ['name', 'description', 'owner__email', 'owner__first_name', 'owner__last_name']
    readonly_fields = [
        'slug', 'rating', 'total_ratings', 'total_products',
        'verification_submitted_at', 'verification_approved_at', 'created_at', 'updated_at'
    ]
    filter_horizontal = ['categories']
    inlines = [StoreSocialMediaInline, StoreAnalyticsInline]
    actions = ['approve_stores', 'suspend_stores', 'approve_verification', 'reject_verification']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'owner', 'description', 'status')
        }),
        ('Media', {
            'fields': ('logo', 'banner')
        }),
        ('Contact Information', {
            'fields': ('contact_phone', 'contact_email', 'address')
        }),
        ('Categories', {
            'fields': ('categories',)
        }),
        ('Settings', {
            'fields': ('is_featured',)
        }),
        ('Verification', {
            'fields': (
                'verification_status', 'verification_submitted_at', 
                'verification_approved_at', 'verification_notes'
            )
        }),
        ('Statistics', {
            'fields': ('rating', 'total_ratings', 'total_products'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def verification_status_display(self, obj):
        colors = {
            'unverified': 'gray',
            'pending': 'orange',
            'verified': 'green',
            'rejected': 'red',
        }
        color = colors.get(obj.verification_status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_verification_status_display()
        )
    verification_status_display.short_description = 'Verification Status'
    
    def total_products(self, obj):
        return obj.total_products
    total_products.short_description = 'Products'
    
    def approve_stores(self, request, queryset):
        count = queryset.update(status='approved')
        self.message_user(request, f'{count} stores approved successfully.')
    approve_stores.short_description = 'Approve selected stores'
    
    def suspend_stores(self, request, queryset):
        count = queryset.update(status='suspended')
        self.message_user(request, f'{count} stores suspended successfully.')
    suspend_stores.short_description = 'Suspend selected stores'
    
    def approve_verification(self, request, queryset):
        count = queryset.filter(verification_status='pending').update(
            verification_status='verified',
            verification_approved_at=timezone.now(),
            verification_notes='Approved by admin'
        )
        self.message_user(request, f'{count} verifications approved successfully.')
    approve_verification.short_description = 'Approve pending verifications'
    
    def reject_verification(self, request, queryset):
        count = queryset.filter(verification_status='pending').update(
            verification_status='rejected',
            verification_notes='Rejected by admin - please resubmit with correct documents'
        )
        self.message_user(request, f'{count} verifications rejected.')
    reject_verification.short_description = 'Reject pending verifications'


@admin.register(StoreVerification)
class StoreVerificationAdmin(admin.ModelAdmin):
    list_display = [
        'store_name', 'business_name', 'owner_name', 
        'verification_status', 'submitted_at', 'admin_actions'
    ]
    list_filter = [
        'store__verification_status', 'business_type', 'submitted_at'
    ]
    search_fields = [
        'store__name', 'business_name', 'owner_name', 
        'store__owner__email', 'business_registration_number'
    ]
    readonly_fields = ['submitted_at', 'updated_at', 'store_link']
    actions = ['approve_verifications', 'reject_verifications']
    
    fieldsets = (
        ('Store Information', {
            'fields': ('store', 'store_link')
        }),
        ('Business Information', {
            'fields': (
                'business_name', 'business_type', 'business_registration_number',
                'tax_identification_number', 'business_address', 
                'business_phone', 'business_email', 'years_in_business',
                'description_of_business'
            )
        }),
        ('Owner Information', {
            'fields': ('owner_name', 'owner_phone', 'owner_email')
        }),
        ('Documents', {
            'fields': (
                'business_registration', 'tax_certificate', 'owner_id',
                'business_permit', 'bank_statement'
            )
        }),
        ('Social Media', {
            'fields': ('social_media_links',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def store_name(self, obj):
        return obj.store.name
    store_name.short_description = 'Store'
    
    def verification_status(self, obj):
        colors = {
            'unverified': 'gray',
            'pending': 'orange', 
            'verified': 'green',
            'rejected': 'red',
        }
        color = colors.get(obj.store.verification_status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.store.get_verification_status_display()
        )
    verification_status.short_description = 'Status'
    
    def store_link(self, obj):
        if obj.store:
            url = reverse('admin:stores_store_change', args=[obj.store.pk])
            return format_html('<a href="{}">View Store</a>', url)
        return '-'
    store_link.short_description = 'Store Admin Link'
    
    def admin_actions(self, obj):
        if obj.store.verification_status == 'pending':
            return format_html(
                '<span style="color: orange; font-weight: bold;">⏳ Pending Review</span>'
            )
        elif obj.store.verification_status == 'verified':
            return format_html(
                '<span style="color: green; font-weight: bold;">✅ Verified</span>'
            )
        elif obj.store.verification_status == 'rejected':
            return format_html(
                '<span style="color: red; font-weight: bold;">❌ Rejected</span>'
            )
        return obj.store.get_verification_status_display()
    admin_actions.short_description = 'Actions'
    
    def approve_verifications(self, request, queryset):
        count = 0
        for verification in queryset:
            if verification.store.verification_status == 'pending':
                verification.store.verification_status = 'verified'
                verification.store.verification_approved_at = timezone.now()
                verification.store.verification_notes = 'Approved by admin'
                verification.store.save()
                count += 1
        self.message_user(request, f'{count} verifications approved successfully.')
    approve_verifications.short_description = 'Approve selected verifications'
    
    def reject_verifications(self, request, queryset):
        count = 0
        for verification in queryset:
            if verification.store.verification_status == 'pending':
                verification.store.verification_status = 'rejected'
                verification.store.verification_notes = 'Rejected by admin - please resubmit with correct documents'
                verification.store.save()
                count += 1
        self.message_user(request, f'{count} verifications rejected.')
    reject_verifications.short_description = 'Reject selected verifications'


@admin.register(StoreAnalytics)
class StoreAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['store', 'total_views', 'total_sales', 'total_revenue', 'last_updated']
    list_filter = ['last_updated']
    search_fields = ['store__name']
    readonly_fields = ['last_updated']
