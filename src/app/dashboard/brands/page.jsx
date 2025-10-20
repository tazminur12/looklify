'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BrandsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 });

  const fetchBrands = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (featuredFilter) params.append('featured', featuredFilter);
      const res = await fetch(`/api/brands?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setBrands(json.data.brands);
        setPagination(json.data.pagination);
      } else {
        setError(json.error || 'Failed to load brands');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchBrands(1), 400);
    return () => clearTimeout(t);
  }, [search, statusFilter, featuredFilter]);

  useEffect(() => {
    fetchBrands(1);
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchBrands(pagination.currentPage);
      } else {
        alert(json.error || 'Failed to delete brand');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' })
      });
      const json = await res.json();
      if (json.success) {
        fetchBrands(pagination.currentPage);
      } else {
        alert(json.error || 'Failed to update brand');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const total = brands.length;
    const active = brands.filter(b => b.status === 'active').length;
    const featured = brands.filter(b => b.isFeatured).length;
    return { total, active, featured };
  }, [brands]);

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Brand Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage and organize your beauty brands collection
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/brands/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Brand
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Brands</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Brands</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Featured</p>
              <p className="text-3xl font-bold mt-2">{stats.featured}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brands by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 transition-all"
                />
                <div className="absolute left-4 top-3.5 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 min-w-40 transition-all"
              >
                <option value="">All Status</option>
                <option value="active">🟢 Active</option>
                <option value="inactive">⚫ Inactive</option>
              </select>
              
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 min-w-40 transition-all"
              >
                <option value="">All Brands</option>
                <option value="featured">⭐ Featured</option>
                <option value="not-featured">🔹 Regular</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {brands.length === 0 && !loading ? (
          <div className="col-span-full text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No brands found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {search || statusFilter || featuredFilter 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by adding your first beauty brand to the collection.'
              }
            </p>
            <Link
              href="/dashboard/brands/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Your First Brand
            </Link>
          </div>
        ) : (
          brands.map((brand) => (
            <div 
              key={brand._id} 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Logo and Actions Header */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {brand.logo?.url ? (
                      <img
                        src={brand.logo.url}
                        alt={brand.logo.alt || brand.name}
                        className="w-16 h-16 object-cover rounded-2xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-purple-200 dark:group-hover:border-purple-800 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {brand.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-mono mt-1">
                        /{brand.slug}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleStatusToggle(brand._id, brand.status)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      brand.status === 'active' 
                        ? 'bg-green-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    title={brand.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      brand.status === 'active' ? 'transform translate-x-6' : 'transform translate-x-1'
                    }`}></div>
                  </button>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    brand.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {brand.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                  </span>
                  {brand.isFeatured && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      ⭐ Featured
                    </span>
                  )}
                  {brand.country && (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      🌍 {brand.country}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Brand Details */}
              <div className="p-6 space-y-4">
                {brand.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                    {brand.description}
                  </p>
                )}
                
                {/* Website Link */}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors group/link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="truncate">{brand.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => router.push(`/dashboard/brands/edit/${brand._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(brand._id, brand.name)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && brands.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}