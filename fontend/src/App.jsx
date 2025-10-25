import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';

// Payment Pages
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import PaymentCancel from './pages/PaymentCancel';

// Admin Pages
import AdminLayout from './components/admin/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductCreate from './pages/admin/AdminProductCreate';
import AdminProductEdit from './pages/admin/AdminProductEdit';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetails from './pages/admin/AdminOrderDetails';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminInventory from './pages/admin/AdminInventory';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="App">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              
              <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <>
                    <Header />
                    <Home />
                    <Footer />
                  </>
                } />
                
                <Route path="/shop" element={
                  <>
                    <Header />
                    <Shop />
                    <Footer />
                  </>
                } />
                
                <Route path="/product/:slug" element={
                  <>
                    <Header />
                    <ProductDetails />
                    <Footer />
                  </>
                } />
                
                <Route path="/category/:slug" element={
                  <>
                    <Header />
                    <Shop />
                    <Footer />
                  </>
                } />
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected user routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={
                    <>
                      <Header />
                      <Dashboard />
                      <Footer />
                    </>
                  } />
                  
                  <Route path="/cart" element={
                    <>
                      <Header />
                      <Cart />
                      <Footer />
                    </>
                  } />
                  
                  <Route path="/checkout" element={
                    <>
                      <Header />
                      <Checkout />
                      <Footer />
                    </>
                  } />
                  
                  <Route path="/orders" element={
                    <>
                      <Header />
                      <Orders />
                      <Footer />
                    </>
                  } />
                  
                  <Route path="/orders/:id" element={
                    <>
                      <Header />
                      <OrderDetails />
                      <Footer />
                    </>
                  } />
                  
                  <Route path="/wishlist" element={
                    <>
                      <Header />
                      <Wishlist />
                      <Footer />
                    </>
                  } />
                  
                  <Route path="/profile" element={
                    <>
                      <Header />
                      <Profile />
                      <Footer />
                    </>
                  } />
                </Route>

                {/* Admin routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/create" element={<AdminProductCreate />} />
                    <Route path="products/edit/:id" element={<AdminProductEdit />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetails />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="inventory" element={<AdminInventory />} />
                  </Route>
                </Route>

                {/* Payment callback routes */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/fail" element={<PaymentFail />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
              </Routes>
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;