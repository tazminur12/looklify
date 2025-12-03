/**
 * Looklify Automation Events Helper
 * 
 * এই file থেকে frontend/backend থেকে automation events send করতে পারবেন
 */

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;

/**
 * Send event to n8n webhook
 * @param {string} event - Event type (PRODUCT_VIEW, ADD_TO_CART, etc.)
 * @param {object} data - Event data
 * @returns {Promise<object>} Response from n8n
 */
export async function sendAutomationEvent(event, data = {}) {
  if (!N8N_WEBHOOK_URL) {
    console.warn('⚠️ N8N_WEBHOOK_URL is not configured. Automation events will not be sent.');
    return { success: false, error: 'N8N_WEBHOOK_URL not configured' };
  }

  const payload = {
    event,
    ...data
  };

  console.log('🚀 Sending automation event to n8n:', {
    url: N8N_WEBHOOK_URL,
    event,
    hasUserId: !!data.userId,
    hasOrderId: !!data.orderId,
    hasProductId: !!data.productId
  });

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ n8n webhook error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const responseText = await response.text();
    
    // If response is empty, consider it success (n8n might return empty response)
    if (!responseText || responseText.trim() === '') {
      console.log('✅ Automation event sent successfully (empty response from n8n)');
      return { success: true, data: { message: 'Event received by n8n' } };
    }

    // Try to parse JSON if content-type indicates JSON
    if (contentType && contentType.includes('application/json')) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Automation event sent successfully:', result);
        return { success: true, data: result };
      } catch (parseError) {
        console.warn('⚠️ Response is not valid JSON, treating as success:', responseText);
        return { success: true, data: { message: responseText } };
      }
    }

    // If not JSON, return as text
    console.log('✅ Automation event sent successfully (non-JSON response):', responseText);
    return { success: true, data: { message: responseText } };
  } catch (error) {
    console.error('❌ Error sending automation event:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Product View Event
 */
export async function trackProductView(productId, userId = null, viewCount = 1) {
  return sendAutomationEvent('PRODUCT_VIEW', {
    productId,
    userId,
    additionalData: { viewCount }
  });
}

/**
 * Add to Cart Event
 */
export async function trackAddToCart(productId, userId, cartValue = 0, isFirstTime = false) {
  return sendAutomationEvent('ADD_TO_CART', {
    productId,
    userId,
    additionalData: {
      cartValue,
      isFirstTime
    }
  });
}

/**
 * Checkout Started Event
 */
export async function trackCheckoutStarted(userId, cartItems = [], cartValue = 0) {
  return sendAutomationEvent('CHECKOUT_STARTED', {
    userId,
    additionalData: {
      cartItems,
      cartValue
    }
  });
}

/**
 * Order Success Event
 */
export async function trackOrderSuccess(orderId, userId) {
  return sendAutomationEvent('ORDER_SUCCESS', {
    orderId,
    userId
  });
}

/**
 * Order Delivered Event
 */
export async function trackOrderDelivered(orderId, userId) {
  return sendAutomationEvent('ORDER_DELIVERED', {
    orderId,
    userId
  });
}

/**
 * Review Submitted Event
 */
export async function trackReviewSubmitted(productId, userId, rating = 0) {
  return sendAutomationEvent('REVIEW_SUBMITTED', {
    productId,
    userId,
    additionalData: { rating }
  });
}

/**
 * New User Event
 */
export async function trackNewUser(userId) {
  return sendAutomationEvent('NEW_USER', {
    userId
  });
}

/**
 * Cart Abandoned Event (call this when checkout started but order not completed)
 */
export async function trackCartAbandoned(userId, cartItems = [], cartValue = 0) {
  return sendAutomationEvent('CART_ABANDONED', {
    userId,
    additionalData: {
      cartItems,
      cartValue
    }
  });
}

/**
 * Low Stock Event
 */
export async function trackLowStock(productId) {
  return sendAutomationEvent('LOW_STOCK', {
    productId
  });
}

/**
 * Restock Event
 */
export async function trackRestock(productId) {
  return sendAutomationEvent('RESTOCK', {
    productId
  });
}

/**
 * Return Request Event
 */
export async function trackReturnRequest(orderId, userId, reason = '', items = []) {
  return sendAutomationEvent('RETURN_REQUEST', {
    orderId,
    userId,
    additionalData: {
      reason,
      items,
      returnRequestId: `RET-${Date.now()}`
    }
  });
}

/**
 * Affiliate Order Event
 */
export async function trackAffiliateOrder(orderId, affiliateId, commission = 0, commissionPercentage = 0) {
  return sendAutomationEvent('AFFILIATE_ORDER', {
    orderId,
    additionalData: {
      affiliateId,
      commission,
      commissionPercentage,
      payoutDate: new Date().toISOString()
    }
  });
}

/**
 * Page Visit Event
 */
export async function trackPageVisit(userId, page = '') {
  return sendAutomationEvent('PAGE_VISIT', {
    userId,
    additionalData: { page }
  });
}

// Example usage in React component:
/*
import { trackProductView, trackAddToCart } from '@/lib/automation-events';

// In your component
useEffect(() => {
  if (productId && userId) {
    trackProductView(productId, userId);
  }
}, [productId, userId]);

const handleAddToCart = async () => {
  await addToCart(product);
  await trackAddToCart(product._id, user.id, cartValue, isFirstTime);
};
*/


