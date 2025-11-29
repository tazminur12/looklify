'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function FeaturedBlogs() {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        setLoading(true);
        // First try to get featured blogs
        let response = await fetch('/api/blogs/public?featured=true&limit=4');
        
        if (response.ok) {
          const data = await response.json();
          const blogs = data.data?.blogs || [];
          
          // If we have featured blogs, use them
          if (blogs.length > 0) {
            setFeaturedBlogs(blogs);
            setLoading(false);
            return;
          }
        }
        
        // If no featured blogs, get any published blogs
        response = await fetch('/api/blogs/public?limit=4');
        
        if (response.ok) {
          const data = await response.json();
          setFeaturedBlogs(data.data?.blogs || []);
        } else {
          setFeaturedBlogs([]);
        }
      } catch (error) {
        console.error('Error fetching featured blogs:', error);
        setFeaturedBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                <span className="font-bold">Looklify</span>{' '}
                <span className="font-bold text-purple-600">Blog Articles</span>
              </h2>
              <div className="h-1 w-32 bg-purple-600 mt-2 rounded-full"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-[#7c52c5] animate-pulse overflow-hidden">
                <div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-200"></div>
                <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 sm:h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't show section if no featured blogs
  if (featuredBlogs.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header - centered like FeaturedProducts */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 relative">
            <span className="font-bold">Looklify Blog Articles</span>{' '}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </h2>
        </div>

        {/* Blog Cards Grid - matching FeaturedProducts layout */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {featuredBlogs.map((blog) => (
            <Link
              key={blog._id}
              href={`/blog/${blog.slug}`}
              className="group bg-white rounded-xl border border-[#7c52c5] hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Featured Image */}
              <div className="relative w-full h-32 sm:h-40 lg:h-48 overflow-hidden">
                {blog.featuredImage?.url ? (
                  <Image
                    src={blog.featuredImage.url}
                    alt={blog.featuredImage.alt || blog.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    unoptimized={blog.featuredImage.url.includes('cloudinary')}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                )}
                
                {/* Overlay Text */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3 lg:p-4">
                  <p className="text-white text-[10px] sm:text-xs lg:text-sm font-medium line-clamp-2">
                    {blog.title}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-2 sm:p-3 lg:p-4 flex-1 flex flex-col">
                {/* Date */}
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
                  {formatDate(blog.publishDate)}
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[32px] sm:min-h-[40px]">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                {blog.excerpt && (
                  <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 mb-2 sm:mb-3 flex-1">
                    {blog.excerpt}
                  </p>
                )}

                {/* Tags */}
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-auto">
                    {blog.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Read More Arrow */}
                <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] sm:text-xs lg:text-sm font-medium">Read More</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>View All Blog Articles</span>
            <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

