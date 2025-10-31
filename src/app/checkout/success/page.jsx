'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [paymentID, setPaymentID] = useState(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId');
    const paymentIDParam = searchParams.get('paymentID');

    if (orderIdParam && paymentIDParam) {
      setOrderId(orderIdParam);
      setPaymentID(paymentIDParam);
      verifyPayment(orderIdParam, paymentIDParam);
    } else {
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyPayment = async (orderId, paymentID) => {
    try {
      const response = await fetch('/api/payments/bkash/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentID,
          orderId
        })
      });

      const result = await response.json();

      if (result.success && result.verified) {
        setVerified(true);
        Swal.fire({
          title: 'Payment Successful!',
          html: `
            <div class="text-center">
              <p class="mb-3">Your payment has been successfully processed.</p>
              <p class="text-lg font-bold text-purple-600 mt-4">Order ID: ${orderId}</p>
              <p class="text-sm text-gray-600 mt-2">Payment ID: ${paymentID}</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'View Orders',
          confirmButtonColor: '#7c3aed',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/dashboard/orders');
          } else {
            router.push('/');
          }
        });
      } else {
        setVerified(false);
        Swal.fire({
          title: 'Payment Verification Failed',
          text: result.data?.statusMessage || 'Please contact support if payment was deducted.',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#7c3aed'
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerified(false);
      Swal.fire({
        title: 'Verification Error',
        text: 'Unable to verify payment. Please contact support with your order ID.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed'
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {verifying ? (
          <>
            <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h2>
            <p className="text-gray-600">Please wait while we verify your payment</p>
          </>
        ) : verified ? (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your order has been confirmed</p>
            {orderId && (
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-lg font-bold text-purple-600">{orderId}</p>
              </div>
            )}
            <Link
              href="/dashboard/orders"
              className="inline-block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold transition-all"
            >
              View Orders
            </Link>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h2>
            <p className="text-gray-600 mb-6">Please contact support with your order details</p>
            <Link
              href="/dashboard/orders"
              className="inline-block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold transition-all mb-3"
            >
              View Orders
            </Link>
            <Link
              href="/"
              className="inline-block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

