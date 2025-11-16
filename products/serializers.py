from rest_framework import serializers
from .models import (
    Product, ProductVariant, ProductImage, Review,
    ProductAttribute, ProductAttributeValue, ProductVariantOption
)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_main', 'position', 'created_at']
        read_only_fields = ['created_at']


class ProductVariantOptionSerializer(serializers.ModelSerializer):
    attribute = serializers.StringRelatedField()
    value = serializers.StringRelatedField()

    class Meta:
        model = ProductVariantOption
        fields = ['attribute', 'value']


class ProductVariantSerializer(serializers.ModelSerializer):
    options = ProductVariantOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'sku', 'price', 'compare_at_price', 
                 'quantity', 'weight', 'is_active', 'options', 'created_at']
        read_only_fields = ['sku', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'user_email', 'rating', 'title', 
                 'comment', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['user', 'user_name', 'user_email', 'is_approved', 'created_at', 'updated_at']


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttributeValue
        fields = ['id', 'value', 'description']


class ProductAttributeSerializer(serializers.ModelSerializer):
    values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = ProductAttribute
        fields = ['id', 'name', 'description', 'values']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    store_name = serializers.CharField(source='store.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    main_image = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'price', 'compare_at_price', 'store_name',
                 'category_name', 'main_image', 'rating', 'review_count', 'is_featured', 'created_at']

    def get_main_image(self, obj):
        main_img = obj.main_image
        if main_img and main_img.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(main_img.image.url)
        return None
    
    def get_rating(self, obj):
        return obj.rating
    
    def get_review_count(self, obj):
        return obj.review_count


class ProductSerializer(serializers.ModelSerializer):
    store_name = serializers.CharField(source='store.name', read_only=True)
    store_id = serializers.IntegerField(source='store.id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    has_variants = serializers.BooleanField(read_only=True)
    
    # Handle multiple image uploads
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'store', 'store_name', 'store_id',
            'category', 'category_name', 'price', 'compare_at_price', 'cost_per_item',
            'sku', 'barcode', 'quantity', 'is_taxable', 'is_physical', 'weight',
            'condition', 'is_active', 'is_featured', 'requires_shipping', 'is_digital',
            'view_count', 'images', 'variants', 'reviews', 'rating', 'review_count',
            'has_variants', 'uploaded_images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'sku', 'view_count', 'created_at', 'updated_at']

    def get_rating(self, obj):
        return obj.rating
    
    def get_review_count(self, obj):
        return obj.review_count

    def validate(self, data):
        # Ensure the product belongs to the user's store
        request = self.context.get('request')
        if request and request.method == 'POST':
            try:
                store = request.user.store
                data['store'] = store
            except:
                raise serializers.ValidationError("You must have a store to create products")
        return data
    
    def create(self, validated_data):
        # Extract uploaded images from validated data
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Create the product
        product = Product.objects.create(**validated_data)
        
        # Create image instances for uploaded images
        for index, image_file in enumerate(uploaded_images):
            ProductImage.objects.create(
                product=product,
                image=image_file,
                position=index,
                is_main=(index == 0)  # First image is main
            )
        
        return product
