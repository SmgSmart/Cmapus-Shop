// Order detail page for viewing specific order information
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Receipt
} from 'lucide-react';
import { ordersAPI } from '../services/api';

function OrderDetailPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderNumber) {
      loadOrderDetail();
    }
  }, [orderNumber]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const orderData = await ordersAPI.getOrder(orderNumber);
      setOrder(orderData);
    } catch (err) {
      setError('Order not found or you do not have permission to view it');
      console.error('Order loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await ordersAPI.cancelOrder(order.id);
      await loadOrderDetail(); // Reload order data
    } catch (err) {
      alert('Failed to cancel order. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'processing': return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped': return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'cancelled': return <XCircle className="h-6 w-6 text-red-500" />;
      default: return <Clock className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Receipt },
      { key: 'processing', label: 'Processing', icon: Package },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle }
    ];

    const currentIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => {
      const isCompleted = index <= currentIndex;
      const isActive = index === currentIndex;
      const isCancelled = order?.status === 'cancelled';
      
      return {
        ...step,
        isCompleted: isCompleted && !isCancelled,
        isActive: isActive && !isCancelled,
        isCancelled
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderSteps = getOrderSteps();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/orders"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.order_number}
            </h1>
            <p className="text-gray-600">
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-2 font-medium">{order.status_display || order.status}</span>
          </div>
        </div>
      </div>

      {/* Order Progress */}
      {order.status !== 'cancelled' && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Order Progress</h2>
          <div className="relative">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {orderSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.key} className="relative flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      step.isCompleted 
                        ? 'bg-green-100 border-green-500' 
                        : step.isActive 
                        ? 'bg-blue-100 border-blue-500' 
                        : 'bg-gray-100 border-gray-300'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        step.isCompleted 
                          ? 'text-green-600' 
                          : step.isActive 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-sm font-medium ${
                        step.isCompleted || step.isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </h3>
                      {step.isActive && (
                        <p className="text-sm text-gray-600">In progress</p>
                      )}
                      {step.isCompleted && step.key === 'delivered' && order.delivered_at && (
                        <p className="text-sm text-gray-600">
                          {new Date(order.delivered_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Order Items</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0">
                      {item.product_image ? (
                        <img
                          className="h-20 w-20 rounded-lg object-cover"
                          src={item.product_image}
                          alt={item.product_name}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900">
                        {item.product_name}
                      </h3>
                      {item.variant_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          Variant: {item.variant_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        ₵{parseFloat(item.price).toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-base font-medium text-gray-900">
                        ₵{parseFloat(item.total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₵{parseFloat(order.subtotal).toFixed(2)}</span>
                </div>
                
                {parseFloat(order.tax_amount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₵{parseFloat(order.tax_amount).toFixed(2)}</span>
                  </div>
                )}
                
                {parseFloat(order.shipping_cost) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>₵{parseFloat(order.shipping_cost).toFixed(2)}</span>
                  </div>
                )}
                
                {parseFloat(order.platform_fee) > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform Fee</span>
                    <span>₵{parseFloat(order.platform_fee).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₵{parseFloat(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Payment Information</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Method</p>
                    <p className="text-sm text-gray-600">{order.payment_method}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Status</p>
                    <p className={`text-sm ${order.is_paid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {order.payment_status_display || order.payment_status || 'Pending'}
                    </p>
                  </div>
                </div>

                {order.payment_reference && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Reference</p>
                    <p className="text-sm text-gray-600 font-mono">{order.payment_reference}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Shipping Address</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900">{order.shipping_address.full_name}</p>
                    <p className="text-sm text-gray-600">{order.shipping_address.street_address}</p>
                    <p className="text-sm text-gray-600">
                      {order.shipping_address.city}, {order.shipping_address.state}
                    </p>
                    <p className="text-sm text-gray-600">{order.shipping_address.country}</p>
                    {order.shipping_address.phone && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {order.shipping_address.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Note */}
          {order.customer_note && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Customer Note</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600">{order.customer_note}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {(order.status === 'pending' || order.status === 'processing') && (
              <button
                onClick={handleCancelOrder}
                className="w-full flex justify-center items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </button>
            )}
            
            <Link
              to="/orders"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;