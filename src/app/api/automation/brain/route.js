import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import PromoCode from '@/models/PromoCode';
import mongoose from 'mongoose';

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

    // Get createdBy user ID - use provided userId if valid, otherwise find an admin user
    let createdByUserId = null;
    
    // Check if userId is valid ObjectId
    if (userId && userId !== '' && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) {
        createdByUserId = user._id;
      }
    }
    
    // If no valid userId, find an admin user to use as createdBy
    if (!createdByUserId) {
      const adminUser = await User.findOne({ 
        role: { $in: ['Super Admin', 'Admin'] },
        isActive: true 
      }).select('_id');
      
      if (adminUser) {
        createdByUserId = adminUser._id;
      } else {
        // Last resort: find any active user
        const anyUser = await User.findOne({ isActive: true }).select('_id');
        if (anyUser) {
          createdByUserId = anyUser._id;
        }
      }
    }
    
    // If still no user found, throw error
    if (!createdByUserId) {
      throw new Error('No valid user found to set as createdBy for promo code');
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
      applicableUsers: userId && mongoose.Types.ObjectId.isValid(userId) 
        ? [new mongoose.Types.ObjectId(userId)] 
        : [], // If userId provided, make it user-specific
      status: 'active',
      autoApply: false,
      createdBy: createdByUserId // Set the required createdBy field
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
    try {
      // Skip if userId is empty string or invalid
      if (!userId || userId === '' || userId === 'N/A') {
        console.log('⚠️ Invalid userId provided, skipping user fetch');
      } else {
        // Try finding by MongoDB _id first (ObjectId)
        if (mongoose.Types.ObjectId.isValid(userId)) {
          userData = await User.findById(userId);
        }
        
        // If not found, try finding by email or other fields
        if (!userData && typeof userId === 'string') {
          // Try as email
          if (userId.includes('@')) {
            userData = await User.findOne({ email: userId });
          }
        }
      }
      
      console.log('🔍 User fetch result:', {
        userId,
        isValid: userId && userId !== '' && userId !== 'N/A',
        found: !!userData,
        userEmail: userData?.email || 'N/A',
        userName: userData?.name || 'N/A'
      });
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      userData = null;
    }
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
    try {
      // Skip if orderId is empty string or invalid
      if (!orderId || orderId === '' || orderId === 'N/A') {
        console.log('⚠️ Invalid orderId provided, skipping order fetch');
      } else {
        // Try finding by MongoDB _id first (ObjectId)
        if (mongoose.Types.ObjectId.isValid(orderId)) {
          orderData = await Order.findById(orderId)
            .populate('items.productId')
            .populate('user');
        }
        
        // If not found by _id, try finding by orderId string field
        if (!orderData && typeof orderId === 'string') {
          orderData = await Order.findOne({ orderId: orderId })
            .populate('items.productId')
            .populate('user');
        }
      }
      
      console.log('🔍 Order fetch result:', {
        orderId,
        isValidObjectId: orderId ? mongoose.Types.ObjectId.isValid(orderId) : false,
        found: !!orderData,
        customerEmail: orderData?.shipping?.email || 'N/A',
        customerName: orderData?.shipping?.fullName || 'N/A',
        orderTotal: orderData?.pricing?.total || 0
      });
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      orderData = null;
    }
  }
  
  // If user not found but order has user reference, try to populate (after order fetch)
  if (!userData && orderData?.user) {
    if (typeof orderData.user === 'object') {
      userData = orderData.user;
    } else if (mongoose.Types.ObjectId.isValid(orderData.user)) {
      userData = await User.findById(orderData.user);
    }
  }
  
  // Try to get user info either from DB, order data, or from additionalData (fallback)
  // Note: These are fallback values, ORDER_SUCCESS case will override with more specific logic
  const userName =
    userData?.name ||
    orderData?.shipping?.fullName ||
    additionalData?.customerName ||
    additionalData?.customer_name ||
    additionalData?.name ||
    'there';

  const userEmail =
    userData?.email ||
    orderData?.shipping?.email ||
    additionalData?.customerEmail ||
    additionalData?.customer_email ||
    additionalData?.email ||
    '';

  const userPhone =
    userData?.phone ||
    orderData?.shipping?.phone ||
    additionalData?.customerPhone ||
    additionalData?.customer_phone ||
    additionalData?.phone ||
    '';
  
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
      // Be tolerant: even if user/order not fully loaded, still try to send emails
      const safeOrder = orderData || {};
      
      // Get email from multiple sources (order shipping, user, additionalData)
      const finalUserEmail = 
        orderData?.shipping?.email || 
        userData?.email || 
        additionalData?.customerEmail || 
        additionalData?.email || 
        '';
      
      const finalUserName = 
        orderData?.shipping?.fullName || 
        userData?.name || 
        additionalData?.customerName || 
        additionalData?.name || 
        'there';
      
      const finalUserPhone = 
        orderData?.shipping?.phone || 
        userData?.phone || 
        additionalData?.customerPhone || 
        additionalData?.phone || 
        '';
      
      const finalOrderTotal = 
        orderData?.pricing?.total || 
        additionalData?.orderTotal || 
        0;
      
      console.log('📦 ORDER_SUCCESS processing:', {
        hasOrderData: !!orderData,
        orderId: orderId,
        orderDataOrderId: orderData?.orderId,
        orderDataId: orderData?._id,
        hasUserData: !!userData,
        userId: userId,
        finalUserEmail: finalUserEmail,
        finalUserName: finalUserName,
        orderTotal: finalOrderTotal,
        shippingEmail: orderData?.shipping?.email,
        shippingFullName: orderData?.shipping?.fullName,
        additionalDataKeys: Object.keys(additionalData || {})
      });
      
      // Check if repeat customer only when we have a user
      let orderCount = 0;
      let isRepeatCustomer = false;
      if (userData) {
        orderCount = await Order.countDocuments({ user: userData._id });
        isRepeatCustomer = orderCount > 1;
      }

      // If we don't have a valid customer email, still return action but with store_to_mongo
      // This ensures the workflow continues and can route to AI Agent for decision making
      if (!finalUserEmail || typeof finalUserEmail !== 'string' || !finalUserEmail.includes('@')) {
        console.log('⚠️ No valid customer email found, but still routing to AI Agent for decision');
        return {
          action: 'store_to_mongo', // Changed from 'nothing' to allow routing
          message: '',
          data: {
            order_id: safeOrder.orderId || orderId || additionalData?.orderIdString || '',
            customer_name: finalUserName,
            customer_email: finalUserEmail || '',
            customer_phone: finalUserPhone || '',
            order_total: finalOrderTotal,
            items: (safeOrder.items || []).map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              product_id: item.productId?._id || item.productId
            })),
            is_repeat_customer: isRepeatCustomer,
            order_count: orderCount,
            invoice_url: `/orders/${safeOrder._id || orderId || ''}/invoice`,
            event_type: 'ORDER_SUCCESS',
            context: isRepeatCustomer ? 'repeat_customer_vip_offer' : 'new_customer_order',
            has_valid_email: false
          }
        };
      }
      
      console.log('✅ Valid customer email found, proceeding with email actions');

      // IMPORTANT: Invoice must ALWAYS be sent for EVERY order (new or repeat customer)
      // For repeat customers, we ALSO send VIP offer
      // 
      // Strategy for repeat customers:
      // 1. Return action: 'send_invoice send_vip_offer' (space-separated)
      //    - "Route Actions" switch uses "contains" operation
      //    - This matches BOTH outputs: send_invoice (contains "send_invoice") AND send_vip_offer (contains "send_vip_offer")
      //    - Both routes go to separate AI Agent instances
      // 2. Set explicit data flags: send_invoice: true, send_vip_offer: true
      //    - "Route Messages" switch checks both action AND data flags as backup
      //    - This ensures both emails are sent even if action parsing fails
      //
      // Strategy for new customers:
      // 1. Return action: 'send_invoice' only
      // 2. Set send_invoice: true flag
      //    - Invoice email will be sent, no VIP offer
      
      const baseInvoiceData = {
        order_id: safeOrder.orderId || orderId || additionalData?.orderIdString || '',
        customer_name: finalUserName,
        customer_email: finalUserEmail,
        customer_phone: finalUserPhone,
        order_total: finalOrderTotal,
        items: (safeOrder.items || []).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          product_id: item.productId?._id || item.productId
        })),
        invoice_url: `/orders/${safeOrder._id || orderId || ''}/invoice`,
        event_type: 'ORDER_SUCCESS',
        has_valid_email: true,
        // Always set send_invoice flag to ensure invoice is sent
        send_invoice: true
      };

      // If repeat customer, also prepare VIP offer data
      if (isRepeatCustomer) {
        const discountCode = generateDiscountCode(15, 'VIP');
        // Save discount code to database (best-effort)
        const savedCode = await saveDiscountCodeToDatabase(
          discountCode,
          15,
          userData?._id?.toString() || '',
          'VIP'
        );
        
        const repeatCustomerResponse = {
          // CRITICAL: Space-separated actions ensure BOTH outputs match in "Route Actions" switch
          // Format: 'send_invoice send_vip_offer'
          // - Matches send_invoice output (contains "send_invoice") ✓
          // - Matches send_vip_offer output (contains "send_vip_offer") ✓
          // Both will route to separate AI Agent instances, then to respective email nodes
          action: 'send_invoice send_vip_offer',
          message: '', // AI will generate messages
          data: {
            // CRITICAL: Put routing flags FIRST so they're less likely to be filtered/modified
            // "Route Messages" switch checks: $json.data.send_invoice === true (boolean)
            // These MUST be at the top and MUST be boolean true
            send_invoice: true,  // CRITICAL: Invoice always goes - Route Messages checks this FIRST
            send_vip_offer: true, // CRITICAL: VIP offer for repeat customers - Route Messages checks this
            
            // Store action in data as backup (Route Messages can check data.action too)
            action: 'send_invoice send_vip_offer', // Backup action in data object
            original_action: 'send_invoice send_vip_offer',
            action_backup: 'send_invoice send_vip_offer',
            
            // Spread base invoice data
            ...baseInvoiceData,
            
            // VIP offer specific data
            discount_code: savedCode,
            discount_percentage: 15,
            is_repeat_customer: true,
            order_count: orderCount,
            context: 'repeat_customer_vip_offer',
            
            // Additional backup flags (multiple formats to ensure routing works)
            send_invoice_num: 1,  // Numeric backup
            send_vip_offer_num: 1,
            send_invoice_str: 'true',  // String backup
            send_vip_offer_str: 'true',
            
            // Helper flags for workflow
            requires_both_emails: true,
            invoice_required: true,
            vip_offer_required: true,
            email_type: 'invoice_and_vip',
            send_both: true
          }
        };
        
        console.log('📧✅ Repeat customer - Sending BOTH invoice AND VIP offer:', {
          action: repeatCustomerResponse.action,
          actionContainsInvoice: repeatCustomerResponse.action.includes('send_invoice'),
          actionContainsVip: repeatCustomerResponse.action.includes('send_vip_offer'),
          sendInvoiceFlag: repeatCustomerResponse.data.send_invoice,
          sendVipOfferFlag: repeatCustomerResponse.data.send_vip_offer,
          customerEmail: finalUserEmail,
          orderId: baseInvoiceData.order_id,
          orderTotal: finalOrderTotal
        });
        
        return repeatCustomerResponse;
      }
      
      const newCustomerResponse = {
        action: 'send_invoice', // CRITICAL: Invoice must ALWAYS be sent for every order
        message: '', // AI will generate messages
        data: {
          // CRITICAL: Put routing flag FIRST so it's less likely to be filtered/modified
          // "Route Messages" switch checks: $json.data.send_invoice === true (boolean)
          // This MUST be at the top and MUST be boolean true
          send_invoice: true,  // CRITICAL: Invoice always goes - Route Messages checks this FIRST
          
          // Store action in data as backup (Route Messages can check data.action too)
          action: 'send_invoice', // Backup action in data object
          original_action: 'send_invoice',
          action_backup: 'send_invoice',
          
          // Spread base invoice data
          ...baseInvoiceData,
          
          // Customer info
          is_repeat_customer: false,
          order_count: orderCount,
          context: 'new_customer_order',
          
          // Additional backup flags (multiple formats to ensure routing works)
          send_invoice_num: 1,  // Numeric backup
          send_invoice_str: 'true',  // String backup
          
          // Helper flags
          invoice_required: true,
          email_type: 'invoice_only',
          send_vip_offer: false // No VIP offer for new customers
        }
      };
      
      console.log('📧✅ New customer - Sending invoice only (no VIP offer):', {
        action: newCustomerResponse.action,
        sendInvoiceFlag: newCustomerResponse.data.send_invoice,
        sendVipOfferFlag: newCustomerResponse.data.send_vip_offer,
        customerEmail: finalUserEmail,
        orderId: baseInvoiceData.order_id,
        orderTotal: finalOrderTotal
      });
      
      return newCustomerResponse;
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
    
    // Log raw body for debugging
    console.log('📥 Raw request body received:', {
      bodyKeys: Object.keys(body),
      bodyType: typeof body,
      body: JSON.stringify(body, null, 2).substring(0, 1000) // First 1000 chars
    });
    
    // Handle n8n webhook wrapper format - n8n wraps the actual payload in body.body
    // When called from n8n test mode or webhook, the structure is:
    // { headers: {...}, params: {...}, query: {...}, body: { event, userId, ... }, webhookUrl: "...", executionMode: "..." }
    const actualPayload = body.body && typeof body.body === 'object' && !body.body.body 
      ? body.body  // n8n webhook wrapper - actual data is in body.body
      : body;      // Direct call - data is at root level
    
    const { event, data } = actualPayload;
    
    // Handle multiple formats:
    // 1. { event, data: {...} } - nested format from n8n
    // 2. { event, userId, orderId, ... } - flat format
    // 3. Direct fields at root level
    const rawData = data || actualPayload;
    
    // If we have data nested, use it; otherwise check if main fields are at root level
    // This handles cases where n8n sends { event, data: { userId, ... } } or { event, userId, ... }
    
    // Normalize data keys (handle both camelCase and snake_case)
    // Also filter out empty strings and convert to null
    const normalizeValue = (value) => {
      if (value === null || value === undefined || value === '') return null;
      if (value === 'N/A' || value === 'null' || value === 'undefined') return null;
      // Convert string 'null' to actual null
      if (typeof value === 'string' && value.toLowerCase() === 'null') return null;
      // If it's a string that looks like "null", convert it
      if (typeof value === 'string' && value.trim() === 'null') return null;
      return value;
    };
    
    // Extract additionalData first - check multiple possible locations
    // Make sure we preserve the full additionalData object even if it's nested
    let extractedAdditionalData = {};
    
    if (rawData?.additionalData && typeof rawData.additionalData === 'object') {
      extractedAdditionalData = { ...rawData.additionalData };
    } else if (rawData?.additional_data && typeof rawData.additional_data === 'object') {
      extractedAdditionalData = { ...rawData.additional_data };
    } else if (actualPayload?.additionalData && typeof actualPayload.additionalData === 'object') {
      extractedAdditionalData = { ...actualPayload.additionalData };
    } else if (actualPayload?.additional_data && typeof actualPayload.additional_data === 'object') {
      extractedAdditionalData = { ...actualPayload.additional_data };
    }
    
    // Build normalized data with priority: main fields > additionalData fields
    // Also check actualPayload directly in case data is at root level
    const normalizedData = {
      userId: normalizeValue(
        rawData?.userId || 
        rawData?.user_id || 
        actualPayload?.userId ||
        actualPayload?.user_id ||
        extractedAdditionalData?.userId || 
        extractedAdditionalData?.user_id
      ),
      orderId: normalizeValue(
        rawData?.orderId || 
        rawData?.order_id || 
        actualPayload?.orderId ||
        actualPayload?.order_id ||
        extractedAdditionalData?.orderId || 
        extractedAdditionalData?.order_id ||
        extractedAdditionalData?.orderIdString
      ),
      productId: normalizeValue(
        rawData?.productId || 
        rawData?.product_id || 
        actualPayload?.productId ||
        actualPayload?.product_id ||
        extractedAdditionalData?.productId || 
        extractedAdditionalData?.product_id
      ),
      additionalData: extractedAdditionalData
    };
    
    // Merge any other fields from rawData into additionalData for fallback
    const fieldsToIgnore = ['userId', 'user_id', 'orderId', 'order_id', 'productId', 'product_id', 'additionalData', 'additional_data', 'event', 'data'];
    Object.keys(rawData || {}).forEach(key => {
      if (!fieldsToIgnore.includes(key)) {
        if (normalizedData.additionalData[key] === undefined || normalizedData.additionalData[key] === null) {
          const value = rawData[key];
          if (value !== null && value !== undefined && value !== '') {
            normalizedData.additionalData[key] = value;
          }
        }
      }
    });
    
    // Also merge from actualPayload if different from rawData
    if (data && actualPayload !== rawData) {
      Object.keys(actualPayload || {}).forEach(key => {
        if (!fieldsToIgnore.includes(key)) {
          if (normalizedData.additionalData[key] === undefined || normalizedData.additionalData[key] === null) {
            const value = actualPayload[key];
            if (value !== null && value !== undefined && value !== '') {
              normalizedData.additionalData[key] = value;
            }
          }
        }
      });
    }
    
    // Clean up additionalData - remove null/undefined/empty values
    Object.keys(normalizedData.additionalData).forEach(key => {
      const value = normalizedData.additionalData[key];
      if (value === null || value === undefined || value === '' || value === 'null' || value === 'undefined') {
        delete normalizedData.additionalData[key];
      }
    });
    
    console.log('📥 Automation Brain API called:', {
      event,
      hasData: !!rawData,
      rawDataKeys: rawData ? Object.keys(rawData) : [],
      actualPayloadKeys: Object.keys(actualPayload || {}),
      isN8nWrapper: !!body.body && body.body !== body,
      hasNestedData: !!data,
      normalizedOrderId: normalizedData.orderId || 'N/A',
      normalizedUserId: normalizedData.userId || 'N/A',
      normalizedProductId: normalizedData.productId || 'N/A',
      hasAdditionalData: !!normalizedData.additionalData && Object.keys(normalizedData.additionalData).length > 0,
      additionalDataKeys: normalizedData.additionalData ? Object.keys(normalizedData.additionalData) : [],
      normalizedData: JSON.stringify(normalizedData, null, 2)
    });
    
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
    
    // Process the event with normalized data
    const result = await processEvent(event, normalizedData);
    
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

