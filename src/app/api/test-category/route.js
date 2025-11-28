import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// GET /api/test-category?slug=skin-care - Test category products
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug') || 'skin-care';

    // Find category
    const category = await Category.findOne({ slug, status: 'active' });
    
    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Category not found',
        slug
      });
    }

    // Test different query methods
    const results = {
      category: {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug
      },
      tests: {}
    };

    // Test 1: Direct ObjectId
    results.tests.directObjectId = await Product.countDocuments({
      category: category._id,
      status: 'active'
    });

    // Test 2: ObjectId as string
    results.tests.objectIdString = await Product.countDocuments({
      category: category._id.toString(),
      status: 'active'
    });

    // Test 3: New ObjectId instance
    results.tests.newObjectId = await Product.countDocuments({
      category: new mongoose.Types.ObjectId(category._id),
      status: 'active'
    });

    // Test 4: Without status filter
    results.tests.noStatusFilter = await Product.countDocuments({
      category: category._id
    });

    // Get sample products
    const sampleProducts = await Product.find({ category: category._id })
      .limit(5)
      .select('name category status')
      .lean();

    results.sampleProducts = sampleProducts.map(p => ({
      name: p.name,
      category: p.category?.toString(),
      status: p.status
    }));

    // Get all categories from products
    const allProductCategories = await Product.distinct('category');
    results.allProductCategories = allProductCategories.map(c => c?.toString());

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Test category error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

