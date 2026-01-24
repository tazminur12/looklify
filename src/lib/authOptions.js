import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '../lib/db';
import User from '../models/User';
import { trackNewUser } from '../lib/automation-events';

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('Warning: NEXTAUTH_SECRET is not set. This may cause authentication issues.');
}

const useSecureCookies =
  process.env.NODE_ENV === 'production' &&
  (process.env.NEXTAUTH_URL || '').startsWith('https://');

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production',
  debug: process.env.NODE_ENV === 'development',
  // Ensure NEXTAUTH_URL is properly set for production
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
  // Add trustHost for Vercel deployment
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await dbConnect();
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            return null;
          }

          // Check if user is active
          if (!user.isActive) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.profileImage,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: useSecureCookies
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: useSecureCookies
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
      },
    },
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Remove encryption in production to avoid issues
    // ...(process.env.NODE_ENV === 'production' && {
    //   encryption: true,
    // }),
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Handle JWT decryption errors gracefully
      try {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        
        // Debug logging for production
        if (process.env.NODE_ENV === 'production') {
          console.log('JWT callback:', {
            hasToken: !!token,
            hasUser: !!user,
            userRole: user?.role,
            tokenRole: token?.role,
            trigger
          });
        }
      
      // Handle OAuth providers (Google, GitHub)
      if (account && (account.provider === 'google' || account.provider === 'github')) {
        try {
          await dbConnect();
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email.toLowerCase() });
          
          if (!existingUser) {
            // Create new user for OAuth
            existingUser = new User({
              name: user.name,
              email: user.email.toLowerCase(),
              password: '', // OAuth users don't need password
              role: 'Customer', // Default role
              isEmailVerified: true,
              profileImage: user.image,
            });
            await existingUser.save();
            
            // Trigger welcome message for new OAuth user (non-blocking)
            trackNewUser(existingUser._id.toString()).catch(error => {
              console.error('Error sending welcome message for OAuth user:', error);
              // Don't fail login if welcome message fails
            });
          } else {
            // Update last login and profile image if needed
            await User.findByIdAndUpdate(existingUser._id, {
              lastLogin: new Date(),
              profileImage: user.image,
            });
          }
          
          token.id = existingUser._id.toString();
          token.role = existingUser.role;
        } catch (error) {
          console.error('OAuth user creation error:', error);
        }
      }
      
      return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        // Return a minimal token to prevent complete failure
        return {
          ...token,
          error: 'JWT_DECRYPTION_ERROR'
        };
      }
    },
    async session({ session, token }) {
      try {
        if (token) {
          session.user.id = token.id;
          session.user.role = token.role;
          
          // Handle JWT decryption errors
          if (token.error === 'JWT_DECRYPTION_ERROR') {
            console.warn('JWT decryption error detected, clearing session');
            return null;
          }
        }
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        // Return session instead of null to prevent logout
        return session;
      }
    },
    async redirect({ url, baseUrl }) {
      // If redirecting to dashboard, check if user has permission
      // Otherwise, redirect to home page
      if (url.startsWith(`${baseUrl}/dashboard`)) {
        return url;
      }
      // Default redirect to home page
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
};
