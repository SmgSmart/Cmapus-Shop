from rest_framework import permissions


class IsSeller(permissions.BasePermission):
    """Check if the user is a seller"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_seller


class IsStoreOwner(permissions.BasePermission):
    """Check if the user owns the store"""
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsProductOwner(permissions.BasePermission):
    """Check if the user owns the product's store"""
    def has_object_permission(self, request, view, obj):
        return obj.store.owner == request.user


class IsOrderOwner(permissions.BasePermission):
    """Check if the user owns the order"""
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user


class IsOrderItemStoreOwner(permissions.BasePermission):
    """Check if the user owns the store of an order item"""
    def has_object_permission(self, request, view, obj):
        return obj.store.owner == request.user
