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
          <div className="flex items-center justify-between mb-8">
            <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="font-bold">Shop From</span>{' '}
              <span className="font-bold text-purple-600">Brand</span>
            </h2>
              <div className="h-1 w-32 bg-purple-600 mt-2 rounded-full"></div>
            </div>
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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with "Shop From Brand" and "View All" link */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              <span className="font-bold">Shop From</span>{' '}
              <span className="font-bold text-purple-600">Brand</span>
            </h2>
            <div className="h-1 w-32 bg-purple-600 mt-2 rounded-full"></div>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors group"
          >
            <span>View All</span>
            <svg 
              className="w-5 h-5 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Single-line horizontal slider */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {featuredBrands.map((brand) => (
              <Link
                key={brand._id}
                href={`/shop?brand=${brand.slug || brand._id}`}
                className="group bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 relative overflow-hidden w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 flex items-center justify-center p-3"
              >
                {/* Brand Logo - fills the entire card */}
                {brand.logo?.url ? (
                  <div className="w-full h-full relative rounded-lg overflow-hidden">
                    <Image
                      src={brand.logo.url}
                      alt={brand.logo.alt || brand.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 128px, 160px"
                      unoptimized={brand.logo.url.includes('cloudinary')}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-400">
                      {brand.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Subtle hover overlay */}
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

