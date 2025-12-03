import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import PromoCode from '@/models/PromoCode';

// Helper function to generate discount codes
function generateDiscountCode(percentage, prefix = 'LOOK') {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${percentage}${random}`;
}

// Helper function to save discount code to database
async function saveDiscountCodeToDatabase(code, percentage, userId, context = '') {
  try {
    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      // If exists, return the existing code
      return existingCode.code;
    }

    // Calculate expiry date (30 days from now)
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    // Create promo code name based on context
    let codeName = '';
    let codeDescription = '';
    
    if (context.includes('VIP') || context.includes('vip')) {
      codeName = `VIP ${percentage}% Discount`;
      codeDescription = `Exclusive VIP discount code for repeat customers`;
    } else if (context.includes('CART') || context.includes('cart')) {
      codeName = `Cart Recovery ${percentage}% Discount`;
      codeDescription = `Special discount for completing your abandoned cart`;
    } else if (context.includes('WELCOME') || context.includes('welcome')) {
      codeName = `Welcome ${percentage}% Discount`;
      codeDescription = `Welcome discount for new customers`;
    } else if (context.includes('REVIEW') || context.includes('review')) {
      codeName = `Review ${percentage}% Discount`;
      codeDescription = `Thank you discount for submitting a review`;
    } else {
      codeName = `${percentage}% Discount Code`;
      codeDescription = `Automated discount code`;
    }

    // Create new promo code
    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      name: codeName,
      description: codeDescription,
      type: 'percentage',
      value: percentage,
      minimumOrderAmount: 0,
      usageLimit: 1, // Single use per code
      usageLimitPerUser: 1,
      validFrom: validFrom,
      validUntil: validUntil,
      applicableUsers: userId ? [userId] : [], // If userId provided, make it user-specific
      status: 'active',
      autoApply: false
    });

    await promoCode.save();
    console.log(`✅ Discount code saved to database: ${code.toUpperCase()}`);
    return promoCode.code;
  } catch (error) {
    console.error('Error saving discount code to database:', error);
    // Return the code anyway, even if save fails
    return code;
  }
}

// Helper function to get personalized greeting
function getPersonalizedGreeting(name) {
  const greetings = [
    `Hi ${name}`,
    `Hey ${name}`,
    `Hello ${name}`,
    `${name}, we've got something for you`
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// Helper function to recommend products based on user data
async function getRecommendedProducts(user, product, viewedProducts = []) {
  try {
    const recommendations = [];
    
    // Get user's past orders to understand preferences
    const pastOrders = await Order.find({ user: user._id })
      .populate('items.productId')
      .limit(10)
      .sort({ createdAt: -1 });
    
    const purchasedCategories = new Set();
    const purchasedBrands = new Set();
    const inferredSkinTypes = new Set();
    const inferredSkinConcerns = new Set();
    
    // Infer skin type and concerns from past purchases
    pastOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.productId?.category) purchasedCategories.add(item.productId.category.toString());
        if (item.productId?.brand) purchasedBrands.add(item.productId.brand.toString());
        if (item.productId?.skinType) {
          item.productId.skinType.forEach(st => inferredSkinTypes.add(st));
        }
        if (item.productId?.skinConcern) {
          item.productId.skinConcern.forEach(sc => inferredSkinConcerns.add(sc));
        }
      });
    });
    
    let query = {
      status: 'active',
      stock: { $gt: 0 },
      _id: { $ne: product?._id }
    };
    
    // If we inferred skin type/concerns from purchases, prioritize matching products
    if (inferredSkinTypes.size > 0 || inferredSkinConcerns.size > 0) {
      query.$or = [];
      if (inferredSkinTypes.size > 0) {
        query.$or.push({ skinType: { $in: Array.from(inferredSkinTypes) } });
      }
      if (inferredSkinConcerns.size > 0) {
        query.$or.push({ skinConcern: { $in: Array.from(inferredSkinConcerns) } });
      }
    }
    
    // If current product exists, find similar products
    if (product) {
      if (product.category) {
        query.category = product.category;
      }
      if (product.brand) {
        query.brand = product.brand;
      }
      // Also match skin type/concerns from current product
      if (product.skinType && product.skinType.length > 0) {
        if (!query.$or) query.$or = [];
        query.$or.push({ skinType: { $in: product.skinType } });
      }
      if (product.skinConcern && product.skinConcern.length > 0) {
        if (!query.$or) query.$or = [];
        query.$or.push({ skinConcern: { $in: product.skinConcern } });
      }
    }
    
    const similarProducts = await Product.find(query)
      .limit(5)
      .populate('brand', 'name')
      .populate('category', 'name');
    
    recommendations.push(...similarProducts);
    
    // If we don't have enough, get best sellers
    if (recommendations.length < 3) {
      const bestSellers = await Product.find({
        status: 'active',
        stock: { $gt: 0 },
        isBestSeller: true,
        _id: { $nin: recommendations.map(p => p._id) }
      })
      .limit(5 - recommendations.length)
      .populate('brand', 'name')
      .populate('category', 'name');
      
      recommendations.push(...bestSellers);
    }
    
    return recommendations.slice(0, 5);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Main automation brain function
