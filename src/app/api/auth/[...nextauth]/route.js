import NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';

const handler = NextAuth(authOptions);

// Export handlers for Next.js 13+ App Router
export { handler as GET, handler as POST };
