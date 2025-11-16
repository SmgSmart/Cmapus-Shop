import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  // Get payment reference from URL parameters
  const trxref = searchParams.get('trxref');
  const reference = searchParams.get('reference');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference && !trxref) {
        setError('No payment reference found');
        setVerificationStatus('error');
        return;
      }

      const paymentRef = reference || trxref;

      try {
        // Verify payment with backend
        const response = await fetch(`http://127.0.0.1:8000/api/orders/payments/verify/${paymentRef}/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          setOrderDetails(result.order);
          setVerificationStatus('success');
          
          // Redirect to order detail page after 3 seconds
          setTimeout(() => {
            navigate(`/orders/${result.order.order_number}`);
          }, 3000);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Payment verification failed');
          setVerificationStatus('error');
        }
      } catch (err) {
        setError('Network error occurred while verifying payment');
        setVerificationStatus('error');
      }
    };

    verifyPayment();
  }, [reference, trxref, navigate]);

  const getStatusDisplay = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment with Paystack.</p>
            <p className="text-sm text-gray-500 mt-2">Reference: {reference || trxref}</p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your payment has been confirmed and your order is being processed.</p>
            
            {orderDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800 mb-2">Order Details</h3>
                <p><strong>Order Number:</strong> {orderDetails.order_number}</p>
                <p><strong>Total Amount:</strong> GHS {orderDetails.total_amount}</p>
                <p><strong>Status:</strong> {orderDetails.status}</p>
              </div>
            )}
            
            <p className="text-sm text-gray-500">Redirecting to order details in 3 seconds...</p>
            <div className="mt-4">
              <button
                onClick={() => navigate(`/orders/${orderDetails?.order_number}`)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-3"
              >
                View Order Details
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                View All Orders
              </button>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-4">Reference: {reference || trxref}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-red-800 mb-2">What to do next:</h3>
              <ul className="text-left text-red-700 space-y-1">
                <li>• Check your order history to see if payment was processed</li>
                <li>• Contact support if you were charged but order wasn't created</li>
                <li>• Try placing the order again if payment failed</li>
              </ul>
            </div>
            
            <div className="space-x-3">
              <button
                onClick={() => navigate('/orders')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                View Orders
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Back to Cart
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Processing</h1>
            <p className="text-gray-600">Campus Shop - Paystack Payment Callback</p>
          </div>
          
          {getStatusDisplay()}
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;