import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { AnimatedButton, FadeTransition } from '../animations/TransitionWrapper';

export default function EnhancedCart({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();
  
  const sidebarVariants = {
    closed: { x: '100%' },
    open: { x: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const formatPrice = (price) => {
    return `₵${parseFloat(price).toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
          
          {/* Cart Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                  <ShoppingCart size={20} />
                  <span>Shopping Cart ({getCartCount()})</span>
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus size={16} className="rotate-45" />
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <FadeTransition className="text-center py-12">
                  <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some products to get started</p>
                  <AnimatedButton
                    onClick={onClose}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Continue Shopping
                  </AnimatedButton>
                </FadeTransition>
              ) : (
                <motion.div className="space-y-4">
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-4">
                          <img
                            src={item.main_image || '/api/placeholder/80/80'}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {item.store_name}
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3 bg-white rounded-lg border">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                            >
                              <Minus size={16} />
                            </motion.button>
                            
                            <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                              {item.quantity}
                            </span>
                            
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                            >
                              <Plus size={16} />
                            </motion.button>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>

                        {/* Item total */}
                        <div className="mt-2 text-right">
                          <span className="text-sm text-gray-500">Subtotal: </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* Footer - Total and Checkout */}
            {cart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-gray-200 p-6 bg-gray-50"
              >
                <div className="space-y-4">
                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-semibold text-lg">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">{formatPrice(getCartTotal())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <AnimatedButton
                    onClick={() => {
                      // Navigate to checkout
                      window.location.href = '/checkout';
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight size={16} />
                  </AnimatedButton>
                  
                  <button
                    onClick={onClose}
                    className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}