'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// Custom Image Component with better error handling
function ProductImage({ src, alt, className, onError }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
    
    // Preload image to check if it exists
    if (src && src !== '/slider/1.webp') {
      const img = new window.Image();
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        console.error('Image failed to load:', src);
        setHasError(true);
        setIsLoading(false);
        if (onError) onError();
      };
      img.src = src;
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [src, onError]);

  if (hasError || !imgSrc || imgSrc === '/slider/1.webp') {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-6xl ${className}`}>
        📦
      </div>
    );
  }

  return (
    <>
      {/* Background that prevents black screen */}
      <div className="absolute inset-0 bg-white" />
      {isLoading && (
        <div className="absolute inset-0 bg-white animate-pulse z-10" />
      )}
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 relative z-20`}
        style={{ objectFit: 'contain' }}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        onLoadingComplete={() => setIsLoading(false)}
        unoptimized={imgSrc.includes('cloudinary')}
      />
    </>
  );
}

export default function PopularProductsOnOffer() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchProductsOnOffer = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?limit=8&status=active');
        
        if (response.ok) {
          const data = await response.json();
          const allProducts = data.data?.products || [];
          
          // Filter products that have isOfferProduct flag set to true
          const productsWithOffers = allProducts.filter(product => {
            return Boolean(product.isOfferProduct) === true;
          });
          
          // Sort by discount percentage (highest first) and take top 8
          const sortedProducts = productsWithOffers
            .map(product => {
              let discount = 0;
              if (product.regularPrice && product.salePrice) {
                discount = Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
              } else if (product.originalPrice && product.price) {
                discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
              }
              return { ...product, discount };
            })
            .sort((a, b) => b.discount - a.discount)
            .slice(0, 8);
          
          setProducts(sortedProducts);
        } else {
          console.error('Failed to fetch products on offer:', response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products on offer:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsOnOffer();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (product) => {
    if (product.regularPrice && product.salePrice) {
      return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
    }
    if (product.originalPrice && product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const getDisplayPrice = (product) => {
    return product.salePrice || product.price;
  };

  const getRegularPrice = (product) => {
    return product.regularPrice || product.originalPrice;
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Popular Products on Offer</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show section if no products on offer
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 relative">
            Popular Products on Offer
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 sm:w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-6">
          {products.map((product) => {
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
            const imageUrl = primaryImage?.url || '/slider/1.webp';
            const discount = calculateDiscount(product);
            const displayPrice = getDisplayPrice(product);
            const regularPrice = getRegularPrice(product);
            
            return (
              <div
                key={product._id}
                className="group bg-white rounded-xl border border-[#7c52c5] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
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
                  {discount > 0 && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-2.5 py-1.5 text-xs sm:text-sm font-bold bg-red-600 text-white rounded-full shadow-lg">
                        {discount}% OFF
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
                      <span className="text-xs sm:text-sm lg:text-sm xl:text-base font-bold text-gray-900">
                        BDT {displayPrice}
                      </span>
                      {regularPrice && regularPrice > displayPrice && (
                        <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                          BDT {regularPrice}
                        </span>
                      )}
                    </div>
                    {/* Wishlist button on right */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
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
                        onClick={(e) => {
                          e.preventDefault();
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
                            color: '#1f2937'
                          });
                        }}
                        className="flex-1 py-2 sm:py-2.5 lg:py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors text-xs sm:text-sm lg:text-xs"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
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
                          
                          router.push('/checkout');
                        }}
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
        
        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/shop/offers"
            className="inline-flex items-center px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold text-sm sm:text-base lg:text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>View All Offers</span>
            <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

