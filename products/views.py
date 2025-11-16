from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, ProductVariant, Review, ProductAttribute, ProductImage
from .serializers import (
    ProductSerializer, ProductListSerializer, ProductVariantSerializer, 
    ReviewSerializer, ProductAttributeSerializer, ProductImageSerializer
)
from core.permissions import IsProductOwner, IsSeller


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('store', 'category').prefetch_related('images', 'variants', 'reviews')
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store', 'category', 'is_active', 'is_featured', 'condition']
    search_fields = ['name', 'description', 'sku']
    ordering_fields = ['price', 'created_at', 'view_count', 'name']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Only show active products to non-staff users
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            queryset = queryset.filter(
                is_active=True, 
                store__status='approved',
                store__owner__is_active=True
            )
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsSeller()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsProductOwner()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['post'])
    def increment_view(self, request, slug=None):
        """Increment the view count for a product"""
        product = self.get_object()
        product.increment_view_count()
        return Response({'status': 'view count incremented'})

    @action(detail=True, methods=['get', 'post'])
    def images(self, request, slug=None):
        """Get or add images to a product"""
        product = self.get_object()
        
        if request.method == 'GET':
            images = product.images.all()
            serializer = ProductImageSerializer(images, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Check permission
            if product.store.owner != request.user:
                return Response(
                    {'error': 'You do not have permission to add images to this product'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = ProductImageSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(product=product)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'])
    def reviews(self, request, slug=None):
        """Get or create reviews for a product"""
        product = self.get_object()
        
        if request.method == 'GET':
            reviews = product.reviews.filter(is_approved=True)
            serializer = ReviewSerializer(reviews, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            if not request.user.is_authenticated:
                return Response(
                    {'error': 'Authentication required'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check if user already reviewed this product
            if Review.objects.filter(product=product, user=request.user).exists():
                return Response(
                    {'error': 'You have already reviewed this product'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = ReviewSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(user=request.user, product=product)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_products(self, request):
        """Get products for the current user's store"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            store = request.user.store
            products = self.get_queryset().filter(store=store)
            
            page = self.paginate_queryset(products)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        except:
            return Response(
                {'error': 'You do not have a store'},
                status=status.HTTP_404_NOT_FOUND
            )


class ProductAttributeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductAttribute.objects.prefetch_related('values')
    serializer_class = ProductAttributeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Review.objects.all()
        return Review.objects.filter(is_approved=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
