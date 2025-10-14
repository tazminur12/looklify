'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Products', href: '/dashboard/products', icon: '📦' },
    { name: 'Orders', href: '/dashboard/orders', icon: '🧾' },
    { name: 'Customers', href: '/dashboard/customers', icon: '👥' },
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
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
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

        {/* User Info */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">admin@looklify.com</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">↪️</button>
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
                A
              </div>
              <span className="hidden sm:block text-gray-700 dark:text-gray-300 text-sm font-medium">
                Admin
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
