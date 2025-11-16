import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import ProductModel3D from '../3d/ProductModel3D';
import { ScaleTransition, AnimatedButton } from '../animations/TransitionWrapper';

export default function EnhancedProductCard({ product, onAddToCart, onViewDetails }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [show3D, setShow3D] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    hover: { 
      y: -10,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
    }
  };

  const imageVariants = {
    hover: { scale: 1.1 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleToggle3D = (e) => {
    e.stopPropagation();
    setShow3D(!show3D);
  };

  const formatPrice = (price) => {
    return `₵${parseFloat(price).toLocaleString()}`;
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      whileHover="hover"
      variants={cardVariants}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails?.(product)}
    >
      {/* Image/3D Model Container */}
      <div className="relative h-64 overflow-hidden bg-gray-50">
        {show3D ? (
          <ProductModel3D product={product} className="h-full w-full" />
        ) : (
          <>
            <motion.img
              variants={imageVariants}
              src={product.main_image || '/api/placeholder/300/300'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate={isHovered ? "visible" : "hidden"}
              className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
            />
          </>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute top-4 right-4 space-y-2"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggle3D}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
          >
            <Eye size={16} />
          </motion.button>
        </motion.div>

        {/* Badge */}
        {product.is_featured && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4"
          >
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          </motion.div>
        )}

        {/* Stock indicator */}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-4"
          >
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
              Only {product.stock_quantity} left
            </span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Store name */}
        <p className="text-sm text-gray-500 mb-1">{product.store_name}</p>
        
        {/* Product name */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">
            ({product.review_count} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>
          
          {product.compare_at_price && (
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Save {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
            </span>
          )}
        </div>

        {/* Add to cart button */}
        <AnimatedButton
          onClick={handleAddToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </AnimatedButton>
      </div>
    </motion.div>
  );
}