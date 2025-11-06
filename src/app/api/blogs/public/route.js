import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

// GET /api/blogs/public - Public API to get published featured blogs
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const featured = searchParams.get('featured');

    const filter = {
      status: 'published'
    };

    // If featured parameter is provided, filter by isFeatured
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const sort = { publishDate: -1 };

    const blogs = await Blog.find(filter)
      .sort(sort)
      .limit(limit)
      .populate('author', 'name email')
      .select('title slug excerpt featuredImage publishDate author views tags categories')
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        blogs
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

