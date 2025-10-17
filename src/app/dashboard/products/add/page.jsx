'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    bengaliName: '',
    description: '',
    bengaliDescription: '',
    category: 'Skin Care',
    subcategory: '',
    price: '',
    originalPrice: '',
    sku: '',
    productCode: '',
    stock: '',
    lowStockThreshold: '20',
    status: 'active',
    brand: '',
    origin: '',
    skinType: [],
    skinConcern: [],
    soldCount: '0',
    watchersCount: '0',
    weight: {
      value: '',
      unit: 'g'
    },
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    features: [''],
    ingredients: [''],
    tags: [''],
    images: [
      {
        url: '/slider/1.webp',
        alt: '',
        isPrimary: true
      }
    ],
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    inventory: {
      trackInventory: true,
      allowBackorder: false,
      minOrderQuantity: '1',
      maxOrderQuantity: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ['']
    }
  });

  const categories = [
    'Skin Care',
    'Hair Care',
    'Lip Care',
    'Eye Care',
    'Body Care',
    'Facial Care',
    'Teeth Care',
    'Health & Beauty',
    'Makeup',
    'Tools'
  ];

  const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'All Types'];
  const skinConcerns = ['Acne', 'Aging', 'Dark Spots', 'Dryness', 'Oiliness', 'Sensitivity', 'Uneven Skin Tone', 'Wrinkles'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.productCode.trim()) newErrors.productCode = 'Product code is required';
    if (formData.stock === '' || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';

    // SKU format validation (alphanumeric with dashes/underscores)
    if (formData.sku && !/^[A-Z0-9-_]+$/i.test(formData.sku.trim())) {
      newErrors.sku = 'SKU should contain only letters, numbers, dashes, and underscores';
    }

    // Price validation
    if (formData.originalPrice && formData.originalPrice <= formData.price) {
      newErrors.originalPrice = 'Original price must be higher than current price';
    }

    // Image validation
    if (!formData.images[0]?.url) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        soldCount: parseInt(formData.soldCount),
        watchersCount: parseInt(formData.watchersCount),
        weight: {
          value: formData.weight.value ? parseFloat(formData.weight.value) : null,
          unit: formData.weight.unit
        },
        dimensions: {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : null,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : null,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : null,
          unit: formData.dimensions.unit
        },
        features: formData.features.filter(f => f.trim()),
        ingredients: formData.ingredients.filter(i => i.trim()),
        tags: formData.tags.filter(t => t.trim()),
        keywords: formData.seo.keywords.filter(k => k.trim()),
        inventory: {
          ...formData.inventory,
          minOrderQuantity: parseInt(formData.inventory.minOrderQuantity),
          maxOrderQuantity: formData.inventory.maxOrderQuantity ? parseInt(formData.inventory.maxOrderQuantity) : null
        }
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard/products');
      } else {
        if (result.details && Array.isArray(result.details)) {
          // Validation errors from server
          const serverErrors = {};
          result.details.forEach(error => {
            // Extract field name from error message
            const fieldMatch = error.match(/`(\w+)`/);
            if (fieldMatch) {
              serverErrors[fieldMatch[1]] = error;
            }
          });
          setErrors(serverErrors);
        } else {
          setErrors({ submit: result.error || 'Failed to create product' });
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">নতুন পণ্য যোগ করুন</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            আপনার স্টোরে নতুন পণ্য তৈরি করুন
          </p>
        </div>
        <Link
          href="/dashboard/products"
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
        >
          ← পণ্য তালিকায় ফিরুন
        </Link>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            মৌলিক তথ্য
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                পণ্যের নাম (ইংরেজি) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="পণ্যের নাম লিখুন"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                পণ্যের নাম (বাংলা)
              </label>
              <input
                type="text"
                value={formData.bengaliName}
                onChange={(e) => handleInputChange('bengaliName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="পণ্যের বাংলা নাম লিখুন"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ক্যাটাগরি *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                সাব-ক্যাটাগরি
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="যেমন: ফেস সিরাম, শ্যাম্পু"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ব্র্যান্ড
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="ব্র্যান্ডের নাম"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                উৎপাদনের দেশ
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="যেমন: বাংলাদেশ, থাইল্যান্ড"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বর্ণনা (ইংরেজি) *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="4"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.description ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="পণ্যের বিস্তারিত বর্ণনা লিখুন"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বর্ণনা (বাংলা)
              </label>
              <textarea
                value={formData.bengaliDescription}
                onChange={(e) => handleInputChange('bengaliDescription', e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="পণ্যের বাংলা বর্ণনা লিখুন"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            মূল্য ও ইনভেন্টরি
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বর্তমান মূল্য (৳) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.price ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="720"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                আসল মূল্য (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.originalPrice ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="1200"
              />
              {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.sku ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="PRODUCT-SKU-001"
              />
              {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                পণ্য কোড *
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => handleInputChange('productCode', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.productCode ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="BLG-P0001"
              />
              {errors.productCode && <p className="mt-1 text-sm text-red-600">{errors.productCode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                স্টক পরিমাণ *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.stock ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="100"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                বিক্রিত সংখ্যা
              </label>
              <input
                type="number"
                min="0"
                value={formData.soldCount}
                onChange={(e) => handleInputChange('soldCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                পর্যবেক্ষক সংখ্যা
              </label>
              <input
                type="number"
                min="0"
                value={formData.watchersCount}
                onChange={(e) => handleInputChange('watchersCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                অবস্থা
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="active">সক্রিয়</option>
                <option value="inactive">নিষ্ক্রিয়</option>
                <option value="out_of_stock">স্টক নেই</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skin Type & Concerns */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ত্বকের ধরন ও সমস্যা
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ত্বকের ধরন
              </label>
              <div className="space-y-2">
                {skinTypes.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.skinType.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            skinType: [...prev.skinType, type]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skinType: prev.skinType.filter(t => t !== type)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ত্বকের সমস্যা
              </label>
              <div className="space-y-2">
                {skinConcerns.map((concern) => (
                  <label key={concern} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.skinConcern.includes(concern)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            skinConcern: [...prev.skinConcern, concern]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skinConcern: prev.skinConcern.filter(c => c !== concern)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{concern}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Product Images
          </h2>
          <div className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image URL {index === 0 && '*'}
                  </label>
                  <input
                    type="url"
                    value={image.url}
                    onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[index] = { ...newImages[index], url: e.target.value };
                      setFormData(prev => ({ ...prev, images: newImages }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => {
                      const newImages = [...formData.images];
                      newImages[index] = { ...newImages[index], alt: e.target.value };
                      setFormData(prev => ({ ...prev, images: newImages }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    placeholder="Product image description"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...formData.images];
                      newImages[index] = { ...newImages[index], isPrimary: !newImages[index].isPrimary };
                      setFormData(prev => ({ ...prev, images: newImages }));
                    }}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      image.isPrimary
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {image.isPrimary ? 'Primary' : 'Set Primary'}
                  </button>
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = formData.images.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  images: [...prev.images, { url: '', alt: '', isPrimary: false }]
                }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              + Add Another Image
            </button>
            {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
          </div>
        </div>

        {/* Features & Tags */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Features & Tags
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Features
              </label>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleArrayChange('features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Enter feature"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('features')}
                  className="px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  + Add Feature
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                      placeholder="Enter tag"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  + Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Flags */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Product Flags
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => handleInputChange('isBestSeller', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Best Seller</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => handleInputChange('isNewArrival', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">New Arrival</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.inventory.trackInventory}
                onChange={(e) => handleNestedInputChange('inventory', 'trackInventory', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Track Inventory</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/products"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            বাতিল করুন
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'পণ্য তৈরি হচ্ছে...' : 'পণ্য তৈরি করুন'}
          </button>
        </div>
      </form>
    </div>
  );
}
