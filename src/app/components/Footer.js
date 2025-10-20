import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  LOOKLIFY
                </span>
                <p className="text-sm text-purple-300 mt-1">Beauty Redefined</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              Your premium destination for beauty and skincare products. Discover the latest trends, 
              premium quality products, and expert beauty advice to enhance your natural beauty.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-800 hover:bg-purple-600 rounded-lg transition-all duration-200 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-all duration-200 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-pink-600 rounded-lg transition-all duration-200 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all duration-200 group">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/skincare" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/makeup" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Makeup
                </Link>
              </li>
              <li>
                <Link href="/fragrance" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Fragrance
                </Link>
              </li>
              <li>
                <Link href="/haircare" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Hair Care
                </Link>
              </li>
              <li>
                <Link href="/bestsellers" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Bestsellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Track Your Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Beauty Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Press
                </Link>
              </li>
              <li>
                <Link href="/affiliates" className="text-gray-300 hover:text-purple-400 transition-colors text-sm flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Affiliate Program
                </Link>
              </li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
              <p>© 2024 Looklify. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-purple-400 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-purple-400 transition-colors">
                  Cookies
                </Link>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm hidden sm:block">We accept:</span>
              <div className="flex items-center gap-3">
                
                {/* SSLCommerz Payment Method */}
                <div className="w-24 h-12 bg-white rounded flex items-center justify-center shadow-sm p-2">
                  <Image
                    src="/footer/SSLCommerz.png"
                    alt="SSLCommerz"
                    width={80}
                    height={40}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Payment
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              100% Satisfaction
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}