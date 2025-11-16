from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, RegexValidator
from django.conf import settings
from django.db.models import Avg, Count
from django.utils.text import slugify


class Category(models.Model):
    """Category model for product classification."""
    name = models.CharField(_('name'), max_length=100, unique=True)
    slug = models.SlugField(_('slug'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField(_('is active'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def get_products_count(self):
        """Return the number of active products in this category."""
        return self.products.filter(is_active=True).count()


class Store(models.Model):
    """Store model for student sellers."""
    STATUS_CHOICES = (
        ('pending', _('Pending Approval')),
        ('approved', _('Approved')),
        ('suspended', _('Suspended')),
    )
    
    VERIFICATION_STATUS_CHOICES = (
        ('unverified', _('Unverified')),
        ('pending', _('Pending Verification')),
        ('verified', _('Verified')),
        ('rejected', _('Verification Rejected')),
    )

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='store',
        verbose_name=_('owner')
    )
    name = models.CharField(_('store name'), max_length=100)
    slug = models.SlugField(_('slug'), max_length=100, unique=True)
    description = models.TextField(_('description'), blank=True)
    logo = models.ImageField(upload_to='stores/logos/', blank=True, null=True)
    banner = models.ImageField(upload_to='stores/banners/', blank=True, null=True)
    categories = models.ManyToManyField(
        Category,
        related_name='stores',
        blank=True,
        verbose_name=_('categories')
    )
    contact_phone = models.CharField(
        _('contact phone'),
        max_length=17,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message=_("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
            ),
        ],
        blank=True
    )
    contact_email = models.EmailField(_('contact email'), blank=True)
    address = models.TextField(_('store address'), blank=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    verification_status = models.CharField(
        _('verification status'),
        max_length=20,
        choices=VERIFICATION_STATUS_CHOICES,
        default='unverified'
    )
    verification_submitted_at = models.DateTimeField(_('verification submitted at'), null=True, blank=True)
    verification_approved_at = models.DateTimeField(_('verification approved at'), null=True, blank=True)
    verification_notes = models.TextField(_('verification notes'), blank=True)
    is_featured = models.BooleanField(_('is featured'), default=False)
    rating = models.FloatField(_('rating'), default=0.0, editable=False)
    total_ratings = models.PositiveIntegerField(_('total ratings'), default=0, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('store')
        verbose_name_plural = _('stores')
        ordering = ['-is_featured', '-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            # Ensure slug is unique
            if Store.objects.filter(slug=self.slug).exists():
                self.slug = f"{self.slug}-{self.owner.id}"
        super().save(*args, **kwargs)

    def update_rating(self):
        """Update the store's rating based on product reviews."""
        from products.models import Review
        
        # Get all reviews for products in this store
        result = Review.objects.filter(product__store=self).aggregate(
            avg_rating=Avg('rating'),
            count=Count('id')
        )
        
        self.rating = result['avg_rating'] or 0.0
        self.total_ratings = result['count'] or 0
        self.save(update_fields=['rating', 'total_ratings'])

    def get_absolute_url(self):
        from django.urls import reverse
        return reverse('store-detail', kwargs={'slug': self.slug})

    @property
    def is_active(self):
        """Check if the store is active and approved."""
        return self.status == 'approved' and self.owner.is_active

    @property
    def total_products(self):
        """Return the count of active products in this store."""
        return self.products.filter(is_active=True).count()


class StoreAnalytics(models.Model):
    """Store analytics to track views and other metrics."""
    store = models.OneToOneField(
        Store,
        on_delete=models.CASCADE,
        related_name='analytics',
        verbose_name=_('store')
    )
    total_views = models.PositiveIntegerField(_('total views'), default=0)
    total_sales = models.PositiveIntegerField(_('total sales'), default=0)
    total_revenue = models.DecimalField(
        _('total revenue'),
        max_digits=12,
        decimal_places=2,
        default=0.00
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('store analytics')
        verbose_name_plural = _('store analytics')

    def __str__(self):
        return f"{self.store.name} Analytics"

    def increment_views(self):
        """Increment the view counter."""
        self.total_views += 1
        self.save(update_fields=['total_views', 'last_updated'])

    def record_sale(self, amount):
        """Record a new sale and update revenue."""
        self.total_sales += 1
        self.total_revenue += amount
        self.save(update_fields=['total_sales', 'total_revenue', 'last_updated'])


class StoreSocialMedia(models.Model):
    """Store social media links."""
    store = models.OneToOneField(
        Store,
        on_delete=models.CASCADE,
        related_name='social_media',
        verbose_name=_('store')
    )
    website = models.URLField(_('website'), blank=True)
    facebook = models.URLField(_('facebook'), blank=True)
    twitter = models.URLField(_('twitter'), blank=True)
    instagram = models.URLField(_('instagram'), blank=True)
    linkedin = models.URLField(_('linkedin'), blank=True)
    youtube = models.URLField(_('youtube'), blank=True)

    class Meta:
        verbose_name = _('store social media')
        verbose_name_plural = _('store social media')

    def __str__(self):
        return f"{self.store.name} Social Media"


class StoreVerification(models.Model):
    """Store verification data and documents."""
    store = models.OneToOneField(
        Store,
        on_delete=models.CASCADE,
        related_name='verification_data',
        verbose_name=_('store')
    )
    
    # Business Information
    business_name = models.CharField(_('business name'), max_length=200)
    business_registration_number = models.CharField(_('business registration number'), max_length=100, blank=True)
    tax_identification_number = models.CharField(_('tax identification number'), max_length=100, blank=True)
    business_address = models.TextField(_('business address'))
    business_phone = models.CharField(_('business phone'), max_length=20, blank=True)
    business_email = models.EmailField(_('business email'), blank=True)
    business_type = models.CharField(_('business type'), max_length=100)
    years_in_business = models.CharField(_('years in business'), max_length=20, blank=True)
    description_of_business = models.TextField(_('description of business'), blank=True)
    
    # Owner Information
    owner_name = models.CharField(_('owner name'), max_length=200)
    owner_phone = models.CharField(_('owner phone'), max_length=20, blank=True)
    owner_email = models.EmailField(_('owner email'), blank=True)
    
    # Documents
    business_registration = models.FileField(upload_to='verification/business/', null=True, blank=True)
    tax_certificate = models.FileField(upload_to='verification/tax/', null=True, blank=True)
    owner_id = models.FileField(upload_to='verification/id/', null=True, blank=True)
    business_permit = models.FileField(upload_to='verification/permit/', null=True, blank=True)
    bank_statement = models.FileField(upload_to='verification/bank/', null=True, blank=True)
    
    # Social Media Links
    social_media_links = models.JSONField(_('social media links'), default=dict, blank=True)
    
    # Metadata
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('store verification')
        verbose_name_plural = _('store verifications')

    def __str__(self):
        return f"{self.store.name} Verification"
