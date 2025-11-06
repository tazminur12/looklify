import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

// GET /api/categories - list categories with search, parent filter, pagination, sort
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const parent = searchParams.get('parent') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'sortOrder';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (brand) filter.brand = brand;
    if (parent === 'root') filter.parent = null;
    else if (parent) filter.parent = parent;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Fetch categories with populated relationships
    const categoriesQuery = Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('brand', 'name slug logo')
      .populate('parent', 'name slug');
    
    // Populate children virtual field
    const categories = await categoriesQuery.lean();
    
    // Manually populate children for each category since virtuals with lean() need special handling
    const categoryIds = categories.map(c => c._id.toString());
    const allChildren = await Category.find({ parent: { $in: categoryIds } })
      .populate('parent', 'name slug')
      .sort({ sortOrder: 1 })
      .lean();
    
    // Group children by parent
    const childrenByParent = {};
    allChildren.forEach(child => {
      const parentId = child.parent?._id?.toString() || child.parent?.toString();
      if (parentId) {
        if (!childrenByParent[parentId]) {
          childrenByParent[parentId] = [];
        }
        childrenByParent[parentId].push(child);
      }
    });
    
    // Attach children to their parent categories
    categories.forEach(category => {
      const categoryId = category._id.toString();
      category.children = childrenByParent[categoryId] || [];
    });
    
    const totalCount = await Category.countDocuments(filter);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories', details: error.message }, { status: 500 });
  }
}

// POST /api/categories - create new category
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, slug, brand, parent, status, description, icon, image, sortOrder, isFeatured } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    // Generate slug if not provided
    let categorySlug = slug?.trim();
    if (!categorySlug) {
      categorySlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    // Build category data object
    const categoryData = {
      name,
      slug: categorySlug,
      description,
      icon,
      image,
      parent: parent || null,
      sortOrder: sortOrder ?? 0,
      status: status || 'active',
      isFeatured: !!isFeatured,
      createdBy: session.user.id
    };

    // Only add brand if provided (optional)
    if (brand) {
      categoryData.brand = brand;
    }

    console.log('Creating category with data:', categoryData);

    const doc = new Category(categoryData);

    // ensure unique slug
    const existing = await Category.findOne({ slug: doc.slug });
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
    }

    await doc.save();

    const created = await Category.findById(doc._id)
      .populate('brand', 'name slug logo')
      .populate('parent', 'name slug')
      .lean();

    return NextResponse.json({ success: true, data: created, message: 'Category created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', validationErrors);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category', details: error.message }, { status: 500 });
  }
}


