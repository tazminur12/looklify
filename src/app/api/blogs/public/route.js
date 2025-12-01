import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

// GET /api/blogs/public - Public API to get published blogs with pagination, search, filters
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const featured = searchParams.get('featured');
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const category = searchParams.get('category') || '';

    const filter = {
      status: 'published'
    };

    // If featured parameter is provided, filter by isFeatured
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag filter
    if (tag) {
      filter.tags = tag;
    }

    // Category filter
    if (category) {
      filter.categories = category;
    }

    // Sort by sortOrder first (ascending - lower numbers first), then by publishDate (descending - newest first)
    const sort = { sortOrder: 1, publishDate: -1 };
    const skip = (page - 1) * limit;

    // Get blogs and total count
    const [blogs, totalCount] = await Promise.all([
      Blog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email')
        .select('title slug excerpt featuredImage publishDate author views tags categories sortOrder')
        .lean(),
      Blog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch blogs', 
      details: error.message 
    }, { status: 500 });
  }
}

