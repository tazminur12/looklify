import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Brand from '@/models/Brand';

// GET /api/shop/filters - get all filter options for shop page
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand');

    // Fetch all active brands
    const brands = await Brand.find({ status: 'active' })
      .select('_id name slug logo')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Fetch all active categories (main categories only)
    const categories = await Category.find({ 
      status: 'active',
      parent: null // Only main categories
    })
      .select('_id name slug icon image isFeatured')
      .sort({ sortOrder: 1, name: 1 })
      .lean();


    // Fetch featured categories
    const featuredCategories = await Category.find({ 
      status: 'active',
      parent: null,
      isFeatured: true
    })
      .select('_id name slug icon image')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Fetch subcategories based on selected brand or all brands
    let subcategories = [];
    if (brandId) {
      // If specific brand selected, get subcategories for that brand only
      subcategories = await Category.find({ 
        status: 'active',
        parent: { $ne: null },
        brand: brandId
      })
        .select('_id name slug parent')
        .populate('parent', 'name slug')
        .sort({ sortOrder: 1, name: 1 })
        .lean();
    } else {
      // If no brand selected, get all subcategories
      subcategories = await Category.find({ 
        status: 'active',
        parent: { $ne: null }
      })
        .select('_id name slug parent brand')
        .populate('parent', 'name slug')
        .populate('brand', 'name slug')
        .sort({ sortOrder: 1, name: 1 })
        .lean();
    }

    // Group subcategories by parent category
    const subcategoriesByParent = subcategories.reduce((acc, sub) => {
      const parentName = sub.parent?.name || 'Other';
      if (!acc[parentName]) {
        acc[parentName] = [];
      }
      acc[parentName].push(sub);
      return acc;
    }, {});

    // Static filter options (these could also be moved to database if needed)
    const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'All Types'];
    const skinConcerns = ['Acne', 'Aging', 'Dark Spots', 'Dryness', 'Oiliness', 'Sensitivity', 'Uneven Skin Tone', 'Wrinkles'];

    return NextResponse.json({
      success: true,
      data: {
        brands,
        categories,
        featuredCategories,
        subcategories: subcategoriesByParent,
        skinTypes,
        skinConcerns
      }
    });
  } catch (error) {
    console.error('Error fetching shop filters:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch filter options', 
      details: error.message 
    }, { status: 500 });
  }
}
