from rest_framework import serializers
from decimal import Decimal
from .models import Cart, CartItem, Order, OrderItem, Transaction, SellerPayout
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    variant_name = serializers.CharField(source='variant.name', read_only=True, allow_null=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_slug', 'variant', 'variant_name', 
                 'quantity', 'price', 'total_price', 'product_image', 'created_at']
        read_only_fields = ['cart', 'price', 'total_price']

    def get_product_image(self, obj):
        main_img = obj.product.main_image
        if main_img and main_img.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(main_img.image.url)
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal', 'total', 'item_count', 'created_at', 'updated_at']
        read_only_fields = ['user']


class OrderItemSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_id = serializers.IntegerField(source='store.id', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'product_name', 'variant_name', 'store',
                 'store_name', 'store_id', 'quantity', 'price', 'subtotal', 'tax_amount', 
                 'total', 'product_image']
        read_only_fields = fields
    
    def get_product_image(self, obj):
        try:
            main_img = obj.product.main_image
            if main_img and main_img.image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(main_img.image.url)
        except:
            pass
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    is_paid = serializers.BooleanField(read_only=True)
    shipping_address_display = serializers.SerializerMethodField()
    billing_address_display = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_email', 'user_first_name', 'user_last_name',
            'status', 'status_display', 'payment_method', 'payment_status', 'payment_status_display', 
            'payment_reference', 'subtotal', 'tax_amount', 'shipping_cost', 'total', 'platform_fee',
            'shipping_address', 'billing_address', 'shipping_address_display', 'billing_address_display',
            'customer_note', 'items', 'is_paid', 'created_at', 'updated_at', 'paid_at', 'delivered_at'
        ]
        read_only_fields = ['order_number', 'user', 'status', 'payment_status',
                          'payment_reference', 'subtotal', 'tax_amount', 'shipping_cost', 
                          'total', 'platform_fee', 'paid_at', 'delivered_at']
    
    def get_shipping_address_display(self, obj):
        if obj.shipping_address:
            return f"{obj.shipping_address.street_address}, {obj.shipping_address.city}"
        return None
    
    def get_billing_address_display(self, obj):
        if obj.billing_address:
            return f"{obj.billing_address.street_address}, {obj.billing_address.city}"
        return None


class TransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'order', 'order_number', 'amount', 'currency', 'payment_method',
                 'status', 'reference', 'gateway_response', 'created_at', 'paid_at']
        read_only_fields = ['order', 'reference', 'status', 'gateway_response',
                          'created_at', 'paid_at']


class SellerPayoutSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    
    class Meta:
        model = SellerPayout
        fields = ['id', 'store', 'store_name', 'amount', 'fee', 'status', 'reference',
                 'payment_method', 'payment_details', 'notes', 'processed_at',
                 'created_at', 'updated_at']
        read_only_fields = ['store', 'reference', 'status', 'created_at', 'updated_at', 'processed_at']


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout process"""
    shipping_address_id = serializers.IntegerField(required=False, allow_null=True)
    billing_address_id = serializers.IntegerField(required=False, allow_null=True)
    payment_method = serializers.ChoiceField(choices=Order.PAYMENT_METHODS, default='paystack')
    customer_note = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        # Additional validation can be added here
        return data
