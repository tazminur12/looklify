'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import Swal from 'sweetalert2';

function ShopContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
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
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Sync category and brand slugs from URL to _id after filter options are loaded (only once)
  useEffect(() => {
    if (!filtersLoading && !hasSyncedRef.current && (filterOptions.categories.length > 0 || filterOptions.brands.length > 0)) {
      const categoryParam = searchParams.get('category') || '';
      const brandParam = searchParams.get('brand') || '';
      let updated = false;
      const updatedFilters = { ...filters };

      if (filterOptions.categories.length > 0 && categoryParam) {
        // Check if current category value is a slug (not an ObjectId)
        const isSlug = !/^[0-9a-fA-F]{24}$/.test(categoryParam);
        if (isSlug) {
          // Find category by slug and update filter to use _id
          const foundCategory = filterOptions.categories.find(
            cat => cat.slug === categoryParam
          );
          if (foundCategory && foundCategory._id !== filters.category) {
            updatedFilters.category = foundCategory._id;
            updated = true;
          }
        }
      }

      if (filterOptions.brands.length > 0 && brandParam) {
        // Check if current brand value is a slug (not an ObjectId)
        const isSlug = !/^[0-9a-fA-F]{24}$/.test(brandParam);
        if (isSlug) {
          // Find brand by slug and update filter to use _id
          const foundBrand = filterOptions.brands.find(
            brand => brand.slug === brandParam
          );
          if (foundBrand && foundBrand._id !== filters.brand) {
            updatedFilters.brand = foundBrand._id;
            updated = true;
          }
        }
      }

      if (updated) {
        setFilters(updatedFilters);
      }
      hasSyncedRef.current = true;
    }
  }, [filterOptions.categories, filterOptions.brands, filtersLoading, searchParams, filters]);

  useEffect(() => {
    // Only fetch products after filter options are loaded (to avoid race conditions)
    if (!filtersLoading) {
      fetchProducts();
    }
  }, [filters, filtersLoading]);

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
    const product = products.find(p => p._id === productId);
    if (product) {
      addToCart(product);
      // Redirect to checkout
      window.location.href = '/checkout';
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">All Products</h1>
          <p className="text-sm text-gray-600">Find your perfect beauty products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-3 sm:p-4 sticky top-8">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Filter Options</h2>
              
              {/* Search */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search products..."
                />
              </div>

              {/* Brand Filter */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => {
                    handleFilterChange('brand', e.target.value);
                    // Reset subcategory when brand changes
                    handleFilterChange('subcategory', '');
                  }}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="mb-3 sm:mb-4">
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => {
                    handleFilterChange('category', e.target.value);
                    // Reset subcategory when category changes
                    handleFilterChange('subcategory', '');
                  }}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="mb-3 sm:mb-4">
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">Sub Category</label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="mb-3 sm:mb-4">
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">Skin Type</label>
                <select
                  value={filters.skinType}
                  onChange={(e) => handleFilterChange('skinType', e.target.value)}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="mb-3 sm:mb-4">
                <label className="block text-[11px] sm:text-xs font-medium text-gray-700 mb-1">Skin Concern</label>
                <select
                  value={filters.skinConcern}
                  onChange={(e) => handleFilterChange('skinConcern', e.target.value)}
                  className="w-full px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {products.map((product) => {
                  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                  const imageUrl = primaryImage?.url || '/slider/1.webp';
                  const discountPercentage = calculateDiscountPercentage(product);

                  return (
                    <div key={product._id} className="group bg-white rounded-xl border border-[#7c52c5] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Product Image Container with white background */}
                      <div className="relative w-full h-32 sm:h-40 lg:h-40 overflow-hidden bg-white">
                        <Link href={`/shop/${product._id}`}>
                          <Image
                            src={imageUrl}
                            alt={primaryImage?.alt || product.name}
                            width={400}
                            height={400}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Discount Badge - red oval top-right */}
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-red-600 text-white rounded-full shadow-lg">
                              {discountPercentage}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-2 sm:p-3 lg:p-3">
                        {/* Product Name */}
                        <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors text-xs sm:text-sm lg:text-sm min-h-[32px] sm:min-h-[36px]">
                          <Link href={`/shop/${product._id}`} className="hover:text-purple-600 transition-colors">
                            {product.name}
                          </Link>
                        </h3>

                        {/* Price and Wishlist */}
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                            {(() => {
                              const salePrice = product.salePrice;
                              const regularPrice = product.regularPrice || product.originalPrice;
                              const legacyPrice = product.price;
                              const displayPrice = (salePrice && regularPrice) ? salePrice : (salePrice || legacyPrice);
                              return (
                                <>
                                  <span className="text-xs sm:text-sm lg:text-sm xl:text-base font-bold text-gray-900">
                                    BDT {displayPrice}
                                  </span>
                                  {regularPrice && regularPrice > displayPrice && (
                                    <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                                      BDT {regularPrice}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          {/* Wishlist button on right */}
                          <button 
                            onClick={() => {
                              if (isInWishlist(product._id)) {
                                removeFromWishlist(product._id);
                              } else {
                                addToWishlist(product);
                              }
                            }}
                            aria-label="wishlist"
                            className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-8 lg:h-8 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                              isInWishlist(product._id)
                                ? 'text-red-500 border-red-200 bg-red-50'
                                : 'text-gray-500 border-gray-200 hover:text-red-500 hover:border-red-300'
                            }`}
                          >
                            <svg className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-4 lg:h-4 ${isInWishlist(product._id) ? 'fill-current' : 'stroke-current'}`} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                        </div>

                        {/* Bottom action bar - pill buttons */}
                        <div className="mt-1.5 sm:mt-2">
                          <div className="flex gap-1.5 sm:gap-2 lg:gap-2">
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex-1 py-2 sm:py-2.5 lg:py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-xs sm:text-sm lg:text-xs"
                            >
                              Add to Cart
                            </button>
                            <button
                              onClick={() => handleBuyNow(product._id)}
                              className="flex-1 py-2 sm:py-2.5 lg:py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-xs sm:text-sm lg:text-xs"
                            >
                              Buy Now
                            </button>
                          </div>
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