'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  // List-only view (accordion)
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 1000 });
  const [expandedIds, setExpandedIds] = useState({});

  const fetchCategories = async (page = 1) => {
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
      if (brandFilter) params.append('brand', brandFilter);
      
      const res = await fetch(`/api/categories?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setCategories(json.data.categories);
        setPagination(json.data.pagination);
      } else {
        setError(json.error || 'Failed to load categories');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/brands?limit=1000');
      const json = await res.json();
      if (json.success) {
        setBrands(json.data.brands);
      }
    } catch (e) {
      console.error('Failed to load brands:', e);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchCategories(1), 400);
    return () => clearTimeout(t);
  }, [search, statusFilter, brandFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCategories(1);
    fetchBrands();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.status === 'active').length;
    const inactive = categories.filter(c => c.status === 'inactive').length;
    const featured = categories.filter(c => c.isFeatured).length;
    const withSubcategories = categories.filter(c => c.children && c.children.length > 0).length;
    const totalSubcategories = categories.filter(c => c.parent != null).length;
    
    return { total, active, inactive, featured, withSubcategories, totalSubcategories };
  }, [categories]);

  const groupedByParent = useMemo(() => {
    const byId = new Map();
    // Preserve children from API if they exist, otherwise initialize as empty array
    categories.forEach(c => {
      byId.set(c._id, { 
        ...c, 
        children: Array.isArray(c.children) ? [...c.children] : [] 
      });
    });
    
    const roots = [];
    byId.forEach(cat => {
      // Check if parent exists (could be ObjectId or populated object)
      const parentId = cat.parent?._id || cat.parent;
      if (parentId) {
        const parent = byId.get(parentId);
        if (parent) {
          // Check if this child is not already in the children array
          const exists = parent.children.some(child => child._id === cat._id || child === cat._id);
          if (!exists) {
            parent.children.push(cat);
          }
        } else {
          // Parent not in current page, but category has parent, still show it but mark as orphan
          roots.push(cat);
        }
      } else {
        roots.push(cat);
      }
    });
    
    // Sort roots and children
    roots.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    roots.forEach(r => {
      if (r.children && r.children.length > 0) {
        r.children.sort((a, b) => {
          const aOrder = (typeof a === 'object' ? a.sortOrder : 0) ?? 0;
          const bOrder = (typeof b === 'object' ? b.sortOrder : 0) ?? 0;
          return aOrder - bOrder;
        });
      }
    });
    
    return roots;
  }, [categories]);

  const areAllExpanded = useMemo(() => {
    if (!groupedByParent || groupedByParent.length === 0) return false;
    return groupedByParent.every(cat => !!expandedIds[cat._id]);
  }, [groupedByParent, expandedIds]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      fetchCategories(pagination.currentPage);
    } else {
      alert(json.error || 'Failed to delete category');
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (!groupedByParent || groupedByParent.length === 0) return;
    if (areAllExpanded) {
      setExpandedIds({});
    } else {
      const next = {};
      groupedByParent.forEach(cat => { next[cat._id] = true; });
      setExpandedIds(next);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your product categories and subcategories</p>
              </div>
            </div>
            <Link
              href="/dashboard/categories/new"
              className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-medium">Add Category</span>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg sm:rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Categories</p>
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
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Inactive</p>
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
              <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg sm:rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.withSubcategories}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">With Subcategories</p>
              </div>
            </div>
          </div>

          {/* Total Subcategories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-pink-100 dark:bg-pink-900/20 rounded-lg sm:rounded-xl">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSubcategories}</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Subcategories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 min-w-[120px] sm:min-w-[150px]"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>{brand.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 min-w-[100px] sm:min-w-[120px]"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 min-w-[100px] sm:min-w-[120px]"
              >
                <option value="name">Sort by Name</option>
                <option value="createdAt">Sort by Date</option>
                <option value="sortOrder">Sort by Order</option>
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

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Showing {categories.length} of {pagination.totalCount} categories
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAll}
              className="px-3 py-1.5 rounded-lg sm:rounded-md text-xs sm:text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {areAllExpanded ? 'Hide subcategories' : 'Show subcategories'}
            </button>
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

        {/* Categories Display - List only */}
        {categories.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No categories found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Get started by creating your first category</p>
            <Link
              href="/dashboard/categories/new"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Category
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedByParent.map((cat) => {
              const isExpanded = !!expandedIds[cat._id];
              return (
                <div key={cat._id}>
                  <CategoryListItem 
                    category={cat} 
                    onEdit={() => router.push(`/dashboard/categories/edit/${cat._id}`)} 
                    onDelete={() => handleDelete(cat._id)} 
                    onToggle={() => toggleExpand(cat._id)}
                    isExpanded={isExpanded}
                  />

                  {/* Subcategories */}
                  {isExpanded && cat.children?.length > 0 && (
                    <div className="mt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cat.children.map(child => (
                          <SubcategoryTile
                            key={child._id}
                            category={child}
                            onOpen={() => router.push(`/dashboard/categories/edit/${child._id}`)}
                            onDelete={() => handleDelete(child._id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Card view removed

// Category List Item Component
function CategoryListItem({ category, isSubcategory = false, onEdit, onDelete, onToggle, isExpanded }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-0 transition-all hover:shadow-xl ${isSubcategory ? 'opacity-90 sm:ml-4 ml-2 border-l-4 border-l-purple-200 dark:border-l-purple-800' : ''}`}>
      {/* Accordion Header */}
      <button
        type="button"
        onClick={!isSubcategory ? onToggle : undefined}
        className={`w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between ${!isSubcategory ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}`}
      >
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg flex items-center justify-center text-base sm:text-lg flex-shrink-0">
            {category.icon || '📦'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{category.name}</h3>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">/{category.slug}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                category.status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {category.status}
              </span>
              {category.isFeatured && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 flex-shrink-0">Featured</span>
              )}
            </div>
            {category.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{category.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              {category.brand && <span className="truncate">Brand: {category.brand.name}</span>}
              {category.children && category.children.length > 0 && (
                <span>{category.children.length} subcategor{category.children.length === 1 ? 'y' : 'ies'}</span>
              )}
              <span>Sort: {category.sortOrder || 0}</span>
            </div>
          </div>
        </div>
        {!isSubcategory && (
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 transition-transform flex-shrink-0 ml-2 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* Row action bar */}
      {!isSubcategory && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 -mt-1 flex items-center space-x-2">
          <button onClick={onEdit} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-xs sm:text-sm font-medium">Edit</button>
          <button onClick={onDelete} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-xs sm:text-sm font-medium">Delete</button>
        </div>
      )}
    </div>
  );
}

// Compact tile for subcategories inside accordion
function SubcategoryTile({ category, onOpen, onDelete }) {
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent opening the tile when clicking delete
    if (confirm(`Are you sure you want to delete the subcategory "${category.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="relative group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:shadow transition-colors">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-left px-4 sm:px-5 py-3 sm:py-4 pr-10"
      >
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-sm sm:text-base flex-shrink-0">
            {category.icon || '📦'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">{category.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">/{category.slug}</p>
          </div>
        </div>
      </button>
      
      {/* Delete Button */}
      <button
        type="button"
        onClick={handleDeleteClick}
        className="absolute top-2 right-2 p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete subcategory"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}


