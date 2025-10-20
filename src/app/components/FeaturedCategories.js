'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function FeaturedCategories() {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Categories</h2>
            <p className="text-lg text-gray-600">Discover our carefully curated selection of beauty products</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative">
            Featured Categories
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated selection of beauty products across different categories
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
          {featuredCategories.map((category) => (
            <Link
              key={category._id || category.name}
              href={`/shop?category=${category.slug}`}
              className="group bg-white rounded-xl p-4 md:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-100 hover:border-purple-300 relative overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Category Image or Icon */}
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 relative">
                  {category.image?.url ? (
                    <Image
                      src={category.image.url}
                      alt={category.image.alt || category.name}
                      fill
                      className="object-cover rounded-full"
                      sizes="(max-width: 768px) 48px, 64px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-2xl md:text-3xl">
                      {category.icon || '✨'}
                    </div>
                  )}
                </div>
                
                {/* Category Name */}
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-sm md:text-base">
                  {category.name}
                </h3>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </Link>
          ))}
        </div>
        
        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            View All Categories
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
