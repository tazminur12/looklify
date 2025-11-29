'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function FeaturedBrands() {
  const [featuredBrands, setFeaturedBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchFeaturedBrands = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shop/filters');
        
        if (response.ok) {
          const data = await response.json();
          setFeaturedBrands(data.data?.featuredBrands || []);
        } else {
          // Fallback to empty array if API fails
          setFeaturedBrands([]);
        }
      } catch (error) {
        console.error('Error fetching featured brands:', error);
        setFeaturedBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBrands();
  }, []);

  // Auto-scroll horizontally when overflowed; pause on hover
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const hasOverflow = container.scrollWidth > container.clientWidth;
    if (!hasOverflow) return;

    let intervalId;
    const step = () => {
      if (!container || isHovered) return;
      const firstChild = container.firstElementChild;
      const itemWidth = firstChild ? firstChild.clientWidth + 16 /* approx gap */ : 144;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft + itemWidth >= maxScrollLeft - 2) {
        // Jump back to start without smooth behavior to avoid long animation
        container.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        container.scrollBy({ left: itemWidth, behavior: 'smooth' });
      }
    };

    intervalId = setInterval(step, 2200);
    return () => clearInterval(intervalId);
  }, [featuredBrands, isHovered]);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 relative">
              <span className="font-bold">Shop From Brands</span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </h2>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex gap-4 overflow-hidden">
              {[...Array(7)].map((_, index) => (
                <div key={index} className="w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-xl border border-gray-200 animate-pulse flex-shrink-0">
                  <div className="w-full h-full bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't show section if no featured brands
  if (featuredBrands.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 relative">
            <span className="font-bold">Shop From Brands</span>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </h2>
        </div>

        {/* Single-line horizontal slider */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-3 sm:pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {featuredBrands.map((brand, index) => {
              // Different gradient colors for each card
              const gradientColors = [
                'from-purple-500 via-pink-500 to-red-500',
                'from-blue-500 via-purple-500 to-pink-500',
                'from-pink-500 via-red-500 to-orange-500',
                'from-purple-500 via-indigo-500 to-blue-500',
                'from-pink-500 via-purple-500 to-indigo-500',
                'from-orange-500 via-pink-500 to-purple-500',
                'from-blue-500 via-cyan-500 to-teal-500',
              ];
              const gradientColor = gradientColors[index % gradientColors.length];
              
              return (
                <Link
                  key={brand._id}
                  href={`/shop?brand=${brand.slug || brand._id}`}
                  className="group relative rounded-xl bg-white overflow-hidden flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex-shrink-0"
                >
                  {/* Gradient border wrapper */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} rounded-xl p-[1px] opacity-60`}>
                    <div className="w-full h-full bg-white rounded-xl"></div>
                  </div>
                  
                  {/* Brand Logo - exact same structure as brands page */}
                  <div className="relative w-full h-full flex items-center justify-center p-3 z-10">
                    {brand.logo?.url ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={brand.logo.url}
                          alt={brand.logo.alt || brand.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                          unoptimized={brand.logo.url.includes('cloudinary')}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-bold text-gray-400 mb-1">
                          {brand.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-700 line-clamp-1 px-2">
                          {brand.name}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* View All Button - Centered at bottom */}
        <div className="text-center mt-8">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>View All Brands</span>
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
      
      
    </section>
  );
}

