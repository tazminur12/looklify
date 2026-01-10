/**
 * EPS Debug - Test Environment Variables
 * GET /api/eps/debug
 */

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const config = {
      hasUsername: !!process.env.EPS_USERNAME,
      hasPassword: !!process.env.EPS_PASSWORD,
      hasHashKey: !!process.env.EPS_HASH_KEY,
      hasMerchantId: !!process.env.EPS_MERCHANT_ID,
      hasStoreId: !!process.env.EPS_STORE_ID,
      apiBase: process.env.EPS_API_BASE || 'Not set',
      // Show partial values for debugging (first 5 chars)
      usernamePreview: process.env.EPS_USERNAME ? process.env.EPS_USERNAME.substring(0, 5) + '...' : 'Not set',
      merchantIdPreview: process.env.EPS_MERCHANT_ID ? process.env.EPS_MERCHANT_ID.substring(0, 8) + '...' : 'Not set',
    };

    return NextResponse.json({
      success: true,
      config,
      message: 'All variables present? ' + Object.values(config).slice(0, 5).every(v => v === true)
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
