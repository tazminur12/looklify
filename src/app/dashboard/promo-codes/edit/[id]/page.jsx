'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';

export default function EditPromoCodePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const promoCodeId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: 1,
    validFrom: '',
    validUntil: '',
    applicableProducts: [],
    applicableCategories: [],
    applicableBrands: [],
    excludedProducts: [],
    excludedCategories: [],
    excludedBrands: [],
    applicableUsers: [],
    excludedUsers: [],
    newUsersOnly: false,
    firstTimePurchaseOnly: false,
    stackable: false,
    priority: 0,
    autoApply: false,
    autoApplyConditions: {
      minimumOrderAmount: '',
      minimumQuantity: '',
      specificProducts: [],
      specificCategories: []
    },
    bengaliName: '',
    bengaliDescription: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch promo code data and dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch promo code data
        const promoCodeResponse = await fetch(`/api/promo-codes/${promoCodeId}`);
        if (!promoCodeResponse.ok) {
          throw new Error('Failed to fetch promo code');
        }
        
        const promoCodeData = await promoCodeResponse.json();
        if (!promoCodeData.success) {
          throw new Error(promoCodeData.error || 'Failed to fetch promo code');
        }
        
        const promoCode = promoCodeData.data;
        
        // Format dates for input fields
        const formatDateForInput = (date) => {
          if (!date) return '';
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };
        
        // Set form data
        setFormData({
          code: promoCode.code || '',
          name: promoCode.name || '',
          description: promoCode.description || '',
          type: promoCode.type || 'percentage',
          value: promoCode.value || '',
          minimumOrderAmount: promoCode.minimumOrderAmount || '',
          maximumDiscountAmount: promoCode.maximumDiscountAmount || '',
          usageLimit: promoCode.usageLimit || '',
          usageLimitPerUser: promoCode.usageLimitPerUser || 1,
          validFrom: formatDateForInput(promoCode.validFrom),
          validUntil: formatDateForInput(promoCode.validUntil),
          applicableProducts: promoCode.applicableProducts?.map(p => p._id) || [],
          applicableCategories: promoCode.applicableCategories?.map(c => c._id) || [],
          applicableBrands: promoCode.applicableBrands?.map(b => b._id) || [],
          excludedProducts: promoCode.excludedProducts?.map(p => p._id) || [],
          excludedCategories: promoCode.excludedCategories?.map(c => c._id) || [],
          excludedBrands: promoCode.excludedBrands?.map(b => b._id) || [],
          applicableUsers: promoCode.applicableUsers?.map(u => u._id) || [],
          excludedUsers: promoCode.excludedUsers?.map(u => u._id) || [],
          newUsersOnly: promoCode.newUsersOnly || false,
          firstTimePurchaseOnly: promoCode.firstTimePurchaseOnly || false,
          stackable: promoCode.stackable || false,
          priority: promoCode.priority || 0,
          autoApply: promoCode.autoApply || false,
          autoApplyConditions: promoCode.autoApplyConditions || {
            minimumOrderAmount: '',
            minimumQuantity: '',
            specificProducts: [],
            specificCategories: []
          },
          bengaliName: promoCode.bengaliName || '',
          bengaliDescription: promoCode.bengaliDescription || ''
        });

        // Fetch dropdown data
        const [productsRes, categoriesRes, brandsRes, usersRes] = await Promise.all([
          fetch('/api/products?limit=1000'),
          fetch('/api/categories'),
          fetch('/api/brands'),
          fetch('/api/users?limit=1000')
        ]);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data?.products || []);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }

        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          setBrands(brandsData.data || []);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        Swal.fire({
          title: 'Error!',
          text: error.message || 'Failed to load promo code data',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          background: '#ffffff',
          color: '#1f2937',
          customClass: {
            popup: 'rounded-lg shadow-xl',
            confirmButton: 'px-4 py-2 rounded-lg font-medium'
          }
        });
        router.push('/dashboard/promo-codes');
      } finally {
        setLoading(false);
      }
    };

    if (promoCodeId) {
      fetchData();
    }
  }, [promoCodeId, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Promo code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Promo code must be at least 3 characters';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Promo code name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Promo code type is required';
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Valid from date is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    if (formData.validFrom && formData.validUntil) {
      const fromDate = new Date(formData.validFrom);
      const untilDate = new Date(formData.validUntil);
      
      if (fromDate >= untilDate) {
        newErrors.validUntil = 'Valid until date must be after valid from date';
      }
    }

    if (formData.minimumOrderAmount && formData.minimumOrderAmount < 0) {
      newErrors.minimumOrderAmount = 'Minimum order amount cannot be negative';
    }

    if (formData.maximumDiscountAmount && formData.maximumDiscountAmount < 0) {
      newErrors.maximumDiscountAmount = 'Maximum discount amount cannot be negative';
    }

    if (formData.usageLimit && formData.usageLimit < 1) {
      newErrors.usageLimit = 'Usage limit must be at least 1';
    }

    if (formData.usageLimitPerUser < 1) {
      newErrors.usageLimitPerUser = 'Usage limit per user must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/promo-codes/${promoCodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          title: 'Success!',
          text: 'Promo code updated successfully.',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
          background: '#ffffff',
          color: '#1f2937',
          customClass: {
            popup: 'rounded-lg shadow-xl'
          }
        });
        router.push('/dashboard/promo-codes');
      } else {
        Swal.fire({
          title: 'Error!',
          text: result.error || 'Failed to update promo code',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          background: '#ffffff',
          color: '#1f2937',
          customClass: {
            popup: 'rounded-lg shadow-xl',
            confirmButton: 'px-4 py-2 rounded-lg font-medium'
          }
        });
      }
    } catch (error) {
      console.error('Error updating promo code:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Network error. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-xl',
          confirmButton: 'px-4 py-2 rounded-lg font-medium'
        }
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading promo code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Promo Code</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Update promotional discount code settings
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
        >
          ← Back
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Promo Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Promo Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., SAVE20, WELCOME10"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Summer Sale 20% Off"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe the promo code and its benefits..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Discount Configuration */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Discount Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="percentage">Percentage Discount</option>
                <option value="fixed_amount">Fixed Amount Discount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount Value *
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                placeholder={formData.type === 'percentage' ? '20' : '100'}
                min="0"
                max={formData.type === 'percentage' ? '100' : undefined}
                step={formData.type === 'percentage' ? '1' : '0.01'}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.value ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formData.type === 'percentage' ? 'Percentage (0-100)' : 'Amount in BDT'}
              </p>
            </div>

            {/* Minimum Order Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minimumOrderAmount"
                value={formData.minimumOrderAmount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.minimumOrderAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.minimumOrderAmount && <p className="mt-1 text-sm text-red-600">{errors.minimumOrderAmount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Maximum Discount Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Discount Amount
              </label>
              <input
                type="number"
                name="maximumDiscountAmount"
                value={formData.maximumDiscountAmount}
                onChange={handleInputChange}
                placeholder="No limit"
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.maximumDiscountAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.maximumDiscountAmount && <p className="mt-1 text-sm text-red-600">{errors.maximumDiscountAmount}</p>}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Higher number = higher priority
              </p>
            </div>
          </div>
        </div>

        {/* Usage Limits */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Usage Limits</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.usageLimit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.usageLimit && <p className="mt-1 text-sm text-red-600">{errors.usageLimit}</p>}
            </div>

            {/* Usage Limit Per User */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usage Limit Per User *
              </label>
              <input
                type="number"
                name="usageLimitPerUser"
                value={formData.usageLimitPerUser}
                onChange={handleInputChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.usageLimitPerUser ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.usageLimitPerUser && <p className="mt-1 text-sm text-red-600">{errors.usageLimitPerUser}</p>}
            </div>
          </div>
        </div>

        {/* Validity Period */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Validity Period</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Valid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valid From *
              </label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.validFrom ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>}
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valid Until *
              </label>
              <input
                type="datetime-local"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 ${
                  errors.validUntil ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.validUntil && <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>}
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Advanced Options</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="newUsersOnly"
                checked={formData.newUsersOnly}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                New users only (registered within last 30 days)
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="firstTimePurchaseOnly"
                checked={formData.firstTimePurchaseOnly}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                First time purchase only
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="stackable"
                checked={formData.stackable}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Stackable with other promo codes
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoApply"
                checked={formData.autoApply}
                onChange={handleInputChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Auto-apply when conditions are met
              </label>
            </div>
          </div>
        </div>

        {/* Bengali Translations */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Bengali Translations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bengali Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bengali Name
              </label>
              <input
                type="text"
                name="bengaliName"
                value={formData.bengaliName}
                onChange={handleInputChange}
                placeholder="গ্রীষ্মকালীন ছাড় ২০%"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Bengali Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bengali Description
              </label>
              <textarea
                name="bengaliDescription"
                value={formData.bengaliDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="গ্রীষ্মকালীন ছাড়ের সুবিধা নিন..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'Update Promo Code'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
