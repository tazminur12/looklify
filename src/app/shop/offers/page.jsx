'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import Swal from 'sweetalert2';

export default function OffersPage() {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [sortBy, setSortBy] = useState('discount-desc');

  useEffect(() => {
    fetchOfferProducts();
  }, [pagination.currentPage, sortBy]);

  const fetchOfferProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '12',
        status: 'active'
      });

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (result.success) {
        const allProducts = result.data.products || [];
        
        // Filter products that have isOfferProduct flag set to true
        const productsWithOffers = allProducts.filter(product => {
          return Boolean(product.isOfferProduct) === true;
        });
        
        // Calculate discount and sort
        const sortedProducts = productsWithOffers
          .map(product => {
            let discount = 0;
            if (product.regularPrice && product.salePrice) {
              discount = Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
            } else if (product.originalPrice && product.price) {
              discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            } else if (product.discountPercentage) {
              discount = product.discountPercentage;
            }
            return { ...product, calculatedDiscount: discount };
          })
          .sort((a, b) => {
            if (sortBy === 'discount-desc') {
              return b.calculatedDiscount - a.calculatedDiscount;
            } else if (sortBy === 'discount-asc') {
              return a.calculatedDiscount - b.calculatedDiscount;
            } else if (sortBy === 'price-asc') {
              const priceA = a.salePrice || a.price;
              const priceB = b.salePrice || b.price;
              return priceA - priceB;
            } else if (sortBy === 'price-desc') {
              const priceA = a.salePrice || a.price;
              const priceB = b.salePrice || b.price;
              return priceB - priceA;
            } else if (sortBy === 'name-asc') {
              return a.name.localeCompare(b.name);
            }
            return 0;
          });
        
        // Calculate pagination
        const totalCount = sortedProducts.length;
        const limit = 12;
        const totalPages = Math.ceil(totalCount / limit);
        const startIndex = (pagination.currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
        
        setProducts(paginatedProducts);
        setPagination(prev => ({
          ...prev,
          totalPages,
          totalCount
        }));
      } else {
        setError(result.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching offer products:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountPercentage = (product) => {
    if (product.calculatedDiscount) {
      return product.calculatedDiscount;
    }
    if (product.regularPrice && product.salePrice && product.regularPrice > product.salePrice) {
      return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
    }
    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    if (product.discountPercentage) {
      return product.discountPercentage;
    }
    return 0;
  };

  const getDisplayPrice = (product) => {
    return product.salePrice || product.price;
  };

  const getRegularPrice = (product) => {
    return product.regularPrice || product.originalPrice;
  };

  const formatPrice = (price) => {
    if (!price) return '';
    return `৳${parseInt(price).toLocaleString('en-BD')}`;
  };

  const handleAddToCart = (product) => {
    // Check stock before adding to cart
    if (product.inventory?.trackInventory !== false) {
      if (product.stock === 0 || product.stock < 1) {
        Swal.fire({
          title: 'Out of Stock',
          html: `
            <div class="text-center">
              <p class="mb-2 text-gray-700">
                <strong>${product.name}</strong> is currently out of stock.
              </p>
              <p class="text-sm text-gray-600">
                Please check back later or browse other products.
              </p>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#7c3aed',
          background: '#f8fafc',
          color: '#1f2937'
        });
        return;
      }
    }
    
    const result = addToCart(product);
    
    if (!result.success) {
      Swal.fire({
        title: 'Cannot Add to Cart',
        html: `
          <div class="text-center">
            <p class="mb-2 text-gray-700">
              ${result.message || 'Unable to add this product to cart.'}
            </p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed',
        background: '#f8fafc',
        color: '#1f2937'
      });
      return;
    }
    
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
    });
  };

  const handleBuyNow = (product) => {
    addToCart(product);
    window.location.href = '/checkout';
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 relative">
            Products on Offer
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-4">
            Discover amazing deals and discounts on our best products
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-purple-600">{pagination.totalCount}</span> products on offer
          </p>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPagination(prev => ({ ...prev, currentPage: 1 }));
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="discount-desc">Highest Discount</option>
              <option value="discount-asc">Lowest Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              ⚠️
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Something went wrong</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchOfferProducts}
              className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              🎁
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No offers available</h3>
            <p className="text-sm text-gray-500 mb-4">Check back later for amazing deals!</p>
            <Link
              href="/shop"
              className="inline-block px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => {
                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                const imageUrl = primaryImage?.url || '/slider/1.webp';
                const discountPercentage = calculateDiscountPercentage(product);
                const displayPrice = getDisplayPrice(product);
                const regularPrice = getRegularPrice(product);

                return (
                  <div key={product._id} className="bg-white rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 group">
                    <div className="relative">
                      <Link href={`/shop/${product._id}`}>
                        <Image
                          src={imageUrl}
                          alt={primaryImage?.alt || product.name}
                          width={400}
                          height={400}
                          className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Discount Badge - Prominent for offers */}
                      {discountPercentage > 0 && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="px-3 py-1.5 text-sm font-bold bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full shadow-lg animate-pulse">
                            {discountPercentage}% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-2 leading-tight min-h-[40px] group-hover:text-purple-600 transition-colors">
                        <Link href={`/shop/${product._id}`}>
                          {product.name}
                        </Link>
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className="text-lg sm:text-xl font-bold text-red-600">
                            {formatPrice(displayPrice)}
                          </span>
                          {regularPrice && regularPrice > displayPrice && (
                            <span className="text-xs sm:text-sm text-gray-500 line-through">
                              {formatPrice(regularPrice)}
                            </span>
                          )}
                        </div>
                        {/* Wishlist button */}
                        <button 
                          onClick={() => {
                            if (isInWishlist(product._id)) {
                              removeFromWishlist(product._id);
                            } else {
                              addToWishlist(product);
                            }
                          }}
                          aria-label="wishlist"
                          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                            isInWishlist(product._id)
                              ? 'text-red-500 border-red-200 bg-red-50'
                              : 'text-gray-500 border-gray-200 hover:text-red-500 hover:border-red-300'
                          }`}
                        >
                          <svg className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : 'stroke-current'}`} fill={isInWishlist(product._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 py-2.5 rounded-full border-2 border-purple-600 text-purple-600 bg-white font-semibold hover:bg-purple-50 transition-colors text-xs sm:text-sm"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleBuyNow(product)}
                            className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-xs sm:text-sm"
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                            pagination.currentPage === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

