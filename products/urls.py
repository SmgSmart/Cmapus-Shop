from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ProductAttributeViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')
router.register(r'attributes', ProductAttributeViewSet, basename='attribute')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
