from rest_framework import serializers
from .models import Store, StoreSocialMedia, Category, StoreAnalytics
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='get_products_count', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'products_count', 'created_at']
        read_only_fields = ['slug', 'created_at']


class StoreSocialMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSocialMedia
        fields = ['website', 'facebook', 'twitter', 'instagram', 'linkedin', 'youtube']


class StoreAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreAnalytics
        fields = ['total_views', 'total_sales', 'total_revenue', 'last_updated']
        read_only_fields = fields


class StoreSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    social_media = StoreSocialMediaSerializer(read_only=True)
    analytics = StoreAnalyticsSerializer(read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Category.objects.all(),
        source='categories',
        required=False
    )
    is_owner = serializers.SerializerMethodField()
    total_products = serializers.IntegerField(read_only=True)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'banner', 'owner',
            'contact_phone', 'contact_email', 'address', 'status', 'is_featured',
            'rating', 'total_ratings', 'social_media', 'analytics', 'categories', 
            'category_ids', 'is_owner', 'total_products', 'verification_status',
            'verification_submitted_at', 'verification_approved_at', 'verification_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'status', 'rating', 'total_ratings', 'verification_status', 
                           'verification_submitted_at', 'verification_approved_at', 'verification_notes',
                           'created_at', 'updated_at']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request and request.user.is_authenticated and request.user == obj.owner

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        # Set user as seller when creating a store
        self.context['request'].user.is_seller = True
        self.context['request'].user.save(update_fields=['is_seller'])
        return super().create(validated_data)


class StoreListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing stores"""
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    
    class Meta:
        model = Store
        fields = ['id', 'name', 'slug', 'logo', 'rating', 'total_ratings', 
                 'is_featured', 'owner_name', 'created_at']
