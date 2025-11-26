import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET /api/products/[id] - Get a single product by ID
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

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

    const { id } = await params;
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

    // Explicitly ensure boolean flags are properly set (handle false values)
    // This ensures that false values are saved correctly to MongoDB
    if ('isFeatured' in body) {
      body.isFeatured = Boolean(body.isFeatured);
    }
    if ('isBestSeller' in body) {
      body.isBestSeller = Boolean(body.isBestSeller);
    }
    if ('isNewArrival' in body) {
      body.isNewArrival = Boolean(body.isNewArrival);
    }
    if ('isOfferProduct' in body) {
      body.isOfferProduct = Boolean(body.isOfferProduct);
    }

    // Prepare update object - start with body copy
    const updateData = { ...body };
    
    // Remove special fields that shouldn't be updated
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;

    // Explicitly ensure boolean flags are set (even if false) - do this AFTER copying body
    // This ensures boolean values override any undefined/null values
    if ('isFeatured' in body) {
      updateData.isFeatured = Boolean(body.isFeatured);
    }
    if ('isBestSeller' in body) {
      updateData.isBestSeller = Boolean(body.isBestSeller);
    }
    if ('isNewArrival' in body) {
      updateData.isNewArrival = Boolean(body.isNewArrival);
    }
    if ('isOfferProduct' in body) {
      updateData.isOfferProduct = Boolean(body.isOfferProduct);
    }

    // Use native MongoDB driver to ensure field is saved
    const db = mongoose.connection.db;
    const collectionName = Product.collection.name; // Get actual collection name
    const collection = db.collection(collectionName);
    
    // Convert ObjectId string to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);
    
    // Update using native MongoDB driver
    const updateResult = await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Now fetch the updated product
    const updatedProduct = await Product.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('brand', 'name')
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .lean();

    if (!updatedProduct) {
      return NextResponse.json(
        { error: 'Product not found after update' },
        { status: 404 }
      );
    }

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

    const { id } = await params;

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
