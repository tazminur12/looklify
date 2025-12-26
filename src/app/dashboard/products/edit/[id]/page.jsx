'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/app/components/RichTextEditor';

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [skinTypes, setSkinTypes] = useState([]);
  const [skinConcerns, setSkinConcerns] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    bengaliName: '',
    description: '',
    bengaliDescription: '',
    category: '',
    subcategory: '',
    costPrice: '',
    regularPrice: '',
    salePrice: '',
    discountPercentage: '',
    taxPercentage: '',
    shippingCharges: {
      insideDhaka: '',
      outsideDhaka: ''
    },
    discountStartDate: '',
    discountEndDate: '',
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
    features: '',
    ingredients: '',
    tags: [''],
    images: [
      {
        url: '',
        alt: '',
        isPrimary: true
      }
    ],
    isFeatured: false,
    featuredSortOrder: '0',
    isBestSeller: false,
    isNewArrival: false,
    isOfferProduct: false,
    freeDelivery: false,
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


  // Fetch brands, categories, and subcategories using shop/filters API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const response = await fetch('/api/shop/filters');
        
        if (response.ok) {
          const data = await response.json();
          setBrands(data.data.brands || []);
          setCategories(data.data.categories || []);
          setSkinTypes(data.data.skinTypes || []);
          setSkinConcerns(data.data.skinConcerns || []);
        } else {
          throw new Error('Failed to fetch filter data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load brands and categories');
      } finally {
        setLoadingData(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  // Fetch subcategories when category or brand changes (fetch all, filter by category)
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await fetch(`/api/shop/filters`);
        if (response.ok) {
          const data = await response.json();
          const allSubcategories = Object.values(data.data.subcategories || {}).flat();
          const filteredSubcategories = formData.category
            ? allSubcategories.filter(sub => sub && sub.parent && (sub.parent._id === formData.category || sub.parent === formData.category))
            : allSubcategories;
          setSubcategories(filteredSubcategories);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };

    fetchSubcategories();
  }, [formData.category, formData.brand]);

  // Fetch product data for editing
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setLoadingData(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const product = result.data;
            
            // Populate form with existing product data
            setFormData({
              name: product.name || '',
              bengaliName: product.bengaliName || '',
              description: product.description || '',
              bengaliDescription: product.bengaliDescription || '',
              category: product.category && typeof product.category === 'object' ? product.category._id : (product.category || ''),
              subcategory: product.subcategory && typeof product.subcategory === 'object' ? product.subcategory._id : (product.subcategory || ''),
              costPrice: product.costPrice || '',
              regularPrice: product.regularPrice || product.price || '',
              salePrice: product.salePrice || '',
              discountPercentage: product.discountPercentage || '',
              taxPercentage: product.taxPercentage || '',
              shippingCharges: product.shippingCharges ? {
                insideDhaka: product.shippingCharges.insideDhaka !== undefined && product.shippingCharges.insideDhaka !== null ? String(product.shippingCharges.insideDhaka) : '',
                outsideDhaka: product.shippingCharges.outsideDhaka !== undefined && product.shippingCharges.outsideDhaka !== null ? String(product.shippingCharges.outsideDhaka) : ''
              } : {
                insideDhaka: '',
                outsideDhaka: ''
              },
              discountStartDate: product.discountStartDate ? product.discountStartDate.split('T')[0] : '',
              discountEndDate: product.discountEndDate ? product.discountEndDate.split('T')[0] : '',
              sku: product.sku || '',
              productCode: product.productCode || '',
              stock: product.stock || '',
              lowStockThreshold: product.lowStockThreshold || '20',
              status: product.status || 'active',
              brand: product.brand && typeof product.brand === 'object' ? product.brand._id : (product.brand || ''),
              origin: product.origin || '',
              skinType: product.skinType || [],
              skinConcern: product.skinConcern || [],
              soldCount: product.soldCount || '0',
              watchersCount: product.watchersCount || '0',
              weight: product.weight ? {
                value: product.weight.value !== undefined && product.weight.value !== null ? String(product.weight.value) : '',
                unit: product.weight.unit || 'g'
              } : { value: '', unit: 'g' },
              dimensions: product.dimensions ? {
                length: product.dimensions.length !== undefined && product.dimensions.length !== null ? String(product.dimensions.length) : '',
                width: product.dimensions.width !== undefined && product.dimensions.width !== null ? String(product.dimensions.width) : '',
                height: product.dimensions.height !== undefined && product.dimensions.height !== null ? String(product.dimensions.height) : '',
                unit: product.dimensions.unit || 'cm'
              } : { length: '', width: '', height: '', unit: 'cm' },
              features: typeof product.features === 'string' ? product.features : (Array.isArray(product.features) ? product.features.join('<br>') : ''),
              ingredients: typeof product.ingredients === 'string' ? product.ingredients : (Array.isArray(product.ingredients) ? product.ingredients.join('<br>') : ''),
              tags: product.tags && product.tags.length > 0 ? product.tags : [''],
              images: product.images && product.images.length > 0 ? product.images : [{ url: '', alt: '', isPrimary: true }],
              isFeatured: Boolean(product.isFeatured),
              featuredSortOrder: product.featuredSortOrder !== undefined && product.featuredSortOrder !== null ? String(product.featuredSortOrder) : '0',
              isBestSeller: Boolean(product.isBestSeller),
              isNewArrival: Boolean(product.isNewArrival),
              isOfferProduct: Boolean(product.isOfferProduct),
              freeDelivery: Boolean(product.freeDelivery),
              inventory: product.inventory || {
                trackInventory: true,
                allowBackorder: false,
                minOrderQuantity: '1',
                maxOrderQuantity: ''
              },
              seo: product.seo || {
                metaTitle: '',
                metaDescription: '',
                keywords: ['']
              }
            });
          }
        } else {
          toast.error('Failed to load product');
          router.push('/dashboard/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Error loading product');
        router.push('/dashboard/products');
      } finally {
        setLoadingData(false);
      }
    };

    if (session && productId) {
      fetchProduct();
    }
  }, [session, productId, router]);

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

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        const newImages = [...formData.images];
        newImages[index] = { 
          ...newImages[index], 
          url: data.url,
          publicId: data.publicId
        };
        setFormData(prev => ({ ...prev, images: newImages }));
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
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Enhanced price calculation logic for new pricing structure
      if (field === 'regularPrice' || field === 'salePrice' || field === 'discountPercentage') {
        const regularPrice = parseFloat(newData.regularPrice) || 0;
        const salePrice = parseFloat(newData.salePrice) || 0;
        const discountPercentage = parseFloat(newData.discountPercentage) || 0;

        // Auto-calculate discount percentage when sale price changes
        if (field === 'salePrice' && value && regularPrice > 0) {
          if (regularPrice > salePrice) {
            const percentage = Math.round(((regularPrice - salePrice) / regularPrice) * 100);
            newData.discountPercentage = percentage.toString();
          } else {
            newData.discountPercentage = '';
          }
        }

        // Auto-calculate sale price when discount percentage changes
        if (field === 'discountPercentage' && value && regularPrice > 0) {
          if (discountPercentage > 0 && discountPercentage < 100) {
            const calculatedSalePrice = regularPrice - (regularPrice * discountPercentage / 100);
            newData.salePrice = calculatedSalePrice.toFixed(2);
          } else {
            newData.salePrice = '';
          }
        }

        // When sale price changes, validate against regular price
        if (field === 'salePrice' && value && regularPrice > 0) {
          if (salePrice >= regularPrice) {
            newData.salePrice = '';
            newData.discountPercentage = '';
          }
        }
      }

      return newData;
    });
    
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
    if (!formData.description.trim()) newErrors.description = 'Caption is required';
    if (!formData.regularPrice || formData.regularPrice <= 0) newErrors.regularPrice = 'Valid regular price is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.productCode.trim()) newErrors.productCode = 'Product code is required';
    if (formData.stock === '' || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData.category) newErrors.category = 'Category is required';

    // SKU format validation (alphanumeric with dashes/underscores)
    if (formData.sku && !/^[A-Z0-9-_]+$/i.test(formData.sku.trim())) {
      newErrors.sku = 'SKU should contain only letters, numbers, dashes, and underscores';
    }

    // Enhanced price validation for new pricing structure
    const regularPrice = parseFloat(formData.regularPrice) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;
    const discountPercentage = parseFloat(formData.discountPercentage) || 0;
    const taxPercentage = parseFloat(formData.taxPercentage) || 0;

    // Sale price validation
    if (formData.salePrice) {
      if (salePrice >= regularPrice) {
        newErrors.salePrice = 'Sale price must be lower than regular price';
      }
    }

    // Discount percentage validation
    if (formData.discountPercentage) {
      if (discountPercentage < 0 || discountPercentage > 100) {
        newErrors.discountPercentage = 'Discount percentage must be between 0 and 100';
      }
      // Validate percentage against actual prices
      if (regularPrice > 0 && discountPercentage > 0) {
        const calculatedSalePrice = regularPrice - (regularPrice * discountPercentage / 100);
        if (calculatedSalePrice >= regularPrice) {
          newErrors.discountPercentage = 'This percentage would make sale price too high';
        }
      }
    }

    // Tax percentage validation
    if (formData.taxPercentage) {
      if (taxPercentage < 0 || taxPercentage > 100) {
        newErrors.taxPercentage = 'Tax percentage must be between 0 and 100';
      }
    }

    // Cross-validation between sale price and discount percentage
    if (formData.salePrice && formData.discountPercentage && regularPrice > 0) {
      const calculatedSalePrice = regularPrice - (regularPrice * discountPercentage / 100);
      const priceDifference = Math.abs(calculatedSalePrice - salePrice);
      if (priceDifference > 0.01) { // Allow small floating point differences
        newErrors.salePrice = 'Sale price and discount percentage do not match';
        newErrors.discountPercentage = 'Sale price and discount percentage do not match';
      }
    }

    // Discount date validation
    if (formData.discountStartDate && formData.discountEndDate) {
      const startDate = new Date(formData.discountStartDate);
      const endDate = new Date(formData.discountEndDate);
      if (startDate >= endDate) {
        newErrors.discountEndDate = 'Discount end date must be after start date';
      }
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
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
        regularPrice: parseFloat(formData.regularPrice),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : undefined,
        discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : undefined,
        taxPercentage: formData.taxPercentage ? parseFloat(formData.taxPercentage) : undefined,
        shippingCharges: {
          insideDhaka: formData.shippingCharges.insideDhaka ? parseFloat(formData.shippingCharges.insideDhaka) : 0,
          outsideDhaka: formData.shippingCharges.outsideDhaka ? parseFloat(formData.shippingCharges.outsideDhaka) : 0
        },
        discountStartDate: formData.discountStartDate || undefined,
        discountEndDate: formData.discountEndDate || undefined,
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        soldCount: parseInt(formData.soldCount),
        watchersCount: parseInt(formData.watchersCount),
        weight: formData.weight.value ? {
          value: parseFloat(formData.weight.value),
          unit: formData.weight.unit
        } : undefined,
        dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) ? {
          length: formData.dimensions.length ? parseFloat(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? parseFloat(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? parseFloat(formData.dimensions.height) : undefined,
          unit: formData.dimensions.unit
        } : undefined,
        features: formData.features || '',
        ingredients: formData.ingredients || '',
        tags: formData.tags.filter(t => t.trim()),
        seo: {
          metaTitle: formData.seo.metaTitle || undefined,
          metaDescription: formData.seo.metaDescription || undefined,
          keywords: formData.seo.keywords.filter(k => k.trim())
        },
        inventory: {
          trackInventory: formData.inventory.trackInventory,
          allowBackorder: formData.inventory.allowBackorder,
          minOrderQuantity: parseInt(formData.inventory.minOrderQuantity),
          maxOrderQuantity: formData.inventory.maxOrderQuantity ? parseInt(formData.inventory.maxOrderQuantity) : undefined
        },
        brand: formData.brand && formData.brand.trim() ? formData.brand : null,
        subcategory: formData.subcategory && formData.subcategory.trim() ? formData.subcategory : null,
        origin: formData.origin || undefined,
        bengaliName: formData.bengaliName || undefined,
        bengaliDescription: formData.bengaliDescription || undefined,
        images: formData.images.filter(img => img.url.trim()),
        isFeatured: Boolean(formData.isFeatured),
        featuredSortOrder: formData.featuredSortOrder ? parseInt(formData.featuredSortOrder) : 0,
        isBestSeller: Boolean(formData.isBestSeller),
        isNewArrival: Boolean(formData.isNewArrival),
        isOfferProduct: Boolean(formData.isOfferProduct),
        freeDelivery: Boolean(formData.freeDelivery)
      };

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Product updated successfully!');
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
          toast.error('Please fix the validation errors');
        } else {
          setErrors({ submit: result.error || 'Failed to update product' });
          toast.error(result.error || 'Failed to update product');
        }
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({ submit: 'Network error. Please try again.' });
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {status === 'loading' ? 'Loading...' : 'Loading brands and categories...'}
          </p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Product</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update product information
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
                Brand
              </label>
              <select
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.brand ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>
                    {brand.name || 'Unnamed Brand'}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="mt-1 text-xs text-red-600">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.category ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name || 'Unnamed Category'}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                disabled={!formData.category}
              >
                <option value="">Select Subcategory</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory._id} value={subcategory._id}>
                    {subcategory.name || 'Unnamed Subcategory'}
                  </option>
                ))}
              </select>
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
                Caption *
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(content) => handleInputChange('description', content)}
                placeholder="Enter product caption"
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Bengali)
              </label>
              <RichTextEditor
                value={formData.bengaliDescription}
                onChange={(content) => handleInputChange('bengaliDescription', content)}
                placeholder="Enter Bengali product description"
              />
            </div>
          </div>
        </div>

        {/* Ingredients & Usage Instructions */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
            Ingredients & Usage
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ingredients
              </label>
              <RichTextEditor
                value={typeof formData.ingredients === 'string' ? formData.ingredients : (Array.isArray(formData.ingredients) ? formData.ingredients.join('<br>') : '')}
                onChange={(html) => setFormData(prev => ({ ...prev, ingredients: html }))}
                placeholder="Enter product ingredients with formatting..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use the editor toolbar to format ingredients list</p>
            </div>

            {/* Usage Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                How to Use (Usage Instructions)
              </label>
              <RichTextEditor
                value={typeof formData.features === 'string' ? formData.features : (Array.isArray(formData.features) ? formData.features.join('<br>') : '')}
                onChange={(html) => setFormData(prev => ({ ...prev, features: html }))}
                placeholder="Enter usage instructions with formatting..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use the editor toolbar to format usage instructions</p>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Pricing & Inventory
          </h2>
          
          {/* Price Summary */}
          {formData.regularPrice && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-gray-600">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Price Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-500 dark:text-gray-400">Regular Price</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">BDT {parseFloat(formData.regularPrice).toFixed(2)}</div>
                </div>
                {formData.costPrice && (
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">Cost Price</div>
                    <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">BDT {parseFloat(formData.costPrice).toFixed(2)}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Profit: BDT {(parseFloat(formData.regularPrice) - parseFloat(formData.costPrice)).toFixed(2)}
                    </div>
                  </div>
                )}
                {formData.salePrice && (
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">Sale Price</div>
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">BDT {parseFloat(formData.salePrice).toFixed(2)}</div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      {formData.discountPercentage}% off
                    </div>
                  </div>
                )}
                {formData.taxPercentage && (
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400">Tax</div>
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">{formData.taxPercentage}%</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      +BDT {(parseFloat(formData.regularPrice) * parseFloat(formData.taxPercentage) / 100).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost Price (Purchase Price) (BDT)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={(e) => handleInputChange('costPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.costPrice ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The price you paid to purchase this product</p>
              {errors.costPrice && <p className="mt-1 text-xs text-red-600">{errors.costPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Regular Price (Selling Price) (BDT) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.regularPrice}
                onChange={(e) => handleInputChange('regularPrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.regularPrice ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="720"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The regular selling price of the product</p>
              {errors.regularPrice && <p className="mt-1 text-xs text-red-600">{errors.regularPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sale Price (Offer Price) (BDT)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.salePrice}
                onChange={(e) => handleInputChange('salePrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.salePrice ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Special sale price (must be lower than regular price)</p>
              {errors.salePrice && <p className="mt-1 text-xs text-red-600">{errors.salePrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.discountPercentage ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="20"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Discount percentage (auto-calculated from sale price)</p>
              {errors.discountPercentage && <p className="mt-1 text-xs text-red-600">{errors.discountPercentage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tax (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxPercentage}
                onChange={(e) => handleInputChange('taxPercentage', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.taxPercentage ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="15"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tax percentage applied to the product</p>
              {errors.taxPercentage && <p className="mt-1 text-xs text-red-600">{errors.taxPercentage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shipping Charge - Inside Dhaka (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.shippingCharges.insideDhaka}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  shippingCharges: {
                    ...prev.shippingCharges,
                    insideDhaka: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="50"
                disabled={formData.freeDelivery}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Shipping charge for orders inside Dhaka</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shipping Charge - Outside Dhaka (৳)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.shippingCharges.outsideDhaka}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  shippingCharges: {
                    ...prev.shippingCharges,
                    outsideDhaka: e.target.value
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                placeholder="100"
                disabled={formData.freeDelivery}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Shipping charge for orders outside Dhaka</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Start Date
              </label>
              <input
                type="date"
                value={formData.discountStartDate}
                onChange={(e) => handleInputChange('discountStartDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.discountStartDate ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">When the discount starts (optional)</p>
              {errors.discountStartDate && <p className="mt-1 text-xs text-red-600">{errors.discountStartDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount End Date
              </label>
              <input
                type="date"
                value={formData.discountEndDate}
                onChange={(e) => handleInputChange('discountEndDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm ${
                  errors.discountEndDate ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">When the discount ends (optional)</p>
              {errors.discountEndDate && <p className="mt-1 text-xs text-red-600">{errors.discountEndDate}</p>}
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

        {/* Product Size, Ingredients & Usage */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
            Product Details
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Size/Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Size/Weight
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight.value || ''}
                  onChange={(e) => handleNestedInputChange('weight', 'value', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                  placeholder="100"
                />
                <select
                  value={formData.weight.unit}
                  onChange={(e) => handleNestedInputChange('weight', 'unit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="oz">oz</option>
                  <option value="lb">lb</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">e.g., 100ml, 50g</p>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dimensions (Optional)
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.length || ''}
                  onChange={(e) => handleNestedInputChange('dimensions', 'length', e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-xs"
                  placeholder="L"
                />
                <span className="self-center text-xs text-gray-400">×</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.width || ''}
                  onChange={(e) => handleNestedInputChange('dimensions', 'width', e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-xs"
                  placeholder="W"
                />
                <span className="self-center text-xs text-gray-400">×</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.dimensions.height || ''}
                  onChange={(e) => handleNestedInputChange('dimensions', 'height', e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-xs"
                  placeholder="H"
                />
                <select
                  value={formData.dimensions.unit}
                  onChange={(e) => handleNestedInputChange('dimensions', 'unit', e.target.value)}
                  className="px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-xs"
                >
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                </select>
              </div>
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
                {Array.isArray(skinTypes) ? skinTypes.map((type) => (
                  <label key={typeof type === 'string' ? type : type._id || type.name} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skinType.includes(typeof type === 'string' ? type : type.name || type._id)}
                      onChange={(e) => {
                        const typeValue = typeof type === 'string' ? type : type.name || type._id;
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            skinType: [...prev.skinType, typeValue]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skinType: prev.skinType.filter(t => t !== typeValue)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {typeof type === 'string' ? type : type.name || type._id || 'Unknown'}
                    </span>
                  </label>
                )) : Object.values(skinTypes || {}).map((type) => (
                  <label key={typeof type === 'string' ? type : type._id || type.name} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skinType.includes(typeof type === 'string' ? type : type.name || type._id)}
                      onChange={(e) => {
                        const typeValue = typeof type === 'string' ? type : type.name || type._id;
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            skinType: [...prev.skinType, typeValue]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skinType: prev.skinType.filter(t => t !== typeValue)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {typeof type === 'string' ? type : type.name || type._id || 'Unknown'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skin Concerns
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Array.isArray(skinConcerns) ? skinConcerns.map((concern) => (
                  <label key={typeof concern === 'string' ? concern : concern._id || concern.name} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skinConcern.includes(typeof concern === 'string' ? concern : concern.name || concern._id)}
                      onChange={(e) => {
                        const concernValue = typeof concern === 'string' ? concern : concern.name || concern._id;
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            skinConcern: [...prev.skinConcern, concernValue]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skinConcern: prev.skinConcern.filter(c => c !== concernValue)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {typeof concern === 'string' ? concern : concern.name || concern._id || 'Unknown'}
                    </span>
                  </label>
                )) : Object.values(skinConcerns || {}).map((concern) => (
                  <label key={typeof concern === 'string' ? concern : concern._id || concern.name} className="flex items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skinConcern.includes(typeof concern === 'string' ? concern : concern.name || concern._id)}
                      onChange={(e) => {
                        const concernValue = typeof concern === 'string' ? concern : concern.name || concern._id;
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            skinConcern: [...prev.skinConcern, concernValue]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skinConcern: prev.skinConcern.filter(c => c !== concernValue)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {typeof concern === 'string' ? concern : concern.name || concern._id || 'Unknown'}
                    </span>
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

        {/* Product Tags */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
            Tags (Optional)
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Tags (Comma separated for search)
            </label>
            <input
              type="text"
              value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                setFormData(prev => ({ ...prev, tags }));
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
              placeholder="tag1, tag2, tag3, ..."
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate tags with commas</p>
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
                checked={formData.isOfferProduct}
                onChange={(e) => handleInputChange('isOfferProduct', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">🎁 Offer Product</span>
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
            <label className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-gray-200 dark:border-gray-600">
              <input
                type="checkbox"
                checked={formData.freeDelivery}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  handleInputChange('freeDelivery', isChecked);
                  // Automatically set shipping charges to 0 when free delivery is enabled
                  if (isChecked) {
                    setFormData(prev => ({
                      ...prev,
                      freeDelivery: true,
                      shippingCharges: {
                        insideDhaka: '0',
                        outsideDhaka: '0'
                      }
                    }));
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">🚚 Free Delivery</span>
            </label>
            {/* Featured Sort Order */}
            <div className="col-span-2 lg:col-span-4 mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Featured Sort Order
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  value={formData.featuredSortOrder || '0'}
                  onChange={(e) => handleInputChange('featuredSortOrder', e.target.value || '0')}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="0"
                  disabled={!formData.isFeatured}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ছোট সংখ্যা মানে Featured Products section এ আগে দেখাবে।
                </p>
              </div>
            </div>
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
            {loading ? 'Updating Product...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
