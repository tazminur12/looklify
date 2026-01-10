/**
 * EPS Payment Component
 * Client component for handling EPS payment flow
 */

'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';

export default function EPSPayment({ amount, orderId, customerInfo, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const handleEPSPayment = async () => {
    setLoading(true);

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

      // Step 2: Initialize payment
      const initResponse = await fetch('/api/eps/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenData.token,
          amount: amount,
          customerName: customerInfo?.name || 'Customer',
          customerEmail: customerInfo?.email || 'customer@example.com',
          customerPhone: customerInfo?.phone || '01700000000',
          orderId: orderId
        })
      });

      const initData = await initResponse.json();

      if (!initData.success || !initData.redirectUrl) {
        throw new Error(initData.error || 'Failed to initialize payment');
      }

      console.log('✅ Payment initialized, redirecting...');

      // Step 3: Redirect to EPS payment page
      window.location.href = initData.redirectUrl;

    } catch (error) {
      console.error('❌ EPS Payment Error:', error);
      setLoading(false);

      Swal.fire({
        title: 'Payment Error',
        text: error.message || 'Failed to process EPS payment',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed'
      });

      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleEPSPayment}
      disabled={loading}
      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>💳</span>
          <span>Pay with EPS</span>
        </>
      )}
    </button>
  );
}
