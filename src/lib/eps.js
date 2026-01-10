/**
 * EPS Payment Gateway Helper Functions
 * Bangladesh EPS Payment Integration
 */

import crypto from 'crypto';

/**
 * Generate x-hash for EPS API authentication
 * Uses HMAC SHA512 + Base64 encoding
 * 
 * @param {string} data - The data to hash (merchantTransactionId for init, username for token)
 * @returns {string} Base64 encoded HMAC SHA512 hash
 */
export function generateXHash(data) {
  const hashKey = process.env.EPS_HASH_KEY;
  
  if (!hashKey) {
    throw new Error('EPS_HASH_KEY is not configured');
  }

  // Create HMAC SHA512 hash
  const hmac = crypto.createHmac('sha512', hashKey);
  hmac.update(data);
  
  // Return Base64 encoded hash
  return hmac.digest('base64');
}

/**
 * Get EPS credentials from environment variables
 * 
 * @returns {Object} EPS configuration
 */
export function getEPSConfig() {
  const config = {
    username: process.env.EPS_USERNAME,
    password: process.env.EPS_PASSWORD,
    hashKey: process.env.EPS_HASH_KEY,
    merchantId: process.env.EPS_MERCHANT_ID,
    storeId: process.env.EPS_STORE_ID,
    apiBase: process.env.EPS_API_BASE || 'https://pgapi.eps.com.bd',
  };

  // Validate all required fields
  const missingFields = [];
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      missingFields.push(key.toUpperCase());
    }
  });

  if (missingFields.length > 0) {
    throw new Error(`Missing EPS configuration: ${missingFields.join(', ')}`);
  }

  return config;
}

/**
 * Generate unique merchant transaction ID
 * Format: EPS-{timestamp}-{random}
 * 
 * @returns {string} Unique transaction ID
 */
export function generateMerchantTransactionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EPS-${timestamp}-${random}`;
}

/**
 * Validate EPS payment response
 * 
 * @param {Object} response - EPS API response
 * @returns {Object} Validation result
 */
export function validateEPSResponse(response) {
  if (!response) {
    return {
      valid: false,
      error: 'No response from EPS API'
    };
  }

  // Check for success indicators
  if (response.ResponseCode === '0' || response.ResponseCode === 0) {
    return {
      valid: true,
      data: response
    };
  }

  return {
    valid: false,
    error: response.ResponseMessage || 'Payment failed',
    code: response.ResponseCode
  };
}
