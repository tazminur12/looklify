'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <header className="bg-white shadow-lg sticky top-0 z-60 border-b border-gray-100">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2">
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
          <div className="hidden lg:flex flex-1 max-w-2xl mx-6 lg:mx-8">
            <div className="flex items-center w-full shadow-sm border border-purple-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
              <select className="bg-gray-50 border-r border-purple-200 px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[180px] cursor-pointer font-medium">
                <option value="">Select Category</option>
                {subCategories.map((category) => (
                  <option key={category} value={category.toLowerCase().replace(' ', '-')}>
                    {category}
                  </option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Search for products..." 
                className="flex-1 px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              />
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3.5 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Section - Cart, Profile, Login/Signup */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Cart Section */}
            <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 group p-2 rounded-lg hover:bg-purple-50">
              <div className="relative">
                {/* Professional shopping bag icon */}
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7V6a3 3 0 116 0v1m-9 0h12l-1.2 11.04A2 2 0 0114.81 21H9.19a2 2 0 01-1.99-1.96L7 7z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold text-[10px]">0</span>
              </div>
              <span className="hidden sm:block text-sm font-semibold">Cart</span>
            </Link>

            {/* Profile/Login Section */}
            <div className="flex items-center space-x-3">
              {session ? (
                // User is logged in - show profile
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold">
                      {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                        {session.user?.role && (
                          <p className="text-xs text-purple-600 font-medium mt-1">
                            {session.user.role}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Settings
                      </Link>
                      
                      {/* Admin Links */}
                      {session.user?.role && ['Super Admin', 'Admin'].includes(session.user.role) && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        </>
                      )}
                      
                      {/* Staff Links */}
                      {session.user?.role && ['Super Admin', 'Admin', 'Staff'].includes(session.user.role) && (
                        <Link
                          href="/staff"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Staff Panel
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' });
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // User is not logged in - show login/signup buttons
                <div className="hidden sm:flex items-center space-x-3">
                  <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-purple-50">Log In</Link>
                  <Link href="/signup" className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    Sign Up
                  </Link>
                </div>
              )}
              
              {/* Mobile Login Button (only show when not logged in) */}
              {!session && (
                <div className="sm:hidden">
                  <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-purple-50">
                    Login
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 rounded-lg"
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
        <div className="lg:hidden bg-white border-t border-purple-100 px-4 py-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <select className="bg-gray-50 border border-purple-200 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 font-medium">
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
              className="flex-1 px-4 py-3.5 border border-purple-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            />
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3.5 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Navigation Bar */}
      <nav className="hidden md:block bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 lg:space-x-2 py-1 lg:py-1.5">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-purple-100 font-medium transition-all duration-200 text-xs whitespace-nowrap px-2 py-1 rounded-md hover:bg-purple-500/30 hover:shadow-sm"
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
        <div className="md:hidden bg-white border-t border-purple-100 shadow-xl max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="px-4 py-6 space-y-3">
            {/* Mobile Navigation Items */}
            {mobileNavigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3.5 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl font-semibold transition-all duration-200 text-base hover:shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Divider */}
            <div className="border-t border-purple-100 my-6"></div>
            
            {/* Additional Categories */}
            <div className="space-y-3">
              <h3 className="px-4 text-sm font-bold text-gray-500 uppercase tracking-wider">More Categories</h3>
              {navigationItems.filter(item => !mobileNavigationItems.includes(item)).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-all duration-200 text-sm hover:shadow-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* User Actions */}
            <div className="border-t border-purple-100 my-6 pt-6">
              {session ? (
                // Mobile logged-in user menu
                <div className="space-y-4">
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="block w-full px-4 py-3.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 text-center rounded-xl font-semibold transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block w-full px-4 py-3.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 text-center rounded-xl font-semibold transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3.5 border-2 border-red-600 text-red-600 text-center rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 hover:shadow-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                // Mobile login/signup buttons
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-3.5 border-2 border-purple-600 text-purple-600 text-center rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 hover:shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}