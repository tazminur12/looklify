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
    
    // Handle optional fields - set to null/undefined if empty to avoid ObjectId casting errors
    if ('brand' in body) {
      if (!body.brand || body.brand === '' || body.brand === null) {
        updateData.brand = null;
      } else if (mongoose.Types.ObjectId.isValid(body.brand)) {
        // Only set if it's a valid ObjectId
        updateData.brand = new mongoose.Types.ObjectId(body.brand);
      } else {
        // Invalid ObjectId, set to null
        updateData.brand = null;
      }
    }
    
    // Handle category field - ensure it's properly converted to ObjectId
    if ('category' in body) {
      if (!body.category || body.category === '' || body.category === null) {
        // Category is required, don't allow null
        return NextResponse.json(
          { error: 'Category is required' },
          { status: 400 }
        );
      } else if (mongoose.Types.ObjectId.isValid(body.category)) {
        // Convert to ObjectId to ensure proper type
        updateData.category = new mongoose.Types.ObjectId(body.category);
      } else {
        return NextResponse.json(
          { error: 'Invalid category ID' },
          { status: 400 }
        );
      }
    }
    
    if ('subcategory' in body) {
      if (!body.subcategory || body.subcategory === '' || body.subcategory === null) {
        updateData.subcategory = null;
      } else if (mongoose.Types.ObjectId.isValid(body.subcategory)) {
        // Only set if it's a valid ObjectId
        updateData.subcategory = new mongoose.Types.ObjectId(body.subcategory);
      } else {
        // Invalid ObjectId, set to null
        updateData.subcategory = null;
      }
    }
    
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

    // Convert ObjectId fields in updateData to proper ObjectId instances for native MongoDB driver
    const mongoUpdateData = { ...updateData };
    if (mongoUpdateData.category && mongoose.Types.ObjectId.isValid(mongoUpdateData.category)) {
      mongoUpdateData.category = new mongoose.Types.ObjectId(mongoUpdateData.category);
    }
    if (mongoUpdateData.brand && mongoose.Types.ObjectId.isValid(mongoUpdateData.brand)) {
      mongoUpdateData.brand = new mongoose.Types.ObjectId(mongoUpdateData.brand);
    }
    if (mongoUpdateData.subcategory && mongoose.Types.ObjectId.isValid(mongoUpdateData.subcategory)) {
      mongoUpdateData.subcategory = new mongoose.Types.ObjectId(mongoUpdateData.subcategory);
    }
    if (mongoUpdateData.updatedBy && mongoose.Types.ObjectId.isValid(mongoUpdateData.updatedBy)) {
      mongoUpdateData.updatedBy = new mongoose.Types.ObjectId(mongoUpdateData.updatedBy);
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
      { $set: mongoUpdateData }
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
