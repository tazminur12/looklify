import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/authOptions';
import dbConnect from '../../../lib/db';
import User from '../../../models/User';
import Product from '../../../models/Product';

// GET - Fetch user's wishlist
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get wishlist items with product details
    const wishlistIds = user.wishlist || [];
    const products = await Product.find({ _id: { $in: wishlistIds } })
      .populate('brand', 'name')
      .populate('category', 'name');

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add product to wishlist
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if product is already in wishlist
    if (user.wishlist && user.wishlist.includes(productId)) {
      return NextResponse.json({
        success: true,
        message: 'Product already in wishlist',
        isInWishlist: true
      });
    }

    // Add product to wishlist
    await User.findByIdAndUpdate(
      session.user.id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist',
      isInWishlist: true
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove product from wishlist
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove product from wishlist
    await User.findByIdAndUpdate(
      session.user.id,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist',
      isInWishlist: false
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}

