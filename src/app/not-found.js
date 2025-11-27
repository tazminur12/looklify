import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-5xl sm:text-6xl font-extrabold text-white">404</span>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-300 rounded-full opacity-60 animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-300 rounded-full opacity-60 animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Page Not Found
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Oops! This page doesn't exist
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          The page you're looking for might have been moved, deleted, or doesn't exist. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>

          <Link
            href="/shop"
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-xl border-2 border-purple-600 hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Browse Shop
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">Popular pages:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Shop
            </Link>
            <Link href="/blog" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

