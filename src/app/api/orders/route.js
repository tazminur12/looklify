import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import PromoCode from '@/models/PromoCode';

// GET /api/orders - Get all orders (admin/staff) or user's orders
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Build query
    let query = {};

    // If user is admin/staff, they can see all orders or filter by userId
    // If user is customer, they can only see their own orders
    const isAdminOrStaff = ['Super Admin', 'Admin', 'Staff', 'Support'].includes(session.user.role);
    
    if (isAdminOrStaff) {
      if (userId) {
        query.user = userId;
      }
    } else {
      // Customer can only see their own orders
      query.user = session.user.id;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.productId', 'name sku stock')
      .populate('promoCode', 'code name type value')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { items, shipping, payment, pricing, promoCode } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    if (!shipping || !payment || !pricing) {
      return NextResponse.json(
        { error: 'Shipping, payment, and pricing information are required' },
        { status: 400 }
      );
    }

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found` },
          { status: 404 }
        );
      }

      if (product.inventory?.trackInventory && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }
    }

    // Update promo code usage if applicable
    let promoCodeDoc = null;
    if (promoCode) {
      promoCodeDoc = await PromoCode.findOne({ code: promoCode.toUpperCase() });
      if (promoCodeDoc) {
        promoCodeDoc.usedCount = (promoCodeDoc.usedCount || 0) + 1;
        await promoCodeDoc.save();
      }
    }

    // Deduct stock from products
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product && product.inventory?.trackInventory) {
        product.stock -= item.quantity;
        product.soldCount = (product.soldCount || 0) + item.quantity;
        await product.save();
      }
    }

    // Create order (orderId will be auto-generated in pre-save hook)
    const order = new Order({
      user: session.user.id,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        sku: item.sku || ''
      })),
      shipping: {
        fullName: shipping.fullName,
        email: shipping.email,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        postalCode: shipping.postalCode,
        deliveryNotes: shipping.deliveryNotes || '',
        location: shipping.location
      },
      payment: {
        method: payment.method === 'bkash_api' ? 'online' : payment.method,
        status: payment.method === 'cod' ? 'pending' : 'processing',
        provider: payment.provider || null,
        phoneNumber: payment.phoneNumber || null,
        transactionId: payment.transactionId || null
      },
      pricing: {
        subtotal: pricing.subtotal,
        tax: pricing.tax || 0,
        shipping: pricing.shipping,
        discount: pricing.discount || 0,
        total: pricing.total
      },
      promoCode: promoCodeDoc?._id || null,
      promoCodeString: promoCode || null,
      status: 'pending'
    });

    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.productId', 'name sku stock')
      .populate('promoCode', 'code name type value')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: populatedOrder
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}

