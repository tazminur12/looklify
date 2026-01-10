/**
 * EPS Payment Gateway - Get Authentication Token (with caching)
 * POST /api/eps/token
 * 
 * This endpoint calls EPS API to get an authentication token
 * Uses in-memory caching to prevent rate limiting (429 errors)
 */

import { NextResponse } from 'next/server';
import { generateXHash, getEPSConfig } from '@/lib/eps';

// In-memory token cache
let tokenCache = {
  token: null,
  expireDate: null,
  lastFetched: null
};

// Check if cached token is still valid
function isCachedTokenValid() {
  if (!tokenCache.token || !tokenCache.expireDate) {
    return false;
  }

  // Parse expire date
  const expireTime = new Date(tokenCache.expireDate).getTime();
  const now = Date.now();
  
  // Token valid if expires in more than 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  return (expireTime - now) > fiveMinutes;
}

export async function POST(request) {
  try {
    // Check if we have a valid cached token
    if (isCachedTokenValid()) {
      console.log('✅ Using cached EPS token (expires:', tokenCache.expireDate, ')');
      return NextResponse.json({
        success: true,
        token: tokenCache.token,
        expireDate: tokenCache.expireDate,
        cached: true,
        message: 'Token from cache'
      });
    }

    console.log('🔄 Fetching fresh EPS token...');

    // Get EPS configuration
    const config = getEPSConfig();

    // Generate x-hash using username
    const xHash = generateXHash(config.username);

    // Prepare request body
    const requestBody = {
      Username: config.username,
      Password: config.password
    };

    console.log('🔐 EPS Token Request:', {
      url: `${config.apiBase}/v1/Auth/GetToken`,
      username: config.username,
      xHash: xHash.substring(0, 20) + '...'
    });

    // Call EPS API to get token
    const response = await fetch(`${config.apiBase}/v1/Auth/GetToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hash': xHash
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // EPS API may return token with lowercase or uppercase field name
    const token = data.token || data.Token;
    const expireDate = data.expireDate || data.ExpireDate;
    const expiresIn = data.expiresIn || data.ExpiresIn;

    console.log('🔐 EPS Token Response:', {
      status: response.status,
      responseCode: data.ResponseCode,
      hasToken: !!token,
      expireDate: expireDate
    });

    // Handle rate limiting (429)
    if (response.status === 429) {
      // If we have an old cached token (even if close to expiry), use it
      if (tokenCache.token) {
        console.log('⚠️ Rate limited, using old cached token');
        return NextResponse.json({
          success: true,
          token: tokenCache.token,
          expireDate: tokenCache.expireDate,
          cached: true,
          warning: 'Using cached token due to rate limiting',
          message: 'Token from cache (rate limited)'
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'EPS API rate limit exceeded. Please try again in a few minutes.',
          details: data
        },
        { status: 429 }
      );
    }

    if (!response.ok || !token) {
      console.error('❌ EPS Token Error:', data);
      return NextResponse.json(
        {
          success: false,
          error: data.errorMessage || data.ResponseMessage || 'Failed to get EPS token',
          details: data
        },
        { status: response.status || 500 }
      );
    }

    // Cache the new token
    tokenCache = {
      token: token,
      expireDate: expireDate,
      lastFetched: new Date().toISOString()
    };

    console.log('✅ New token cached, expires:', expireDate);

    // Return token to client
    return NextResponse.json({
      success: true,
      token: token,
      expiresIn: expiresIn || 3600,
      expireDate: expireDate,
      cached: false,
      message: 'Token generated successfully'
    });

  } catch (error) {
    console.error('❌ EPS Token Exception:', error);
    
    // If error but we have cached token, use it
    if (tokenCache.token) {
      console.log('⚠️ Error occurred, falling back to cached token');
      return NextResponse.json({
        success: true,
        token: tokenCache.token,
        expireDate: tokenCache.expireDate,
        cached: true,
        warning: 'Using cached token due to API error',
        message: 'Token from cache (fallback)'
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while getting EPS token',
        message: error.message
      },
      { status: 500 }
    );
  }
}
