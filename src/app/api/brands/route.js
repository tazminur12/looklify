import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';

// GET /api/brands - list brands with search, pagination, sort
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

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [brands, totalCount] = await Promise.all([
      Brand.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Brand.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        brands,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands', details: error.message }, { status: 500 });
  }
}

// POST /api/brands - create new brand
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, slug, description, logo, website, country, status, sortOrder, isFeatured } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const doc = new Brand({
      name,
      slug,
      description,
      logo,
      website,
      country,
      sortOrder: Number(sortOrder) || 0,
      status: status || 'active',
      isFeatured: !!isFeatured,
      createdBy: session.user.id
    });

    // ensure unique slug
    const existing = await Brand.findOne({ slug: doc.slug });
    if (existing) {
      return NextResponse.json({ error: 'Brand slug already exists' }, { status: 400 });
    }

    await doc.save();

    const created = await Brand.findById(doc._id).lean();

    return NextResponse.json({ success: true, data: created, message: 'Brand created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create brand', details: error.message }, { status: 500 });
  }
}
