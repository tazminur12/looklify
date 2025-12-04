'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import Swal from 'sweetalert2';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { wishlistItems, loading: wishlistLoading, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const calculateDiscountPercentage = (product) => {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return product.discountPercentage;
    }
    
    if (product.regularPrice && product.salePrice && product.regularPrice > product.salePrice) {
      return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
    }
    
    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    
    if (product.regularPrice && product.price && product.regularPrice > product.price) {
      return Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100);
    }
    
    return 0;
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
        const product = wishlistItems.find(p => p._id === productId);
        if (product) {
          addToCart(product);
        }
      }
    });
  };

  if (authLoading || wishlistLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-sm text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding products you love to your wishlist</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => {
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
                        width={400}
                        height={400}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Discount Badge */}
                    {discountPercentage > 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-semibold shadow-lg">
                        {discountPercentage}% OFF
                      </div>
                    )}

                    {/* Wishlist Button - Remove */}
                    <button 
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-3 left-3 w-8 h-8 bg-red-500 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md text-white hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-3 text-base line-clamp-2 leading-tight">
                      <Link href={`/shop/${product._id}`} className="hover:text-purple-600 transition-colors">
                        {product.name}
                      </Link>
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const salePrice = product.salePrice;
                          const regularPrice = product.regularPrice || product.originalPrice;
                          const legacyPrice = product.price;
                          
                          const displayPrice = (salePrice && regularPrice) ? salePrice : (salePrice || legacyPrice);
                          
                          return (
                            <>
                              <span className="text-lg font-bold text-gray-900">
                                ৳{displayPrice}
                              </span>
                              {regularPrice && regularPrice > displayPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ৳{regularPrice}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {product.rating?.average || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 px-3 py-2 text-sm border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition-colors font-medium"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(product._id)}
                        className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
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
      </div>
    </div>
  );
}

