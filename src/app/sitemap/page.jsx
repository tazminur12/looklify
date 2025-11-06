'use client';

import Link from 'next/link';

export default function SitemapPage() {
  const sitemapData = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Products', href: '/shop' },
      { name: 'Blogs', href: '/blog' },
      { name: 'Cart', href: '/cart' },
      { name: 'Wishlist', href: '/wishlist' },
    ],
    categories: [
      { name: 'Skin Care', href: '/shop?category=skin-care' },
      { name: 'Hair Care', href: '/shop?category=hair-care' },
      { name: 'Lip Care', href: '/shop?category=lip-care' },
      { name: 'Eye Care', href: '/shop?category=eye-care' },
      { name: 'Body Care', href: '/shop?category=body-care' },
      { name: 'Facial Care', href: '/shop?category=facial-care' },
      { name: 'Teeth Care', href: '/shop?category=teeth-care' },
      { name: 'Health & Beauty', href: '/shop?category=health-beauty' },
    ],
    customerServices: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Return And Refund', href: '/return-refund' },
      { name: 'Shipping And Delivery', href: '/shipping-delivery' },
      { name: 'Terms And Conditions', href: '/terms-conditions' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Store Location', href: '/store-location' },
      { name: 'FAQ', href: '/faq' },
    ],
    account: [
      { name: 'Login', href: '/login' },
      { name: 'Sign Up', href: '/signup' },
      { name: 'Profile', href: '/profile' },
      { name: 'My Orders', href: '/my-orders' },
      { name: 'Forgot Password', href: '/forgot-password' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sitemap
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Find all pages and links on Looklify
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Main Pages */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Main Pages
            </h2>
            <ul className="space-y-2">
              {sitemapData.main.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Categories
            </h2>
            <ul className="space-y-2">
              {sitemapData.categories.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Services */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Customer Services
            </h2>
            <ul className="space-y-2">
              {sitemapData.customerServices.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </h2>
            <ul className="space-y-2">
              {sitemapData.account.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors flex items-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help Finding Something?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you can't find what you're looking for, feel free to contact our customer service team. We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium rounded-lg transition-all"
              >
                Visit FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

