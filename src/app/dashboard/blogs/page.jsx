'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BlogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('publishDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 });

  const fetchBlogs = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(pagination.limit),
        sortBy,
        sortOrder
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`/api/blogs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setBlogs(json.data.blogs);
        setPagination(json.data.pagination);
      } else {
        setError(json.error || 'Failed to load blogs');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchBlogs(1), 400);
    return () => clearTimeout(t);
  }, [search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchBlogs(1);
  }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchBlogs(pagination.currentPage);
      } else {
        alert(json.error || 'Failed to delete blog');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const total = pagination.totalCount;
    const published = blogs.filter(b => b.status === 'published').length;
    const draft = blogs.filter(b => b.status === 'draft').length;
    const archived = blogs.filter(b => b.status === 'archived').length;
    const featured = blogs.filter(b => b.isFeatured).length;
    const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);
    return { total, published, draft, archived, featured, totalViews };
  }, [blogs, pagination.totalCount]);

  if (loading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Blogs</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your blog posts and articles</p>
          </div>
        </div>
        <Link
          href="/dashboard/blogs/new"
          className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium">Add Blog</span>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Blogs</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.published}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Published</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Drafts</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.featured}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Featured</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.archived}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Archived</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-pink-100 dark:bg-pink-900/20 rounded-lg sm:rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search blogs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 min-w-[100px] sm:min-w-[120px]"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 min-w-[100px] sm:min-w-[120px]"
            >
              <option value="publishDate">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="views">Sort by Views</option>
              <option value="createdAt">Sort by Created</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Blogs List */}
      {blogs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No blogs found</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Get started by creating your first blog post</p>
          <Link
            href="/dashboard/blogs/new"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Blog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Featured Image */}
                  {blog.featuredImage?.url && (
                    <div className="lg:w-48 flex-shrink-0">
                      <img
                        src={blog.featuredImage.url}
                        alt={blog.featuredImage.alt || blog.title}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {blog.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                          By {blog.author?.name || 'Unknown'} • {new Date(blog.publishDate).toLocaleDateString()} • {blog.views || 0} views
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          blog.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : blog.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {blog.status}
                        </span>
                        {blog.isFeatured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    {blog.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {blog.excerpt}
                      </p>
                    )}

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {blog.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/blogs/edit/${blog._id}`)}
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-xs sm:text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id, blog.title)}
                        className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-xs sm:text-sm font-medium"
                      >
                        Delete
                      </button>
                      <a
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchBlogs(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchBlogs(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

