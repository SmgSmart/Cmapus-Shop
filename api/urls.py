from django.urls import path, include

urlpatterns = [
    path('accounts/', include('accounts.urls')),
    path('stores/', include('stores.urls')),
    path('products/', include('products.urls')),
    path('orders/', include('orders.urls')),
]
