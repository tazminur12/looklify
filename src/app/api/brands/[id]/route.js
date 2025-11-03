import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Brand from '@/models/Brand';
import mongoose from 'mongoose';

// GET /api/brands/[id]
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    const brand = await Brand.findById(id).lean();
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json({ error: 'Failed to fetch brand', details: error.message }, { status: 500 });
  }
}

// PUT /api/brands/[id]
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
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    // if slug changed ensure uniqueness
    if (body.slug) {
      const exists = await Brand.findOne({ slug: body.slug, _id: { $ne: id } });
      if (exists) {
        return NextResponse.json({ error: 'Brand slug already exists' }, { status: 400 });
      }
    }

    body.updatedBy = session.user.id;

    const updated = await Brand.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: 'Brand updated successfully' });
  } catch (error) {
    console.error('Error updating brand:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({ error: 'Validation failed', details: validationErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update brand', details: error.message }, { status: 500 });
  }
}

// DELETE /api/brands/[id]
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
    }

    const existing = await Brand.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    await Brand.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand', details: error.message }, { status: 500 });
  }
}
