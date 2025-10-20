'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [brands, setBrands] = useState([]);
  const [parents, setParents] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: { url: '', publicId: '', alt: '' },
    brand: '',
    parent: '',
    sortOrder: 0,
    status: 'active',
    isFeatured: false,
  });
  const [errors, setErrors] = useState({});

  const loadData = async () => {
    try {
      const [brandsRes, parentsRes] = await Promise.all([
        fetch('/api/brands?limit=1000'),
        fetch('/api/categories?parent=root&limit=1000')
      ]);
      const brandsJson = await brandsRes.json();
      const parentsJson = await parentsRes.json();
      if (brandsJson.success) setBrands(brandsJson.data.brands);
      if (parentsJson.success) setParents(parentsJson.data.categories);
    } catch (err) {
      setError('Failed to load data. Please refresh the page.');
    }
  };

  useEffect(() => { loadData(); }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (form.name.length > 120) {
      newErrors.name = 'Category name cannot exceed 120 characters';
    }
    
    if (!form.brand) {
      newErrors.brand = 'Please select a brand';
    }
    
    if (form.description && form.description.length > 400) {
      newErrors.description = 'Description cannot exceed 400 characters';
    }
    
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleImageUpload = async (file, type = 'image') => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'looklify/categories');
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const json = await res.json();
      if (json.success) {
        setForm(prev => ({
          ...prev,
          image: {
            url: json.data.url,
            publicId: json.data.publicId,
            alt: prev.image.alt || form.name || 'Category image'
          }
        }));
        setSuccess('Image uploaded successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(json.error || 'Failed to upload image');
      }
    } catch (e) {
      setError('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file, 'image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug || generateSlug(form.name),
        description: form.description.trim(),
        icon: form.icon.trim(),
        image: form.image.url ? form.image : null,
        brand: form.brand,
        parent: form.parent || null,
        sortOrder: Number(form.sortOrder) || 0,
        status: form.status,
        isFeatured: !!form.isFeatured,
      };
      
      const res = await fetch('/api/categories', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const json = await res.json();
      if (json.success) {
        setSuccess('Category created successfully!');
        setTimeout(() => {
          router.push('/dashboard/categories');
        }, 1500);
      } else {
        setError(json.error || 'Failed to create category');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Category</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new category or subcategory to organize your products</p>
              </div>
            </div>
            <Link 
              href="/dashboard/categories" 
              className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Back to Categories</span>
            </Link>
          </div>
        </div>

        {/* Alert Messages */}
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

        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Essential details about your category</p>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Brand Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select 
                  value={form.brand} 
                  onChange={(e) => setForm({ ...form, brand: e.target.value })} 
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-gray-100`}
                >
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>

              {/* Name and Slug */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    value={form.name} 
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (!form.slug) {
                        setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-gray-100`}
                    placeholder="e.g. Skin Care, Electronics"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    URL Slug
                  </label>
                  <input 
                    value={form.slug} 
                    onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                      errors.slug ? 'border-red-300 bg-red-50' : 'border-gray-300 dark:border-gray-600'
                    } dark:bg-gray-700 dark:text-gray-100`}
                    placeholder="skin-care, electronics"
                  />
                  {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
                  <p className="text-xs text-gray-500 mt-1">Auto-generated from name if left empty</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Description
                </label>
                <textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows={4} 
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 dark:border-gray-600'
                  } dark:bg-gray-700 dark:text-gray-100`}
                  placeholder="Brief description of this category..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                <p className="text-xs text-gray-500 mt-1">{form.description.length}/400 characters</p>
              </div>
            </div>
          </div>

          {/* Category Hierarchy Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Category Hierarchy
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Set up parent-child relationships and organization</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Parent Category
                  </label>
                  <select 
                    value={form.parent} 
                    onChange={(e) => setForm({ ...form, parent: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-gray-100"
                    disabled={!form.brand}
                  >
                    <option value="">None (Top-level category)</option>
                    {parents.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.name} {p.brand && `(${brands.find(b => b._id === p.brand)?.name || 'Unknown Brand'})`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to create a main category</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Sort Order
                  </label>
                  <input 
                    type="number" 
                    value={form.sortOrder} 
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-gray-100"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Category Preview */}
              {form.brand && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category Preview</h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Brand:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {brands.find(b => b._id === form.brand)?.name || 'Select brand'}
                    </span>
                    {form.parent && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-500">Parent:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {parents.find(p => p._id === form.parent)?.name}
                        </span>
                      </>
                    )}
                    {form.name && (
                      <>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-purple-600">{form.name}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visual Elements Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Visual Elements
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Icons and images for better presentation</p>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Icon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Category Icon
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-2xl">
                    {form.icon || '📦'}
                  </div>
                  <input 
                    value={form.icon} 
                    onChange={(e) => setForm({ ...form, icon: e.target.value })} 
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-gray-100"
                    placeholder="💄 or ri-makeup-line"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Use emoji or icon class name</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Category Image
                </label>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragOver 
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {form.image.url ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img 
                          src={form.image.url} 
                          alt={form.image.alt} 
                          className="w-32 h-32 object-cover rounded-xl shadow-lg" 
                        />
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, image: { url: '', publicId: '', alt: '' } }))}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400">✓ Image uploaded successfully</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-3xl">
                        {uploading ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        ) : (
                          '📷'
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">
                          {uploading ? 'Uploading...' : 'Drop image here or click to upload'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(file, 'image');
                        }}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choose File
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Configure category behavior and visibility</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Status
                  </label>
                  <select 
                    value={form.status} 
                    onChange={(e) => setForm({ ...form, status: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-center">
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={form.isFeatured} 
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} 
                      className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" 
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Featured Category</span>
                      <p className="text-xs text-gray-500">Show prominently on homepage</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
            <Link 
              href="/dashboard/categories" 
              className="px-8 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors text-center"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading || uploading} 
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Category...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create Category</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


