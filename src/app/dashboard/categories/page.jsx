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
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 20 });

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit) });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
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

  useEffect(() => {
    const t = setTimeout(() => fetchCategories(1), 400);
    return () => clearTimeout(t);
  }, [search, statusFilter]);

  useEffect(() => {
    fetchCategories(1);
  }, []);

  const groupedByParent = useMemo(() => {
    const byId = new Map();
    categories.forEach(c => byId.set(c._id, { ...c, children: [] }));
    const roots = [];
    byId.forEach(cat => {
      if (cat.parent?._id) {
        const parent = byId.get(cat.parent._id);
        if (parent) parent.children.push(cat);
        else roots.push(cat);
      } else {
        roots.push(cat);
      }
    });
    roots.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    roots.forEach(r => r.children.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)));
    return roots;
  }, [categories]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage categories and subcategories</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/categories/new"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm flex items-center gap-2"
          >
            ➕ Add Category
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Category Tree */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {groupedByParent.length === 0 && (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">No categories found</div>
          )}
          {groupedByParent.map((cat) => (
            <div key={cat._id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">{cat.name}</span>
                    <span className="text-xs text-gray-500">/{cat.slug}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${cat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{cat.status}</span>
                    {cat.isFeatured && <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">Featured</span>}
                  </div>
                  {cat.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{cat.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/dashboard/categories/edit/${cat._id}`)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Edit</button>
                  <button onClick={() => handleDelete(cat._id)} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Delete</button>
                </div>
              </div>
              {cat.children?.length > 0 && (
                <div className="mt-3 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4 space-y-2">
                  {cat.children.map(child => (
                    <div key={child._id} className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{child.name}</span>
                          <span className="text-xs text-gray-500">/{child.slug}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${child.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{child.status}</span>
                          {child.isFeatured && <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">Featured</span>}
                        </div>
                        {child.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{child.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/dashboard/categories/edit/${child._id}`)} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Edit</button>
                        <button onClick={() => handleDelete(child._id)} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


