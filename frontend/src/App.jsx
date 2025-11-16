import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Use original components for now
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';

// Original components
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import StoresPage from './pages/StoresPage';
import SellerDashboard from './pages/seller/SellerDashboard';
import MyStorePage from './pages/seller/MyStorePage';
import AccountDashboard from './pages/AccountDashboard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import PaymentCallback from './pages/PaymentCallback';

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
          <Route path="seller/dashboard" element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          } />
          <Route path="seller/my-store" element={
            <ProtectedRoute>
              <MyStorePage />
            </ProtectedRoute>
          } />
          <Route path="seller/orders" element={
            <ProtectedRoute>
              <SellerOrdersPage />
            </ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          } />
          <Route path="account" element={
            <ProtectedRoute>
              <AccountDashboard />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="orders/:orderNumber" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />
          <Route path="payment/callback" element={
            <ProtectedRoute>
              <PaymentCallback />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </div>
  );
}

export default App;