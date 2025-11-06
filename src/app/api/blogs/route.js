import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

// GET /api/blogs - list blogs with search, filter, pagination, sort
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
    const tag = searchParams.get('tag') || '';
    const category = searchParams.get('category') || '';
    const author = searchParams.get('author') || '';
    const sortBy = searchParams.get('sortBy') || 'publishDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) filter.status = status;
    if (tag) filter.tags = tag;
    if (category) filter.categories = category;
    if (author) filter.author = author;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [blogs, totalCount] = await Promise.all([
      Blog.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email')
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('relatedPosts', 'title slug featuredImage')
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
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs', details: error.message }, { status: 500 });
  }
}

// POST /api/blogs - create new blog
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      featuredImage, 
      author, 
      publishDate, 
      status, 
      tags, 
      categories, 
      metaDescription, 
      metaKeywords, 
      relatedPosts, 
      isFeatured, 
      sortOrder,
      seoTitle 
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Generate slug if not provided
    let blogSlug = slug?.trim();
    if (!blogSlug) {
      blogSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    // Build blog data object
    const blogData = {
      title,
      slug: blogSlug,
      excerpt,
      content,
      featuredImage: featuredImage || null,
      author: author || session.user.id,
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      status: status || 'draft',
      tags: tags || [],
      categories: categories || [],
      metaDescription: metaDescription || '',
      metaKeywords: metaKeywords || [],
      relatedPosts: relatedPosts || [],
      isFeatured: !!isFeatured,
      sortOrder: sortOrder ?? 0,
      seoTitle: seoTitle || title.substring(0, 60),
      createdBy: session.user.id
    };

    // Ensure unique slug
    const existing = await Blog.findOne({ slug: blogData.slug });
    if (existing) {
      return NextResponse.json({ error: 'Blog slug already exists' }, { status: 400 });
    }

    const doc = new Blog(blogData);
    await doc.save();

    const created = await Blog.findById(doc._id)
      .populate('author', 'name email')
      .populate('createdBy', 'name')
      .populate('relatedPosts', 'title slug featuredImage')
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: created, 
      message: 'Blog created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create blog', details: error.message }, { status: 500 });
  }
}

