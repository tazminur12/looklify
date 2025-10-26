import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';

// GET /api/promo-codes - Get all promo codes with pagination and filtering
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['Admin', 'Super Admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const promoCodes = await PromoCode.find(query)
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name')
      .populate('applicableBrands', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalCount = await PromoCode.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Calculate stats
    const stats = await PromoCode.aggregate([
      {
        $group: {
          _id: null,
          totalPromoCodes: { $sum: 1 },
          activePromoCodes: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          expiredPromoCodes: {
            $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] }
          },
          exhaustedPromoCodes: {
            $sum: { $cond: [{ $eq: ['$status', 'exhausted'] }, 1, 0] }
          },
          totalUsage: { $sum: '$usedCount' },
          totalDiscountGiven: { $sum: '$analytics.totalDiscountGiven' }
        }
      }
    ]);

    const pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit
    };

    return NextResponse.json({
      success: true,
      data: {
        promoCodes,
        pagination,
        stats: stats[0] || {
          totalPromoCodes: 0,
          activePromoCodes: 0,
          expiredPromoCodes: 0,
          exhaustedPromoCodes: 0,
          totalUsage: 0,
          totalDiscountGiven: 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// POST /api/promo-codes - Create a new promo code
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['Admin', 'Super Admin'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const {
      code,
      name,
      description,
      type,
      value,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      usageLimitPerUser,
      validFrom,
      validUntil,
      applicableProducts,
      applicableCategories,
      applicableBrands,
      excludedProducts,
      excludedCategories,
      excludedBrands,
      applicableUsers,
      excludedUsers,
      newUsersOnly,
      firstTimePurchaseOnly,
      stackable,
      priority,
      autoApply,
      autoApplyConditions,
      bengaliName,
      bengaliDescription
    } = body;

    // Validate required fields
    if (!code || !name || !type || !value || !validFrom || !validUntil) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date range
    const validFromDate = new Date(validFrom);
    const validUntilDate = new Date(validUntil);
    
    if (validFromDate >= validUntilDate) {
      return NextResponse.json(
        { success: false, error: 'Valid from date must be before valid until date' },
        { status: 400 }
      );
    }

    // Validate percentage value
    if (type === 'percentage' && value > 100) {
      return NextResponse.json(
        { success: false, error: 'Percentage discount cannot exceed 100%' },
        { status: 400 }
      );
    }

    // Check if promo code already exists
    const existingPromoCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingPromoCode) {
      return NextResponse.json(
        { success: false, error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // Validate referenced IDs
    if (applicableProducts && applicableProducts.length > 0) {
      const validProducts = await Product.find({ _id: { $in: applicableProducts } });
      if (validProducts.length !== applicableProducts.length) {
        return NextResponse.json(
          { success: false, error: 'Some products are invalid' },
          { status: 400 }
        );
      }
    }

    if (applicableCategories && applicableCategories.length > 0) {
      const validCategories = await Category.find({ _id: { $in: applicableCategories } });
      if (validCategories.length !== applicableCategories.length) {
        return NextResponse.json(
          { success: false, error: 'Some categories are invalid' },
          { status: 400 }
        );
      }
    }

    if (applicableBrands && applicableBrands.length > 0) {
      const validBrands = await Brand.find({ _id: { $in: applicableBrands } });
      if (validBrands.length !== applicableBrands.length) {
        return NextResponse.json(
          { success: false, error: 'Some brands are invalid' },
          { status: 400 }
        );
      }
    }

    // Create promo code
    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      name,
      description,
      type,
      value,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount,
      usageLimit,
      usageLimitPerUser: usageLimitPerUser || 1,
      validFrom: validFromDate,
      validUntil: validUntilDate,
      applicableProducts: applicableProducts || [],
      applicableCategories: applicableCategories || [],
      applicableBrands: applicableBrands || [],
      excludedProducts: excludedProducts || [],
      excludedCategories: excludedCategories || [],
      excludedBrands: excludedBrands || [],
      applicableUsers: applicableUsers || [],
      excludedUsers: excludedUsers || [],
      newUsersOnly: newUsersOnly || false,
      firstTimePurchaseOnly: firstTimePurchaseOnly || false,
      stackable: stackable || false,
      priority: priority || 0,
      autoApply: autoApply || false,
      autoApplyConditions,
      bengaliName,
      bengaliDescription,
      createdBy: session.user.id
    });

    await promoCode.save();

    // Populate the created promo code
    const populatedPromoCode = await PromoCode.findById(promoCode._id)
      .populate('applicableProducts', 'name sku')
      .populate('applicableCategories', 'name')
      .populate('applicableBrands', 'name')
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedPromoCode,
      message: 'Promo code created successfully'
    });

  } catch (error) {
    console.error('Error creating promo code:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Promo code already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}
