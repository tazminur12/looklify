import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// GET /api/orders/[id] - Get single order
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('items.productId', 'name sku stock')
      .populate('promoCode', 'code name type value');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isAdminOrStaff = ['Super Admin', 'Admin', 'Staff', 'Support'].includes(session.user.role);
    const isOwner = order.user && order.user._id?.toString() === session.user.id;
    if (!isAdminOrStaff && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order', details: error.message }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Update order (admin/staff only)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminOrStaff = ['Super Admin', 'Admin', 'Staff', 'Support'].includes(session.user.role);
    if (!isAdminOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, trackingNumber, notes } = body;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order fields
    if (typeof status === 'string' && status.length > 0) {
      await order.updateStatus(status, notes || '');
    } else if (typeof notes === 'string') {
      order.notes = notes;
    }

    if (typeof trackingNumber === 'string') {
      order.trackingNumber = trackingNumber || null;
    }

    if (typeof paymentStatus === 'string') {
      order.payment = order.payment || {};
      order.payment.status = paymentStatus;
      if (paymentStatus === 'completed' && !order.payment.paidAt) {
        order.payment.paidAt = new Date();
      }
      if (paymentStatus !== 'completed') {
        order.payment.paidAt = null;
      }
    }

    await order.save();

    const populated = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.productId', 'name sku stock')
      .populate('promoCode', 'code name type value')
      .lean();

    return NextResponse.json({ success: true, message: 'Order updated', data: populated }, { status: 200 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order', details: error.message }, { status: 500 });
  }
}


