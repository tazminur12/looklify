'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [shippingLocation, setShippingLocation] = useState('insideDhaka'); // insideDhaka or outsideDhaka
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    // Load cart items from localStorage
    const savedCart = localStorage.getItem('looklify-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart data:', error);
        setCartItems([]);
      }
    }
    setLoading(false);
  };

  const updateCartItems = (newCartItems) => {
    setCartItems(newCartItems);
    localStorage.setItem('looklify-cart', JSON.stringify(newCartItems));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    const updatedItems = cartItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    updateCartItems(updatedItems);
    setUpdating(false);
  };

  const handleRemoveItem = async (productId) => {
    setRemoving(productId);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    updateCartItems(updatedItems);
    setRemoving(null);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    // Calculate tax for each product individually if taxPercentage is set
    return cartItems.reduce((total, item) => {
      if (item.taxPercentage && item.taxPercentage > 0) {
        return total + ((item.price * item.quantity) * item.taxPercentage / 100);
      }
      return total;
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    
    // Free shipping if subtotal is over 1000
    if (subtotal > 1000) {
      return 0;
    }
    
    // Get shipping charges for each product
    let maxShipping = 0;
    cartItems.forEach(item => {
      if (item.shippingCharges) {
        const locationCharge = item.shippingCharges[shippingLocation] || 0;
        if (locationCharge > maxShipping) {
          maxShipping = locationCharge;
        }
      }
    });
    
    // If no product-specific shipping, use default
    if (maxShipping === 0) {
      return 100; // Default shipping charge
    }
    
    return maxShipping;
  };

  const calculatePromoDiscount = () => {
    if (!appliedPromoCode) return 0;
    
    const subtotal = calculateSubtotal();
    const discountResult = appliedPromoCode.calculateDiscount(subtotal);
    
    if (!discountResult.valid) return 0;
    
    return discountResult.discountAmount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const shipping = calculateShipping();
    const promoDiscount = calculatePromoDiscount();
    
    return subtotal + tax + shipping - promoDiscount;
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    setPromoCodeLoading(true);
    setPromoCodeError('');

    try {
      const productIds = cartItems.map(item => item.productId);
      const categoryIds = [...new Set(cartItems.map(item => item.categoryId).filter(Boolean))];
      const brandIds = [...new Set(cartItems.map(item => item.brandId).filter(Boolean))];

      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: promoCode.trim(),
          orderAmount: calculateSubtotal(),
          productIds,
          categoryIds,
          brandIds,
          userId: user?.id
        }),
      });

      const result = await response.json();

      if (result.success && result.valid) {
        setAppliedPromoCode(result.data.promoCode);
        setPromoCodeError('');
        // Clear the input
        setPromoCode('');
      } else {
        setPromoCodeError(result.message || 'Invalid promo code');
        setAppliedPromoCode(null);
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      setPromoCodeError('Network error. Please try again.');
      setAppliedPromoCode(null);
    } finally {
      setPromoCodeLoading(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    setPromoCodeError('');
    setPromoCode('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/cart';
      return;
    }
    
    // TODO: Implement checkout functionality
    alert('Checkout functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-2xl mx-auto">
            <div className="text-9xl mb-6 animate-bounce">🛒</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              <span>Start Shopping</span>
              <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-lg text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h2 className="text-2xl font-bold text-white">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.productId} 
                    className={`p-6 transition-all duration-300 ${
                      removing === item.productId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Link href={`/shop/${item.productId}`}>
                          <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={128}
                                height={128}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                                📦
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.productId}`}
                          className="text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors block"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.brand && `${item.brand} • `}
                          {item.category}
                        </p>
                        
                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            {/* Quantity Controls */}
                            <label className="text-sm font-medium text-gray-700">Quantity:</label>
                            <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={updating}
                                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition-colors font-semibold"
                              >
                                −
                              </button>
                              <span className="px-6 py-2 text-center min-w-[3.5rem] border-x-2 border-gray-300 font-semibold text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={updating}
                                className="px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 disabled:opacity-50 transition-colors font-semibold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xl font-bold text-purple-600">
                                ৳{(item.price * item.quantity).toLocaleString()}
                              </p>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <div className="flex items-center gap-1">
                                  <p className="text-sm text-gray-500 line-through">
                                    ৳{(item.originalPrice * item.quantity).toLocaleString()}
                                  </p>
                                  <span className="text-xs font-semibold text-red-600">
                                    Save ৳{((item.originalPrice - item.price) * item.quantity).toLocaleString()}
                                  </span>
                                </div>
                              )}
                              {!item.originalPrice && (
                                <p className="text-xs text-gray-500">Per item: ৳{item.price?.toLocaleString()}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={updating}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg disabled:opacity-50 transition-all"
                              title="Remove from cart"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Shipping Location Selection */}
              <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Location
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShippingLocation('insideDhaka')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      shippingLocation === 'insideDhaka'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    Inside Dhaka
                  </button>
                  <button
                    onClick={() => setShippingLocation('outsideDhaka')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      shippingLocation === 'outsideDhaka'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    Outside Dhaka
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span className="text-base">Subtotal</span>
                  <span className="font-semibold text-gray-900">৳{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                {/* Tax - Only show if any product has tax */}
                {calculateTax() > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span className="text-base">Tax</span>
                    <span className="font-semibold text-gray-900">৳{calculateTax().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span className="text-base">Shipping</span>
                  <span className="font-semibold">
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `৳${calculateShipping().toLocaleString()}`
                    )}
                  </span>
                </div>
                
                {/* Promo Discount */}
                {appliedPromoCode && calculatePromoDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-base">Discount ({appliedPromoCode.code})</span>
                    <span className="font-semibold">-৳{calculatePromoDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-purple-600">৳{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {calculateSubtotal() < 1000 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Save ৳100 on shipping!</span> Add ৳{(1000 - calculateSubtotal()).toLocaleString()} more to get free delivery.
                    </p>
                  </div>
                )}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Promo Code
                </label>
                
                {!appliedPromoCode ? (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className={`flex-1 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          promoCodeError ? 'border-red-300' : 'border-gray-300'
                        }`}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                      />
                      <button 
                        onClick={handleApplyPromoCode}
                        disabled={promoCodeLoading || !promoCode.trim()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
                      >
                        {promoCodeLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Applying...
                          </>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    {promoCodeError && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                        {promoCodeError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-semibold">✓ {appliedPromoCode.code}</span>
                          <span className="text-sm text-green-700">{appliedPromoCode.name}</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {appliedPromoCode.discountDisplay} applied
                        </p>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Remove promo code"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full mb-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="block w-full px-6 py-3 text-center border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-purple-500 transition-all font-semibold"
              >
                Continue Shopping
              </Link>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">Secure Payment</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">🚚</div>
                  <p className="text-xs text-gray-600">Free Delivery</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">↩️</div>
                  <p className="text-xs text-gray-600">Easy Returns</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-2xl mb-1">🛡️</div>
                  <p className="text-xs text-gray-600">Quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
