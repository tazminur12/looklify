import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo and Tagline Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-white">
                LOOKLIFY
              </span>
            </div>
            <div className="space-y-1 text-sm text-white">
              <p>Beauty Redefined</p>
              <p>Glow Up with Confidence.</p>
              <p>100% Authentic Skincare</p>
              <p>& Beauty Products.</p>
            </div>
          </div>

          {/* Most Popular Categories */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Most popular Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-white hover:text-purple-300 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Services */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Customer Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/customer-services" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Customer Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white hover:text-purple-300 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/return-refund" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Return And Refund
                </Link>
              </li>
              <li>
                <Link href="/shipping-delivery" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Shipping And Delivery
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Terms And Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-white hover:text-purple-300 transition-colors">
                  Store Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Contact Us
            </h3>
            <div className="space-y-2 text-sm text-white">
              <p>01866414126</p>
              <p>looklify.official@gmail.com</p>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white">
              Social
            </h3>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="https://www.facebook.com/looklifybd" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-indigo-900 mt-12 pt-8">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-center text-sm text-white">
              © 2025 Looklify. All rights reserved.
            </p>
            <p className="text-center text-xs sm:text-sm text-gray-400">
              Developed By{' '}
              <a 
                href="https://tanimportfolio1.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-200 transition-colors font-medium"
              >
                Tazminur Rahman Tanim
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}