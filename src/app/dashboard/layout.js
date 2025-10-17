'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, logout, isAdmin } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has admin privileges
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-8xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            You need Super Admin or Admin privileges to access the dashboard.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Current Role: <span className="font-semibold">{user?.role || 'Not logged in'}</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Required: Super Admin or Admin
            </p>
          </div>
          <div className="mt-8 space-x-4">
            <button
              onClick={logout}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
            <Link
              href="/"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors inline-block"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Brands', href: '/dashboard/brands', icon: '🏢' },
    { name: 'Products', href: '/dashboard/products', icon: '📦' },
    { name: 'Categories', href: '/dashboard/categories', icon: '🏷️' },
    { name: 'Orders', href: '/dashboard/orders', icon: '🧾' },
    { name: 'Customers', href: '/dashboard/customers', icon: '👥' },
    ...(isAdmin ? [{ name: 'Role Management', href: '/dashboard/role-management', icon: '👑' }] : []),
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📊' },
    { name: 'Inventory', href: '/dashboard/inventory', icon: '📦' },
    { name: 'Marketing', href: '/dashboard/marketing', icon: '📢' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
  ];

  const isActive = (href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
              L
            </div>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              LOOKLIFY
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            ✖️
          </button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto px-4 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-purple-700'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User Info - Moved to bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {loading ? 'Loading...' : (user?.name || 'User')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'user@looklify.com'}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  {user?.role || 'Customer'}
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Logout"
            >
              ↪️
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between h-16 px-4 lg:px-6 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            ☰
          </button>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 text-sm w-48 sm:w-64"
              />
              <span className="absolute left-2 top-2 text-gray-400">🔍</span>
            </div>
            <button className="relative text-gray-400 hover:text-gray-600">
              🔔
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-gray-700 dark:text-gray-300 text-sm font-medium">
                {user?.role || 'User'}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
