'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    subcategory: searchParams.get('subcategory') || '',
    skinType: searchParams.get('skinType') || '',
    skinConcern: searchParams.get('skinConcern') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });

  const categories = [
    'Skin Care', 'Hair Care', 'Lip Care', 'Eye Care', 
    'Body Care', 'Facial Care', 'Teeth Care', 'Health & Beauty', 'Makeup', 'Tools'
  ];

  const brands = ['FairyPai', 'Barmiz', 'KT', 'Real Glow', 'ADAD', 'TVLV', 'Maca Power'];
  const skinTypes = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'All Types'];
  const skinConcerns = ['Acne', 'Aging', 'Dark Spots', 'Dryness', 'Oiliness', 'Sensitivity', 'Uneven Skin Tone', 'Wrinkles'];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '12',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data.products);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const calculateDiscountPercentage = (product) => {
    if (product.originalPrice && product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const handleAddToCart = (productId) => {
    console.log('Adding to cart:', productId);
  };

  const handleBuyNow = (productId) => {
    console.log('Buying now:', productId);
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">পণ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">সব পণ্য</h1>
          <p className="text-gray-600">আপনার পছন্দের পণ্যটি খুঁজে নিন</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ফিল্টার অপশন</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">অনুসন্ধান</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="পণ্যের নাম লিখুন..."
                />
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ব্র্যান্ড</label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">সব ব্র্যান্ড</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ক্যাটাগরি</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">সব ক্যাটাগরি</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Skin Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ত্বকের ধরন</label>
                <select
                  value={filters.skinType}
                  onChange={(e) => handleFilterChange('skinType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">সব ধরন</option>
                  {skinTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Skin Concern Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">ত্বকের সমস্যা</label>
                <select
                  value={filters.skinConcern}
                  onChange={(e) => handleFilterChange('skinConcern', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">সব সমস্যা</option>
                  {skinConcerns.map(concern => (
                    <option key={concern} value={concern}>{concern}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">মূল্য রেঞ্জ</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="ন্যূনতম"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="সর্বোচ্চ"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => setFilters({
                  search: '', category: '', brand: '', subcategory: '',
                  skinType: '', skinConcern: '', minPrice: '', maxPrice: '',
                  sortBy: 'createdAt', sortOrder: 'desc'
                })}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ফিল্টার রিসেট করুন
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">
                {pagination.totalCount} টি পণ্য পাওয়া গেছে
              </p>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">সাজান:</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">নতুন প্রথম</option>
                  <option value="createdAt-asc">পুরানো প্রথম</option>
                  <option value="price-asc">মূল্য: কম থেকে বেশি</option>
                  <option value="price-desc">মূল্য: বেশি থেকে কম</option>
                  <option value="rating.average-desc">রেটিং: বেশি থেকে কম</option>
                  <option value="name-asc">নাম: ক থেকে খ</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  ⚠️
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">কিছু সমস্যা হয়েছে</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  আবার চেষ্টা করুন
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  📦
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
                <p className="text-gray-500 mb-4">আপনার ফিল্টার অনুযায়ী কোনো পণ্য নেই</p>
                <button
                  onClick={() => setFilters({
                    search: '', category: '', brand: '', subcategory: '',
                    skinType: '', skinConcern: '', minPrice: '', maxPrice: '',
                    sortBy: 'createdAt', sortOrder: 'desc'
                  })}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                >
                  সব ফিল্টার মুছে দিন
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => {
                  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                  const imageUrl = primaryImage?.url || '/slider/1.webp';
                  const discountPercentage = calculateDiscountPercentage(product);

                  return (
                    <div key={product._id} className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <Link href={`/shop/${product._id}`}>
                          <Image
                            src={imageUrl}
                            alt={primaryImage?.alt || product.name}
                            width={300}
                            height={300}
                            className="w-full h-48 object-cover"
                          />
                        </Link>
                        
                        {/* Discount Badge */}
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {discountPercentage}% OFF
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50">
                          ❤️
                        </button>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">
                          <Link href={`/shop/${product._id}`} className="hover:text-purple-600">
                            {product.bengaliName || product.name}
                          </Link>
                        </h3>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              ৳{product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ৳{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm text-gray-600">
                              {product.rating?.average || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddToCart(product._id)}
                            className="flex-1 px-3 py-2 text-sm border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50"
                          >
                            কার্টে যোগ করুন
                          </button>
                          <button
                            onClick={() => handleBuyNow(product._id)}
                            className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                          >
                            এখনই কিনুন
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    পূর্ববর্তী
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                      className={`px-3 py-2 rounded-lg ${
                        pagination.currentPage === i + 1
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    পরবর্তী
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}