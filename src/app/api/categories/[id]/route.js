import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// GET /api/categories/[id]
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const category = await Category.findById(id)
      .populate('brand', 'name slug logo')
      .populate('parent', 'name slug')
      .populate('children', 'name slug status sortOrder')
      .lean();
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category', details: error.message }, { status: 500 });
  }
}

// PUT /api/categories/[id]
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = params;
    const body = await request.json();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    // prevent setting parent to itself
    if (body.parent && body.parent === id) {
      return NextResponse.json({ error: 'A category cannot be its own parent' }, { status: 400 });
    }

    // if slug changed ensure uniqueness
    if (body.slug) {
      const exists = await Category.findOne({ slug: body.slug, _id: { $ne: id } });
      if (exists) {
        return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
      }
    }

    body.updatedBy = session.user.id;

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('brand', 'name slug logo')
      .populate('parent', 'name slug')
      .lean();

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category', details: error.message }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const existing = await Category.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // prevent delete if has children
    const childrenCount = await Category.countDocuments({ parent: id });
    if (childrenCount > 0) {
      return NextResponse.json({ error: 'Cannot delete a category with subcategories' }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category', details: error.message }, { status: 500 });
  }
}


