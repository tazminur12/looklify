import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET /api/products/[id] - Get a single product by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If SKU is being updated, check for duplicates
    if (body.sku && body.sku !== existingProduct.sku) {
      const duplicateProduct = await Product.findOne({ 
        sku: body.sku.toUpperCase(),
        _id: { $ne: id }
      });
      
      if (duplicateProduct) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        );
      }
      
      body.sku = body.sku.toUpperCase();
    }

    // Handle pricing structure for update
    if (body.regularPrice) {
      // If we have a salePrice, use it as the display price (for backward compatibility)
      if (body.salePrice) {
        body.price = body.salePrice;
      } else if (!body.price && !existingProduct.price) {
        // If only regularPrice, use it as price for backward compatibility
        body.price = body.regularPrice;
      }
    }

    // Add updatedBy field
    body.updatedBy = session.user.id;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .lean();

    return NextResponse.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}
