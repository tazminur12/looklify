export default function FeaturesSection() {
  return (
    <section className="py-6 sm:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Why Choose Looklify?</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">Experience the difference with our premium beauty solutions</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 text-center">
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Premium Quality</h3>
            <p className="text-xs sm:text-sm text-gray-600">Only the finest ingredients and highest quality standards</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Natural Ingredients</h3>
            <p className="text-xs sm:text-sm text-gray-600">Carefully sourced organic and natural beauty ingredients</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Expert Curated</h3>
            <p className="text-xs sm:text-sm text-gray-600">Products selected by beauty experts and professionals</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto mb-2 sm:mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Fast Delivery</h3>
            <p className="text-xs sm:text-sm text-gray-600">Quick and reliable shipping to your doorstep</p>
          </div>
        </div>
      </div>
    </section>
  );
}
