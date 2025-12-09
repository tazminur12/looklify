import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SliderImage from '@/models/SliderImage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET - Fetch all slider images
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const placement = searchParams.get('placement');
    const sortBy = searchParams.get('sortBy') || 'sortOrder';

    const query = {};
    if (status) {
      query.status = status;
    }
    if (placement) {
      // Treat documents without placement as primary for backward compatibility
      if (placement === 'primary') {
        query.$or = [
          { placement: 'primary' },
          { placement: 'both' },
          { placement: { $exists: false } },
          { placement: null }
        ];
      } else if (placement === 'secondary') {
        query.$or = [
          { placement: 'secondary' },
          { placement: 'both' }
        ];
      } else {
        query.placement = placement;
      }
    }

    const sortOptions = {};
    if (sortBy === 'sortOrder') {
      sortOptions.sortOrder = 1;
      sortOptions.createdAt = -1;
    } else {
      sortOptions[sortBy] = -1;
    }

    const sliderImages = await SliderImage.find(query)
      .sort(sortOptions)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    return NextResponse.json({
      success: true,
      data: sliderImages
    });
  } catch (error) {
    console.error('Error fetching slider images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slider images', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new slider image
export async function POST(request) {
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

    const body = await request.json();
    const { image, title, description, buttonText, buttonLink, status, sortOrder, placement } = body;

    if (!image || !image.url) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const sliderImage = new SliderImage({
      image,
      title: title || '',
      description: description || '',
      buttonText: buttonText || 'Shop Now',
      buttonLink: buttonLink || '/shop',
      status: status || 'active',
      placement: placement || 'primary',
      sortOrder: sortOrder || 0,
      createdBy: session.user.id,
      updatedBy: session.user.id
    });

    await sliderImage.save();
    await sliderImage.populate('createdBy', 'name email');
    await sliderImage.populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: sliderImage
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating slider image:', error);
    return NextResponse.json(
      { error: 'Failed to create slider image', details: error.message },
      { status: 500 }
    );
  }
}

