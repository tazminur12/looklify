import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';

// GET /api/blogs/[id]
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const blog = await Blog.findById(id)
      .populate('author', 'name email')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('relatedPosts', 'title slug featuredImage publishDate')
      .lean();
      
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Increment view count
    await Blog.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ error: 'Failed to fetch blog', details: error.message }, { status: 500 });
  }
}

// PUT /api/blogs/[id]
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    // If slug changed, ensure uniqueness
    if (body.slug) {
      const exists = await Blog.findOne({ slug: body.slug, _id: { $ne: id } });
      if (exists) {
        return NextResponse.json({ error: 'Blog slug already exists' }, { status: 400 });
      }
    }

    body.updatedBy = session.user.id;

    const updated = await Blog.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('author', 'name email')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('relatedPosts', 'title slug featuredImage publishDate')
      .lean();

    if (!updated) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: updated, 
      message: 'Blog updated successfully' 
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update blog', details: error.message }, { status: 500 });
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid blog ID' }, { status: 400 });
    }

    const deleted = await Blog.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Blog deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ error: 'Failed to delete blog', details: error.message }, { status: 500 });
  }
}

