'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  // Mobile-optimized navigation items (fewer items for mobile)
  const mobileNavigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Skin Care', href: '/shop/skin-care' },
    { name: 'Hair Care', href: '/shop/hair-care' },
    { name: 'Lip Care', href: '/shop/lip-care' },
    { name: 'Eye Care', href: '/shop/eye-care' },
    { name: 'Body Care', href: '/shop/body-care' },
    { name: 'Facial Care', href: '/shop/facial-care' },
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <Image
                src="/logo/Looklify zone logo.svg"
                alt="Looklify Logo"
                width={80}
                height={80}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
              />
              <span className="hidden sm:block text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LOOKLIFY
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="flex items-center w-full">
              <select className="bg-gray-100 border border-gray-300 rounded-l-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]">
                <option value="">Select category</option>
                {subCategories.map((category) => (
                  <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="flex-1 px-4 py-2.5 border-t border-b border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2.5 rounded-r-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile/Tablet Search Button & Cart */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <Link href="/cart" className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <div className="relative">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">0</span>
              </div>
              <span className="hidden sm:block text-sm font-medium">Cart</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 px-3 py-4">
          <div className="flex items-center space-x-2">
            <select className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1">
              <option value="">All Categories</option>
              {subCategories.map((category) => (
                <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                  {category}
                </option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navigation Bar */}
      <nav className="hidden md:block bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 lg:space-x-8 py-3 lg:py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-blue-100 font-medium transition-colors duration-200 text-sm whitespace-nowrap px-2 py-1 rounded-md hover:bg-blue-500/20"
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
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Navigation Items */}
            {mobileNavigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-200 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Divider */}
            <div className="border-t border-gray-200 my-4"></div>
            
            {/* Additional Categories */}
            <div className="space-y-2">
              <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">More Categories</h3>
              {navigationItems.filter(item => !mobileNavigationItems.includes(item)).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors duration-200 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* User Actions */}
            <div className="border-t border-gray-200 my-4 pt-4">
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 border border-purple-600 text-purple-600 text-center rounded-lg font-medium hover:bg-purple-50 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}