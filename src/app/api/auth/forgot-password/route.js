import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import PasswordResetToken from '../../../../models/PasswordResetToken';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always generate token and respond with success (do not reveal account existence)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    if (user) {
      await PasswordResetToken.deleteMany({ userId: user._id, usedAt: null });
      await PasswordResetToken.create({ userId: user._id, email: user.email, token, expiresAt });
    }

    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    if (hasEmailConfig) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Password Reset Request - Looklify',
          html: `<p>Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.log('Generated reset URL (no email configured):', resetUrl);
    }

    return NextResponse.json({
      message: hasEmailConfig
        ? 'If an account with that email exists, a reset link has been sent.'
        : 'Password reset link generated. Check server logs for the URL.',
      ...(process.env.NODE_ENV === 'development' ? { resetUrl, email } : {}),
    }, { status: 200 });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again later.' }, { status: 500 });
  }
}

