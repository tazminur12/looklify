import crypto from 'crypto';

export function generateHash(text) {
  const hashKey = process.env.EPS_HASH_KEY;
  if (!hashKey) {
    throw new Error('EPS_HASH_KEY not configured');
  }
  return crypto.createHmac('sha512', hashKey).update(text).digest('base64');
}

export function generateMerchantTransactionId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
}
