'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );

  if (!session) return null;

  const stats = [
    { name: 'Revenue', value: '$45,231', change: '+20.1%', positive: true },
    { name: 'Orders', value: '2,350', change: '+54.3%', positive: true },
    { name: 'Customers', value: '1,234', change: '+12.5%', positive: true },
    { name: 'Conversion', value: '3.24%', change: '-2.4%', positive: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Welcome back, {session.user?.name || session.user?.email}.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            Export Report
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.name}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-500">{s.name}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{s.value}</p>
            <p
              className={`text-sm mt-1 ${
                s.positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {s.change} from last month
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder sections for tables/charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Recent Orders
          </h2>
          <p className="text-gray-500 text-sm">Order table placeholder...</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Top Products
          </h2>
          <p className="text-gray-500 text-sm">Top products chart placeholder...</p>
        </div>
      </div>
    </div>
  );
}
