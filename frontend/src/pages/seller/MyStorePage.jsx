// My Store page for sellers to view their store and products
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  ArrowLeft,
  Settings,
  Plus,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { storesAPI, productsAPI } from '../../services/api';
import ProductModal from '../../components/seller/ProductModal';
import StoreAnalytics from '../../components/seller/StoreAnalytics';
import StoreEditModal from '../../components/seller/StoreEditModal';
import SellerVerificationModal, { SellerVerificationBadge } from '../../components/seller/SellerVerification';

function MyStorePage() {
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('customer'); // 'customer' or 'manager'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showStoreEditModal, setShowStoreEditModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      setIsLoading(true);
      const [storeData, productsData] = await Promise.all([
        storesAPI.getMyStore(),
        productsAPI.getMyProducts()
      ]);
      
      setStore(storeData);
      setProducts(productsData.results || productsData);
    } catch (err) {
      setError('Failed to load store data');
      console.error('Store data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(productId);
        loadStoreData(); // Reload data
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleProductSaved = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    loadStoreData(); // Reload data to show updated product
  };

  const handleEditStore = () => {
    setShowStoreEditModal(true);
  };

  const handleStoreSaved = (updatedStore) => {
    setShowStoreEditModal(false);
    setStore(updatedStore); // Update store state with new data
    loadStoreData(); // Reload all data to ensure consistency
  };

  const handleStartVerification = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationSubmitted = (verificationData) => {
    setShowVerificationModal(false);
    // Update store verification status
    setStore(prev => ({ ...prev, verification_status: 'pending' }));
    loadStoreData(); // Reload all data
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Store Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'You don\'t have a store yet.'}</p>
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/seller/dashboard"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Store</h1>
            <p className="mt-1 text-sm text-gray-500">
              {store.name} - {viewMode === 'customer' ? 'Customer View' : 'Management View'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('customer')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'customer'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-1" />
              Customer View
            </button>
            <button
              onClick={() => setViewMode('manager')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'manager'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-1" />
              Manage
            </button>
          </div>
          
          {/* Action Buttons */}
          <Link
            to={`/stores/${store.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Public Store
          </Link>
        </div>
      </div>

      {/* Store Status Banner */}
      <div className="mb-8 bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <Store className="h-8 w-8 text-primary-600" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                <SellerVerificationBadge store={store} size="md" />
              </div>
              <p className="text-gray-600">{store.description}</p>
              {store.rating > 0 && (
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {store.rating.toFixed(1)} ({store.total_ratings} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              store.status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : store.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {store.status}
            </span>
            <div className="mt-2 text-sm text-gray-500">
              {store.total_products || 0} products
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'customer' ? (
        <CustomerView store={store} products={products} />
      ) : (
        <ManagementView 
          store={store} 
          products={products} 
          onProductDeleted={handleDeleteProduct}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onEditStore={handleEditStore}
          onStartVerification={handleStartVerification}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onSave={handleProductSaved}
      />

      {/* Store Edit Modal */}
      <StoreEditModal
        isOpen={showStoreEditModal}
        onClose={() => setShowStoreEditModal(false)}
        store={store}
        onSave={handleStoreSaved}
      />

      {/* Seller Verification Modal */}
      <SellerVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        store={store}
        onVerificationSubmitted={handleVerificationSubmitted}
      />
    </div>
  );
}

// Customer view component - how customers see the store
function CustomerView({ store, products }) {
  return (
    <div className="space-y-8">
      {/* Store Banner */}
      {store.banner && (
        <div className="rounded-lg overflow-hidden h-64">
          <img
            src={store.banner}
            alt={`${store.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Store Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">About This Store</h3>
          <p className="text-gray-600 mb-6">{store.description}</p>
          
          {/* Store Categories */}
          {store.categories && store.categories.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {store.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
          <div className="space-y-3">
            {store.contact_email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{store.contact_email}</span>
              </div>
            )}
            {store.contact_phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{store.contact_phone}</span>
              </div>
            )}
            {store.address && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-600">{store.address}</span>
              </div>
            )}
          </div>

          {/* Social Media Links */}
          {store.social_media && (
            <div className="mt-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Follow Us</h5>
              <div className="flex space-x-2">
                {store.social_media.website && (
                  <a
                    href={store.social_media.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {store.social_media.facebook && (
                  <a
                    href={store.social_media.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {store.social_media.twitter && (
                  <a
                    href={store.social_media.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {store.social_media.instagram && (
                  <a
                    href={store.social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-600"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-6">Our Products</h3>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No products yet</h4>
            <p className="mt-1 text-sm text-gray-500">
              This store hasn't added any products yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg">
                  <img
                    src={product.images?.[0]?.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {product.name}
                  </h4>
                  <p className="mt-1 text-lg font-medium text-gray-900">
                    ₵{parseFloat(product.price).toLocaleString()}
                  </p>
                  {product.rating > 0 && (
                    <div className="mt-1 flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="ml-1 text-xs text-gray-600">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Management view component - seller management interface  
function ManagementView({ store, products, onProductDeleted, onAddProduct, onEditProduct, onEditStore, onStartVerification }) {
  const [activeTab, setActiveTab] = React.useState('overview'); // 'overview', 'products', 'analytics'

  return (
    <div className="space-y-8">
      {/* Management Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          store={store} 
          products={products} 
          onAddProduct={onAddProduct}
          onEditStore={onEditStore}
          onStartVerification={onStartVerification}
        />
      )}
      
      {activeTab === 'products' && (
        <ProductsTab 
          products={products} 
          onAddProduct={onAddProduct}
          onEditProduct={onEditProduct}
          onDeleteProduct={onProductDeleted}
        />
      )}
      
      {activeTab === 'analytics' && (
        <StoreAnalytics store={store} />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ store, products, onAddProduct, onEditStore, onStartVerification }) {
  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={onAddProduct}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
          <button 
            onClick={onEditStore}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Store Info
          </button>
          
          {/* Verification Button - show only if not verified */}
          {(!store.verification_status || store.verification_status === 'unverified' || store.verification_status === 'rejected') && (
            <button 
              onClick={onStartVerification}
              className="inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100"
            >
              <Shield className="h-4 w-4 mr-2" />
              Get Verified
            </button>
          )}
          
          <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-2" />
            Store Settings
          </button>
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {products.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Store Views
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {store.analytics?.total_views || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Sales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {store.analytics?.total_sales || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Rating
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {store.rating > 0 ? store.rating.toFixed(1) : 'No ratings'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Products Tab Component
function ProductsTab({ products, onAddProduct, onEditProduct, onDeleteProduct }) {
  return (
    <div className="space-y-8">

      {/* Products Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Manage Products</h3>
            <button 
              onClick={onAddProduct}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No products</h4>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first product.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={product.images?.[0]?.image || '/placeholder-product.jpg'}
                        alt={product.name}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ₵{parseFloat(product.price).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        
                        <button 
                          onClick={() => onEditProduct(product)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyStorePage;