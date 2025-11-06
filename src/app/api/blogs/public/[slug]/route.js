import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

// GET /api/blogs/public/[slug] - Public API to get a single blog by slug
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;

    const blog = await Blog.findOne({ 
      slug,
      status: 'published' 
    })
      .populate('author', 'name email')
      .populate('relatedPosts', 'title slug featuredImage publishDate excerpt')
      .lean();

    if (!blog) {
      return NextResponse.json({ 
        success: false,
        error: 'Blog not found' 
      }, { status: 404 });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    return NextResponse.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch blog', 
      details: error.message 
    }, { status: 500 });
  }
}

