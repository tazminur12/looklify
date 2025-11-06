import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SliderImage from '@/models/SliderImage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET - Fetch single slider image
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const sliderImage = await SliderImage.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    if (!sliderImage) {
      return NextResponse.json(
        { error: 'Slider image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sliderImage
    });
  } catch (error) {
    console.error('Error fetching slider image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slider image', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update slider image
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const User = (await import('@/models/User')).default;
    await dbConnect();
    const user = await User.findById(session.user.id);
    
    if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { image, title, description, buttonText, buttonLink, status, sortOrder } = body;

    const sliderImage = await SliderImage.findById(id);

    if (!sliderImage) {
      return NextResponse.json(
        { error: 'Slider image not found' },
        { status: 404 }
      );
    }

    if (image) sliderImage.image = image;
    if (title !== undefined) sliderImage.title = title;
    if (description !== undefined) sliderImage.description = description;
    if (buttonText !== undefined) sliderImage.buttonText = buttonText;
    if (buttonLink !== undefined) sliderImage.buttonLink = buttonLink;
    if (status !== undefined) sliderImage.status = status;
    if (sortOrder !== undefined) sliderImage.sortOrder = sortOrder;
    sliderImage.updatedBy = session.user.id;

    await sliderImage.save();
    await sliderImage.populate('createdBy', 'name email');
    await sliderImage.populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: sliderImage
    });
  } catch (error) {
    console.error('Error updating slider image:', error);
    return NextResponse.json(
      { error: 'Failed to update slider image', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete slider image
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const User = (await import('@/models/User')).default;
    await dbConnect();
    const user = await User.findById(session.user.id);
    
    if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = params;

    const sliderImage = await SliderImage.findById(id);

    if (!sliderImage) {
      return NextResponse.json(
        { error: 'Slider image not found' },
        { status: 404 }
      );
    }

    // TODO: Delete image from Cloudinary if publicId exists
    // For now, just delete from database
    await SliderImage.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Slider image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slider image:', error);
    return NextResponse.json(
      { error: 'Failed to delete slider image', details: error.message },
      { status: 500 }
    );
  }
}

