import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

// Helper function to generate discount codes
function generateDiscountCode(percentage, prefix = 'LOOK') {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${percentage}${random}`;
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
          message: `${getPersonalizedGreeting(userName)}, I noticed you're interested in ${productData?.name || 'this product'}. Here are some perfect matches for your skincare routine ✨`,
          data: {
            product_id: productId,
            product_name: productData?.name,
            recommendations: recommendations.map(p => ({
              id: p._id,
              name: p.name,
              price: p.salePrice || p.price,
              image: p.images?.[0]?.url,
              brand: p.brand?.name
            }))
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
          message: `Hi ${userName}! Great choice adding ${productData?.name || 'this product'} to your cart 🛒 Your skincare journey starts here! Complete your order and get glowing skin ✨`,
          data: {
            customer_name: userName,
            customer_email: userEmail,
            product_name: productData?.name,
            cart_value: cartValue,
            subject: `Your ${productData?.name || 'product'} is waiting in your cart!`
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
      messages.push(`Hi ${userName}! 🎉 Your order ${orderData.orderId} has been confirmed! We're preparing your skincare essentials with love. Here's your invoice 📧`);
      
      // Notify admin
      actions.push('notify_admin');
      
      // If repeat customer, send VIP offer
      if (isRepeatCustomer) {
        const discountCode = generateDiscountCode(15, 'VIP');
        actions.push('send_vip_offer');
        messages.push(`As a valued customer, here's an exclusive 15% off your next order! Use code ${discountCode} ❤️`);
        
        return {
          action: actions.join(','), // Multiple actions
          message: messages.join(' '),
          data: {
            order_id: orderData.orderId,
            customer_name: userName,
            customer_email: userEmail,
            customer_phone: userPhone,
            order_total: orderData.pricing?.total || 0,
            items: orderData.items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            discount_code: discountCode,
            is_repeat_customer: true,
            order_count: orderCount,
            invoice_url: `/orders/${orderData._id}/invoice`
          }
        };
      }
      
      return {
        action: actions.join(','),
        message: messages.join(' '),
        data: {
          order_id: orderData.orderId,
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          order_total: orderData.pricing?.total || 0,
          items: orderData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          is_repeat_customer: false,
          invoice_url: `/orders/${orderData._id}/invoice`
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
        message: `Hi ${userName}! 🎊 Your order ${orderData.orderId} has been delivered! We hope you love your new skincare products. Share your glow with us by leaving a review ⭐`,
        data: {
          customer_name: userName,
          customer_email: userEmail,
          order_id: orderData.orderId,
          delivery_date: new Date().toISOString(),
          review_link: `/reviews?order=${orderData.orderId}`,
          subject: 'Your Looklify order has been delivered! ✨'
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
      
      return {
        action: 'send_email',
        message: `Thank you ${userName} for your review! 💜 Your feedback helps us serve you better. As a token of appreciation, here's a special offer on your next purchase 🎁`,
        data: {
          customer_name: userName,
          customer_email: userEmail,
          product_name: productData.name,
          review_rating: additionalData?.rating || 0,
          discount_code: generateDiscountCode(5, 'REVIEW'),
          subject: 'Thank you for your review!'
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
        message: `⚠️ Low Stock Alert: ${productData.name} is running low (${productData.stock} units remaining). Consider restocking soon!`,
        data: {
          product_id: productId,
          product_name: productData.name,
          current_stock: productData.stock,
          low_stock_threshold: productData.lowStockThreshold || 20,
          sku: productData.sku
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
          message: `Great news! ${productData.name} is back in stock! 🎉 Get yours before it's gone again ✨`,
          data: {
            product_id: productId,
            product_name: productData.name,
            new_stock: productData.stock,
            interested_users: wishlistUsers.map(u => ({
              user_id: u._id,
              email: u.email,
              name: u.name
            })),
            product_image: productData.images?.[0]?.url,
            product_url: `/shop/${productId}`
          }
        };
      }
      
      return {
        action: 'notify_admin',
        message: `Product ${productData.name} has been restocked (${productData.stock} units)`,
        data: {
          product_id: productId,
          product_name: productData.name,
          stock: productData.stock
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
      
      return {
        action: 'send_email',
        message: `Welcome to Looklify, ${userName}! 🌟 We're so excited to have you join our skincare family. Start your journey to glowing skin with 10% off your first order! Use code ${discountCode} at checkout 💜`,
        data: {
          customer_name: userName,
          customer_email: userEmail,
          discount_code: discountCode,
          discount_percentage: 10,
          welcome_message: true,
          subject: 'Welcome to Looklify! Your skincare journey starts here ✨'
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
        message: `Hi ${userName}, we've received your return request for order ${orderData.orderId}. Our team will review it and get back to you within 24-48 hours. We're here to help! 💜`,
        data: {
          order_id: orderData.orderId,
          customer_name: userName,
          customer_email: userEmail,
          customer_phone: userPhone,
          return_reason: additionalData?.reason || '',
          return_items: additionalData?.items || [],
          return_request_id: additionalData?.returnRequestId || `RET-${Date.now()}`
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
      const cartItems = additionalData?.cartItems || [];
      const cartValue = additionalData?.cartValue || 0;
      
      return {
        action: 'trigger_cart_recovery',
        message: `Hi ${userName}, you left some amazing products in your cart! 💔 Don't miss out on your skincare essentials. Complete your order now and save 8% with code ${discountCode} ❤️`,
        data: {
          customer_name: userName,
          customer_email: userEmail,
          discount_code: discountCode,
          discount_percentage: 8,
          cart_items: cartItems.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          cart_value: cartValue,
          cart_url: '/cart'
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

