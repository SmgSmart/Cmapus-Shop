from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.utils.text import slugify
from decimal import Decimal
import uuid


class Product(models.Model):
    """Product model for items being sold in the marketplace."""
    CONDITION_CHOICES = (
        ('new', _('New')),
        ('used_like_new', _('Used - Like New')),
        ('used_good', _('Used - Good')),
        ('used_fair', _('Used - Fair')),
    )

    store = models.ForeignKey(
        'stores.Store',
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('store')
    )
    name = models.CharField(_('name'), max_length=200)
    slug = models.SlugField(_('slug'), max_length=200, unique=True)
    description = models.TextField(_('description'))
    category = models.ForeignKey(
        'stores.Category',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
        verbose_name=_('category')
    )
    price = models.DecimalField(
        _('price'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    compare_at_price = models.DecimalField(
        _('compare at price'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    cost_per_item = models.DecimalField(
        _('cost per item'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    sku = models.CharField(
        _('SKU'),
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )
    barcode = models.CharField(
        _('barcode'),
        max_length=100,
        null=True,
        blank=True
    )
    quantity = models.PositiveIntegerField(_('quantity'), default=0)
    is_taxable = models.BooleanField(_('charge tax on this product'), default=True)
    is_physical = models.BooleanField(_('physical product'), default=True)
    weight = models.DecimalField(
        _('weight'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Weight in grams')
    )
    condition = models.CharField(
        _('condition'),
        max_length=20,
        choices=CONDITION_CHOICES,
        default='new'
    )
    is_active = models.BooleanField(_('active'), default=True)
    is_featured = models.BooleanField(_('featured'), default=False)
    requires_shipping = models.BooleanField(_('requires shipping'), default=True)
    is_digital = models.BooleanField(_('digital product'), default=False)
    digital_file = models.FileField(
        upload_to='digital_products/',
        null=True,
        blank=True,
        help_text=_('For digital products only')
    )
    view_count = models.PositiveIntegerField(_('view count'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('product')
        verbose_name_plural = _('products')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['id', 'slug']),
            models.Index(fields=['name']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            self.slug = f"{base_slug}-{str(uuid.uuid4())[:8]}"
        if not self.sku:
            self.sku = f"PROD-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)

    @property
    def has_variants(self):
        """Check if product has variants."""
        return self.variants.exists()

    @property
    def main_image(self):
        """Get the main product image or None."""
        return self.images.filter(is_main=True).first()

    @property
    def rating(self):
        """Calculate average rating from reviews."""
        return self.reviews.aggregate(
            avg_rating=models.Avg('rating')
        )['avg_rating'] or 0.0

    @property
    def review_count(self):
        """Get total number of reviews."""
        return self.reviews.count()

    def increment_view_count(self):
        """Increment the view count."""
        self.view_count += 1
        self.save(update_fields=['view_count'])


class ProductVariant(models.Model):
    """Product variant model for products with options like size, color, etc."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants',
        verbose_name=_('product')
    )
    name = models.CharField(_('variant name'), max_length=100)
    sku = models.CharField(
        _('SKU'),
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )
    price = models.DecimalField(
        _('price'),
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    compare_at_price = models.DecimalField(
        _('compare at price'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    quantity = models.PositiveIntegerField(_('quantity'), default=0)
    weight = models.DecimalField(
        _('weight'),
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_('Weight in grams')
    )
    is_active = models.BooleanField(_('active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('product variant')
        verbose_name_plural = _('product variants')
        ordering = ['product', 'name']

    def __str__(self):
        return f"{self.product.name} - {self.name}"

    def save(self, *args, **kwargs):
        if not self.sku:
            self.sku = f"VAR-{str(uuid.uuid4())[:8].upper()}"
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    """Product images model."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('product')
    )
    image = models.ImageField(
        _('image'),
        upload_to='products/'
    )
    alt_text = models.CharField(
        _('alt text'),
        max_length=255,
        blank=True,
        help_text=_('A description of the image for accessibility')
    )
    is_main = models.BooleanField(_('main image'), default=False)
    position = models.PositiveIntegerField(_('position'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('product image')
        verbose_name_plural = _('product images')
        ordering = ['position', 'created_at']

    def __str__(self):
        return f"Image for {self.product.name}"

    def save(self, *args, **kwargs):
        if self.is_main:
            # Ensure only one main image per product
            ProductImage.objects.filter(
                product=self.product,
                is_main=True
            ).update(is_main=False)
        super().save(*args, **kwargs)


class Review(models.Model):
    """Product reviews model."""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_('product')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reviews',
        verbose_name=_('user')
    )
    rating = models.PositiveSmallIntegerField(
        _('rating'),
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(_('title'), max_length=200)
    comment = models.TextField(_('comment'))
    is_approved = models.BooleanField(_('approved'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('review')
        verbose_name_plural = _('reviews')
        ordering = ['-created_at']
        unique_together = ['product', 'user']

    def __str__(self):
        return f"Review by {self.user} for {self.product}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update product's store rating when a new review is saved
        self.product.store.update_rating()


class ProductAttribute(models.Model):
    """Product attributes model (e.g., color, size, material)."""
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True)

    class Meta:
        verbose_name = _('product attribute')
        verbose_name_plural = _('product attributes')
        ordering = ['name']

    def __str__(self):
        return self.name


class ProductAttributeValue(models.Model):
    """Product attribute values model."""
    attribute = models.ForeignKey(
        ProductAttribute,
        on_delete=models.CASCADE,
        related_name='values',
        verbose_name=_('attribute')
    )
    value = models.CharField(_('value'), max_length=100)
    description = models.TextField(_('description'), blank=True)

    class Meta:
        verbose_name = _('attribute value')
        verbose_name_plural = _('attribute values')
        ordering = ['attribute__name', 'value']
        unique_together = ['attribute', 'value']

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"


class ProductVariantOption(models.Model):
    """Product variant options model."""
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name='options',
        verbose_name=_('variant')
    )
    attribute = models.ForeignKey(
        ProductAttribute,
        on_delete=models.CASCADE,
        verbose_name=_('attribute')
    )
    value = models.ForeignKey(
        ProductAttributeValue,
        on_delete=models.CASCADE,
        verbose_name=_('value')
    )

    class Meta:
        verbose_name = _('variant option')
        verbose_name_plural = _('variant options')
        unique_together = ['variant', 'attribute']

    def __str__(self):
        return f"{self.variant} - {self.attribute}: {self.value}"
