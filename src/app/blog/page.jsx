'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    tag: searchParams.get('tag') || '',
    page: 1
  });

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '12',
        status: 'published'
      });
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.tag) params.append('tag', filters.tag);
      
      const response = await fetch(`/api/blogs/public?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBlogs(data.data.blogs || []);
          // Note: Public API might not return pagination, so we'll handle it differently
          setPagination(prev => ({
            ...prev,
            currentPage: filters.page,
            totalCount: data.data.blogs?.length || 0
          }));
        } else {
          setError(data.error || 'Failed to load blogs');
        }
      } else {
        setError('Failed to load blogs');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchBlogs();
  };

  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog Articles</h1>
            <p className="text-gray-600">Loading blogs...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 animate-pulse overflow-hidden">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center">
            <h1 className="text-4xl pb-2 sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Looklify Blog
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Discover beauty tips, skincare routines, and expert advice
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Search articles..."
                  className="w-full px-6 py-4 pl-14 rounded-xl text-gray-900 bg-white border-2 border-purple-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:outline-none shadow-sm"
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg text-white font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Blogs Grid */}
        {blogs.length === 0 && !loading ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No blogs found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setFilters({ search: '', category: '', tag: '', page: 1 });
                fetchBlogs();
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug}`}
                className="group bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Featured Image */}
                <div className="relative w-full h-56 overflow-hidden">
                  {blog.featuredImage?.url ? (
                    <Image
                      src={blog.featuredImage.url}
                      alt={blog.featuredImage.alt || blog.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      unoptimized={blog.featuredImage.url.includes('cloudinary')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <svg className="w-16 h-16 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-medium line-clamp-2">
                        {blog.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Date and Author */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>{formatDate(blog.publishDate)}</span>
                    {blog.author && (
                      <>
                        <span>•</span>
                        <span>{blog.author.name || 'Admin'}</span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  {blog.excerpt && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                      {blog.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read More */}
                  <div className="flex items-center gap-2 text-purple-600 font-medium text-sm">
                    <span>Read More</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={filters.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {filters.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page >= pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

