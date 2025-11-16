// Shopping cart page
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function CartPage() {
  const { 
    items, 
    itemCount, 
    subtotal, 
    isLoading, 
    error, 
    updateCartItem, 
    removeFromCart 
  } = useCart();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Please sign in</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be signed in to view your cart.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Sign in to continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start adding some products to your cart.
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    await updateCartItem(cartItemId, newQuantity);
  };

  const handleRemoveItem = async (cartItemId) => {
    await removeFromCart(cartItemId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
        <p className="mt-1 text-sm text-gray-500">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Cart items */}
      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
            {/* Product image */}
            <div className="flex-shrink-0">
              <img
                className="h-20 w-20 rounded-md object-cover"
                src={item.product_image || '/placeholder-product.jpg'}
                alt={item.product_name}
              />
            </div>

            {/* Product details */}
            <div className="flex-1 min-w-0">
              <div className="text-sm">
                <Link 
                  to={`/products/${item.product_slug}`}
                  className="font-medium text-gray-900 hover:text-primary-600"
                >
                  {item.product_name}
                </Link>
              </div>
              
              {item.variant && (
                <div className="text-sm text-gray-500 mt-1">
                  Variant: {item.variant.name}
                </div>
              )}
              
              <div className="text-sm font-medium text-gray-900 mt-1">
                ₵{parseFloat(item.price).toLocaleString()}
              </div>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={isLoading}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="min-w-[2rem] text-center text-sm font-medium">
                {item.quantity}
              </span>
              
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                disabled={isLoading}
                className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Total price */}
            <div className="text-sm font-medium text-gray-900 min-w-[4rem] text-right">
              ₵{(parseFloat(item.price) * item.quantity).toLocaleString()}
            </div>

            {/* Remove button */}
            <button
              onClick={() => handleRemoveItem(item.id)}
              disabled={isLoading}
              className="p-2 text-red-400 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Cart summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal</p>
          <p>GH₵{parseFloat(subtotal).toLocaleString()}</p>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Shipping and taxes calculated at checkout.
        </p>
        
        <div className="mt-6">
          <Link
            to="/checkout"
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Proceed to Checkout
          </Link>
        </div>
        
        <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
          <p>
            or{' '}
            <Link
              to="/products"
              className="text-primary-600 font-medium hover:text-primary-500"
            >
              Continue Shopping
              <span aria-hidden="true"> &rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CartPage;