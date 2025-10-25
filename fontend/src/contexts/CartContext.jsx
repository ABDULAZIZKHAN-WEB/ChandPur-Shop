import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    items_count: 0,
  });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        items_count: 0,
      });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCartItems(response.data.items);
      setCartSummary({
        subtotal: response.data.subtotal,
        tax: response.data.subtotal * 0.1, // 10% tax
        shipping: 50, // Flat rate
        total: response.data.subtotal + (response.data.subtotal * 0.1) + 50,
        items_count: response.data.count,
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load cart');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productData) => {
    try {
      const response = await cartService.addToCart(productData);
      await fetchCart(); // Refresh cart
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await cartService.updateCartItem(itemId, { quantity });
      await fetchCart(); // Refresh cart
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await cartService.removeFromCart(itemId);
      await fetchCart(); // Refresh cart
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
      return { success: false, message };
    }
  };

  const clearCart = async () => {
    try {
      const response = await cartService.clearCart();
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        items_count: 0,
      });
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
      return { success: false, message };
    }
  };

  const getItemsCount = () => {
    return cartSummary.items_count;
  };

  const isInCart = (productId, attributeId = null) => {
    return cartItems.some(item => 
      item.product_id === productId && 
      item.attribute_id === attributeId
    );
  };

  const getCartItem = (productId, attributeId = null) => {
    return cartItems.find(item => 
      item.product_id === productId && 
      item.attribute_id === attributeId
    );
  };

  const value = {
    cartItems,
    cartSummary,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
    getItemsCount,
    isInCart,
    getCartItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};