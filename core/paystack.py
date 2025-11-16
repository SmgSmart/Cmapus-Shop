# Paystack integration for payment processing
import os
import requests
import hashlib
import hmac
from decimal import Decimal
from django.conf import settings


class PaystackAPI:
    """Paystack API integration for payment processing"""
    
    def __init__(self):
        self.secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', '')
        self.public_key = getattr(settings, 'PAYSTACK_PUBLIC_KEY', '')
        self.base_url = "https://api.paystack.co"
        
        if not self.secret_key:
            raise ValueError("PAYSTACK_SECRET_KEY not found in settings")
    
    def _headers(self):
        return {
            'Authorization': f'Bearer {self.secret_key}',
            'Content-Type': 'application/json'
        }
    
    def initialize_transaction(self, email, amount, reference, callback_url=None, metadata=None):
        """Initialize a payment transaction"""
        url = f"{self.base_url}/transaction/initialize"
        
        # Convert amount to kobo (Paystack expects amount in kobo)
        amount_in_kobo = int(Decimal(str(amount)) * 100)
        
        data = {
            "email": email,
            "amount": amount_in_kobo,
            "reference": reference,
            "currency": "GHS",  # Ghana Cedis
        }
        
        if callback_url:
            data["callback_url"] = callback_url
            
        if metadata:
            data["metadata"] = metadata
        
        try:
            response = requests.post(url, json=data, headers=self._headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": f"Request failed: {str(e)}"}
    
    def verify_transaction(self, reference):
        """Verify a payment transaction"""
        url = f"{self.base_url}/transaction/verify/{reference}"
        
        try:
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": f"Verification failed: {str(e)}"}
    
    def verify_webhook_signature(self, payload, signature):
        """Verify webhook signature for security"""
        if not signature:
            return False
            
        expected_signature = hmac.new(
            self.secret_key.encode('utf-8'),
            payload,
            hashlib.sha512
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    
    def list_transactions(self, page=1, per_page=50):
        """List transactions"""
        url = f"{self.base_url}/transaction"
        params = {
            'page': page,
            'perPage': per_page
        }
        
        try:
            response = requests.get(url, params=params, headers=self._headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": f"Request failed: {str(e)}"}
    
    def create_transfer_recipient(self, account_number, bank_code, name):
        """Create a transfer recipient for payouts"""
        url = f"{self.base_url}/transferrecipient"
        
        data = {
            "type": "nuban",
            "name": name,
            "account_number": account_number,
            "bank_code": bank_code,
            "currency": "GHS"
        }
        
        try:
            response = requests.post(url, json=data, headers=self._headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": f"Request failed: {str(e)}"}
    
    def initiate_transfer(self, recipient_code, amount, reason):
        """Initiate a transfer/payout"""
        url = f"{self.base_url}/transfer"
        
        # Convert amount to kobo
        amount_in_kobo = int(Decimal(str(amount)) * 100)
        
        data = {
            "source": "balance",
            "amount": amount_in_kobo,
            "recipient": recipient_code,
            "reason": reason
        }
        
        try:
            response = requests.post(url, json=data, headers=self._headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": f"Request failed: {str(e)}"}
    
    def get_banks(self):
        """Get list of supported banks"""
        url = f"{self.base_url}/bank"
        
        try:
            response = requests.get(url, headers=self._headers())
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"status": False, "message": f"Request failed: {str(e)}"}


# Utility functions for payment processing
def generate_payment_reference(order_id):
    """Generate a unique payment reference"""
    import uuid
    return f"CS-{order_id}-{uuid.uuid4().hex[:8].upper()}"


def calculate_paystack_fee(amount):
    """Calculate Paystack transaction fee"""
    # Paystack fee structure for Ghana
    # 1.95% + GHS 0.5 for local cards
    fee = (Decimal(str(amount)) * Decimal('0.0195')) + Decimal('0.50')
    return round(fee, 2)


def process_order_payment(order, payment_method='paystack'):
    """Process payment for an order"""
    from orders.models import Transaction
    
    # Initialize Paystack API
    paystack = PaystackAPI()
    
    # Generate payment reference
    reference = generate_payment_reference(order.id)
    
    # Calculate total amount (order total + paystack fees)
    paystack_fee = calculate_paystack_fee(order.total)
    total_amount = order.total + paystack_fee
    
    # Prepare metadata
    metadata = {
        "order_id": order.id,
        "order_number": order.order_number,
        "customer_name": f"{order.user.first_name} {order.user.last_name}",
        "items_count": order.items.count(),
        "platform": "Campus Shop"
    }
    
    # Initialize transaction with Paystack
    response = paystack.initialize_transaction(
        email=order.user.email,
        amount=total_amount,
        reference=reference,
        callback_url=f"{settings.FRONTEND_URL}/payment/callback",
        metadata=metadata
    )
    
    if response.get('status'):
        # Create transaction record
        transaction = Transaction.objects.create(
            order=order,
            reference=reference,
            amount=total_amount,
            payment_method=payment_method,
            status='pending',
            gateway_response=response
        )
        
        return {
            'success': True,
            'authorization_url': response['data']['authorization_url'],
            'reference': reference,
            'transaction_id': transaction.id
        }
    else:
        return {
            'success': False,
            'message': response.get('message', 'Payment initialization failed')
        }


def verify_order_payment(reference):
    """Verify payment and update order status"""
    from orders.models import Transaction
    
    try:
        transaction = Transaction.objects.get(reference=reference)
        order = transaction.order
        
        # Initialize Paystack API
        paystack = PaystackAPI()
        
        # Verify transaction with Paystack
        response = paystack.verify_transaction(reference)
        
        if response.get('status') and response['data']['status'] == 'success':
            # Payment successful
            transaction.status = 'completed'
            transaction.gateway_response = response
            transaction.save()
            
            # Update order
            order.is_paid = True
            order.payment_reference = reference
            order.status = 'processing'  # Move from pending to processing
            order.save()
            
            # Update product inventory
            for item in order.items.all():
                product = item.product
                if product.quantity >= item.quantity:
                    product.quantity -= item.quantity
                    product.save()
            
            return {
                'success': True,
                'order': order,
                'message': 'Payment verified successfully'
            }
        else:
            # Payment failed
            transaction.status = 'failed'
            transaction.gateway_response = response
            transaction.save()
            
            return {
                'success': False,
                'message': 'Payment verification failed'
            }
            
    except Transaction.DoesNotExist:
        return {
            'success': False,
            'message': 'Transaction not found'
        }