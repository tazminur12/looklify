import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import User from '@/models/User';

// POST /api/promo-codes/validate - Validate a promo code for an order
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { 
      code, 
      orderAmount, 
      productIds = [], 
      categoryIds = [], 
      brandIds = [],
      userId = session.user.id 
    } = body;

    if (!code || !orderAmount) {
      return NextResponse.json(
        { success: false, error: 'Promo code and order amount are required' },
        { status: 400 }
      );
    }

    // Find the promo code
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      status: 'active'
    });

    if (!promoCode) {
      return NextResponse.json({
        success: false,
        valid: false,
        message: 'Invalid promo code'
      });
    }

    // Check if promo code is valid (not expired, not exhausted)
    if (!promoCode.isValid) {
      let message = 'Promo code is not valid';
      if (promoCode.isExpired) {
        message = 'Promo code has expired';
      } else if (promoCode.isExhausted) {
        message = 'Promo code usage limit reached';
      }
      
      return NextResponse.json({
        success: true,
        valid: false,
        message
      });
    }

    // Check if promo code is applicable to the user
    if (!promoCode.isApplicableToUser(userId)) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: 'Promo code is not applicable to your account'
      });
    }

    // Check new users only restriction
    if (promoCode.newUsersOnly) {
      const user = await User.findById(userId);
      const userCreatedAt = new Date(user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (userCreatedAt > thirtyDaysAgo) {
        return NextResponse.json({
          success: true,
          valid: false,
          message: 'This promo code is only for new users'
        });
      }
    }

    // Check minimum order amount
    if (orderAmount < promoCode.minimumOrderAmount) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: `Minimum order amount of BDT ${promoCode.minimumOrderAmount} required`
      });
    }

    // Check product restrictions
    if (productIds.length > 0) {
      const hasApplicableProduct = productIds.some(productId => 
        promoCode.isApplicableToProduct(productId)
      );
      
      if (!hasApplicableProduct) {
        return NextResponse.json({
          success: true,
          valid: false,
          message: 'Promo code is not applicable to any products in your cart'
        });
      }
    }

    // Check category restrictions
    if (categoryIds.length > 0) {
      const hasApplicableCategory = categoryIds.some(categoryId => 
        promoCode.isApplicableToCategory(categoryId)
      );
      
      if (!hasApplicableCategory) {
        return NextResponse.json({
          success: true,
          valid: false,
          message: 'Promo code is not applicable to any categories in your cart'
        });
      }
    }

    // Check brand restrictions
    if (brandIds.length > 0) {
      const hasApplicableBrand = brandIds.some(brandId => 
        promoCode.isApplicableToBrand(brandId)
      );
      
      if (!hasApplicableBrand) {
        return NextResponse.json({
          success: true,
          valid: false,
          message: 'Promo code is not applicable to any brands in your cart'
        });
      }
    }

    // Calculate discount
    const discountResult = promoCode.calculateDiscount(orderAmount, productIds, categoryIds, brandIds);

    if (!discountResult.valid) {
      return NextResponse.json({
        success: true,
        valid: false,
        message: discountResult.message
      });
    }

    // Return successful validation with discount details
    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        promoCode: {
          _id: promoCode._id,
          code: promoCode.code,
          name: promoCode.name,
          description: promoCode.description,
          type: promoCode.type,
          value: promoCode.value,
          discountDisplay: promoCode.discountDisplay,
          stackable: promoCode.stackable,
          priority: promoCode.priority
        },
        discountAmount: discountResult.discountAmount,
        message: discountResult.message
      }
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
