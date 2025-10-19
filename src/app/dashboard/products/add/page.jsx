'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  // Image upload function
  const handleImageUpload = async (file, index) => {
    setUploading(true);
    setErrors(prev => ({ ...prev, images: '' }));
    
    try {
      // Validate file
      if (!file) {
        throw new Error('No file selected');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('Uploading file:', file.name, 'Size:', file.size);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response data:', data);
      
      if (data.success && data.url) {
        const newImages = [...formData.images];
        newImages[index] = { 
          ...newImages[index], 
          url: data.url,
          publicId: data.publicId
        };
        setFormData(prev => ({ ...prev, images: newImages }));
        console.log('Image uploaded successfully:', data.url);
      } else {
        throw new Error(data.error || 'Upload failed - no URL returned');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ ...prev, images: error.message || 'Failed to upload image. Please try again.' }));
    } finally {
      setUploading(false);
    }
  };

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
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-purple-200 dark:border-gray-600">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Product</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a new product for your store
          </p>
        </div>
        <Link
          href="/dashboard/products"
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 text-sm transition-colors"
        >
          ← Back to Products
        </Link>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name (Bengali)
              </label>
              <input
                type="text"
                value={formData.bengaliName}
                onChange={(e) => handleInputChange('bengaliName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="Enter Bengali product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="e.g., Face Serum, Shampoo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="Brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Country of Origin
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="e.g., Bangladesh, Thailand"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (English) *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.description ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter detailed product description"
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Bengali)
              </label>
              <textarea
                value={formData.bengaliDescription}
                onChange={(e) => handleInputChange('bengaliDescription', e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="Enter Bengali product description"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Pricing & Inventory
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Price (৳) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.price ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="720"
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Original Price (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.originalPrice ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="1200"
              />
              {errors.originalPrice && <p className="mt-1 text-xs text-red-600">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.sku ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="PRODUCT-SKU-001"
              />
              {errors.sku && <p className="mt-1 text-xs text-red-600">{errors.sku}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Code *
              </label>
              <input
                type="text"
                value={formData.productCode}
                onChange={(e) => handleInputChange('productCode', e.target.value.toUpperCase())}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.productCode ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="BLG-P0001"
              />
              {errors.productCode && <p className="mt-1 text-xs text-red-600">{errors.productCode}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.stock ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="100"
              />
              {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sold Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.soldCount}
                onChange={(e) => handleInputChange('soldCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Watchers Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.watchersCount}
                onChange={(e) => handleInputChange('watchersCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skin Type & Concerns */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Skin Type & Concerns
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skin Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {skinTypes.map((type) => (
                  <label key={type} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
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
                Skin Concerns
              </label>
              <div className="grid grid-cols-2 gap-2">
                {skinConcerns.map((concern) => (
                  <label key={concern} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
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
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Product Images
          </h2>
          <div className="space-y-4">
            {formData.images.map((image, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  {/* Image Preview */}
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Preview {index === 0 && '*'}
                    </label>
                    <div className="relative">
                      {image.url ? (
                        <div className="relative group">
                          <img
                            src={image.url}
                            alt={image.alt || 'Product image'}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm">Click to change</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-gray-500 text-sm block">Click to upload image</span>
                            <span className="text-gray-400 text-xs block mt-1">or drag & drop</span>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          console.log('File selected:', file);
                          if (file) {
                            handleImageUpload(file, index);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Details */}
                  <div className="lg:col-span-2 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                        placeholder="Product image description"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...formData.images];
                          newImages[index] = { ...newImages[index], isPrimary: !newImages[index].isPrimary };
                          setFormData(prev => ({ ...prev, images: newImages }));
                        }}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          image.isPrimary
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {image.isPrimary ? '✓ Primary' : 'Set Primary'}
                      </button>
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, images: newImages }));
                          }}
                          className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 border border-red-200 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
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
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              + Add Another Image
            </button>
            {errors.images && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.images}</p>
                <p className="text-xs text-red-500 mt-1">
                  If upload continues to fail, you can manually enter image URLs in the URL field above.
                </p>
              </div>
            )}
            {uploading && (
              <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm text-blue-600">Uploading image...</span>
              </div>
            )}
          </div>
        </div>

        {/* Features & Tags */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Features & Tags
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                      placeholder="Enter feature"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('features')}
                  className="px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
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
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                      placeholder="Enter tag"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('tags', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-colors"
                >
                  + Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Flags */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
            Product Flags
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Featured</span>
            </label>
            <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => handleInputChange('isBestSeller', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Best Seller</span>
            </label>
            <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600">
              <input
                type="checkbox"
                checked={formData.isNewArrival}
                onChange={(e) => handleInputChange('isNewArrival', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">New Arrival</span>
            </label>
            <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600">
              <input
                type="checkbox"
                checked={formData.inventory.trackInventory}
                onChange={(e) => handleNestedInputChange('inventory', 'trackInventory', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Track Inventory</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/dashboard/products"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Creating Product...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
