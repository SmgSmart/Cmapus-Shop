import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ShoppingBag, Users, Star, TrendingUp } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import EnhancedProductCard from '../components/enhanced/ProductCard';
import { PageTransition, FadeTransition, SlideUpTransition, StaggerContainer, StaggerItem } from '../components/animations/TransitionWrapper';
import { useApi } from '../../hooks/useApi';

export default function EnhancedLandingPage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [stats, setStats] = useState({ users: 0, products: 0, stores: 0 });
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  // Fetch featured products
  const { data: productsData } = useApi('/api/products/?is_featured=true&page_size=8');

  useEffect(() => {
    if (productsData) {
      setFeaturedProducts(productsData.results || []);
    }
  }, [productsData]);

  // Animated stats
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const startTime = Date.now();
      const targetStats = { users: 1200, products: 5400, stores: 89 };

      const updateStats = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setStats({
          users: Math.floor(targetStats.users * progress),
          products: Math.floor(targetStats.products * progress),
          stores: Math.floor(targetStats.stores * progress)
        });

        if (progress < 1) {
          requestAnimationFrame(updateStats);
        }
      };

      updateStats();
    };

    animateStats();
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <PageTransition>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Animated background elements */}
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 opacity-20"
        >
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Campus
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {" "}Shop
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
              Your one-stop marketplace for everything campus life. 
              Buy and sell with fellow students in a trusted community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full flex items-center space-x-2 transition-all duration-300"
              >
                <ShoppingBag size={20} />
                <span>Start Shopping</span>
                <ArrowRight size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300"
              >
                Become a Seller
              </motion.button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid grid-cols-3 gap-8 max-w-md mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.users.toLocaleString()}+</div>
                <div className="text-sm opacity-75">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.products.toLocaleString()}+</div>
                <div className="text-sm opacity-75">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.stores}+</div>
                <div className="text-sm opacity-75">Stores</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <FadeTransition className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Campus Shop?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for students, by students. Experience the future of campus commerce.
            </p>
          </FadeTransition>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem>
              <motion.div
                variants={featureVariants}
                whileHover={{ y: -10 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Student Community</h3>
                <p className="text-gray-600">
                  Connect with fellow students on your campus. Buy and sell in a trusted, verified community.
                </p>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                variants={featureVariants}
                whileHover={{ y: -10 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200"
              >
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Quality Assured</h3>
                <p className="text-gray-600">
                  Every seller is verified. Rate and review products to help others make informed decisions.
                </p>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <motion.div
                variants={featureVariants}
                whileHover={{ y: -10 }}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200"
              >
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Best Prices</h3>
                <p className="text-gray-600">
                  Student-friendly pricing with exclusive deals and discounts for campus community members.
                </p>
              </motion.div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <FadeTransition className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600">
              Discover the most popular items among students
            </p>
          </FadeTransition>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <EnhancedProductCard
                  product={product}
                  onAddToCart={(product) => console.log('Add to cart:', product)}
                  onViewDetails={(product) => console.log('View details:', product)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full flex items-center space-x-2 mx-auto"
            >
              <span>View All Products</span>
              <ArrowRight size={16} />
            </motion.button>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
}