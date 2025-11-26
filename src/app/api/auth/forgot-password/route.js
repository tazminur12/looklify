import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';
import PasswordResetToken from '../../../../models/PasswordResetToken';

// Professional email template
const getEmailTemplate = (resetUrl, userName = 'User') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - Looklify</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 40px 30px; text-align: center;">
                  <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; line-height: 60px; margin-bottom: 10px;">
                    <span style="color: #ffffff; font-size: 28px; font-weight: bold;">L</span>
                  </div>
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0;">LOOKLIFY</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #111827; font-size: 24px; font-weight: bold; margin: 0 0 20px 0;">Reset Your Password</h2>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Hello ${userName},
                  </p>
                  <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    We received a request to reset your password for your Looklify account. Click the button below to create a new password:
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 0 0 30px 0;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(147, 51, 234, 0.3);">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Alternative Link -->
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #9333ea; font-size: 13px; line-height: 1.6; margin: 0 0 30px 0; word-break: break-all;">
                    <a href="${resetUrl}" style="color: #9333ea; text-decoration: none;">${resetUrl}</a>
                  </p>
                  
                  <!-- Warning -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin: 30px 0;">
                    <p style="color: #92400e; font-size: 14px; line-height: 1.6; margin: 0;">
                      <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this password reset, please ignore this email or contact our support team.
                    </p>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    Best regards,<br>
                    <strong style="color: #111827;">The Looklify Team</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                    This is an automated email. Please do not reply to this message.
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                    © ${new Date().getFullYear()} Looklify. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

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

    // Security: Only proceed if user exists, but always return success message
    // This prevents revealing if an account exists
    let emailSent = false;
    let token = null;

    if (user) {
      // Generate secure token
      token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete any existing unused tokens for this user
      await PasswordResetToken.deleteMany({ userId: user._id, usedAt: null });
      
      // Create new token
      await PasswordResetToken.create({
        userId: user._id,
        email: user.email,
        token,
        expiresAt,
      });

      // Get base URL
      const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // Check if email is configured (support multiple variable names)
      const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
      let emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD;
      
      // Remove spaces from password (Gmail App Passwords sometimes have spaces)
      if (emailPass) {
        emailPass = emailPass.replace(/\s+/g, '').trim();
      }

      if (emailUser && emailPass) {
        try {
          // Configure Gmail transporter with better error handling
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: emailUser,
              pass: emailPass.trim(), // Trim whitespace from password
            },
            // Additional options for better reliability
            pool: true,
            maxConnections: 1,
            maxMessages: 3,
            // Increase timeout
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
          });

          // Verify connection
          await transporter.verify();

          // Prepare email
          const userName = user.name || 'User';
          const emailHtml = getEmailTemplate(resetUrl, userName);

          // Send email
          await transporter.sendMail({
            from: `"Looklify" <${emailUser}>`,
            to: user.email,
            subject: '🔐 Reset Your Password - Looklify',
            html: emailHtml,
            // Plain text version
            text: `Hello ${userName},\n\nWe received a request to reset your password for your Looklify account. Click the link below to create a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request this password reset, please ignore this email.\n\nBest regards,\nThe Looklify Team`,
          });

          emailSent = true;
        } catch (emailErr) {
          console.error('Email send error:', emailErr.message || emailErr);
          // Don't throw error, just log it - we still want to return success to user
          // for security reasons (don't reveal if email sending failed)
        }
      }
    }

    // Always return success message (security: don't reveal if account exists)
    return NextResponse.json(
      {
        message: 'If an account with that email exists, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

