import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import mongoose from 'mongoose';

// GET /api/products/[id]/reviews - Get all reviews for a product
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch reviews
    const [reviews, totalCount] = await Promise.all([
      Review.find({ product: id, status: 'approved' })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email profileImage')
        .lean(),
      Review.countDocuments({ product: id, status: 'approved' })
    ]);

    // Calculate ratings summary
    const ratingsSummary = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(id), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Get average rating from product
    const product = await Product.findById(id).select('rating').lean();

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit
        },
        ratingsSummary: ratingsSummary.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        averageRating: product?.rating?.average || 0,
        totalReviews: product?.rating?.count || 0
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/reviews - Create a new review
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { rating, comment } = body;
    if (!rating || !comment) {
      return NextResponse.json(
        { error: 'Rating and comment are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: id,
      user: session.user.id
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create review
    const review = new Review({
      product: id,
      user: session.user.id,
      rating,
      comment,
      images: body.images || [],
      verifiedPurchase: body.verifiedPurchase || false,
      status: 'approved', // Auto-approve reviews
      isApproved: true
    });

    await review.save();

    // Update product rating
    await updateProductRating(id);

    // Populate the created review
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email profileImage')
      .lean();

    return NextResponse.json({
      success: true,
      data: populatedReview,
      message: 'Review submitted successfully.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to update product rating
async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].totalReviews
    });
  }
}

