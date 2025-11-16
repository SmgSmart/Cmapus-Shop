import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import EnhancedCart from './EnhancedCart';

export default function FloatingCart() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartCount, getCartTotal } = useCart();

  const cartCount = getCartCount();

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 30 
      }
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300 }}
      >
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setIsCartOpen(true)}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <ShoppingCart size={24} />
          
          {/* Cart count badge */}
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Cart total preview */}
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-900 px-3 py-2 rounded-lg shadow-lg whitespace-nowrap"
              >
                <div className="text-sm font-medium">
                  ₵{parseFloat(getCartTotal()).toLocaleString()}
                </div>
                <div className="absolute top-1/2 left-full transform -translate-y-1/2">
                  <div className="w-0 h-0 border-l-4 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Enhanced Cart Sidebar */}
      <EnhancedCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}