import Link from 'next/link';
import Image from 'next/image';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-3 mb-8">
            <Image
              src="/logo/Looklify logo.jpg"
              alt="Looklify Logo"
              width={50}
              height={50}
              className="w-12 h-12 rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-900">LOOKLIFY</span>
          </Link>
        </div>
        
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-lg text-gray-600 mb-8">
              You don&apos;t have permission to access this page.
            </p>
            
            <div className="space-y-4">
              <Link
                href="/"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                Go to Homepage
              </Link>
              
              <Link
                href="/profile"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
