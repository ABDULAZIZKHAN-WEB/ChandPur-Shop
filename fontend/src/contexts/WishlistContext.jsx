import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import * as wishlistService from '../services/wishlistService';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load wishlist');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await wishlistService.addToWishlist({ product_id: productId });
      await fetchWishlist(); // Refresh wishlist
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await wishlistService.removeFromWishlist(itemId);
      await fetchWishlist(); // Refresh wishlist
      toast.success(response.data.message);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  const clearWishlist = async () => {
    try {
      const response = await wishlistService.clearWishlist();
      setWishlistItems([]);
      toast.success(response.data.message || 'Wishlist cleared successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear wishlist';
      toast.error(message);
      return { success: false, message };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const getWishlistItem = (productId) => {
    return wishlistItems.find(item => item.product_id === productId);
  };

  const getItemsCount = () => {
    return wishlistItems.length;
  };

  const toggleWishlist = async (productId) => {
    const item = getWishlistItem(productId);
    if (item) {
      return await removeFromWishlist(item.id);
    } else {
      return await addToWishlist(productId);
    }
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    fetchWishlist,
    isInWishlist,
    getWishlistItem,
    getItemsCount,
    toggleWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};