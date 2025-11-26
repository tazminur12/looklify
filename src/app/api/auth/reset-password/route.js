import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import PasswordResetToken from '../../../../models/PasswordResetToken';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the token record
    const record = await PasswordResetToken.findOne({ token, usedAt: null });
    
    if (!record) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(record.expiresAt);
    
    if (now > expiresAt) {
      // Mark as used to prevent reuse attempts
      record.usedAt = now;
      await record.save();
      
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new password reset.' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findById(record.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User account not found. Please contact support.' },
        { status: 404 }
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Mark token as used (prevent reuse)
    record.usedAt = now;
    await record.save();

    // Delete all other unused tokens for this user
    await PasswordResetToken.deleteMany({
      userId: user._id,
      usedAt: null,
      _id: { $ne: record._id },
    });

    console.log(`✅ Password reset successfully for user: ${user.email}`);

    return NextResponse.json(
      { message: 'Password has been reset successfully. You can now log in with your new password.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}


