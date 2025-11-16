from django.contrib import admin
from .models import (
    Product, ProductVariant, ProductImage, Review, 
    ProductAttribute, ProductAttributeValue, ProductVariantOption
)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    readonly_fields = ['created_at']


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'store', 'category', 'price', 'quantity', 'condition', 'is_active', 'is_featured', 'created_at']
    list_filter = ['is_active', 'is_featured', 'condition', 'category', 'store', 'created_at']
    search_fields = ['name', 'description', 'sku', 'store__name', 'category__name']
    prepopulated_fields = {'slug': ('name',)}
    raw_id_fields = ['category']
    inlines = [ProductImageInline, ProductVariantInline]
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    list_editable = ['is_active', 'is_featured', 'price']
    ordering = ['-created_at']
    actions = ['make_active', 'make_inactive', 'make_featured', 'remove_featured']
    
    def make_active(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} products were successfully marked as active.')
    make_active.short_description = "Mark selected products as active"
    
    def make_inactive(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} products were successfully marked as inactive.')
    make_inactive.short_description = "Mark selected products as inactive"
    
    def make_featured(self, request, queryset):
        queryset.update(is_featured=True)
        self.message_user(request, f'{queryset.count()} products were successfully marked as featured.')
    make_featured.short_description = "Mark selected products as featured"
    
    def remove_featured(self, request, queryset):
        queryset.update(is_featured=False)
        self.message_user(request, f'{queryset.count()} products were successfully removed from featured.')
    remove_featured.short_description = "Remove selected products from featured"
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('store', 'name', 'slug', 'description', 'category'),
            'description': 'Enter the basic product information. The slug will be auto-generated from the name.'
        }),
        ('Pricing', {
            'fields': ('price', 'compare_at_price', 'cost_per_item'),
            'description': 'Set product pricing. Compare at price shows original price for discounts.'
        }),
        ('Inventory', {
            'fields': ('sku', 'barcode', 'quantity', 'condition'),
            'description': 'Manage product inventory and condition. SKU will be auto-generated if not provided.'
        }),
        ('Product Details', {
            'fields': ('is_taxable', 'is_physical', 'weight', 'requires_shipping')
        }),
        ('Digital Product', {
            'fields': ('is_digital', 'digital_file'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured'),
            'description': 'Control product visibility. Active products appear on the website. Featured products are highlighted.'
        }),
        ('Statistics', {
            'fields': ('view_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'name', 'price', 'quantity', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['product__name', 'name', 'sku']
    raw_id_fields = ['product']


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'is_main', 'position', 'created_at']
    list_filter = ['is_main', 'created_at']
    search_fields = ['product__name', 'alt_text']
    raw_id_fields = ['product']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'title', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_approved', 'created_at']
    search_fields = ['product__name', 'user__email', 'title', 'comment']
    raw_id_fields = ['product', 'user']
    actions = ['approve_reviews', 'unapprove_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "Approve selected reviews"
    
    def unapprove_reviews(self, request, queryset):
        queryset.update(is_approved=False)
    unapprove_reviews.short_description = "Unapprove selected reviews"


@admin.register(ProductAttribute)
class ProductAttributeAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name', 'description']


@admin.register(ProductAttributeValue)
class ProductAttributeValueAdmin(admin.ModelAdmin):
    list_display = ['attribute', 'value']
    list_filter = ['attribute']
    search_fields = ['attribute__name', 'value']
    raw_id_fields = ['attribute']


@admin.register(ProductVariantOption)
class ProductVariantOptionAdmin(admin.ModelAdmin):
    list_display = ['variant', 'attribute', 'value']
    list_filter = ['attribute']
    search_fields = ['variant__name', 'attribute__name', 'value__value']
    raw_id_fields = ['variant', 'attribute', 'value']
