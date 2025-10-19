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

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    // Load cart items from localStorage for now
    // In a real app, this would come from an API
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

  const handleRemoveItem = (productId) => {
    setUpdating(true);
    const updatedItems = cartItems.filter(item => item.productId !== productId);
    updateCartItems(updatedItems);
    setUpdating(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = subtotal > 1000 ? 0 : 100; // Free shipping over 1000
    const tax = subtotal * 0.05; // 5% tax
    return subtotal + shipping + tax;
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/login?redirect=/cart';
      return;
    }
    
    // In a real app, redirect to checkout page
    alert('Checkout functionality will be implemented soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">কার্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">আপনার কার্ট খালি</h1>
            <p className="text-lg text-gray-600 mb-8">কিছু পণ্য যোগ করে শুরু করুন</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-colors"
            >
              <span>শপিং শুরু করুন</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">শপিং কার্ট</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} টি পণ্য</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">কার্ট আইটেম</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <div key={item.productId} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📦
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${item.productId}`}
                          className="text-lg font-medium text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.brand && `${item.brand} • `}
                          {item.category}
                        </p>
                        
                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                disabled={updating}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              >
                                −
                              </button>
                              <span className="px-4 py-1 text-center min-w-[3rem] border-x border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                disabled={updating}
                                className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Price and Remove */}
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-lg font-semibold text-gray-900">
                                ৳{(item.price * item.quantity).toLocaleString()}
                              </p>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <p className="text-sm text-gray-500 line-through">
                                  ৳{(item.originalPrice * item.quantity).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              disabled={updating}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                              title="Remove from cart"
                            >
                              🗑️
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
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">অর্ডার সুমারি</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল</span>
                  <span>৳{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>শিপিং</span>
                  <span>
                    {calculateSubtotal() > 1000 ? (
                      <span className="text-green-600">ফ্রি</span>
                    ) : (
                      '৳100'
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-gray-600">
                  <span>ট্যাক্স (৫%)</span>
                  <span>৳{(calculateSubtotal() * 0.05).toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>মোট</span>
                    <span>৳{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-6">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="প্রমো কোড"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    প্রয়োগ
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-colors"
              >
                চেকআউট করুন
              </button>

              {/* Continue Shopping */}
              <Link
                href="/shop"
                className="block w-full mt-3 px-6 py-3 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                আরো কেনাকাটা করুন
              </Link>

              {/* Security Badge */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <span>🔒</span>
                  <span>সুরক্ষিত পেমেন্ট</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
