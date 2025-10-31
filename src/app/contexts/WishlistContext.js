'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import Swal from 'sweetalert2';

const WishlistContext = createContext({});

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/wishlist');
      const result = await response.json();
      
      if (result.success) {
        setWishlistItems(result.data || []);
      } else {
        console.error('Failed to load wishlist:', result.error);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, loadWishlist]);

  const addToWishlist = async (product) => {
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add items to your wishlist',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#7c3aed',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Cancel',
        background: '#f8fafc',
        color: '#1f2937'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return { success: false };
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product._id }),
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.message && result.message.includes('already')) {
          // Product already in wishlist
          Swal.fire({
            title: 'Already Added',
            text: 'This product is already in your wishlist',
            icon: 'info',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            background: '#f8fafc',
            color: '#1f2937',
          });
        } else {
          // Product was added - add to local state immediately
          setWishlistItems(prev => {
            // Check if already in list to prevent duplicates
            if (prev.some(item => String(item._id) === String(product._id))) {
              return prev;
            }
            return [...prev, product];
          });
          
          Swal.fire({
            title: 'Added to Wishlist!',
            text: `${product.name} has been added to your wishlist`,
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            background: '#f8fafc',
            color: '#1f2937',
            customClass: {
              popup: 'swal2-toast',
              title: 'text-purple-600 font-semibold',
              content: 'text-gray-600'
            }
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to add product to wishlist',
        icon: 'error',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      return { success: false };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return { success: false };

    try {
      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setWishlistItems(prev => prev.filter(item => String(item._id) !== String(productId)));
        
        Swal.fire({
          title: 'Removed from Wishlist',
          text: 'Product has been removed from your wishlist',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
          background: '#f8fafc',
          color: '#1f2937',
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false };
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => String(item._id) === String(productId));
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

