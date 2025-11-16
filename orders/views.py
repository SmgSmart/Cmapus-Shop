from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction as db_transaction
from django.db.models import Sum, Q
from django_filters.rest_framework import DjangoFilterBackend
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse, JsonResponse
from decimal import Decimal
import json
from .models import Cart, CartItem, Order, OrderItem, Transaction, SellerPayout
from .serializers import (
    CartSerializer, CartItemSerializer, OrderSerializer,
    TransactionSerializer, SellerPayoutSerializer, CheckoutSerializer
)
from products.models import Product, ProductVariant
from accounts.models import Address
from core.permissions import IsSeller, IsOrderOwner
from core.paystack import PaystackAPI, process_order_payment, verify_order_payment
import uuid


class CartViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """Get or create the current user's cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Add an item to the cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        product_id = request.data.get('product_id')
        variant_id = request.data.get('variant_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if variant is required
        if product.variants.exists() and not variant_id:
            return Response(
                {'error': 'Variant is required for this product'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get variant if specified
        variant = None
        if variant_id:
            try:
                variant = ProductVariant.objects.get(id=variant_id, product=product)
            except ProductVariant.DoesNotExist:
                return Response(
                    {'error': 'Variant not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Check stock
        available_quantity = variant.quantity if variant else product.quantity
        if quantity > available_quantity:
            return Response(
                {'error': f'Only {available_quantity} items available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or update cart item
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            variant=variant,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity = quantity
            cart_item.save()
        
        serializer = CartItemSerializer(cart_item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def update_item(self, request):
        """Update cart item quantity"""
        cart_item_id = request.data.get('cart_item_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check stock
        available_quantity = cart_item.variant.quantity if cart_item.variant else cart_item.product.quantity
        if quantity > available_quantity:
            return Response(
                {'error': f'Only {available_quantity} items available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item.quantity = quantity
        cart_item.save()
        
        serializer = CartItemSerializer(cart_item, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Remove an item from the cart"""
        cart_item_id = request.data.get('cart_item_id')
        
        try:
            cart_item = CartItem.objects.get(id=cart_item_id, cart__user=request.user)
            cart_item.delete()
            return Response({'status': 'Item removed from cart'})
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear all items from the cart"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({'status': 'Cart cleared'})

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        """Process checkout and create an order"""
        cart, created = Cart.objects.get_or_create(user=request.user)
        
        if cart.items.count() == 0:
            return Response(
                {'error': 'Cannot checkout with an empty cart'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CheckoutSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get addresses
        shipping_address = None
        billing_address = None
        
        if serializer.validated_data.get('shipping_address_id'):
            try:
                shipping_address = Address.objects.get(
                    id=serializer.validated_data['shipping_address_id'],
                    user=request.user
                )
            except Address.DoesNotExist:
                return Response(
                    {'error': 'Shipping address not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        if serializer.validated_data.get('billing_address_id'):
            try:
                billing_address = Address.objects.get(
                    id=serializer.validated_data['billing_address_id'],
                    user=request.user
                )
            except Address.DoesNotExist:
                return Response(
                    {'error': 'Billing address not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        with db_transaction.atomic():
            # Calculate totals
            subtotal = cart.subtotal
            tax_amount = Decimal('0.00')  # Implement tax calculation
            shipping_cost = Decimal('0.00')  # Implement shipping calculation
            platform_fee = subtotal * Decimal(str(0.05))  # 5% platform fee
            total = subtotal + tax_amount + shipping_cost
            
            # Create order
            order = Order.objects.create(
                user=request.user,
                payment_method=serializer.validated_data.get('payment_method', 'paystack'),
                subtotal=subtotal,
                tax_amount=tax_amount,
                shipping_cost=shipping_cost,
                total=total,
                platform_fee=platform_fee,
                shipping_address=shipping_address,
                billing_address=billing_address,
                customer_note=serializer.validated_data.get('customer_note', ''),
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Create order items
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    variant=item.variant,
                    store=item.product.store,
                    product_name=item.product.name,
                    variant_name=str(item.variant) if item.variant else '',
                    price=item.price,
                    quantity=item.quantity,
                    subtotal=item.total_price,
                    tax_amount=Decimal('0.00'),
                    total=item.total_price
                )
            
            # Create transaction
            transaction_ref = f"TXN-{str(uuid.uuid4())[:8].upper()}"
            transaction_obj = Transaction.objects.create(
                order=order,
                amount=order.total,
                currency='GHS',
                payment_method=order.payment_method,
                status='pending',
                reference=transaction_ref,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Clear the cart
            cart.items.all().delete()
            
            # For Paystack payments, initialize payment immediately
            if order.payment_method == 'paystack':
                try:
                    # Process payment with Paystack
                    payment_result = process_order_payment(order)
                    
                    if payment_result['success']:
                        return Response({
                            'order': OrderSerializer(order, context={'request': request}).data,
                            'transaction': TransactionSerializer(transaction_obj).data,
                            'payment_url': payment_result['authorization_url'],
                            'reference': payment_result['reference']
                        }, status=status.HTTP_201_CREATED)
                    else:
                        return Response({
                            'error': f'Payment initialization failed: {payment_result["message"]}',
                            'order': OrderSerializer(order, context={'request': request}).data
                        }, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    return Response({
                        'error': f'Payment initialization failed: {str(e)}',
                        'order': OrderSerializer(order, context={'request': request}).data
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                # For other payment methods (cash, bank transfer), just return order
                return Response({
                    'order': OrderSerializer(order, context={'request': request}).data,
                    'transaction': TransactionSerializer(transaction_obj).data,
                    'message': 'Order created successfully'
                }, status=status.HTTP_201_CREATED)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'payment_method']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        
        if order.status not in ['pending', 'processing']:
            return Response(
                {'error': 'Cannot cancel an order that is already shipped or delivered'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save(update_fields=['status'])
        return Response({'status': 'Order cancelled'})


class SellerOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for sellers to manage their store's orders"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']

    def get_queryset(self):
        return Order.objects.filter(
            items__store__owner=self.request.user
        ).distinct()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        if new_status == 'delivered':
            from django.utils import timezone
            order.delivered_at = timezone.now()
        
        order.save()
        return Response({'status': 'Order status updated'})


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Transaction.objects.all()
        return Transaction.objects.filter(order__user=user)


class SellerPayoutViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SellerPayoutSerializer
    permission_classes = [permissions.IsAuthenticated, IsSeller]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        return SellerPayout.objects.filter(store__owner=self.request.user)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        """Get seller's balance and earnings"""
        try:
            store = request.user.store
        except:
            return Response(
                {'error': 'You do not have a store'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate earnings from paid orders
        total_sales = OrderItem.objects.filter(
            store=store,
            order__payment_status='paid'
        ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        
        # Calculate platform fees
        platform_fees = OrderItem.objects.filter(
            store=store,
            order__payment_status='paid'
        ).aggregate(total=Sum('order__platform_fee'))['total'] or Decimal('0.00')
        
        # Calculate total payouts
        total_payouts = SellerPayout.objects.filter(
            store=store,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Calculate pending payouts
        pending_payouts = SellerPayout.objects.filter(
            store=store,
            status__in=['pending', 'processing']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        # Available balance
        available_balance = total_sales - platform_fees - total_payouts - pending_payouts
        
        return Response({
            'total_sales': total_sales,
            'platform_fees': platform_fees,
            'total_payouts': total_payouts,
            'pending_payouts': pending_payouts,
            'available_balance': max(available_balance, Decimal('0.00')),
        })


# =================== PAYSTACK PAYMENT ENDPOINTS ===================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def initialize_payment(request):
    """Initialize Paystack payment for an order"""
    try:
        order_id = request.data.get('order_id')
        order = get_object_or_404(Order, id=order_id, user=request.user)
        
        if order.is_paid:
            return Response(
                {'error': 'Order is already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process payment with Paystack
        payment_result = process_order_payment(order)
        
        if payment_result['success']:
            return Response({
                'authorization_url': payment_result['authorization_url'],
                'reference': payment_result['reference'],
                'transaction_id': payment_result['transaction_id']
            })
        else:
            return Response(
                {'error': payment_result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': f'Payment initialization failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_payment(request, reference):
    """Verify Paystack payment and update order status"""
    try:
        verification_result = verify_order_payment(reference)
        
        if verification_result['success']:
            order = verification_result['order']
            
            # Ensure user owns this order
            if order.user != request.user:
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return Response({
                'success': True,
                'message': verification_result['message'],
                'order': OrderSerializer(order, context={'request': request}).data
            })
        else:
            return Response(
                {'success': False, 'message': verification_result['message']},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': f'Payment verification failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
@api_view(['POST'])
@permission_classes([])  # Webhook doesn't need authentication
def paystack_webhook(request):
    """Handle Paystack webhook notifications"""
    try:
        # Get the signature from headers
        signature = request.META.get('HTTP_X_PAYSTACK_SIGNATURE', '')
        
        # Get the raw body
        payload = request.body
        
        # Initialize Paystack API to verify signature
        paystack = PaystackAPI()
        
        if not paystack.verify_webhook_signature(payload, signature):
            return HttpResponse('Invalid signature', status=400)
        
        # Parse the event data
        event_data = json.loads(payload)
        event_type = event_data.get('event')
        
        if event_type == 'charge.success':
            # Handle successful payment
            data = event_data['data']
            reference = data['reference']
            
            # Verify and update order
            verification_result = verify_order_payment(reference)
            
            if verification_result['success']:
                print(f"Webhook: Payment verified for reference {reference}")
            else:
                print(f"Webhook: Payment verification failed for reference {reference}")
        
        elif event_type == 'transfer.success':
            # Handle successful payout
            data = event_data['data']
            print(f"Webhook: Payout completed - {data.get('reference')}")
        
        elif event_type == 'transfer.failed':
            # Handle failed payout
            data = event_data['data']
            print(f"Webhook: Payout failed - {data.get('reference')}")
        
        return HttpResponse('OK', status=200)
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return HttpResponse('Error processing webhook', status=500)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_status(request, order_id):
    """Get payment status for an order"""
    try:
        order = get_object_or_404(Order, id=order_id, user=request.user)
        
        # Get the latest transaction for this order
        transaction = Transaction.objects.filter(order=order).order_by('-created_at').first()
        
        response_data = {
            'order_id': order.id,
            'order_number': order.order_number,
            'is_paid': order.is_paid,
            'payment_status': order.payment_status,
            'payment_method': order.payment_method,
            'total': str(order.total),
        }
        
        if transaction:
            response_data.update({
                'transaction_reference': transaction.reference,
                'transaction_status': transaction.status,
                'transaction_amount': str(transaction.amount)
            })
        
        return Response(response_data)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get payment status: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([])  # Make this public so frontend can access it without auth
def paystack_config(request):
    """Get Paystack configuration for frontend"""
    from django.conf import settings
    
    return Response({
        'public_key': settings.PAYSTACK_PUBLIC_KEY,
        'currency': 'GHS'  # Ghana Cedis
    })
