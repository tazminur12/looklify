import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
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

    const [categories, totalCount] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('brand', 'name slug logo')
        .populate('parent', 'name slug')
        .lean(),
      Category.countDocuments(filter)
    ]);

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
    if (!brand) {
      return NextResponse.json({ error: 'brand is required' }, { status: 400 });
    }

    const doc = new Category({
      name,
      slug,
      description,
      icon,
      image,
      brand,
      parent: parent || null,
      sortOrder: sortOrder ?? 0,
      status: status || 'active',
      isFeatured: !!isFeatured,
      createdBy: session.user.id
    });

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
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category', details: error.message }, { status: 500 });
  }
}


