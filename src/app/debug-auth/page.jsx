'use client';

import { useSession } from 'next-auth/react';
import { useAuth } from '../contexts/AuthContext';

export default function DebugAuth() {
  const { data: session, status } = useSession();
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NextAuth Session */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>Has Session:</strong> {session ? 'Yes' : 'No'}</p>
              {session && (
                <>
                  <p><strong>User ID:</strong> {session.user?.id || 'N/A'}</p>
                  <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
                  <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
                  <p><strong>Role:</strong> {session.user?.role || 'N/A'}</p>
                </>
              )}
            </div>
          </div>

          {/* AuthContext */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">AuthContext</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
              {user && (
                <>
                  <p><strong>User ID:</strong> {user.id || 'N/A'}</p>
                  <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                  <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                  <p><strong>Role:</strong> {user.role || 'N/A'}</p>
                </>
              )}
            </div>
          </div>

          {/* Environment Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-2">
              <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
              <p><strong>NEXTAUTH_URL:</strong> {process.env.NEXTAUTH_URL || 'Not set'}</p>
              <p><strong>Has NEXTAUTH_SECRET:</strong> {process.env.NEXTAUTH_SECRET ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Raw Session Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Raw Session Data</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-8">
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Try Dashboard Access
          </a>
        </div>
      </div>
    </div>
  );
}
