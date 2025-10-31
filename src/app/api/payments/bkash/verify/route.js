import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import axios from 'axios';

// Verify Bkash Payment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentID, orderId } = body;

    if (!paymentID || !orderId) {
      return NextResponse.json(
        { error: 'PaymentID and orderId are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find order
    const order = await Order.findOne({ orderId });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get Bkash credentials
    const bkashAppKey = process.env.BKASH_APP_KEY;
    const bkashAppSecret = process.env.BKASH_APP_SECRET;
    const bkashUsername = process.env.BKASH_USERNAME;
    const bkashPassword = process.env.BKASH_PASSWORD;
    const bkashBaseUrl = process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';

    if (!bkashAppKey || !bkashAppSecret || !bkashUsername || !bkashPassword) {
      return NextResponse.json(
        { error: 'Bkash credentials are not configured' },
        { status: 500 }
      );
    }

    // Get Grant Token
    const grantTokenResponse = await axios.post(
      `${bkashBaseUrl}/tokenized/checkout/token/grant`,
      {
        app_key: bkashAppKey,
        app_secret: bkashAppSecret
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          username: bkashUsername,
          password: bkashPassword
        }
      }
    );

    if (!grantTokenResponse.data || !grantTokenResponse.data.id_token) {
      return NextResponse.json(
        { error: 'Failed to obtain grant token from Bkash' },
        { status: 500 }
      );
    }

    const idToken = grantTokenResponse.data.id_token;

    // Verify Payment with Bkash
    const verifyPaymentResponse = await axios.post(
      `${bkashBaseUrl}/tokenized/checkout/payment/execute`,
      {
        paymentID: paymentID
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: idToken,
          'X-App-Key': bkashAppKey
        }
      }
    );

    const paymentData = verifyPaymentResponse.data;

    // Update order based on verification result
    if (paymentData.statusCode === '0000' && paymentData.transactionStatus === 'Completed') {
      order.payment.status = 'completed';
      order.status = 'confirmed';
      order.payment.transactionId = paymentID;
      order.payment.paymentID = paymentID;
      order.payment.provider = 'bkash';
      order.payment.paidAt = new Date();
      order.payment.bkashData = {
        paymentID: paymentData.paymentID,
        transactionStatus: paymentData.transactionStatus,
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentExecuteTime: paymentData.paymentExecuteTime
      };
      await order.save();

      return NextResponse.json({
        success: true,
        verified: true,
        data: {
          paymentID: paymentData.paymentID,
          transactionStatus: paymentData.transactionStatus,
          statusMessage: paymentData.statusMessage,
          orderId: order.orderId
        }
      });
    } else {
      order.payment.status = 'failed';
      order.payment.provider = 'bkash';
      await order.save();

      return NextResponse.json({
        success: false,
        verified: false,
        data: {
          statusMessage: paymentData.statusMessage || 'Payment verification failed',
          orderId: order.orderId
        }
      });
    }

  } catch (error) {
    console.error('Bkash payment verification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify Bkash payment',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}

