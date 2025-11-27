'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function FeaturedCategories() {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shop/filters');
        
        if (response.ok) {
          const data = await response.json();
          setFeaturedCategories(data.data.featuredCategories || []);
        } else {
          // Fallback to static data if API fails
          setFeaturedCategories([
            { _id: '1', name: 'Skin Care', icon: '🧴', slug: 'skin-care' },
            { _id: '2', name: 'Hair Care', icon: '💇‍♀️', slug: 'hair-care' },
            { _id: '3', name: 'Lip Care', icon: '💄', slug: 'lip-care' },
            { _id: '4', name: 'Eye Care', icon: '👁️', slug: 'eye-care' },
            { _id: '5', name: 'Body Care', icon: '🧽', slug: 'body-care' },
            { _id: '6', name: 'Facial Care', icon: '✨', slug: 'facial-care' },
            { _id: '7', name: 'Teeth Care', icon: '🦷', slug: 'teeth-care' },
            { _id: '8', name: 'Health & Beauty', icon: '🌿', slug: 'health-beauty' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching featured categories:', error);
        // Fallback to static data
        setFeaturedCategories([
          { _id: '1', name: 'Skin Care', icon: '🧴', slug: 'skin-care' },
          { _id: '2', name: 'Hair Care', icon: '💇‍♀️', slug: 'hair-care' },
          { _id: '3', name: 'Lip Care', icon: '💄', slug: 'lip-care' },
          { _id: '4', name: 'Eye Care', icon: '👁️', slug: 'eye-care' },
          { _id: '5', name: 'Body Care', icon: '🧽', slug: 'body-care' },
          { _id: '6', name: 'Facial Care', icon: '✨', slug: 'facial-care' },
          { _id: '7', name: 'Teeth Care', icon: '🦷', slug: 'teeth-care' },
          { _id: '8', name: 'Health & Beauty', icon: '🌿', slug: 'health-beauty' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCategories();
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
      const itemWidth = firstChild ? firstChild.clientWidth + 12 /* approx gap */ : 120;
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
  }, [featuredCategories, isHovered]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Categories</h2>
          </div>
          <div className="relative overflow-hidden">
            <div className="flex gap-3 sm:gap-4 overflow-hidden">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="min-w-[104px] sm:min-w-[120px] bg-white rounded-xl p-4 text-center animate-pulse">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 relative">
            Featured Categories
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
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {featuredCategories.map((category) => (
              <Link
                key={category._id || category.name}
                href={`/shop?category=${category.slug}`}
                className="group bg-white rounded-xl p-3 sm:p-4 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-purple-100 hover:border-purple-300 relative overflow-hidden min-w-[104px] sm:min-w-[120px] flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 relative">
                    {category.image?.url ? (
                      <Image
                        src={category.image.url}
                        alt={category.image.alt || category.name}
                        fill
                        className="object-cover rounded-full"
                        sizes="(max-width: 768px) 40px, 48px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-xl sm:text-2xl">
                        {category.icon || '✨'}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-xs sm:text-sm truncate">
                    {category.name}
                  </h3>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
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

// Auto-scroll effect
// Keep outside component render to avoid recreating functions unnecessarily is not critical here,
// but we handle it inline with useEffect below for clarity.