async function processEvent(eventType, eventData) {
  const { userId, productId, orderId, user, product, order, additionalData } = eventData;
  
  // Fetch user if not provided
  let userData = user;
  if (!userData && userId) {
    userData = await User.findById(userId);
  }
  
  // Fetch product if not provided
  let productData = product;
  if (!productData && productId) {
    productData = await Product.findById(productId)
      .populate('brand', 'name')
      .populate('category', 'name');
  }
  
  // Fetch order if not provided
  let orderData = order;
  if (!orderData && orderId) {
    orderData = await Order.findById(orderId)
      .populate('items.productId')
      .populate('user');
  }
  
  const userName = userData?.name || 'there';
  const userEmail = userData?.email || '';
  const userPhone = userData?.phone || '';
  
  // Process each event type
  switch (eventType) {
    case 'PRODUCT_VIEW': {
      // Check if product viewed multiple times
      const viewCount = additionalData?.viewCount || 1;
      
      if (viewCount >= 3 && userData) {
        // User viewed this product multiple times - recommend similar products
        const recommendations = await getRecommendedProducts(userData, productData);
        
        return {
          action: 'recommend_products',
          message: '', // AI will generate the message
          data: {
            customer_name: userName,
            customer_email: userEmail,
            product_id: productId,
            product_name: productData?.name,
            product_category: productData?.category?.name,
            product_brand: productData?.brand?.name,
            view_count: viewCount,
            recommendations: recommendations.map(p => ({
              id: p._id,
              name: p.name,
              price: p.salePrice || p.price,
              image: p.images?.[0]?.url,
              brand: p.brand?.name,
              category: p.category?.name
            })),
            event_type: 'PRODUCT_VIEW',
            context: 'multiple_views_recommendation'
          }
        };
      }
      
      return {
        action: 'store_to_mongo',
        message: '',
        data: {
          event: 'PRODUCT_VIEW',
          product_id: productId,
          user_id: userId,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    case 'ADD_TO_CART': {
      if (!userData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      // Check if this is a high-value item or first-time cart addition
      const cartValue = additionalData?.cartValue || 0;
      const isFirstTime = additionalData?.isFirstTime || false;
      
      if (isFirstTime && cartValue > 2000) {
        return {
          action: 'send_email',
          message: '', // AI will generate the message
          data: {
            customer_name: userName,
            customer_email: userEmail,
            customer_phone: userPhone,
            product_name: productData?.name,
            product_id: productId,
            cart_value: cartValue,
            cart_items: additionalData?.cartItems || [],
            event_type: 'ADD_TO_CART',
            context: 'first_time_high_value_cart',
            // AI will use this data to generate personalized message
          }
        };
      }
      
      return {
        action: 'store_to_mongo',
        message: '',
        data: {
          event: 'ADD_TO_CART',
          product_id: productId,
          user_id: userId,
          cart_value: cartValue,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    case 'CHECKOUT_STARTED': {
      if (!userData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      // Store checkout start for potential cart recovery
      return {
        action: 'store_to_mongo',
        message: '',
        data: {
          event: 'CHECKOUT_STARTED',
          user_id: userId,
          cart_items: additionalData?.cartItems || [],
          cart_value: additionalData?.cartValue || 0,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    case 'ORDER_SUCCESS': {
      if (!userData || !orderData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      // Check if repeat customer
      const orderCount = await Order.countDocuments({ user: userData._id });
      const isRepeatCustomer = orderCount > 1;
      
      // Generate invoice and send notifications
      const actions = [];
      const messages = [];
      
      // Always send invoice
      actions.push('send_invoice');
      
      // Notify admin
      actions.push('notify_admin');
      
      // If repeat customer, send VIP offer
      if (isRepeatCustomer) {
        const discountCode = generateDiscountCode(15, 'VIP');
        // Save discount code to database
        const savedCode = await saveDiscountCodeToDatabase(discountCode, 15, userData._id.toString(), 'VIP');
        actions.push('send_vip_offer');
        
        return {
          action: actions.join(','), // Multiple actions
          message: '', // AI will generate messages
          data: {
            order_id: orderData.orderId,
            customer_name: userName,
            customer_email: userEmail,
            customer_phone: userPhone,
            order_total: orderData.pricing?.total || 0,
            items: orderData.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              product_id: item.productId?._id || item.productId
            })),
            discount_code: savedCode,
            discount_percentage: 15,
            is_repeat_customer: true,
            order_count: orderCount,
            invoice_url: `/orders/${orderData._id}/invoice`,
            event_type: 'ORDER_SUCCESS',
            context: 'repeat_customer_vip_offer'
          }
        };
      }
      
      return {
        action: actions.join(','),
        message: '', // AI will generate messages
        data: {
          order_id: orderData.orderId,
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          order_total: orderData.pricing?.total || 0,
          items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            product_id: item.productId?._id || item.productId
          })),
          is_repeat_customer: false,
          order_count: orderCount,
          invoice_url: `/orders/${orderData._id}/invoice`,
          event_type: 'ORDER_SUCCESS',
          context: 'new_customer_order'
        }
      };
    }
    
    case 'ORDER_DELIVERED': {
      if (!userData || !orderData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      return {
        action: 'send_email',
        message: '', // AI will generate the message
        data: {
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          order_id: orderData.orderId,
          order_total: orderData.pricing?.total || 0,
          delivery_date: new Date().toISOString(),
          review_link: `/reviews?order=${orderData.orderId}`,
          items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity
          })),
          event_type: 'ORDER_DELIVERED',
          context: 'order_delivered_review_request'
        }
      };
    }
    
    case 'REVIEW_SUBMITTED': {
      if (!userData || !productData) {
        return {
          action: 'store_to_mongo',
          message: '',
          data: {
            event: 'REVIEW_SUBMITTED',
            product_id: productId,
            user_id: userId,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      const reviewDiscountCode = generateDiscountCode(5, 'REVIEW');
      // Save discount code to database
      const savedReviewCode = await saveDiscountCodeToDatabase(reviewDiscountCode, 5, userData._id.toString(), 'REVIEW');
      
      return {
        action: 'send_email',
        message: '', // AI will generate the message
        data: {
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          product_name: productData.name,
          product_id: productId,
          review_rating: additionalData?.rating || 0,
          review_text: additionalData?.reviewText || '',
          discount_code: savedReviewCode,
          discount_percentage: 5,
          event_type: 'REVIEW_SUBMITTED',
          context: 'review_thank_you_discount'
        }
      };
    }
    
    case 'PAGE_VISIT': {
      // Track page visits for analytics
      return {
        action: 'store_to_mongo',
        message: '',
        data: {
          event: 'PAGE_VISIT',
          user_id: userId,
          page: additionalData?.page || '',
          timestamp: new Date().toISOString()
        }
      };
    }
    
    case 'LOW_STOCK': {
      if (!productData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      return {
        action: 'low_stock_alert',
        message: '', // AI will generate the message
        data: {
          product_id: productId,
          product_name: productData.name,
          product_category: productData.category?.name,
          product_brand: productData.brand?.name,
          current_stock: productData.stock,
          low_stock_threshold: productData.lowStockThreshold || 20,
          sku: productData.sku,
          price: productData.salePrice || productData.price,
          event_type: 'LOW_STOCK',
          context: 'admin_low_stock_alert'
        }
      };
    }
    
    case 'RESTOCK': {
      if (!productData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      // Get users who had this product in wishlist or viewed it multiple times
      const wishlistUsers = await User.find({ wishlist: productId });
      
      if (wishlistUsers.length > 0) {
        return {
          action: 'send_restock_alert',
          message: '', // AI will generate the message
          data: {
            product_id: productId,
            product_name: productData.name,
            product_category: productData.category?.name,
            product_brand: productData.brand?.name,
            product_price: productData.salePrice || productData.price,
            new_stock: productData.stock,
            interested_users: wishlistUsers.map(u => ({
              user_id: u._id,
              email: u.email,
              name: u.name,
              phone: u.phone
            })),
            product_image: productData.images?.[0]?.url,
            product_url: `/shop/${productId}`,
            event_type: 'RESTOCK',
            context: 'product_back_in_stock_notification'
          }
        };
      }
      
      return {
        action: 'notify_admin',
        message: '', // AI will generate the message
        data: {
          product_id: productId,
          product_name: productData.name,
          product_category: productData.category?.name,
          stock: productData.stock,
          event_type: 'RESTOCK',
          context: 'admin_restock_notification'
        }
      };
    }
    
    case 'NEW_USER': {
      if (!userData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      const discountCode = generateDiscountCode(10, 'WELCOME');
      // Save discount code to database
      const savedCode = await saveDiscountCodeToDatabase(discountCode, 10, userData._id.toString(), 'WELCOME');
      
      return {
        action: 'send_email',
        message: '', // AI will generate the message
        data: {
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          discount_code: savedCode,
          discount_percentage: 10,
          welcome_message: true,
          event_type: 'NEW_USER',
          context: 'welcome_new_customer'
        }
      };
    }
    
    case 'RETURN_REQUEST': {
      if (!userData || !orderData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      return {
        action: 'start_return_process',
        message: '', // AI will generate the message
        data: {
          order_id: orderData.orderId,
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          order_total: orderData.pricing?.total || 0,
          return_reason: additionalData?.reason || '',
          return_items: additionalData?.items || [],
          return_request_id: additionalData?.returnRequestId || `RET-${Date.now()}`,
          event_type: 'RETURN_REQUEST',
          context: 'return_request_confirmation'
        }
      };
    }
    
    // Cart abandonment - triggered when checkout started but order not completed
    case 'CART_ABANDONED': {
      if (!userData) {
        return {
          action: 'nothing',
          message: '',
          data: {}
        };
      }
      
      const discountCode = generateDiscountCode(8, 'CART');
      // Save discount code to database
      const savedCartCode = await saveDiscountCodeToDatabase(discountCode, 8, userData._id.toString(), 'CART');
      const cartItems = additionalData?.cartItems || [];
      const cartValue = additionalData?.cartValue || 0;
      
      return {
        action: 'trigger_cart_recovery',
        message: '', // AI will generate the message
        data: {
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          discount_code: savedCartCode,
          discount_percentage: 8,
          cart_items: cartItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            product_id: item.productId || item.id
          })),
          cart_value: cartValue,
          cart_url: '/cart',
          event_type: 'CART_ABANDONED',
          context: 'cart_abandonment_recovery'
        }
      };
    }
    
    default:
      return {
        action: 'nothing',
        message: '',
        data: {
          event: eventType,
          message: 'Unknown event type'
        }
      };
  }
}

// POST endpoint to receive events
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { event, data } = body;
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }
    
    // Validate event type
    const validEvents = [
      'PRODUCT_VIEW',
      'ADD_TO_CART',
      'CHECKOUT_STARTED',
      'ORDER_SUCCESS',
      'ORDER_DELIVERED',
      'REVIEW_SUBMITTED',
      'PAGE_VISIT',
      'LOW_STOCK',
      'RESTOCK',
      'NEW_USER',
      'RETURN_REQUEST',
      'CART_ABANDONED'
    ];
    
    if (!validEvents.includes(event)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${validEvents.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Process the event
    const result = await processEvent(event, data || {});
    
    // Return the automation decision
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Automation brain error:', error);
    return NextResponse.json(
      {
        action: 'nothing',
        message: '',
        data: {
          error: error.message
        }
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Looklify Automation Brain',
    version: '1.0.0',
    supported_events: [
      'PRODUCT_VIEW',
      'ADD_TO_CART',
      'CHECKOUT_STARTED',
      'ORDER_SUCCESS',
      'ORDER_DELIVERED',
      'REVIEW_SUBMITTED',
      'PAGE_VISIT',
      'LOW_STOCK',
      'RESTOCK',
      'NEW_USER',
      'RETURN_REQUEST',
      'CART_ABANDONED'
    ]
  });
}

