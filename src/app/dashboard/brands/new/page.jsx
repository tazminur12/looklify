'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    country: '',
    sortOrder: 0,
    status: 'active',
    isFeatured: false,
    logo: { url: '', publicId: '', alt: '' }
  });

  const handleImageUpload = async (file, type = 'icon') => {
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'looklify');
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const json = await res.json();
      if (json.success) {
        setForm(prev => ({
          ...prev,
          logo: {
            url: json.data.url,
            publicId: json.data.publicId,
            alt: prev.logo.alt || form.name || 'Brand logo'
          }
        }));
      } else {
        setError(json.error || 'Failed to upload image');
      }
    } catch (e) {
      setError('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name,
        description: form.description,
        website: form.website,
        country: form.country,
        sortOrder: Number(form.sortOrder) || 0,
        status: form.status,
        isFeatured: !!form.isFeatured,
        logo: form.logo.url ? form.logo : null
      };
      const res = await fetch('/api/brands', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      const json = await res.json();
      if (json.success) {
        router.push('/dashboard/brands');
      } else {
        setError(json.error || 'Failed to create brand');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Brand</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Create a new brand</p>
        </div>
        <Link href="/dashboard/brands" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">← Back</Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Name *</label>
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100" 
              placeholder="e.g. L'Oreal" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
            <input 
              value={form.slug} 
              onChange={(e) => setForm({ ...form, slug: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100" 
              placeholder="loreal" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              rows={3} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100" 
              placeholder="Brand description" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
              <input 
                value={form.website} 
                onChange={(e) => setForm({ ...form, website: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100" 
                placeholder="https://loreal.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
              <input 
                value={form.country} 
                onChange={(e) => setForm({ ...form, country: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100" 
                placeholder="France" 
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand Logo</label>
            <div className="flex items-center gap-4">
              {form.logo.url ? (
                <div className="relative">
                  <img src={form.logo.url} alt={form.logo.alt} className="w-20 h-20 object-cover rounded-lg border" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, logo: { url: '', publicId: '', alt: '' } }))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">📷</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleImageUpload(file, 'icon');
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-sm"
                >
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort Order</label>
              <input 
                type="number" 
                value={form.sortOrder} 
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={form.isFeatured} 
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} 
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured Brand</span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/brands" className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</Link>
          <button 
            type="submit" 
            disabled={loading || uploading} 
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}
