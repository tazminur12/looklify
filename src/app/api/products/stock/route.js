import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// PUT /api/products/stock - Update product stock
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { productId, quantity, operation = 'set' } = body;

    // Validate required fields
    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Validate operation
    if (!['set', 'add', 'subtract'].includes(operation)) {
      return NextResponse.json(
        { error: 'Operation must be set, add, or subtract' },
        { status: 400 }
      );
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate new stock
    let newStock;
    switch (operation) {
      case 'set':
        newStock = quantity;
        break;
      case 'add':
        newStock = product.stock + quantity;
        break;
      case 'subtract':
        newStock = product.stock - quantity;
        if (newStock < 0 && product.inventory.trackInventory) {
          return NextResponse.json(
            { error: 'Insufficient stock' },
            { status: 400 }
          );
        }
        break;
    }

    // Update product stock
    product.stock = newStock;
    product.updatedBy = session.user.id;

    // Update status based on stock
    if (newStock === 0) {
      product.status = 'out_of_stock';
    } else if (newStock <= product.lowStockThreshold) {
      product.status = 'low_stock';
    } else if (product.status === 'out_of_stock' || product.status === 'low_stock') {
      product.status = 'active';
    }

    await product.save();

    // Populate the updated product
    const updatedProduct = await Product.findById(product._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Stock updated successfully'
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock', details: error.message },
      { status: 500 }
    );
  }
}
