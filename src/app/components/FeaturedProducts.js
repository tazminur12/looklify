'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";

// Custom Image Component with better error handling
function ProductImage({ src, alt, className, onError }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    console.error('Image failed to load:', imgSrc);
    setHasError(true);
    if (onError) onError();
  };

  if (hasError || !imgSrc || imgSrc === '/slider/1.webp') {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-6xl ${className}`}>
        📦
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className={className}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      onError={handleError}
      unoptimized={imgSrc.includes('cloudinary')} // Cloudinary handles optimization
    />
  );
}

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching featured products...');
        const response = await fetch('/api/products?featured=true&limit=8');
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          setFeaturedProducts(data.data?.products || []);
        } else {
          console.error('Failed to fetch featured products:', response.status, response.statusText);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (product) => {
    // New pricing structure
    if (product.regularPrice && product.salePrice) {
      return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
    }
    // Legacy pricing
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Our handpicked selection of premium beauty products</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

  if (featuredProducts.length === 0) {
    return null; // Don't show section if no featured products
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 relative">
            Featured Products
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our handpicked selection of premium beauty products that stand out for their quality and effectiveness
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
            const imageUrl = primaryImage?.url || '/slider/1.webp';
            const discount = calculateDiscount(product);
            const displayPrice = getDisplayPrice(product);
            const regularPrice = getRegularPrice(product);
            
            // Debug logging
            console.log('Product:', product.name, 'Image URL:', imageUrl, 'Images:', product.images);
            
            return (
              <Link
                key={product._id}
                href={`/shop/${product._id}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                {/* Product Image */}
                <div className="relative w-full h-48 overflow-hidden">
                  <ProductImage
                    src={imageUrl}
                    alt={primaryImage?.alt || product.name}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Featured Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 text-xs font-semibold rounded-full shadow-lg">
                      ⭐ Featured
                    </span>
                  </div>
                  
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-full shadow-lg">
                        -{discount}%
                      </span>
                    </div>
                  )}
                  
                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm">
                        Quick View
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {typeof product.brand === 'string' ? product.brand : product.brand.name}
                    </p>
                  )}
                  
                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Category */}
                  <p className="text-sm text-gray-500 mb-3">
                    {typeof product.category === 'string' ? product.category : product.category?.name || 'Beauty'}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < Math.floor(product.rating?.average || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      ({product.rating?.count || 0})
                    </span>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-purple-600">
                        {formatPrice(displayPrice)}
                      </span>
                      {regularPrice && regularPrice > displayPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(regularPrice)}
                        </span>
                      )}
                    </div>
                    
                    {/* Stock Status */}
                    <div className="text-right">
                      {product.stock > 0 ? (
                        <span className="text-xs text-green-600 font-medium">
                          In Stock
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to cart functionality can be implemented here
                      console.log('Add to cart:', product._id);
                    }}
                    className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                  >
                    Add to Cart
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/shop?featured=true"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>View All Featured Products</span>
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
