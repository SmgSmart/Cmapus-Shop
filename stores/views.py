from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Store, Category, StoreSocialMedia, StoreVerification
from .serializers import StoreSerializer, StoreListSerializer, CategorySerializer, StoreSocialMediaSerializer
from core.permissions import IsStoreOwner


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # No pagination for categories


class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.select_related('owner').prefetch_related('categories', 'analytics', 'social_media')
    serializer_class = StoreSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'is_featured', 'categories']
    search_fields = ['name', 'description', 'address']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['-is_featured', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Only show approved stores to non-staff users
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='approved', owner__is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.action == 'list':
            return StoreListSerializer
        return StoreSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsStoreOwner()]
        return [permissions.AllowAny()]

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """Get detailed analytics for a store"""
        store = self.get_object()
        
        # Check permission
        if store.owner != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to view these analytics'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        analytics_data = {
            'total_products': store.products.filter(is_active=True).count(),
            'total_orders': store.order_items.count(),
            'total_revenue': store.analytics.total_revenue if hasattr(store, 'analytics') else 0,
            'total_sales': store.analytics.total_sales if hasattr(store, 'analytics') else 0,
            'total_views': store.analytics.total_views if hasattr(store, 'analytics') else 0,
            'average_rating': store.rating,
            'total_ratings': store.total_ratings,
        }
        return Response(analytics_data)

    @action(detail=True, methods=['post'])
    def increment_view(self, request, pk=None):
        """Increment the view counter for a store"""
        store = self.get_object()
        analytics, created = store.analytics.get_or_create(store=store)
        analytics.increment_views()
        return Response({'status': 'view count incremented'})

    @action(detail=True, methods=['get', 'put', 'patch'])
    def social_media(self, request, pk=None):
        """Get or update social media links"""
        store = self.get_object()
        
        # Check permission for updates
        if request.method in ['PUT', 'PATCH'] and store.owner != request.user:
            return Response(
                {'error': 'You do not have permission to edit this store'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        social_media, created = StoreSocialMedia.objects.get_or_create(store=store)
        
        if request.method == 'GET':
            serializer = StoreSocialMediaSerializer(social_media)
            return Response(serializer.data)
        else:
            serializer = StoreSocialMediaSerializer(
                social_media, 
                data=request.data, 
                partial=request.method == 'PATCH'
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def my_store(self, request):
        """Get the current user's store"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            store = Store.objects.get(owner=request.user)
            serializer = self.get_serializer(store)
            return Response(serializer.data)
        except Store.DoesNotExist:
            return Response(
                {'error': 'You do not have a store yet'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def verification(self, request, pk=None):
        """Submit store verification documents"""
        store = self.get_object()
        
        # Check permission
        if store.owner != request.user:
            return Response(
                {'error': 'You do not have permission to submit verification for this store'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already verified
        if store.verification_status == 'verified':
            return Response(
                {'error': 'Store is already verified'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse social media links if provided as JSON string
        social_media_links = request.data.get('social_media_links', '{}')
        if isinstance(social_media_links, str):
            try:
                import json
                social_media_links = json.loads(social_media_links)
            except json.JSONDecodeError:
                social_media_links = {}
        
        # Create or update verification data
        verification_data = {
            'business_name': request.data.get('business_name', ''),
            'business_registration_number': request.data.get('business_registration_number', ''),
            'tax_identification_number': request.data.get('tax_identification_number', ''),
            'business_address': request.data.get('business_address', ''),
            'business_phone': request.data.get('business_phone', ''),
            'business_email': request.data.get('business_email', ''),
            'business_type': request.data.get('business_type', ''),
            'years_in_business': request.data.get('years_in_business', ''),
            'description_of_business': request.data.get('description_of_business', ''),
            'owner_name': request.data.get('owner_name', ''),
            'owner_phone': request.data.get('owner_phone', ''),
            'owner_email': request.data.get('owner_email', ''),
            'social_media_links': social_media_links,
        }
        
        # Handle file uploads
        file_fields = ['business_registration', 'tax_certificate', 'owner_id', 'business_permit', 'bank_statement']
        for field in file_fields:
            if field in request.FILES:
                verification_data[field] = request.FILES[field]
        
        # Create or update verification record
        verification, created = StoreVerification.objects.update_or_create(
            store=store,
            defaults=verification_data
        )
        
        # Update store verification status
        store.verification_status = 'pending'
        store.verification_submitted_at = timezone.now()
        store.save(update_fields=['verification_status', 'verification_submitted_at'])
        
        return Response({
            'message': 'Verification submitted successfully',
            'verification_status': 'pending',
            'submitted_at': store.verification_submitted_at
        })

    @action(detail=True, methods=['get'])
    def verification_status(self, request, pk=None):
        """Get verification status for a store"""
        store = self.get_object()
        
        # Check permission - only store owner or staff can view
        if store.owner != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You do not have permission to view verification status'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        verification_data = {
            'verification_status': store.verification_status,
            'verification_submitted_at': store.verification_submitted_at,
            'verification_approved_at': store.verification_approved_at,
            'verification_notes': store.verification_notes,
        }
        
        return Response(verification_data)

    @action(detail=True, methods=['post'])
    def approve_verification(self, request, pk=None):
        """Approve store verification (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        store = self.get_object()
        
        if store.verification_status != 'pending':
            return Response(
                {'error': 'Only pending verifications can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update store verification status
        store.verification_status = 'verified'
        store.verification_approved_at = timezone.now()
        store.verification_notes = request.data.get('notes', 'Approved by admin')
        store.save(update_fields=['verification_status', 'verification_approved_at', 'verification_notes'])
        
        return Response({
            'message': 'Verification approved successfully',
            'verification_status': 'verified',
            'approved_at': store.verification_approved_at,
            'notes': store.verification_notes
        })

    @action(detail=True, methods=['post'])
    def reject_verification(self, request, pk=None):
        """Reject store verification (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        store = self.get_object()
        
        if store.verification_status != 'pending':
            return Response(
                {'error': 'Only pending verifications can be rejected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rejection_reason = request.data.get('notes', 'Verification rejected by admin')
        
        # Update store verification status
        store.verification_status = 'rejected'
        store.verification_notes = rejection_reason
        store.save(update_fields=['verification_status', 'verification_notes'])
        
        return Response({
            'message': 'Verification rejected',
            'verification_status': 'rejected',
            'rejection_reason': rejection_reason
        })

    @action(detail=False, methods=['get'])
    def pending_verifications(self, request):
        """Get all stores with pending verifications (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stores = Store.objects.filter(verification_status='pending').select_related('owner')
        
        verification_data = []
        for store in stores:
            try:
                verification = store.verification_data
                verification_data.append({
                    'store_id': store.id,
                    'store_name': store.name,
                    'owner_name': f"{store.owner.first_name} {store.owner.last_name}",
                    'owner_email': store.owner.email,
                    'business_name': verification.business_name,
                    'business_type': verification.business_type,
                    'owner_name_verification': verification.owner_name,
                    'submitted_at': store.verification_submitted_at,
                    'has_documents': bool(verification.business_registration or verification.owner_id),
                })
            except StoreVerification.DoesNotExist:
                # Store marked as pending but no verification data
                verification_data.append({
                    'store_id': store.id,
                    'store_name': store.name,
                    'owner_name': f"{store.owner.first_name} {store.owner.last_name}",
                    'owner_email': store.owner.email,
                    'business_name': None,
                    'business_type': None,
                    'owner_name_verification': None,
                    'submitted_at': store.verification_submitted_at,
                    'has_documents': False,
                    'error': 'No verification data found'
                })
        
        return Response({
            'count': len(verification_data),
            'pending_verifications': verification_data
        })
