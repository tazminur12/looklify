'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

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

  const handleImageUpload = async (file, type = 'image') => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    // Show loading alert
    Swal.fire({
      title: 'Uploading Image...',
      text: 'Please wait while we upload your image to Cloudinary',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'looklify-images');
      formData.append('type', type);

      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      console.log('Upload response status:', res.status);
      console.log('Upload response headers:', Object.fromEntries(res.headers.entries()));

      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server returned ${res.status}: ${text.substring(0, 100)}...`);
      }
      
      const json = await res.json();
      console.log('Upload response JSON:', json);

      if (json.success) {
        setForm(prev => ({
          ...prev,
          logo: {
            url: json.data.url,
            publicId: json.data.publicId,
            alt: prev.logo.alt || form.name || 'Brand logo'
          }
        }));
        
        // Success alert
        Swal.fire({
          icon: 'success',
          title: 'Image Uploaded!',
          text: 'Your brand logo has been successfully uploaded to Cloudinary',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const errorMsg = json.error || 'Failed to upload image';
        setError(errorMsg);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: errorMsg,
          confirmButtonText: 'Try Again'
        });
      }
    } catch (e) {
      console.error('Upload error:', e);
      const errorMsg = e.message.includes('Server returned') 
        ? e.message 
        : 'Network error during upload. Please check your internet connection and try again.';
      
      setError(errorMsg);
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: errorMsg,
        confirmButtonText: 'Try Again'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Show loading alert
    Swal.fire({
      title: 'Creating Brand...',
      text: 'Please wait while we create your brand',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
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
        // Success alert with redirect
        Swal.fire({
          icon: 'success',
          title: 'Brand Created Successfully!',
          text: `${form.name} has been added to your brand collection`,
          confirmButtonText: 'View Brands',
          showCancelButton: true,
          cancelButtonText: 'Create Another'
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/dashboard/brands');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Reset form for another brand
            setForm({
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
          }
        });
      } else {
        setError(json.error || 'Failed to create brand');
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: json.error || 'Failed to create brand. Please try again.',
          confirmButtonText: 'Try Again'
        });
      }
    } catch (e) {
      setError('Network error. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Failed to connect to the server. Please check your internet connection.',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (form.name) {
      setForm(prev => ({
        ...prev,
        slug: prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard/brands" 
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Brand
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Add a new brand to your beauty collection
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>All fields marked with * are required</span>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Brand Information Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Brand Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Basic details about the brand
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Brand Name & Slug */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 transition-all" 
                    placeholder="e.g. L'Oreal Paris" 
                    required
                  />
                  <div className="absolute right-3 top-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Generate from name
                  </button>
                </div>
                <div className="relative">
                  <input 
                    value={form.slug} 
                    onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 font-mono text-sm transition-all" 
                    placeholder="loreal-paris" 
                  />
                  <div className="absolute right-3 top-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Brand Description
              </label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={4} 
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 resize-none transition-all" 
                placeholder="Describe the brand, its values, and what makes it unique..." 
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {form.description.length}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Brand Details Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Brand Details
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Additional information about the brand
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Official Website
                </label>
                <div className="relative">
                  <input 
                    value={form.website} 
                    onChange={(e) => setForm({ ...form, website: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 transition-all" 
                    placeholder="https://example.com" 
                  />
                  <div className="absolute right-3 top-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country of Origin
                </label>
                <div className="relative">
                  <input 
                    value={form.country} 
                    onChange={(e) => setForm({ ...form, country: e.target.value })} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 transition-all" 
                    placeholder="e.g. France, USA, Japan" 
                  />
                  <div className="absolute right-3 top-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort Order
                </label>
                <input 
                  type="number" 
                  value={form.sortOrder} 
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all" 
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select 
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value })} 
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 transition-all"
                >
                  <option value="active">🟢 Active</option>
                  <option value="inactive">⚫ Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Logo Upload Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Brand Logo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Upload the brand's logo image
            </p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Logo Preview */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex items-center justify-center bg-gray-50 dark:bg-gray-700/50 transition-all hover:border-purple-400">
                  {form.logo.url ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <img 
                        src={form.logo.url} 
                        alt={form.logo.alt} 
                        className="w-full h-full object-contain p-2" 
                      />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, logo: { url: '', publicId: '', alt: '' } }))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-gray-500 dark:text-gray-400">No logo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Logo</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Recommended: Square image, 512×512 pixels, PNG or JPG format, max 2MB
                  </p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Validate file size
                        if (file.size > 2 * 1024 * 1024) {
                          Swal.fire({
                            icon: 'error',
                            title: 'File Too Large',
                            text: 'File size must be less than 2MB. Please choose a smaller image.',
                            confirmButtonText: 'OK'
                          });
                          return;
                        }
                        
                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                          Swal.fire({
                            icon: 'error',
                            title: 'Invalid File Type',
                            text: 'Please select an image file (PNG, JPG, JPEG, etc.)',
                            confirmButtonText: 'OK'
                          });
                          return;
                        }
                        
                        handleImageUpload(file, 'image');
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-purple-500/25"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choose Logo File
                      </>
                    )}
                  </label>
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={form.isFeatured} 
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} 
                      className="sr-only" 
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors ${
                      form.isFeatured ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        form.isFeatured ? 'transform translate-x-5' : ''
                      }`}></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Brand</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Show this brand prominently on the homepage
                    </p>
                  </div>
                  {form.isFeatured && (
                    <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">
                      ⭐
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              // Check if form has any data
              const hasData = form.name || form.description || form.website || form.country || form.logo.url;
              
              if (hasData) {
                Swal.fire({
                  title: 'Are you sure?',
                  text: 'You have unsaved changes. Are you sure you want to leave?',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#6b7280',
                  confirmButtonText: 'Yes, leave',
                  cancelButtonText: 'Stay here'
                }).then((result) => {
                  if (result.isConfirmed) {
                    router.push('/dashboard/brands');
                  }
                });
              } else {
                router.push('/dashboard/brands');
              }
            }}
            className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-medium text-center"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading || uploading || !form.name} 
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Brand...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Brand
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}