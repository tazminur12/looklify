import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
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
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
