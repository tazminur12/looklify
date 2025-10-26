import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import User from '../../../../../models/User';
import connectDB from '../../../../../lib/db';
import { ROLES } from '../../../../../lib/auth';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if current user has admin privileges
    const currentUser = await User.findById(session.user.id);
    if (!currentUser || !['Super Admin', 'Admin'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const { role } = await request.json();

    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Find the user to update
    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent users from changing their own role (security measure)
    if (userToUpdate._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Only Super Admin can change other Super Admin roles
    if (userToUpdate.role === 'Super Admin' && currentUser.role !== 'Super Admin') {
      return NextResponse.json(
        { error: 'Only Super Admin can modify Super Admin roles' },
        { status: 403 }
      );
    }

    // Only Super Admin can assign Super Admin role
    if (role === 'Super Admin' && currentUser.role !== 'Super Admin') {
      return NextResponse.json(
        { error: 'Only Super Admin can assign Super Admin role' },
        { status: 403 }
      );
    }

    // Update the user's role
    userToUpdate.role = role;
    await userToUpdate.save();

    return NextResponse.json({
      message: 'Role updated successfully',
      user: {
        id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
