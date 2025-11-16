from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator
from django.conf import settings
from decimal import Decimal
import uuid
from django.utils import timezone


class Cart(models.Model):
    """Shopping cart model."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart',
        verbose_name=_('user')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('shopping cart')
        verbose_name_plural = _('shopping carts')

    def __str__(self):
        return f"Cart for {self.user.email}"

    @property
    def item_count(self):
        """Get total number of items in the cart."""
        return sum(item.quantity for item in self.items.all())

    @property
    def subtotal(self):
        """Calculate the subtotal of all items in the cart."""
        return sum(item.total_price for item in self.items.all())

    @property
    def total(self):
        """Calculate the total including any additional charges (tax, shipping)."""
        return self.subtotal


class CartItem(models.Model):
    """Individual item in a shopping cart."""
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('cart')
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='cart_items',
        verbose_name=_('product')
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name=_('variant')
    )
    quantity = models.PositiveIntegerField(
        _('quantity'),
        default=1,
        validators=[MinValueValidator(1)]
    )
    price = models.DecimalField(
        _('price'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('cart item')
        verbose_name_plural = _('cart items')
        unique_together = ['cart', 'product', 'variant']

    def __str__(self):
        variant_str = f" - {self.variant}" if self.variant else ""
        return f"{self.quantity}x {self.product.name}{variant_str}"

    @property
    def total_price(self):
        """Calculate the total price for this cart item."""
        return self.price * self.quantity

    def save(self, *args, **kwargs):
        # Set the price from the product or variant when saving
        if self.variant:
            self.price = self.variant.price
        else:
            self.price = self.product.price
        super().save(*args, **kwargs)


class Order(models.Model):
    """Order model for completed purchases."""
    STATUS_CHOICES = (
        ('pending', _('Pending Payment')),
        ('processing', _('Processing')),
        ('shipped', _('Shipped')),
        ('delivered', _('Delivered')),
        ('cancelled', _('Cancelled')),
        ('refunded', _('Refunded')),
    )

    PAYMENT_METHODS = (
        ('paystack', 'Paystack'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash_on_delivery', 'Cash on Delivery'),
    )

    order_number = models.CharField(
        _('order number'),
        max_length=20,
        unique=True,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='orders',
        verbose_name=_('user')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=PAYMENT_METHODS,
        default='paystack'
    )
    payment_status = models.CharField(
        _('payment status'),
        max_length=20,
        default='pending'
    )
    payment_reference = models.CharField(
        _('payment reference'),
        max_length=100,
        blank=True
    )
    subtotal = models.DecimalField(
        _('subtotal'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    tax_amount = models.DecimalField(
        _('tax amount'),
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    shipping_cost = models.DecimalField(
        _('shipping cost'),
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total = models.DecimalField(
        _('total'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    platform_fee = models.DecimalField(
        _('platform fee'),
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    shipping_address = models.ForeignKey(
        'accounts.Address',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='shipping_orders',
        verbose_name=_('shipping address')
    )
    billing_address = models.ForeignKey(
        'accounts.Address',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='billing_orders',
        verbose_name=_('billing address')
    )
    customer_note = models.TextField(
        _('customer note'),
        blank=True
    )
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    paid_at = models.DateTimeField(_('paid at'), null=True, blank=True)
    delivered_at = models.DateTimeField(_('delivered at'), null=True, blank=True)

    class Meta:
        verbose_name = _('order')
        verbose_name_plural = _('orders')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Order {self.order_number}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self._generate_order_number()
        super().save(*args, **kwargs)

    def _generate_order_number(self):
        """Generate a unique order number."""
        timestamp = timezone.now().strftime('%Y%m%d')
        random_str = str(uuid.uuid4())[:8].upper()
        return f"ORD-{timestamp}-{random_str}"

    def mark_as_paid(self, payment_reference=None):
        """Mark the order as paid."""
        self.status = 'processing'
        self.payment_status = 'paid'
        self.payment_reference = payment_reference or self.payment_reference
        self.paid_at = timezone.now()
        self.save(update_fields=[
            'status', 'payment_status', 'payment_reference', 'paid_at'
        ])
        self._update_inventory()

    def _update_inventory(self):
        """Update product inventory after order is placed."""
        for item in self.items.all():
            if item.variant:
                item.variant.quantity -= item.quantity
                item.variant.save()
            else:
                item.product.quantity -= item.quantity
                item.product.save()

    @property
    def is_paid(self):
        """Check if the order has been paid."""
        return self.payment_status == 'paid' and self.paid_at is not None


class OrderItem(models.Model):
    """Individual item in an order."""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('order')
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='order_items',
        verbose_name=_('product')
    )
    variant = models.ForeignKey(
        'products.ProductVariant',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        verbose_name=_('variant')
    )
    store = models.ForeignKey(
        'stores.Store',
        on_delete=models.PROTECT,
        related_name='order_items',
        verbose_name=_('store')
    )
    product_name = models.CharField(_('product name'), max_length=200)
    variant_name = models.CharField(_('variant name'), max_length=100, blank=True)
    price = models.DecimalField(
        _('price'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    quantity = models.PositiveIntegerField(
        _('quantity'),
        validators=[MinValueValidator(1)]
    )
    subtotal = models.DecimalField(
        _('subtotal'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    tax_amount = models.DecimalField(
        _('tax amount'),
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00')
    )
    total = models.DecimalField(
        _('total'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('order item')
        verbose_name_plural = _('order items')

    def __str__(self):
        return f"{self.quantity}x {self.product_name}"

    def save(self, *args, **kwargs):
        if not self.id:
            self.product_name = self.product.name
            if self.variant:
                self.variant_name = str(self.variant)
            self.store = self.product.store
            self.price = self.variant.price if self.variant else self.product.price
            self.subtotal = self.price * self.quantity
            self.total = self.subtotal + self.tax_amount
        super().save(*args, **kwargs)


class Transaction(models.Model):
    """Payment transaction model."""
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
        ('refunded', _('Refunded')),
    )

    PAYMENT_METHODS = (
        ('paystack', 'Paystack'),
        ('bank_transfer', 'Bank Transfer'),
        ('cash_on_delivery', 'Cash on Delivery'),
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='transactions',
        verbose_name=_('order')
    )
    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.CharField(
        _('currency'),
        max_length=3,
        default='GHS'
    )
    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=PAYMENT_METHODS,
        default='paystack'
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    reference = models.CharField(
        _('reference'),
        max_length=100,
        unique=True
    )
    gateway_response = models.JSONField(
        _('gateway response'),
        null=True,
        blank=True
    )
    ip_address = models.GenericIPAddressField(
        _('IP address'),
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(_('paid at'), null=True, blank=True)

    class Meta:
        verbose_name = _('transaction')
        verbose_name_plural = _('transactions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['reference']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Transaction {self.reference}"

    def mark_as_completed(self, response_data=None):
        """Mark the transaction as completed."""
        self.status = 'completed'
        self.paid_at = timezone.now()
        if response_data:
            self.gateway_response = response_data
        self.save(update_fields=['status', 'paid_at', 'gateway_response', 'updated_at'])
        self.order.mark_as_paid(payment_reference=self.reference)

    def mark_as_failed(self, response_data=None):
        """Mark the transaction as failed."""
        self.status = 'failed'
        if response_data:
            self.gateway_response = response_data
        self.save(update_fields=['status', 'gateway_response', 'updated_at'])


class OrderStatusHistory(models.Model):
    """Order status history model."""
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='status_history',
        verbose_name=_('order')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Order.STATUS_CHOICES
    )
    note = models.TextField(_('note'), blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('changed by')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('order status history')
        verbose_name_plural = _('order status history')
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order.order_number} - {self.get_status_display()} at {self.created_at}"


class SellerPayout(models.Model):
    """Payout model for store owners."""
    STATUS_CHOICES = (
        ('pending', _('Pending')),
        ('processing', _('Processing')),
        ('completed', _('Completed')),
        ('failed', _('Failed')),
    )

    store = models.ForeignKey(
        'stores.Store',
        on_delete=models.CASCADE,
        related_name='payouts',
        verbose_name=_('store')
    )
    amount = models.DecimalField(
        _('amount'),
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    fee = models.DecimalField(
        _('platform fee'),
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00')
    )
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    reference = models.CharField(
        _('reference'),
        max_length=100,
        unique=True
    )
    payment_method = models.CharField(
        _('payment method'),
        max_length=50,
        default='bank_transfer'
    )
    payment_details = models.JSONField(
        _('payment details'),
        null=True,
        blank=True
    )
    notes = models.TextField(_('notes'), blank=True)
    processed_at = models.DateTimeField(_('processed at'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('seller payout')
        verbose_name_plural = _('seller payouts')
        ordering = ['-created_at']

    def __str__(self):
        return f"Payout {self.reference} - {self.store.name}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = f"PYT-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    def mark_as_processing(self):
        """Mark the payout as processing."""
        self.status = 'processing'
        self.save(update_fields=['status', 'updated_at'])

    def mark_as_completed(self, payment_details=None):
        """Mark the payout as completed."""
        self.status = 'completed'
        self.processed_at = timezone.now()
        if payment_details:
            self.payment_details = payment_details
        self.save(update_fields=['status', 'processed_at', 'payment_details', 'updated_at'])

    def mark_as_failed(self, reason=None):
        """Mark the payout as failed."""
        self.status = 'failed'
        if reason:
            self.notes = f"Failed: {reason}"
        self.save(update_fields=['status', 'notes', 'updated_at'])
