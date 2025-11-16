from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CartViewSet, OrderViewSet, SellerOrderViewSet,
    TransactionViewSet, SellerPayoutViewSet,
    initialize_payment, verify_payment, paystack_webhook, 
    payment_status, paystack_config
)

router = DefaultRouter()
router.register(r'carts', CartViewSet, basename='cart')
router.register(r'', OrderViewSet, basename='order')
router.register(r'seller/orders', SellerOrderViewSet, basename='seller-order')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'seller/payouts', SellerPayoutViewSet, basename='seller-payout')

urlpatterns = [
    path('', include(router.urls)),
    
    # Payment endpoints
    path('payments/initialize/', initialize_payment, name='initialize_payment'),
    path('payments/verify/<str:reference>/', verify_payment, name='verify_payment'),
    path('payments/webhook/', paystack_webhook, name='paystack_webhook'),
    path('payments/status/<int:order_id>/', payment_status, name='payment_status'),
    path('payments/config/', paystack_config, name='paystack_config'),
]
