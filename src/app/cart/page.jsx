'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [shippingLocation, setShippingLocation] = useState('insideDhaka'); // insideDhaka or outsideDhaka
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set(cartItems.map(item => item.productId)));

  // When cartItems from context changes, stop local loading state
  useEffect(() => {
    setLoading(false);
    setSelectedItems(new Set(cartItems.map(item => item.productId)));
  }, [cartItems]);

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.productId)));
    }
  };

  const handleSelectItem = (productId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to remove all items from your cart?')) {
      cartItems.forEach(item => {
        removeFromCart(item.productId);
      });
      setSelectedItems(new Set());
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(true);
    updateQuantity(productId, newQuantity);
    setUpdating(false);
  };

  const handleRemoveItem = async (productId) => {
    setRemoving(productId);
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    removeFromCart(productId);
    setRemoving(null);
  };

  const getSelectedItems = () => {
    return cartItems.filter(item => selectedItems.has(item.productId));
  };

  const calculateSubtotal = () => {
    return getSelectedItems().reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateOriginalPrice = () => {
    return getSelectedItems().reduce((total, item) => {
      const original = item.originalPrice || item.price;
      return total + (original * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    return calculateOriginalPrice() - calculateSubtotal();
  };

  const calculateTax = () => {
    // Calculate tax for each product individually if taxPercentage is set
    return getSelectedItems().reduce((total, item) => {
      if (item.taxPercentage && item.taxPercentage > 0) {
        return total + ((item.price * item.quantity) * item.taxPercentage / 100);
      }
      return total;
    }, 0);
  };

  // Calculate shipping charges for both locations
  const getShippingCharges = () => {
    // Check if any selected item has free delivery enabled
    const hasFreeDelivery = getSelectedItems().some(item => item.freeDelivery === true);
    if (hasFreeDelivery) {
      return { insideDhaka: 0, outsideDhaka: 0 };
    }
    
    let maxInsideDhaka = 0;
    let maxOutsideDhaka = 0;
    
    getSelectedItems().forEach(item => {
      if (item.shippingCharges) {
        const insideCharge = item.shippingCharges.insideDhaka || 0;
        const outsideCharge = item.shippingCharges.outsideDhaka || 0;
        
        if (insideCharge > maxInsideDhaka) {
          maxInsideDhaka = insideCharge;
        }
        if (outsideCharge > maxOutsideDhaka) {
          maxOutsideDhaka = outsideCharge;
        }
      }
    });
    
    // If no product-specific shipping, use defaults
    if (maxInsideDhaka === 0) {
      maxInsideDhaka = 70;
    }
    if (maxOutsideDhaka === 0) {
      maxOutsideDhaka = 130;
    }
    
    return { insideDhaka: maxInsideDhaka, outsideDhaka: maxOutsideDhaka };
  };

  const calculateShipping = () => {
    const charges = getShippingCharges();
    return charges[shippingLocation] || 0;
  };
  
  const hasFreeDelivery = () => {
    return getSelectedItems().some(item => item.freeDelivery === true);
  };

  const calculatePromoDiscount = () => {
    if (!appliedPromoCode) return 0;

    const subtotal = calculateSubtotal();
    let discount = 0;

    if (appliedPromoCode.type === 'percentage') {
      discount = (subtotal * (appliedPromoCode.value || 0)) / 100;
    } else if (appliedPromoCode.type === 'fixed_amount') {
      discount = appliedPromoCode.value || 0;
    } else if (appliedPromoCode.type === 'free_shipping') {
      discount = 0;
    }

    // Ensure discount does not exceed subtotal and round to 2 decimals
    discount = Math.min(discount, subtotal);
    return Math.round(discount * 100) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const promoDiscount = calculatePromoDiscount();
    
    // Total doesn't include shipping - shipping is shown separately
    return subtotal + tax - promoDiscount;
  };

  const getTotalQuantity = () => {
    return getSelectedItems().reduce((total, item) => total + item.quantity, 0);
  };

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    setPromoCodeLoading(true);
    setPromoCodeError('');

    try {
      const selected = getSelectedItems();
      const productIds = selected.map(item => item.productId);
      const categoryIds = [...new Set(selected.map(item => item.categoryId).filter(Boolean))];
      const brandIds = [...new Set(selected.map(item => item.brandId).filter(Boolean))];

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
    // Guest checkout supported; go straight to checkout
    window.location.href = '/checkout';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-30 via-pink-30 to-blue-30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent border-b-2 border-purple-500 pb-2 inline-block">
            Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border-2 border-purple-100 overflow-hidden">
              {/* Header with Select All and Delete All */}
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-purple-600 border-purple-400 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-purple-700">Unselect All</span>
                </label>
                <button
                  onClick={handleDeleteAll}
                  className="text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
                >
                  Delete all
                </button>
              </div>
              
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-purple-200 text-xs font-semibold text-purple-700 uppercase">
                <div className="col-span-1"></div>
                <div className="col-span-4">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-center">Subtotal</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
              
              {/* Cart Items */}
              <div className="divide-y divide-purple-100">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.productId} 
                    className={`px-4 py-4 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 ${
                      removing === item.productId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    } ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}`}
                  >
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* Checkbox */}
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.productId)}
                          onChange={() => handleSelectItem(item.productId)}
                          className="w-4 h-4 text-purple-600 border-purple-400 rounded focus:ring-purple-500"
                        />
                      </div>

                      {/* Product Image & Name */}
                      <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                        <Link href={`/shop/${item.productId}`} className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-purple-400 text-2xl">
                                📦
                              </div>
                            )}
                          </div>
                        </Link>
                        <Link
                          href={`/shop/${item.productId}`}
                          className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                      </div>

                      {/* Price */}
                      <div className="col-span-6 md:col-span-2 text-center md:text-left">
                        <p className="text-sm font-semibold text-purple-700">
                          ৳{item.price.toLocaleString()}
                        </p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <p className="text-xs text-gray-500 line-through">
                            ৳{item.originalPrice.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="col-span-6 md:col-span-2 flex justify-center">
                        <div className="flex items-center border-2 border-purple-500 rounded-lg overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                            className="px-2 py-1 text-purple-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold"
                          >
                            −
                          </button>
                          <span className="px-3 py-1 text-center min-w-[2rem] text-sm font-semibold text-purple-900 border-x-2 border-purple-500 bg-purple-50">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={updating}
                            className="px-2 py-1 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors text-sm font-semibold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-6 md:col-span-2 text-center md:text-left">
                        <p className="text-sm font-semibold text-purple-700">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="col-span-6 md:col-span-1 flex justify-center md:justify-end">
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          disabled={updating}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg disabled:opacity-50 transition-all"
                          title="Remove from cart"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border-2 border-purple-200 p-3 sticky top-6">
              <h2 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 pb-1.5 border-b-2 border-purple-300 text-center">
                Cart Summary
              </h2>
              
              <div className="space-y-0 mb-3">
                <div className="flex justify-between text-xs px-2 py-1.5 bg-gray-100">
                  <span className="text-gray-700">Quantity:</span>
                  <span className="font-semibold text-gray-900">{getTotalQuantity()}</span>
                </div>
                
                <div className="flex justify-between text-xs px-2 py-1.5 bg-white">
                  <span className="text-gray-700">Product Price:</span>
                  <span className="font-semibold text-gray-900">৳{calculateOriginalPrice().toLocaleString()}</span>
                </div>
                
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between text-xs px-2 py-1.5 bg-gray-100">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-semibold text-gray-900">৳{calculateDiscount().toLocaleString()}</span>
                  </div>
                )}
                
                {/* Tax - Only show if any product has tax */}
                {calculateTax() > 0 && (
                  <div className="flex justify-between text-xs px-2 py-1.5 bg-white">
                    <span className="text-gray-700">Tax:</span>
                    <span className="font-semibold text-gray-900">৳{calculateTax().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xs px-2 py-1.5 bg-white">
                  <span className="text-gray-700">Subtotal Price:</span>
                  <span className="font-semibold text-gray-900">৳{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                {/* Delivery Charge */}
                <div className="px-2 py-1.5 bg-gray-100">
                  <div className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Delivery Charge:</span>
                    </div>
                    {hasFreeDelivery() ? (
                      <div className="flex justify-between items-center text-green-700 font-semibold">
                        <span>Free Delivery</span>
                        <span className="text-green-600">৳ 0</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5 pl-0">
                        <div className="flex justify-between text-gray-700">
                          <span>Inside Dhaka :</span>
                          <span className="font-semibold text-gray-900">৳ {getShippingCharges().insideDhaka}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>Outside Dhaka :</span>
                          <span className="font-semibold text-gray-900">৳ {getShippingCharges().outsideDhaka}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-xs px-2 py-1.5 bg-white border-t border-gray-200 pt-2">
                  <span className="text-gray-900 font-bold">Total:</span>
                  <span className="font-bold text-gray-900">৳{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={selectedItems.size === 0}
                className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Checkout
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
