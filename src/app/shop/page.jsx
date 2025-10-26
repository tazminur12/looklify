'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import Swal from 'sweetalert2';

function ShopContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
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

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    subcategories: {},
    skinTypes: [],
    skinConcerns: []
  });
  const [filtersLoading, setFiltersLoading] = useState(true);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      setFiltersLoading(true);
      const response = await fetch('/api/shop/filters');
      const result = await response.json();
      
      if (result.success) {
        setFilterOptions(result.data);
      } else {
        console.error('Failed to fetch filter options:', result.error);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    } finally {
      setFiltersLoading(false);
    }
  };

  // Get filtered subcategories based on selected category and brand
  const getFilteredSubcategories = () => {
    let filtered = filterOptions.subcategories;
    
    // If a specific category is selected, only show subcategories for that category
    if (filters.category) {
      const selectedCategory = filterOptions.categories.find(cat => cat._id === filters.category);
      if (selectedCategory) {
        filtered = { [selectedCategory.name]: filterOptions.subcategories[selectedCategory.name] || [] };
      }
    }
    
    return filtered;
  };

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
    // If discountPercentage is explicitly set, use it
    if (product.discountPercentage && product.discountPercentage > 0) {
      return product.discountPercentage;
    }
    
    // New pricing structure
    if (product.regularPrice && product.salePrice && product.regularPrice > product.salePrice) {
      return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
    }
    
    // Legacy pricing
    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    
    // Check if there's a price difference
    if (product.regularPrice && product.price && product.regularPrice > product.price) {
      return Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100);
    }
    
    return 0;
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    
    // Show beautiful SweetAlert notification
    Swal.fire({
      title: 'Added to Cart!',
      text: `${product.name} has been added to your cart`,
      icon: 'success',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#f8fafc',
      color: '#1f2937',
      customClass: {
        popup: 'swal2-toast',
        title: 'text-purple-600 font-semibold',
        content: 'text-gray-600'
      }
    });
  };

  const handleBuyNow = (productId) => {
    Swal.fire({
      title: 'Buy Now',
      text: 'This feature will redirect you to checkout',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Proceed to Checkout',
      cancelButtonText: 'Cancel',
      background: '#f8fafc',
      color: '#1f2937'
    }).then((result) => {
      if (result.isConfirmed) {
        // Add to cart and redirect to checkout
        const product = products.find(p => p._id === productId);
        if (product) {
          addToCart(product);
        }
        // You can add checkout redirect logic here
        console.log('Proceeding to checkout for product:', productId);
      }
    });
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">All Products</h1>
          <p className="text-sm text-gray-600">Find your perfect beauty products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 sticky top-8">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Filter Options</h2>
              
              {/* Search */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search products..."
                />
              </div>

              {/* Brand Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => {
                    handleFilterChange('brand', e.target.value);
                    // Reset subcategory when brand changes
                    handleFilterChange('subcategory', '');
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={filtersLoading}
                >
                  <option value="">All Brands</option>
                  {filterOptions.brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
                {filtersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading brands...</p>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => {
                    handleFilterChange('category', e.target.value);
                    // Reset subcategory when category changes
                    handleFilterChange('subcategory', '');
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={filtersLoading}
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
                {filtersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
                )}
              </div>

              {/* Subcategory Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Sub Category</label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={filtersLoading}
                >
                  <option value="">All Sub Categories</option>
                  {Object.entries(getFilteredSubcategories()).map(([parentName, subs]) => (
                    <optgroup key={parentName} label={parentName}>
                      {subs.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {filtersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading subcategories...</p>
                )}
              </div>

              {/* Skin Type Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Skin Type</label>
                <select
                  value={filters.skinType}
                  onChange={(e) => handleFilterChange('skinType', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={filtersLoading}
                >
                  <option value="">All Types</option>
                  {filterOptions.skinTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {filtersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading skin types...</p>
                )}
              </div>

              {/* Skin Concern Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Skin Concern</label>
                <select
                  value={filters.skinConcern}
                  onChange={(e) => handleFilterChange('skinConcern', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={filtersLoading}
                >
                  <option value="">All Concerns</option>
                  {filterOptions.skinConcerns.map(concern => (
                    <option key={concern} value={concern}>{concern}</option>
                  ))}
                </select>
                {filtersLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading skin concerns...</p>
                )}
              </div>


              {/* Clear Filters */}
              <button
                onClick={() => setFilters({
                  search: '', category: '', brand: '', subcategory: '',
                  skinType: '', skinConcern: '', minPrice: '', maxPrice: '',
                  sortBy: 'createdAt', sortOrder: 'desc'
                })}
                className="w-full px-3 py-2 text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-gray-600">
                {pagination.totalCount} products found
              </p>
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-700">Sort by:</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating.average-desc">Rating: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  ⚠️
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">Something went wrong</h3>
                <p className="text-sm text-gray-500 mb-3">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  📦
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 mb-3">No products match your current filters</p>
                <button
                  onClick={() => setFilters({
                    search: '', category: '', brand: '', subcategory: '',
                    skinType: '', skinConcern: '', minPrice: '', maxPrice: '',
                    sortBy: 'createdAt', sortOrder: 'desc'
                  })}
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                  const imageUrl = primaryImage?.url || '/slider/1.webp';
                  const discountPercentage = calculateDiscountPercentage(product);

                  return (
                    <div key={product._id} className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                      <div className="relative">
                        <Link href={`/shop/${product._id}`}>
                          <Image
                            src={imageUrl}
                            alt={primaryImage?.alt || product.name}
                            width={300}
                            height={300}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        
                        {/* Discount Badge */}
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
                            {discountPercentage}% OFF
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button className="absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-3">
                        <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2 leading-tight">
                          <Link href={`/shop/${product._id}`} className="hover:text-purple-600 transition-colors">
                            {product.name}
                          </Link>
                        </h3>

                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            {(() => {
                              // Determine the correct sale price and regular price
                              const salePrice = product.salePrice;
                              const regularPrice = product.regularPrice || product.originalPrice;
                              const legacyPrice = product.price;
                              
                              // If we have salePrice and regularPrice, salePrice is the display price
                              // Otherwise use the legacy price
                              const displayPrice = (salePrice && regularPrice) ? salePrice : (salePrice || legacyPrice);
                              
                              return (
                                <>
                                  <span className="text-base font-bold text-gray-900">
                                    ৳{displayPrice}
                                  </span>
                                  {regularPrice && regularPrice > displayPrice && (
                                    <span className="text-xs text-gray-500 line-through">
                                      ৳{regularPrice}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-600">
                              {product.rating?.average || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 px-2 py-1.5 text-xs border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors font-medium"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleBuyNow(product._id)}
                            className="flex-1 px-2 py-1.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                          >
                            Buy Now
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
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    disabled={pagination.currentPage === 1}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                      className={`px-2 py-1.5 text-xs rounded-md ${
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
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}