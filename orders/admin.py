from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, Transaction, OrderStatusHistory, SellerPayout


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['price', 'created_at', 'updated_at']
    raw_id_fields = ['product', 'variant']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'item_count', 'created_at', 'updated_at']
    search_fields = ['user__email']
    raw_id_fields = ['user']
    inlines = [CartItemInline]
    readonly_fields = ['created_at', 'updated_at']
    
    def item_count(self, obj):
        return obj.item_count
    item_count.short_description = 'Items'


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'variant', 'quantity', 'price']
    list_filter = ['created_at']
    search_fields = ['cart__user__email', 'product__name']
    raw_id_fields = ['cart', 'product', 'variant']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product_name', 'variant_name', 'price', 'quantity', 'subtotal', 'total']
    raw_id_fields = ['product', 'variant', 'store']


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ['status', 'note', 'created_by', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'payment_status', 'total', 'created_at']
    list_filter = ['status', 'payment_status', 'payment_method', 'created_at']
    search_fields = ['order_number', 'user__email', 'payment_reference']
    raw_id_fields = ['user', 'shipping_address', 'billing_address']
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    readonly_fields = ['order_number', 'created_at', 'updated_at', 'paid_at', 'delivered_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status', 'customer_note')
        }),
        ('Payment', {
            'fields': ('payment_method', 'payment_status', 'payment_reference')
        }),
        ('Amounts', {
            'fields': ('subtotal', 'tax_amount', 'shipping_cost', 'platform_fee', 'total')
        }),
        ('Addresses', {
            'fields': ('shipping_address', 'billing_address')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_processing', 'mark_as_shipped', 'mark_as_delivered']
    
    def mark_as_processing(self, request, queryset):
        queryset.update(status='processing')
    mark_as_processing.short_description = "Mark selected orders as Processing"
    
    def mark_as_shipped(self, request, queryset):
        queryset.update(status='shipped')
    mark_as_shipped.short_description = "Mark selected orders as Shipped"
    
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='delivered')
    mark_as_delivered.short_description = "Mark selected orders as Delivered"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product_name', 'variant_name', 'store', 'quantity', 'price', 'total']
    list_filter = ['created_at']
    search_fields = ['order__order_number', 'product_name', 'store__name']
    raw_id_fields = ['order', 'product', 'variant', 'store']


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['reference', 'order', 'amount', 'currency', 'payment_method', 'status', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['reference', 'order__order_number']
    raw_id_fields = ['order']
    readonly_fields = ['created_at', 'updated_at', 'paid_at']
    
    fieldsets = (
        ('Transaction Information', {
            'fields': ('order', 'reference', 'amount', 'currency', 'payment_method')
        }),
        ('Status', {
            'fields': ('status', 'gateway_response')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__order_number', 'note']
    raw_id_fields = ['order', 'created_by']
    readonly_fields = ['created_at']


@admin.register(SellerPayout)
class SellerPayoutAdmin(admin.ModelAdmin):
    list_display = ['reference', 'store', 'amount', 'fee', 'status', 'created_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['reference', 'store__name']
    raw_id_fields = ['store']
    readonly_fields = ['created_at', 'updated_at', 'processed_at']
    
    fieldsets = (
        ('Payout Information', {
            'fields': ('store', 'reference', 'amount', 'fee', 'payment_method')
        }),
        ('Status', {
            'fields': ('status', 'payment_details', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'processed_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_processing', 'mark_as_completed']
    
    def mark_as_processing(self, request, queryset):
        for payout in queryset:
            payout.mark_as_processing()
    mark_as_processing.short_description = "Mark selected payouts as Processing"
    
    def mark_as_completed(self, request, queryset):
        for payout in queryset:
            payout.mark_as_completed()
    mark_as_completed.short_description = "Mark selected payouts as Completed"
