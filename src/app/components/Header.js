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
    <header className="bg-white shadow-md sticky top-0 z-60">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="flex items-center justify-between">
          {/* Logo Section - Image only */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative">
                <Image
                  src="/logo/Looklify logo.jpg"
                  alt="Looklify Logo"
                  width={80}
                  height={80}
                  className="w-20 h-20 duration-200"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar - Professional design */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="flex items-center w-full shadow-sm border border-purple-200 rounded-lg overflow-hidden">
              <select className="bg-gray-50 border-r border-purple-200 px-4 py-3 text-sm text-gray-700 focus:outline-none focus:bg-white min-w-[180px] cursor-pointer">
                <option value="">Select Sub Category</option>
                {subCategories.map((category) => (
                  <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Search" 
                className="flex-1 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Section - Cart, Profile, Login/Signup */}
          <div className="flex items-center space-x-6">
            {/* Cart Section */}
            <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors group">
              <div className="relative">
                {/* Professional shopping bag icon */}
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7V6a3 3 0 116 0v1m-9 0h12l-1.2 11.04A2 2 0 0114.81 21H9.19a2 2 0 01-1.99-1.96L7 7z" />
                </svg>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">0</span>
              </div>
              <span className="hidden sm:block text-sm font-medium">Cart</span>
            </Link>

            {/* Profile/Login Section */}
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">Log In</Link>
                <span className="text-gray-300">|</span>
                <Link href="/signup" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">Sign Up</Link>
              </div>
              <div className="sm:hidden">
                <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
                  Log In/Sign Up
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="lg:hidden bg-white border-t border-purple-100 px-4 py-4">
          <div className="flex items-center space-x-2">
            <select className="bg-gray-50 border border-purple-200 rounded-lg px-3 py-3 text-sm text-gray-700 focus:outline-none focus:bg-white flex-1">
              <option value="">All Categories</option>
              {subCategories.map((category) => (
                <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                  {category}
                </option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="Search" 
              className="flex-1 px-3 py-3 border border-purple-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-300"
            />
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navigation Bar */}
      <nav className="hidden md:block bg-gradient-to-r from-purple-600 to-pink-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-4 lg:space-x-6 py-1 lg:py-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-purple-100 font-medium transition-colors duration-200 text-sm whitespace-nowrap px-2 py-1.5 rounded-md hover:bg-purple-500/20"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        {/* Bottom gradient line */}
        <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-purple-100 shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Navigation Items */}
            {mobileNavigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors duration-200 text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Divider */}
            <div className="border-t border-purple-100 my-4"></div>
            
            {/* Additional Categories */}
            <div className="space-y-2">
              <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">More Categories</h3>
              {navigationItems.filter(item => !mobileNavigationItems.includes(item)).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-colors duration-200 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* User Actions */}
            <div className="border-t border-purple-100 my-4 pt-4">
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="block w-full px-4 py-3 border-2 border-purple-600 text-purple-600 text-center rounded-lg font-medium hover:bg-purple-50 transition-colors duration-200"
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