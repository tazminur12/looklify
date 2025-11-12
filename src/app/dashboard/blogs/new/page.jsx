'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: { url: '', publicId: '', alt: '' },
    author: '',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    tags: [],
    categories: [],
    metaDescription: '',
    metaKeywords: [],
    relatedPosts: [],
    isFeatured: false,
    sortOrder: 0,
    seoTitle: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const stripHtml = (html) =>
    html ? html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim() : '';

  useEffect(() => {
    // Fetch users for author dropdown
    fetch('/api/users?limit=1000')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setUsers(json.data.users || []);
        }
      })
      .catch(err => console.error('Failed to load users:', err));

    // Fetch blogs for related posts
    fetch('/api/blogs?limit=1000&status=published')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setBlogs(json.data.blogs || []);
        }
      })
      .catch(err => console.error('Failed to load blogs:', err));
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    Swal.fire({
      title: 'Uploading Image...',
      text: 'Please wait while we upload your image',
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
      formData.append('folder', 'looklify-blogs');
      formData.append('type', 'image');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const json = await res.json();

      if (json.success) {
        setForm(prev => ({
          ...prev,
          featuredImage: {
            url: json.data.url,
            publicId: json.data.publicId,
            alt: prev.featuredImage.alt || form.title || 'Blog featured image'
          }
        }));
        
        Swal.fire({
          icon: 'success',
          title: 'Image Uploaded!',
          text: 'Featured image uploaded successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        setError(json.error || 'Failed to upload image');
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: json.error || 'Failed to upload image',
          confirmButtonText: 'Try Again'
        });
      }
    } catch (e) {
      console.error('Upload error:', e);
      setError('Network error during upload. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Upload Error',
        text: 'Network error during upload. Please try again.',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim().toLowerCase())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddCategory = () => {
    if (categoryInput.trim() && !form.categories.includes(categoryInput.trim())) {
      setForm(prev => ({
        ...prev,
        categories: [...prev.categories, categoryInput.trim()]
      }));
      setCategoryInput('');
    }
  };

  const handleRemoveCategory = (category) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !form.metaKeywords.includes(keywordInput.trim().toLowerCase())) {
      setForm(prev => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, keywordInput.trim().toLowerCase()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setForm(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(k => k !== keyword)
    }));
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!form.title.trim()) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (!stripHtml(form.content)) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    Swal.fire({
      title: 'Creating Blog...',
      text: 'Please wait while we create your blog post',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.title),
        seoTitle: form.seoTitle || form.title.substring(0, 60),
        featuredImage: form.featuredImage.url ? form.featuredImage : null,
        author: form.author || ''
      };
      
      const res = await fetch('/api/blogs', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      const json = await res.json();
      
      if (json.success) {
        Swal.fire({
          icon: 'success',
          title: 'Blog Created!',
          text: 'Your blog post has been created successfully',
          confirmButtonText: 'OK'
        }).then(() => {
          router.push('/dashboard/blogs');
        });
      } else {
        setError(json.error || 'Failed to create blog');
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: json.error || 'Failed to create blog',
          confirmButtonText: 'Try Again'
        });
      }
    } catch (e) {
      console.error('Submit error:', e);
      setError('Network error. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Network error. Please try again.',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/dashboard/blogs"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create New Blog</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Add a new blog post</p>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  setForm(prev => ({ ...prev, title: e.target.value }));
                  if (!form.slug) {
                    setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }));
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Enter blog title"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="blog-slug"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Short description of the blog post"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{form.excerpt.length}/500</p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
                placeholder="Draft your blog with the toolbar tools above."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use the editor toolbar (bold, headings, lists, alignment) just like MS Word. The content saves automatically in rich format.
              </p>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Featured Image
              </label>
              <div className="space-y-3">
                {form.featuredImage.url && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <img
                      src={form.featuredImage.url}
                      alt={form.featuredImage.alt || form.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, featuredImage: { url: '', publicId: '', alt: '' } }))}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(e.target.files[0]);
                    }
                  }}
                  disabled={uploading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
                {uploading && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uploading image...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Publishing Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Publishing Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author
              </label>
              <select
                value={form.author}
                onChange={(e) => setForm(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">Select Author</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>

            {/* Publish Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Publish Date
              </label>
              <input
                type="date"
                value={form.publishDate}
                onChange={(e) => setForm(prev => ({ ...prev, publishDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Featured */}
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Blog</span>
            </label>
          </div>
        </div>

        {/* Tags and Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags & Categories</h2>
          
          <div className="space-y-4">
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Add tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categories
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Add category and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.categories.map((category, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(category)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">SEO Settings</h2>
          
          <div className="space-y-4">
            {/* SEO Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
                maxLength={60}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="SEO title (max 60 characters)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{form.seoTitle.length}/60</p>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
                maxLength={160}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="Meta description for SEO (max 160 characters)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{form.metaDescription.length}/160</p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meta Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Add keyword and press Enter"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.metaKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Posts</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Related Posts
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-2">
              {blogs.filter(b => b._id).map(blog => (
                <label key={blog._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.relatedPosts.includes(blog._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setForm(prev => ({ ...prev, relatedPosts: [...prev.relatedPosts, blog._id] }));
                      } else {
                        setForm(prev => ({ ...prev, relatedPosts: prev.relatedPosts.filter(id => id !== blog._id) }));
                      }
                    }}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{blog.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link
            href="/dashboard/blogs"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Blog'}
          </button>
        </div>
      </form>
    </div>
  );
}

