// Paystack payment component
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Shield, 
  Loader,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { ordersAPI } from '../../services/api';

function PaystackPayment({ order, onPaymentSuccess, onPaymentError }) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paystackConfig, setPaystackConfig] = useState(null);

  useEffect(() => {
    loadPaystackConfig();
  }, []);

  const loadPaystackConfig = async () => {
    try {
      const config = await ordersAPI.getPaystackConfig();
      setPaystackConfig(config);
    } catch (error) {
      console.error('Failed to load Paystack config:', error);
    }
  };

  const handlePayment = async () => {
    if (!paystackConfig) {
      onPaymentError('Payment configuration not loaded');
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      // Initialize payment with backend
      const paymentData = await ordersAPI.initializePayment({
        order_id: order.id
      });

      // Use Paystack popup
      const handler = window.PaystackPop.setup({
        key: paystackConfig.public_key,
        email: order.user_email || order.user?.email,
        amount: Math.round(parseFloat(order.total) * 100), // Convert to kobo
        currency: paystackConfig.currency,
        ref: paymentData.reference,
        onSuccess: async (response) => {
          setPaymentStatus('verifying');
          
          try {
            // Verify payment with backend
            const verification = await ordersAPI.verifyPayment(response.reference);
            
            if (verification.success) {
              setPaymentStatus('success');
              onPaymentSuccess(verification.order);
            } else {
              setPaymentStatus('failed');
              onPaymentError(verification.message);
            }
          } catch (error) {
            setPaymentStatus('failed');
            onPaymentError('Payment verification failed');
          } finally {
            setLoading(false);
          }
        },
        onCancel: () => {
          setPaymentStatus('cancelled');
          setLoading(false);
        },
        onError: (error) => {
          setPaymentStatus('failed');
          onPaymentError(error.message || 'Payment failed');
          setLoading(false);
        }
      });

      handler.openIframe();

    } catch (error) {
      setLoading(false);
      setPaymentStatus('failed');
      onPaymentError(error.message || 'Failed to initialize payment');
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'verifying':
        return <Loader className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'verifying':
        return 'Verifying payment...';
      case 'success':
        return 'Payment successful!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'cancelled':
        return 'Payment was cancelled.';
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Order Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Summary</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Order #{order.order_number}</span>
            <span className="text-sm font-medium text-gray-900">₵{parseFloat(order.total).toFixed(2)}</span>
          </div>
          
          {order.items && (
            <div className="text-sm text-gray-600">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Secure Payment</h4>
            <p className="text-sm text-blue-700">
              Your payment is secured by Paystack's industry-leading encryption and fraud protection.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {paymentStatus && (
        <div className="mb-6 flex items-center justify-center p-4 rounded-lg bg-gray-50">
          {getStatusIcon()}
          <span className="ml-2 text-sm font-medium text-gray-900">
            {getStatusMessage()}
          </span>
        </div>
      )}

      {/* Payment Methods */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Accepted Payment Methods</h4>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-1" />
            Cards
          </div>
          <span>•</span>
          <span>Bank Transfer</span>
          <span>•</span>
          <span>Mobile Money</span>
        </div>
      </div>

      {/* Pay Now Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !paystackConfig || paymentStatus === 'success'}
        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white ${
          loading || !paystackConfig || paymentStatus === 'success'
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        }`}
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : paymentStatus === 'success' ? (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Payment Completed
          </>
        ) : (
          <>
            <Shield className="h-5 w-5 mr-2" />
            Pay ₵{parseFloat(order.total).toFixed(2)} Securely
          </>
        )}
      </button>

      {/* Powered by Paystack */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Powered by{' '}
          <a 
            href="https://paystack.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700"
          >
            Paystack
          </a>
        </p>
      </div>
    </div>
  );
}

export default PaystackPayment;