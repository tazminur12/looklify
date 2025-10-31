import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import User from '../../../../models/User';
import dbConnect from '../../../../lib/db';
import bcrypt from 'bcryptjs';

// GET /api/users/[id] - Get user by ID
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;

    // Users can only access their own profile, unless they're admin
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is accessing their own profile or is admin
    const isAdmin = ['Super Admin', 'Admin'].includes(currentUser.role);
    if (id !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find user
    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { id } = params;
    const body = await request.json();

    // Users can only update their own profile, unless they're admin
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = ['Super Admin', 'Admin'].includes(currentUser.role);
    if (id !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find user to update
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update fields
    if (body.name !== undefined) {
      user.name = body.name.trim();
    }

    if (body.email !== undefined) {
      // Check if email already exists (for other users)
      const existingUser = await User.findOne({ email: body.email.toLowerCase().trim() });
      if (existingUser && existingUser._id.toString() !== id) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        );
      }
      user.email = body.email.toLowerCase().trim();
    }

    if (body.phone !== undefined) {
      user.phone = body.phone || null;
    }

    if (body.address !== undefined) {
      user.address = {
        street: body.address.street || null,
        city: body.address.city || null,
        state: body.address.state || null,
        zipCode: body.address.zipCode || null,
        country: body.address.country || 'Bangladesh'
      };
    }

    if (body.dateOfBirth !== undefined) {
      user.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }

    if (body.preferences !== undefined) {
      user.preferences = {
        newsletter: body.preferences.newsletter !== false,
        notifications: {
          email: body.preferences.notifications?.email !== false,
          sms: body.preferences.notifications?.sms || false
        }
      };
    }

    if (body.profileImage !== undefined) {
      user.profileImage = body.profileImage || null;
    }

    // Save user
    await user.save();

    // Return updated user (without password)
    const updatedUser = await User.findById(id).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

