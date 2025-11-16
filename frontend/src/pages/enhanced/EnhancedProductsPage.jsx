import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, List, Loader } from 'lucide-react';
import { usePaginatedApi } from '../../hooks/useApi';
import { useCart } from '../../context/CartContext';
import EnhancedProductCard from '../components/enhanced/ProductCard';
import SearchAndFilter from '../components/enhanced/SearchAndFilter';
import { PageTransition, StaggerContainer, StaggerItem, AnimatedSpinner } from '../components/animations/TransitionWrapper';

export default function EnhancedProductsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  
  const { addToCart } = useCart();
  
  // Build API URL with filters
  const buildApiUrl = () => {
    let url = '/api/products/';
    const params = new URLSearchParams();
    
    if (searchQuery) params.append('search', searchQuery);
    if (filters.categories?.length) params.append('category', filters.categories.join(','));
    if (filters.priceRange?.min) params.append('price_min', filters.priceRange.min);
    if (filters.priceRange?.max) params.append('price_max', filters.priceRange.max);
    if (filters.rating) params.append('rating_min', filters.rating);
    if (filters.sortBy) params.append('ordering', filters.sortBy);
    
    return url + (params.toString() ? `?${params.toString()}` : '');
  };

  const { 
    data: products, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = usePaginatedApi(buildApiUrl());

  // Fetch categories
  useEffect(() => {
    fetch('/api/stores/categories/')
      .then(res => res.json())
      .then(data => setCategories(data.results || data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  // Refresh products when filters change
  useEffect(() => {
    refresh();
  }, [filters, searchQuery, refresh]);

  const handleAddToCart = (product) => {
    addToCart(product);
    // Show success animation or toast
  };

  const handleViewDetails = (product) => {
    window.location.href = `/products/${product.id}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <PageTransition className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error.message || 'Failed to load products'}</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing Products
          </h1>
          <p className="text-lg text-gray-600">
            Find everything you need for campus life from trusted student sellers
          </p>
        </motion.div>

        {/* Search and Filters */}
        <SearchAndFilter
          onSearch={setSearchQuery}
          onFilterChange={setFilters}
          categories={categories}
          currentFilters={filters}
        />

        {/* View Mode Toggle */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {products.length} products found
            </span>
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader size={16} className="text-blue-600" />
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </motion.div>

        {/* Products Grid */}
        {products.length === 0 && !loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <StaggerContainer
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }
            `}
          >
            {products.map((product) => (
              <StaggerItem key={product.id} variants={itemVariants}>
                <EnhancedProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={handleViewDetails}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Load More Button */}
        {hasMore && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-8"
          >
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader size={16} />
                  </motion.div>
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load More Products</span>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}