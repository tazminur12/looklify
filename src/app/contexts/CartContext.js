'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext({});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    try {
      const savedCart = localStorage.getItem('looklify-cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCartItems = (items) => {
    try {
      localStorage.setItem('looklify-cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.productId === product._id);
    
    // Get the correct display price and original price
    // IMPORTANT: salePrice is the OFFER/DISCOUNTED price (what customer pays)
    // regularPrice is the ORIGINAL price (before discount)
    let displayPrice = product.price; // default fallback
    let regularPrice = null;
    
    // Priority 1: New structure with salePrice + regularPrice
    if (product.salePrice) {
      displayPrice = product.salePrice;  // Offer price (discounted)
      if (product.regularPrice) {
        regularPrice = product.regularPrice;  // Original price
      } else if (product.price && product.price > product.salePrice) {
        regularPrice = product.price;  // Fallback to price as original
      }
    } 
    // Priority 2: If price field has discount compared to regularPrice
    else if (product.regularPrice && product.price && product.regularPrice > product.price) {
      displayPrice = product.price;  // Offer price
      regularPrice = product.regularPrice;  // Original price
    }
    // Priority 3: Legacy offerPrice structure
    else if (product.offerPrice && product.price) {
      displayPrice = product.offerPrice;  // Offer price
      regularPrice = product.price;  // Original price
    }
    // Priority 4: Legacy originalPrice structure
    else if (product.originalPrice && product.price && product.originalPrice > product.price) {
      displayPrice = product.price;  // Offer price
      regularPrice = product.originalPrice;  // Original price
    }
    // Priority 5: Just regularPrice exists (no offer)
    else if (product.regularPrice && product.regularPrice !== product.price) {
      regularPrice = product.regularPrice;
    }
    
    // Get the primary image URL
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    const imageUrl = primaryImage?.url || product.image;
    
    let updatedItems;
    if (existingItem) {
      updatedItems = cartItems.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedItems = [
        ...cartItems,
        {
          productId: product._id,
          name: product.name,
          price: displayPrice,
          originalPrice: regularPrice,
          image: imageUrl,
          brand: product.brand?.name,
          category: product.category?.name,
          quantity: 1,
          maxQuantity: product.inventory?.maxOrderQuantity || 999,
          taxPercentage: product.taxPercentage || null,
          shippingCharges: product.shippingCharges || {
            insideDhaka: 0,
            outsideDhaka: 0
          }
        }
      ];
    }
    
    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  const removeFromCart = (productId) => {
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const updatedItems = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    );
    setCartItems(updatedItems);
    saveCartItems(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
    saveCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.productId === productId);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
    getCartItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
