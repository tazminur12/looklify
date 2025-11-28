'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/shop/filters');
        const json = await res.json();

        if (res.ok && json?.data?.featuredBrands) {
          setBrands(json.data.featuredBrands);
        } else {
          setBrands([]);
        }
      } catch (e) {
        console.error('Error loading brands page:', e);
        setError('Failed to load brands. Please try again.');
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Shop From Brands
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Discover our curated collection of beauty brands
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="h-28 sm:h-32 bg-white border border-gray-200 rounded-xl animate-pulse"
              >
                <div className="w-full h-full bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!loading && brands.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Shop From Brands
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-8">
            No brands are available right now. Please check back later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 relative">
            Shop From Brands
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Browse all our featured brands and explore products from your favorites.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {brands.map((brand) => (
            <Link
              key={brand._id}
              href={`/shop?brand=${brand.slug || brand._id}`}
              className="group relative rounded-xl border border-[#7c52c5]/60 hover:border-[#7c52c5] bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center h-28 sm:h-32"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative w-full h-full flex items-center justify-center p-3">
                {brand.logo?.url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.logo.url}
                      alt={brand.logo.alt || brand.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
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
          ))}
        </div>

        {error && (
          <p className="mt-6 text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}


