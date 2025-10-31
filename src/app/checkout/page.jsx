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
    address: '',
    city: '',
    postalCode: '',
    deliveryNotes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, online, bkash_api
  const [mobileBankingProvider, setMobileBankingProvider] = useState(null); // bikash, nogod, rocket, bkash, etc.
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [rememberPhoneNumber, setRememberPhoneNumber] = useState(false);
  const [bkashPaymentLoading, setBkashPaymentLoading] = useState(false);
  const [tempOrderId, setTempOrderId] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.push('/login?redirect=/checkout');
        return;
      }

      // Load user data if authenticated
      if (user) {
        setFormData({
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          postalCode: user.postalCode || '',
          deliveryNotes: ''
        });
        // Load saved payment phone number from localStorage if available
        const savedPaymentPhone = localStorage.getItem('paymentPhoneNumber');
        if (savedPaymentPhone) {
          setPaymentPhoneNumber(savedPaymentPhone);
        }
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

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }

    // Validate payment method specific fields
    if (paymentMethod === 'online') {
      if (!mobileBankingProvider) {
        errors.mobileBankingProvider = 'Please select a mobile banking provider';
      } else {
        if (!paymentPhoneNumber.trim()) {
          errors.paymentPhoneNumber = 'Payment phone number is required';
        } else if (!/^(?:\+88|01)[0-9]{9}$/.test(paymentPhoneNumber.replace(/\s/g, ''))) {
          errors.paymentPhoneNumber = 'Invalid phone number format (use 01XXXXXXXXX or +880XXXXXXXXXX)';
        }
        
        if (!transactionId.trim()) {
          errors.transactionId = 'Transaction ID is required';
        }
      }
    }
    
    // Bkash API payment doesn't need validation here as it will be handled in the payment flow
    if (paymentMethod === 'bkash_api') {
      // No additional validation needed - payment will be initiated via API
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

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    
    if (subtotal > 1000) {
      return 0;
    }
    
    let maxShipping = 0;
    cartItems.forEach(item => {
      if (item.shippingCharges) {
        const locationCharge = item.shippingCharges[shippingLocation] || 0;
        if (locationCharge > maxShipping) {
          maxShipping = locationCharge;
        }
      }
    });
    
    if (maxShipping === 0) {
      return shippingLocation === 'insideDhaka' ? 50 : 100;
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
      handlePlaceOrder();
    }
  };

  const handleBkashPayment = async () => {
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    setBkashPaymentLoading(true);

    try {
      // First, create order with pending payment status
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
          city: formData.city,
          postalCode: formData.postalCode,
          deliveryNotes: formData.deliveryNotes,
          location: shippingLocation
        },
        payment: {
          method: 'bkash_api',
          status: 'processing',
          provider: 'bkash'
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

      // Create order first
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
      setTempOrderId(orderId);

      // Initiate Bkash payment
      const paymentResponse = await fetch('/api/payments/bkash/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculateTotal(),
          orderId: orderId,
          invoiceNumber: orderId
        })
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success && paymentResult.data.bkashURL) {
        // Redirect to Bkash payment page
        window.location.href = paymentResult.data.bkashURL;
      } else {
        throw new Error(paymentResult.error || 'Failed to initiate Bkash payment');
      }

    } catch (error) {
      console.error('Error initiating Bkash payment:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to initiate Bkash payment. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed'
      });
      setBkashPaymentLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    // Handle Bkash API payment separately
    if (paymentMethod === 'bkash_api') {
      await handleBkashPayment();
      return;
    }

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
          city: formData.city,
          postalCode: formData.postalCode,
          deliveryNotes: formData.deliveryNotes,
          location: shippingLocation
        },
        payment: {
          method: paymentMethod === 'cod' ? 'cod' : 'online',
          status: paymentMethod === 'cod' ? 'pending' : 'processing',
          provider: mobileBankingProvider || null,
          phoneNumber: paymentPhoneNumber || null,
          transactionId: transactionId || null
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
        // Save payment phone number if remember option is checked
        if (rememberPhoneNumber && paymentPhoneNumber) {
          localStorage.setItem('paymentPhoneNumber', paymentPhoneNumber);
        }
        
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
            router.push('/dashboard/orders');
          } else {
            clearCart();
            router.push('/');
          }
        });
      } else {
        throw new Error(result.error || 'Failed to create order');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to place order. Please try again.',
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-lg text-gray-600">Complete your order in a few simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      currentStep >= step
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step ? 'text-purple-600' : 'text-gray-500'
                    }`}
                  >
                    {step === 1 ? 'Shipping' : step === 2 ? 'Payment' : 'Review'}
                  </span>
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 transition-all ${
                      currentStep > step ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Shipping Information
                </h2>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        formErrors.fullName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        formErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        formErrors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="01XXXXXXXXX or +880XXXXXXXXXX"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Delivery Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Location <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShippingLocation('insideDhaka')}
                        className={`flex-1 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                          shippingLocation === 'insideDhaka'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-700 hover:border-purple-500'
                        }`}
                      >
                        Inside Dhaka
                      </button>
                      <button
                        type="button"
                        onClick={() => setShippingLocation('outsideDhaka')}
                        className={`flex-1 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                          shippingLocation === 'outsideDhaka'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 border-2 border-gray-300 text-gray-700 hover:border-purple-500'
                        }`}
                      >
                        Outside Dhaka
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none ${
                        formErrors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="House/Apartment number, Street, Area"
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>

                  {/* City and Postal Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          formErrors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="City name"
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          formErrors.postalCode ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Postal code"
                      />
                      {formErrors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={formData.deliveryNotes}
                      onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      placeholder="Any special instructions for delivery"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                  Payment Method
                </h2>

                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cod');
                      setMobileBankingProvider(null);
                    }}
                    className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'cod' && (
                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Cash on Delivery</h3>
                          <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                        </div>
                      </div>
                      <div className="text-3xl">💰</div>
                    </div>
                  </button>

                  {/* Bkash API Payment */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('bkash_api');
                      setMobileBankingProvider(null);
                    }}
                    className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === 'bkash_api'
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'bkash_api' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'bkash_api' && (
                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Bkash Payment</h3>
                          <p className="text-sm text-gray-600 mt-1">Pay securely with Bkash Payment Gateway</p>
                        </div>
                      </div>
                      <div className="text-2xl">💳</div>
                    </div>
                  </button>

                  {/* Online Payment (Manual) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`w-full p-5 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === 'online'
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'online' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'online' && (
                            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">Manual Mobile Banking</h3>
                          <p className="text-sm text-gray-600 mt-1">Pay with manual mobile banking (Bikash, Nogod, Rocket)</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📱</span>
                      </div>
                    </div>
                  </button>

                  {/* Bkash API Payment Info */}
                  {paymentMethod === 'bkash_api' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-blue-900">Secure Bkash Payment</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            You will be redirected to Bkash Payment Gateway to complete your payment securely. 
                            After successful payment, you will be redirected back to our website.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Banking Options - Show when Online Payment is selected */}
                  {paymentMethod === 'online' && (
                    <div className="mt-4 space-y-3 pl-2 border-l-4 border-purple-300">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Select Mobile Banking</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Bikash */}
                        <button
                          type="button"
                          onClick={() => setMobileBankingProvider('bikash')}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            mobileBankingProvider === 'bikash'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              mobileBankingProvider === 'bikash' ? 'border-purple-600' : 'border-gray-300'
                            }`}>
                              {mobileBankingProvider === 'bikash' && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900">Bikash</h5>
                            </div>
                          </div>
                        </button>

                        {/* Nogod */}
                        <button
                          type="button"
                          onClick={() => setMobileBankingProvider('nogod')}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            mobileBankingProvider === 'nogod'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              mobileBankingProvider === 'nogod' ? 'border-purple-600' : 'border-gray-300'
                            }`}>
                              {mobileBankingProvider === 'nogod' && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900">Nogod</h5>
                            </div>
                          </div>
                        </button>

                        {/* Rocket */}
                        <button
                          type="button"
                          onClick={() => setMobileBankingProvider('rocket')}
                          className={`p-4 border-2 rounded-xl text-left transition-all ${
                            mobileBankingProvider === 'rocket'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-300 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              mobileBankingProvider === 'rocket' ? 'border-purple-600' : 'border-gray-300'
                            }`}>
                              {mobileBankingProvider === 'rocket' && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900">Rocket</h5>
                            </div>
                          </div>
                        </button>
                      </div>

                      {formErrors.mobileBankingProvider && (
                        <p className="text-sm text-red-600">{formErrors.mobileBankingProvider}</p>
                      )}

                      {/* Payment Details - Show when mobile banking provider is selected */}
                      {mobileBankingProvider && (
                        <div className="mt-6 space-y-4 pt-4 border-t border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">
                            Payment Details ({mobileBankingProvider.charAt(0).toUpperCase() + mobileBankingProvider.slice(1)})
                          </h4>
                          
                          {/* Phone Number */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={paymentPhoneNumber}
                              onChange={(e) => {
                                setPaymentPhoneNumber(e.target.value);
                                if (formErrors.paymentPhoneNumber) {
                                  setFormErrors(prev => ({ ...prev, paymentPhoneNumber: '' }));
                                }
                              }}
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                formErrors.paymentPhoneNumber ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="01XXXXXXXXX or +880XXXXXXXXXX"
                            />
                            {formErrors.paymentPhoneNumber && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.paymentPhoneNumber}</p>
                            )}
                            
                            {/* Remember Phone Number */}
                            <div className="mt-2">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rememberPhoneNumber}
                                  onChange={(e) => setRememberPhoneNumber(e.target.checked)}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-600">Remember this phone number for next time</span>
                              </label>
                            </div>
                          </div>

                          {/* Transaction ID */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Transaction ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={transactionId}
                              onChange={(e) => {
                                setTransactionId(e.target.value);
                                if (formErrors.transactionId) {
                                  setFormErrors(prev => ({ ...prev, transactionId: '' }));
                                }
                              }}
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                formErrors.transactionId ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter transaction ID"
                            />
                            {formErrors.transactionId && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.transactionId}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                              Enter the transaction ID from your {mobileBankingProvider.charAt(0).toUpperCase() + mobileBankingProvider.slice(1)} payment
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-green-900">Secure Payment</h4>
                      <p className="text-sm text-green-700 mt-1">
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
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-purple-500 transition-all font-semibold"
                >
                  ← Previous
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                type="button"
                onClick={handleNextStep}
                disabled={submitting || bkashPaymentLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold text-lg transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(submitting || bkashPaymentLoading) ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {paymentMethod === 'bkash_api' ? 'Redirecting to Bkash...' : 'Processing...'}
                  </>
                ) : currentStep === 2 ? (
                  paymentMethod === 'bkash_api' ? 'Pay with Bkash' : 'Place Order'
                ) : (
                  'Continue to Payment →'
                )}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-purple-600 mt-1">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                {!appliedPromoCode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter promo code"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        promoCodeError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={promoCodeLoading || !promoCode.trim()}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                    >
                      {promoCodeLoading ? 'Applying...' : 'Apply Code'}
                    </button>
                    {promoCodeError && (
                      <p className="text-xs text-red-600">{promoCodeError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-green-700 font-semibold text-sm">
                        ✓ {appliedPromoCode.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedPromoCode(null);
                          setPromoCode('');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">৳{calculateSubtotal().toLocaleString()}</span>
                </div>
                
                {calculateTax() > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-semibold text-gray-900">৳{calculateTax().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">
                    {calculateShipping() === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `৳${calculateShipping().toLocaleString()}`
                    )}
                  </span>
                </div>
                
                {appliedPromoCode && calculatePromoDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-৳{calculatePromoDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-purple-600">৳{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-1">🚚</div>
                    <p className="text-xs text-gray-600 font-medium">Free Delivery</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-1">↩️</div>
                    <p className="text-xs text-gray-600 font-medium">Easy Returns</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl mb-1">🛡️</div>
                    <p className="text-xs text-gray-600 font-medium">Secure</p>
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

