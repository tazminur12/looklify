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
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, online, bkash_api
  const [mobileBankingProvider, setMobileBankingProvider] = useState(null); // bikash, nogod, rocket, bkash, etc.
  const [paymentPhoneNumber, setPaymentPhoneNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [rememberPhoneNumber, setRememberPhoneNumber] = useState(false);
  // Bkash Payment - Commented out (keeping variable to avoid undefined errors)
  const bkashPaymentLoading = false;
  // const [bkashPaymentLoading, setBkashPaymentLoading] = useState(false);
  // const [tempOrderId, setTempOrderId] = useState(null);

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
    // if (paymentMethod === 'bkash_api') {
    //   // No additional validation needed - payment will be initiated via API
    // }

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
    // Check if any cart item has free delivery enabled
    const hasFreeDelivery = cartItems.some(item => item.freeDelivery === true);
    if (hasFreeDelivery) {
      return { insideDhaka: 0, outsideDhaka: 0 };
    }
    
    let maxInsideDhaka = 0;
    let maxOutsideDhaka = 0;
    
    cartItems.forEach(item => {
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
    return cartItems.some(item => item.freeDelivery === true);
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

  // const handleBkashPayment = async () => {
  //   if (!validateForm()) {
  //     setCurrentStep(1);
  //     return;
  //   }

  //   setBkashPaymentLoading(true);

  //   try {
  //     // First, create order with pending payment status
  //     const orderData = {
  //       items: cartItems.map(item => ({
  //         productId: item.productId,
  //         name: item.name,
  //         price: item.price,
  //         quantity: item.quantity,
  //         image: item.image,
  //         sku: item.sku || ''
  //       })),
  //       shipping: {
  //         fullName: formData.fullName,
  //         email: formData.email,
  //         phone: formData.phone,
  //         address: formData.address,
  //         city: formData.city,
  //         postalCode: formData.postalCode,
  //         deliveryNotes: formData.deliveryNotes,
  //         location: shippingLocation
  //       },
  //       payment: {
  //         method: 'bkash_api',
  //         status: 'processing',
  //         provider: 'bkash'
  //       },
  //       pricing: {
  //         subtotal: calculateSubtotal(),
  //         tax: calculateTax(),
  //         shipping: calculateShipping(),
  //         discount: calculatePromoDiscount(),
  //         total: calculateTotal()
  //       },
  //       promoCode: appliedPromoCode?.code || null
  //     };

  //     // Create order first
  //     const orderResponse = await fetch('/api/orders', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(orderData)
  //     });

  //     const orderResult = await orderResponse.json();

  //     if (!orderResult.success) {
  //       throw new Error(orderResult.error || 'Failed to create order');
  //     }

  //     const orderId = orderResult.data.orderId;
  //     setTempOrderId(orderId);

  //     // Initiate Bkash payment
  //     const paymentResponse = await fetch('/api/payments/bkash/initiate', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         amount: calculateTotal(),
  //         orderId: orderId,
  //         invoiceNumber: orderId
  //       })
  //     });

  //     const paymentResult = await paymentResponse.json();

  //     if (paymentResult.success && paymentResult.data.bkashURL) {
  //       // Redirect to Bkash payment page
  //       window.location.href = paymentResult.data.bkashURL;
  //     } else {
  //       throw new Error(paymentResult.error || 'Failed to initiate Bkash payment');
  //     }

  //   } catch (error) {
  //     console.error('Error initiating Bkash payment:', error);
  //     Swal.fire({
  //       title: 'Error',
  //       text: error.message || 'Failed to initiate Bkash payment. Please try again.',
  //       icon: 'error',
  //       confirmButtonText: 'OK',
  //       confirmButtonColor: '#7c3aed'
  //     });
  //     setBkashPaymentLoading(false);
  //   }
  // };

  const handlePlaceOrder = async () => {
    // Handle Bkash API payment separately
    // if (paymentMethod === 'bkash_api') {
    //   await handleBkashPayment();
    //   return;
    // }

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
            router.push('/my-orders');
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

                <div className="space-y-2">
                  {/* Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cod');
                      setMobileBankingProvider(null);
                    }}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'cod' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'cod' && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">Cash on Delivery</h3>
                          <p className="text-xs text-gray-600 mt-0.5">Pay when you receive your order</p>
                        </div>
                      </div>
                      <div className="text-xl">💰</div>
                    </div>
                  </button>

                  {/* Bkash API Payment */}
                  {/* <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('bkash_api');
                      setMobileBankingProvider(null);
                    }}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'bkash_api'
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'bkash_api' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'bkash_api' && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">Bkash Payment</h3>
                          <p className="text-xs text-gray-600 mt-0.5">Pay securely with Bkash Payment Gateway</p>
                        </div>
                      </div>
                      <div className="text-lg">💳</div>
                    </div>
                  </button> */}

                  {/* Online Payment (Manual) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                      paymentMethod === 'online'
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'online' ? 'border-purple-600' : 'border-gray-300'
                        }`}>
                          {paymentMethod === 'online' && (
                            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">Manual Mobile Banking</h3>
                          <p className="text-xs text-gray-600 mt-0.5">Pay with manual mobile banking (Bikash, Nogod, Rocket)</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">📱</span>
                      </div>
                    </div>
                  </button>

                  {/* Bkash API Payment Info */}
                  {/* {paymentMethod === 'bkash_api' && (
                    <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-blue-900 text-xs">Secure Bkash Payment</h4>
                          <p className="text-[10px] text-blue-700 mt-0.5">
                            You will be redirected to Bkash Payment Gateway to complete your payment securely. 
                            After successful payment, you will be redirected back to our website.
                          </p>
                        </div>
                      </div>
                    </div>
                  )} */}

                  {/* Mobile Banking Options - Show when Online Payment is selected */}
                  {paymentMethod === 'online' && (
                    <div className="mt-3 space-y-2 pl-2 border-l-4 border-purple-300">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Select Mobile Banking</h4>
                      
                      {/* Payment Number Info */}
                      <div className="mb-3 p-2.5 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <svg className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className="font-semibold text-purple-900 text-xs mb-1">Send Payment To:</h4>
                            <p className="text-xs text-purple-700 font-medium">
                              Bikash, Nogod, Rocket: <span className="font-bold">01778644419</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* Bikash */}
                        <button
                          type="button"
                          onClick={() => setMobileBankingProvider('bikash')}
                          className={`p-2.5 border-2 rounded-lg text-left transition-all ${
                            mobileBankingProvider === 'bikash'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-purple-200 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                              mobileBankingProvider === 'bikash' ? 'border-purple-600' : 'border-gray-300'
                            }`}>
                              {mobileBankingProvider === 'bikash' && (
                                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900 text-xs">Bikash</h5>
                            </div>
                          </div>
                        </button>

                        {/* Nogod */}
                        <button
                          type="button"
                          onClick={() => setMobileBankingProvider('nogod')}
                          className={`p-2.5 border-2 rounded-lg text-left transition-all ${
                            mobileBankingProvider === 'nogod'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-purple-200 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                              mobileBankingProvider === 'nogod' ? 'border-purple-600' : 'border-gray-300'
                            }`}>
                              {mobileBankingProvider === 'nogod' && (
                                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900 text-xs">Nogod</h5>
                            </div>
                          </div>
                        </button>

                        {/* Rocket */}
                        <button
                          type="button"
                          onClick={() => setMobileBankingProvider('rocket')}
                          className={`p-2.5 border-2 rounded-lg text-left transition-all ${
                            mobileBankingProvider === 'rocket'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-purple-200 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                              mobileBankingProvider === 'rocket' ? 'border-purple-600' : 'border-gray-300'
                            }`}>
                              {mobileBankingProvider === 'rocket' && (
                                <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <h5 className="font-bold text-gray-900 text-xs">Rocket</h5>
                            </div>
                          </div>
                        </button>
                      </div>

                      {formErrors.mobileBankingProvider && (
                        <p className="text-xs text-red-600">{formErrors.mobileBankingProvider}</p>
                      )}

                      {/* Payment Details - Show when mobile banking provider is selected */}
                      {mobileBankingProvider && (
                        <div className="mt-3 space-y-3 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">
                            Payment Details ({mobileBankingProvider.charAt(0).toUpperCase() + mobileBankingProvider.slice(1)})
                          </h4>
                          
                          {/* Phone Number */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                              className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                formErrors.paymentPhoneNumber ? 'border-red-300' : 'border-purple-200'
                              }`}
                              placeholder="01XXXXXXXXX or +880XXXXXXXXXX"
                            />
                            {formErrors.paymentPhoneNumber && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.paymentPhoneNumber}</p>
                            )}
                            
                            {/* Remember Phone Number */}
                            <div className="mt-1.5">
                              <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rememberPhoneNumber}
                                  onChange={(e) => setRememberPhoneNumber(e.target.checked)}
                                  className="w-3.5 h-3.5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-xs text-gray-600">Remember this phone number for next time</span>
                              </label>
                            </div>
                          </div>

                          {/* Transaction ID */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
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
                              className={`w-full px-3 py-2 text-sm border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                                formErrors.transactionId ? 'border-red-300' : 'border-purple-200'
                              }`}
                              placeholder="Enter transaction ID"
                            />
                            {formErrors.transactionId && (
                              <p className="mt-1 text-xs text-red-600">{formErrors.transactionId}</p>
                            )}
                            <p className="mt-1 text-[10px] text-gray-500">
                              Enter the transaction ID from your {mobileBankingProvider.charAt(0).toUpperCase() + mobileBankingProvider.slice(1)} payment
                            </p>
                          </div>
                        </div>
                      )}
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
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold text-sm transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Processing...</span>
                  </>
                ) : currentStep === 2 ? (
                  'Place Order'
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
                    {hasFreeDelivery() ? (
                      <span className="text-green-600">Free Delivery</span>
                    ) : calculateShipping() === 0 ? (
                      <span className="text-green-600">Free</span>
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

