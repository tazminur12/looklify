import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';

// GET /api/promo-codes/[id] - Get a specific promo code
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['Admin', 'Super Admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;

    const promoCode = await PromoCode.findById(id)
      .populate('applicableProducts', 'name sku price')
      .populate('applicableCategories', 'name')
      .populate('applicableBrands', 'name')
      .populate('excludedProducts', 'name sku')
      .populate('excludedCategories', 'name')
      .populate('excludedBrands', 'name')
      .populate('applicableUsers', 'name email')
      .populate('excludedUsers', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: promoCode
    });

  } catch (error) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo code' },
      { status: 500 }
    );
  }
}

// PUT /api/promo-codes/[id] - Update a specific promo code
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['Admin', 'Super Admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Validate date range if dates are being updated
    if (body.validFrom && body.validUntil) {
      const validFromDate = new Date(body.validFrom);
      const validUntilDate = new Date(body.validUntil);
      
      if (validFromDate >= validUntilDate) {
        return NextResponse.json(
          { success: false, error: 'Valid from date must be before valid until date' },
          { status: 400 }
        );
      }
    }

    // Validate percentage value
    if (body.type === 'percentage' && body.value > 100) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    // Check if code is being changed and if it already exists
    if (body.code && body.code !== promoCode.code) {
      const existingPromoCode = await PromoCode.findOne({ 
        code: body.code.toUpperCase(),
        _id: { $ne: id }
      });
      if (existingPromoCode) {
        return NextResponse.json(
          { success: false, error: 'Promo code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate referenced IDs
    if (body.applicableProducts && body.applicableProducts.length > 0) {
      const validProducts = await Product.find({ _id: { $in: body.applicableProducts } });
      if (validProducts.length !== body.applicableProducts.length) {
        return NextResponse.json(
          { success: false, error: 'Some products are invalid' },
          { status: 400 }
        );
      }
    }

    if (body.applicableCategories && body.applicableCategories.length > 0) {
      const validCategories = await Category.find({ _id: { $in: body.applicableCategories } });
      if (validCategories.length !== body.applicableCategories.length) {
        return NextResponse.json(
          { success: false, error: 'Some categories are invalid' },
          { status: 400 }
        );
      }
    }

    if (body.applicableBrands && body.applicableBrands.length > 0) {
      const validBrands = await Brand.find({ _id: { $in: body.applicableBrands } });
      if (validBrands.length !== body.applicableBrands.length) {
        return NextResponse.json(
          { success: false, error: 'Some brands are invalid' },
          { status: 400 }
        );
      }
    }

    // Update promo code
    const updateData = {
      ...body,
      updatedBy: session.user.id
    };

    // Convert code to uppercase if provided
    if (body.code) {
      updateData.code = body.code.toUpperCase();
    }

    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name')
      .populate('applicableBrands', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: updatedPromoCode,
      message: 'Promo code updated successfully'
    });

  } catch (error) {
    console.error('Error updating promo code:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Promo code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

// DELETE /api/promo-codes/[id] - Delete a specific promo code
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['Admin', 'Super Admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;

    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }

    // Check if promo code has been used
    if (promoCode.usedCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete promo code that has been used' },
        { status: 400 }
      );
    }

    await PromoCode.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
