import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import User from '../../../models/User';
import dbConnect from '../../../lib/db';
import { ROLES } from '../../../lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin privileges
    const currentUser = await User.findById(session.user.id);
    if (!currentUser || ![ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    // Fetch all users with basic information
    const users = await User.find(
      {},
      {
        name: 1,
        email: 1,
        role: 1,
        isActive: 1,
        lastLogin: 1,
        createdAt: 1,
        profileImage: 1
      }
    ).sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
