'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shippingLocation, setShippingLocation] = useState('insideDhaka');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoCodeLoading, setPromoCodeLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod or eps
  const [epsPaymentLoading, setEpsPaymentLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      // Prefill user data if authenticated; allow guests to continue
      if (user) {
        setFormData({
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || ''
        });
      }

      // Check if cart is empty
      if (cartItems.length === 0) {
        router.push('/cart');
        return;
      }

      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user, cartItems, router]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^(?:\+88|01)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone number format (use 01XXXXXXXXX or +880XXXXXXXXXX)';
    }

    if (!formData.address.trim()) {
      errors.address = 'Delivery address is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return cartItems.reduce((total, item) => {
      if (item.taxPercentage && item.taxPercentage > 0) {
        return total + ((item.price * item.quantity) * item.taxPercentage / 100);
      }
      return total;
    }, 0);
  };

  // Calculate shipping charges for both locations
  const getShippingCharges = () => {
    // Filter out items that have free delivery enabled
    // Only calculate shipping for items that don't have free delivery
    const itemsWithoutFreeDelivery = cartItems.filter(item => item.freeDelivery !== true);
    
    // If all items have free delivery, return 0
    if (itemsWithoutFreeDelivery.length === 0) {
      return { insideDhaka: 0, outsideDhaka: 0 };
    }
    
    let maxInsideDhaka = 0;
    let maxOutsideDhaka = 0;
    
    // Calculate shipping only for items without free delivery
    itemsWithoutFreeDelivery.forEach(item => {
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
    // Check if ALL items have free delivery enabled
    // If all items have free delivery, return true
    // Otherwise, return false (even if some items have free delivery)
    if (cartItems.length === 0) return false;
    return cartItems.every(item => item.freeDelivery === true);
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

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateForm()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (paymentMethod === 'eps') {
        handleEPSPayment();
      } else {
        handlePlaceOrder();
      }
    }
  };

  const handleEPSPayment = async () => {
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    setEpsPaymentLoading(true);

    try {
      console.log('💳 Starting EPS payment flow...');

      // Step 1: Get authentication token
      const tokenResponse = await fetch('/api/eps/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.success || !tokenData.token) {
        throw new Error(tokenData.error || 'Failed to get payment token');
      }

      console.log('✅ Token received');

      // Step 2: Create order first with pending payment status
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sku: item.sku || ''
        })),
        shipping: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          location: shippingLocation
        },
        payment: {
          method: 'eps',
          status: 'processing',
          provider: 'eps'
        },
        pricing: {
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          shipping: calculateShipping(),
          discount: calculatePromoDiscount(),
          total: calculateTotal()
        },
        promoCode: appliedPromoCode?.code || null
      };

      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const orderId = orderResult.data.orderId;
      console.log('✅ Order created:', orderId);

      // Step 3: Initialize EPS payment
      const initResponse = await fetch('/api/eps/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenData.token,
          amount: calculateTotal(),
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          orderId: orderId
        })
      });

      const initData = await initResponse.json();

      if (!initData.success || !initData.redirectUrl) {
        throw new Error(initData.error || 'Failed to initialize payment');
      }

      console.log('✅ Payment initialized, redirecting...');

      // Step 4: Redirect to EPS payment page
      window.location.href = initData.redirectUrl;

    } catch (error) {
      console.error('❌ EPS Payment Error:', error);
      setEpsPaymentLoading(false);

      Swal.fire({
        title: 'Payment Error',
        text: error.message || 'Failed to process EPS payment',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed'
      });
    }
  };
  const handlePlaceOrder = async () => {

    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sku: item.sku || ''
        })),
        shipping: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          location: shippingLocation
        },
        payment: {
          method: 'cod',
          status: 'pending',
          provider: null,
          phoneNumber: null,
          transactionId: null
        },
        pricing: {
          subtotal: calculateSubtotal(),
          tax: calculateTax(),
          shipping: calculateShipping(),
          discount: calculatePromoDiscount(),
          total: calculateTotal()
        },
        promoCode: appliedPromoCode?.code || null
      };

      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        // Show success message with order ID
        Swal.fire({
          title: 'Order Placed Successfully!',
          html: `
            <div class="text-center">
              <p class="mb-3">Thank you for your order. We will process it soon.</p>
              <p class="text-lg font-bold text-purple-600 mt-4">Order ID: ${result.data.orderId}</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'View Orders',
          confirmButtonColor: '#7c3aed',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            clearCart();
            router.push('/my-orders');
          } else {
            clearCart();
            router.push('/');
          }
        });
      } else {
        // Check if it's a stock error
        const errorMessage = result.error || 'Failed to create order';
        if (errorMessage.includes('Insufficient stock')) {
          // Extract product name and stock info from error message
          const stockMatch = errorMessage.match(/Insufficient stock for (.+?)\. Available: (\d+), Requested: (\d+)/);
          if (stockMatch) {
            const [, productName, available, requested] = stockMatch;
            Swal.fire({
              title: 'Stock Unavailable',
              html: `
                <div class="text-center">
                  <p class="mb-3 text-gray-700">
                    <strong>${productName}</strong> is currently out of stock or has insufficient quantity.
                  </p>
                  <p class="text-sm text-gray-600 mb-2">
                    Available: <strong>${available}</strong> | Requested: <strong>${requested}</strong>
                  </p>
                  <p class="text-sm text-gray-600">
                    Please update your cart and try again.
                  </p>
                </div>
              `,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Go to Cart',
              cancelButtonText: 'Stay Here',
              confirmButtonColor: '#7c3aed',
              cancelButtonColor: '#6b7280'
            }).then((result) => {
              if (result.isConfirmed) {
                router.push('/cart');
              }
            });
            return;
          }
        }
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      const errorMessage = error.message || 'Failed to place order. Please try again.';
      
      // Check if it's a stock error in catch block too
      if (errorMessage.includes('Insufficient stock')) {
        const stockMatch = errorMessage.match(/Insufficient stock for (.+?)\. Available: (\d+), Requested: (\d+)/);
        if (stockMatch) {
          const [, productName, available, requested] = stockMatch;
          Swal.fire({
            title: 'Stock Unavailable',
            html: `
              <div class="text-center">
                <p class="mb-3 text-gray-700">
                  <strong>${productName}</strong> is currently out of stock or has insufficient quantity.
                </p>
                <p class="text-sm text-gray-600 mb-2">
                  Available: <strong>${available}</strong> | Requested: <strong>${requested}</strong>
                </p>
                <p class="text-sm text-gray-600">
                  Please update your cart and try again.
                </p>
              </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Go to Cart',
            cancelButtonText: 'Stay Here',
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280'
          }).then((result) => {
            if (result.isConfirmed) {
              router.push('/cart');
            }
          });
          return;
        }
      }
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-30 via-pink-30 to-blue-30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/cart" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent border-b-2 border-purple-500 pb-2 mb-2">Checkout</h1>
            <p className="text-lg text-gray-600">Complete your order in a few simple steps</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all ${
                      currentStep >= step
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={`mt-1.5 text-xs font-medium ${
                      currentStep >= step ? 'text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-3 transition-all ${
                      currentStep > step ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Delivery Details */}
            {currentStep === 1 && (
              <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-lg shadow-lg border-2 border-purple-200 p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mr-3"></span>
                  Delivery Details
                </h2>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Name (নাম)
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all bg-white ${
                        formErrors.fullName ? 'border-red-400 bg-red-50' : 'border-purple-200 hover:border-purple-300'
                      }`}
                      placeholder="Enter your name"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Email (ইমেইল)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all bg-white ${
                        formErrors.email ? 'border-red-400 bg-red-50' : 'border-purple-200 hover:border-purple-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    {formErrors.email && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Phone Number (মোবাইল নাম্বার)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all bg-white ${
                        formErrors.phone ? 'border-red-400 bg-red-50' : 'border-purple-200 hover:border-purple-300'
                      }`}
                      placeholder="01XXXXXXXXX or +880XXXXXXXXXX"
                    />
                    {formErrors.phone && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Delivery Address (ঠিকানা)
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="4"
                      className={`w-full px-4 py-2.5 text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all resize-none bg-white ${
                        formErrors.address ? 'border-red-400 bg-red-50' : 'border-purple-200 hover:border-purple-300'
                      }`}
                      placeholder="Enter your delivery address"
                    />
                    {formErrors.address && (
                      <p className="mt-1.5 text-xs text-red-600 font-medium">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Delivery Charge */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Delivery Charge (ডেলিভারী চার্জ)
                    </label>
                    <div className="space-y-3">
                      <label className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        shippingLocation === 'insideDhaka' 
                          ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md' 
                          : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/50'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryLocation"
                          value="insideDhaka"
                          checked={shippingLocation === 'insideDhaka'}
                          onChange={() => setShippingLocation('insideDhaka')}
                          className="w-5 h-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-800 font-semibold">
                          ঢাকা সিটির ভিতরে- {getShippingCharges().insideDhaka} টাকা
                        </span>
                      </label>
                      <label className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        shippingLocation === 'outsideDhaka' 
                          ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md' 
                          : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/50'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryLocation"
                          value="outsideDhaka"
                          checked={shippingLocation === 'outsideDhaka'}
                          onChange={() => setShippingLocation('outsideDhaka')}
                          className="w-5 h-5 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <span className="text-sm text-gray-800 font-semibold">
                          ঢাকা সিটির বাইরে- {getShippingCharges().outsideDhaka} টাকা
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-md border-2 border-purple-100 p-4">
                <h2 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 pb-1.5 border-b-2 border-purple-300 flex items-center">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'cod' && (
                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">Cash on Delivery</h3>
                          <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                        </div>
                      </div>
                      <div className="text-2xl">💰</div>
                    </div>
                  </button>

                  {/* EPS Payment Gateway */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('eps')}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'eps'
                        ? 'border-green-600 bg-green-50 shadow-md'
                        : 'border-green-200 hover:border-green-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'eps' ? 'border-green-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'eps' && (
                            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">EPS Payment Gateway</h3>
                          <p className="text-sm text-gray-600 mt-1">Pay securely with Card, Mobile Banking & More</p>
                        </div>
                      </div>
                      <div className="text-2xl">💳</div>
                    </div>
                  </button>

                  {/* EPS Payment Info */}
                  {paymentMethod === 'eps' && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-blue-900 text-sm">Secure EPS Payment</h4>
                          <p className="text-xs text-blue-700 mt-1">
                            You will be redirected to EPS Payment Gateway to complete your payment securely using Card, Mobile Banking (Bkash, Nagad, Rocket), or Bank Transfer. 
                            After successful payment, you will be redirected back to our website.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                <div className="mt-3 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-green-900 text-xs">Secure Payment</h4>
                      <p className="text-[10px] text-green-700 mt-0.5">
                        Your payment information is encrypted and secure. We never store your payment details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 border-2 border-purple-200 text-gray-700 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition-all font-semibold text-sm"
                >
                  ← Previous
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                type="button"
                onClick={handleNextStep}
                disabled={submitting || epsPaymentLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold text-sm transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(submitting || epsPaymentLoading) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Processing...</span>
                  </>
                ) : currentStep === 2 ? (
                  paymentMethod === 'eps' ? 'Pay with EPS' : 'Place Order'
                ) : (
                  'Continue to Payment →'
                )}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border-2 border-purple-200 p-3 sticky top-6">
              <h2 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 pb-1.5 border-b-2 border-purple-300 text-center">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-2 pb-2 border-b border-purple-100 last:border-b-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden border border-purple-200">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-400 text-base">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-xs font-bold text-purple-600 mt-0.5">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-3">
                {!appliedPromoCode ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        promoCodeError ? 'border-red-300 bg-red-50' : 'border-purple-300 bg-purple-50/50'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={promoCodeLoading || !promoCode.trim()}
                      className="w-full px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-medium shadow-md hover:shadow-lg"
                    >
                      {promoCodeLoading ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                    {promoCodeError && (
                      <p className="text-[10px] text-red-600 mt-1 bg-red-50 px-1.5 py-0.5 rounded">{promoCodeError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-green-700">✓ {appliedPromoCode.code}</span>
                        <p className="text-[10px] text-green-600 mt-0.5">{appliedPromoCode.discountDisplay || 'Applied'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedPromoCode(null);
                          setPromoCode('');
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-3 pt-3 border-t-2 border-purple-200">
                <div className="flex justify-between text-xs bg-pink-50 px-2 py-1.5 rounded-lg">
                  <span className="text-pink-700 font-medium">Subtotal</span>
                  <span className="font-semibold text-pink-900">৳{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                {calculateTax() > 0 && (
                  <div className="flex justify-between text-xs bg-yellow-50 px-2 py-1.5 rounded-lg">
                    <span className="text-yellow-700 font-medium">Tax</span>
                    <span className="font-semibold text-yellow-900">৳{calculateTax().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xs bg-blue-50 px-2 py-1.5 rounded-lg">
                  <span className="text-blue-700 font-medium">Shipping</span>
                  <span className="font-semibold">
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">Free Delivery</span>
                    ) : (
                      <span className="text-blue-900">৳{calculateShipping().toLocaleString()}</span>
                    )}
                  </span>
                </div>
                
                {appliedPromoCode && calculatePromoDiscount() > 0 && (
                  <div className="flex justify-between text-xs bg-green-50 px-2 py-1.5 rounded-lg">
                    <span className="text-green-700 font-medium">Promo Discount</span>
                    <span className="font-semibold text-green-800">-৳{calculatePromoDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="pt-2 border-t-2 border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50 px-2 py-1.5 rounded-lg">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-base">৳{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-3 border-t border-purple-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg mb-0.5">🚚</div>
                    <p className="text-[10px] text-gray-600 font-medium">Free Delivery</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg mb-0.5">↩️</div>
                    <p className="text-[10px] text-gray-600 font-medium">Easy Returns</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <div className="text-lg mb-0.5">🛡️</div>
                    <p className="text-[10px] text-gray-600 font-medium">Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

