// API service for communicating with Django backend
import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = 'campus_shop_token';
const REFRESH_TOKEN_KEY = 'campus_shop_refresh_token';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post('http://127.0.0.1:8000/api/accounts/token/refresh/', {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          tokenManager.setTokens(access, refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/accounts/users/', userData);
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await api.post('/accounts/token/', {
      email,
      password,
    });
    
    if (response.data.access && response.data.refresh) {
      tokenManager.setTokens(response.data.access, response.data.refresh);
    }
    
    return response.data;
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        await api.post('/accounts/token/blacklist/', {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/accounts/users/me/');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.patch('/accounts/users/me/', userData);
    return response.data;
  },
};

// Products API
export const productsAPI = {
  // Get all products with pagination and filters
  getProducts: async (params = {}) => {
    const response = await api.get('/products/', { params });
    return response.data;
  },

  // Get single product by slug
  getProduct: async (slug) => {
    const response = await api.get(`/products/${slug}/`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get('/products/', { 
      params: { is_featured: true, page_size: 8 } 
    });
    return response.data;
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    const response = await api.get('/products/', {
      params: { search: query, ...filters }
    });
    return response.data;
  },

  // Create new product (seller only)
  createProduct: async (productData) => {
    const config = {};
    if (productData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.post('/products/', productData, config);
    return response.data;
  },

  // Update product (seller only)
  updateProduct: async (id, productData) => {
    const config = {};
    if (productData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.patch(`/products/${id}/`, productData, config);
    return response.data;
  },

  // Delete product (seller only)
  deleteProduct: async (id) => {
    await api.delete(`/products/${id}/`);
  },

  // Get product categories
  getCategories: async () => {
    const response = await api.get('/stores/categories/');
    return response.data;
  },

  // Get current user's products (seller only)
  getMyProducts: async () => {
    const response = await api.get('/products/my_products/');
    return response.data;
  },
};

// Stores API
export const storesAPI = {
  // Get all stores
  getStores: async (params = {}) => {
    const response = await api.get('/stores/', { params });
    return response.data;
  },

  // Get single store
  getStore: async (slug) => {
    const response = await api.get(`/stores/${slug}/`);
    return response.data;
  },

  // Create new store
  createStore: async (storeData) => {
    const config = {};
    if (storeData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.post('/stores/', storeData, config);
    return response.data;
  },

  // Update store
  updateStore: async (id, storeData) => {
    const config = {};
    if (storeData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.patch(`/stores/${id}/`, storeData, config);
    return response.data;
  },

  // Get current user's store
  getMyStore: async () => {
    const response = await api.get('/stores/my_store/');
    return response.data;
  },

  // Get store analytics
  getStoreAnalytics: async (storeId) => {
    const response = await api.get(`/stores/${storeId}/analytics/`);
    return response.data;
  },

  // Submit seller verification
  submitVerification: async (storeId, verificationData) => {
    const config = {};
    if (verificationData instanceof FormData) {
      config.headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.post(`/stores/${storeId}/verification/`, verificationData, config);
    return response.data;
  },

  // Get verification status
  getVerificationStatus: async (storeId) => {
    const response = await api.get(`/stores/${storeId}/verification_status/`);
    return response.data;
  },

  // Admin: Get pending verifications
  getPendingVerifications: async () => {
    const response = await api.get('/stores/pending_verifications/');
    return response.data;
  },

  // Admin: Approve verification
  approveVerification: async (storeId, data = {}) => {
    const response = await api.post(`/stores/${storeId}/approve_verification/`, data);
    return response.data;
  },

  // Admin: Reject verification
  rejectVerification: async (storeId, data = {}) => {
    const response = await api.post(`/stores/${storeId}/reject_verification/`, data);
    return response.data;
  },

  // Admin: Get verification details
  getVerificationDetails: async (storeId) => {
    const response = await api.get(`/stores/${storeId}/`);
    return response.data;
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/stores/categories/');
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    const response = await api.get('/orders/carts/my_cart/');
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, variantId = null, quantity = 1) => {
    const response = await api.post('/orders/carts/add_item/', {
      product_id: productId,
      variant_id: variantId,
      quantity,
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    const response = await api.post('/orders/carts/update_item/', {
      cart_item_id: cartItemId,
      quantity,
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    const response = await api.post('/orders/carts/remove_item/', {
      cart_item_id: cartItemId
    });
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await api.post('/orders/carts/clear/');
    return response.data;
  },

  // Checkout cart
  checkout: async (checkoutData) => {
    const response = await api.post('/orders/carts/checkout/', checkoutData);
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  // Get user's orders
  getOrders: async (params = {}) => {
    const response = await api.get('/orders/', { params });
    return response.data;
  },

  // Get single order by ID
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/`);
    return response.data;
  },

  // Checkout process
  checkout: async (checkoutData) => {
    const response = await api.post('/orders/carts/checkout/', checkoutData);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel/`);
    return response.data;
  },

  // Get seller's orders
  getSellerOrders: async (params = {}) => {
    const response = await api.get('/orders/seller/orders/', { params });
    return response.data;
  },

  // Update order status (seller only)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.post(`/orders/seller/orders/${orderId}/update_status/`, { status });
    return response.data;
  },

  // Get seller payouts
  getSellerPayouts: async (params = {}) => {
    const response = await api.get('/orders/seller/payouts/', { params });
    return response.data;
  },

  // Get seller balance
  getSellerBalance: async () => {
    const response = await api.get('/orders/seller/payouts/balance/');
    return response.data;
  },

  // Payment endpoints
  initializePayment: async (data) => {
    const response = await api.post('/orders/payments/initialize/', data);
    return response.data;
  },

  verifyPayment: async (reference) => {
    const response = await api.get(`/orders/payments/verify/${reference}/`);
    return response.data;
  },

  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/orders/payments/status/${orderId}/`);
    return response.data;
  },

  getPaystackConfig: async () => {
    const response = await api.get('/orders/payments/config/');
    return response.data;
  },
};

// Addresses API
export const addressesAPI = {
  // Get user's addresses
  getAddresses: async () => {
    const response = await api.get('/accounts/addresses/');
    return response.data;
  },

  // Create new address
  createAddress: async (addressData) => {
    const response = await api.post('/accounts/addresses/', addressData);
    return response.data;
  },

  // Update address
  updateAddress: async (id, addressData) => {
    const response = await api.patch(`/accounts/addresses/${id}/`, addressData);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id) => {
    await api.delete(`/accounts/addresses/${id}/`);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health/');
    return response.data;
  },
};

export default api;