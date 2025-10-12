'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Skin Care', href: '/shop/skin-care' },
    { name: 'Hair Care', href: '/shop/hair-care' },
    { name: 'Lip Care', href: '/shop/lip-care' },
    { name: 'Eye Care', href: '/shop/eye-care' },
    { name: 'Body Care', href: '/shop/body-care' },
    { name: 'Facial Care', href: '/shop/facial-care' },
    { name: 'Teeth Care', href: '/shop/teeth-care' },
    { name: 'Health & Beauty', href: '/shop/health-beauty' },
    { name: 'Combo Deals', href: '/shop/combo-deals' },
    { name: 'Flash Sale', href: '/shop/flash-sale' },
  ];

  const subCategories = [
    'Skin Care',
    'Hair Care', 
    'Lip Care',
    'Eye Care',
    'Body Care',
    'Facial Care',
    'Teeth Care',
    'Health & Beauty'
  ];

  return (
    <header className="bg-white shadow-sm">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/logo/Looklify zone logo.svg"
                alt="Looklify Logo"
                width={80}
                height={80}
                className="w-20 h-20"
              />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="flex items-center">
              <select className="bg-gray-100 border border-gray-300 rounded-l-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]">
                <option value="">Select sub category</option>
                {subCategories.map((category) => (
                  <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Search" 
                className="flex-1 px-4 py-3 border-t border-b border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-r-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Cart */}
          <div className="flex items-center space-x-4">
            <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
              </div>
              <span className="text-sm font-medium">Cart</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-blue-100 font-medium transition-colors duration-200 text-sm whitespace-nowrap"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        {/* Bottom gradient line */}
        <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}