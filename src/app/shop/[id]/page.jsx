'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import Swal from 'sweetalert2';

// Helper function to check if a string is a MongoDB ObjectId (24 hex characters)
const isMongoObjectId = (str) => {
  return /^[0-9a-fA-F]{24}$/.test(str);
};

export default function DynamicShopPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  
  // State for product details page
  const [product, setProduct] = useState(null);
  
  // State for category page
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  
  // Filter states
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
    subcategories: {},
    skinTypes: [],
    skinConcerns: []
  });
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    subcategory: '',
    skinType: '',
    skinConcern: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Check if params.id is a product ID (MongoDB ObjectId) or category slug
  const isProductId = isMongoObjectId(params.id);

  // Fetch product details (when it's a product ID)
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setProduct(result.data);
          // Reset image index when product changes
          setActiveImageIndex(0);
          // Fetch related products
          const relatedResponse = await fetch(`/api/products?category=${result.data.category}&limit=4`);
          const relatedResult = await relatedResponse.json();
          if (relatedResult.success) {
            setRelatedProducts(relatedResult.data.products.filter(p => p._id !== params.id));
          }
        } else {
          setError(result.error || 'Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && isProductId) {
      fetchProduct();
    }
  }, [params.id, isProductId]);

  // Fetch category and its products (when it's a category slug)
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shop/filters');
        const result = await response.json();
        
        if (result.success) {
          // Find the category by slug
          const foundCategory = result.data.categories.find(cat => cat.slug === params.id);
          if (foundCategory) {
            setCategory(foundCategory);
          } else {
            setError('Category not found');
          }
          
          // Set filter options
          setFilterOptions(result.data);
        } else {
          setError('Failed to fetch category');
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Failed to load category');
      } finally {
        setLoading(false);
      }
    };

    if (params.id && !isProductId) {
      fetchCategory();
    }
  }, [params.id, isProductId]);

  // Fetch products for category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        const params = new URLSearchParams({
          category: category.slug,
          limit: '12'
        });

        // Add filters if set
        if (filters.brand) params.append('brand', filters.brand);
        if (filters.search) params.append('search', filters.search);

        const response = await fetch(`/api/products?${params}`);
        const result = await response.json();

        if (result.success) {
          setProducts(result.data.products);
        } else {
          setError(result.error || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchCategoryProducts();
    }
  }, [category, filters]);

  // Reset filters function
  const resetFilters = () => {
    setFilters({
      search: '',
      brand: '',
      subcategory: '',
      skinType: '',
      skinConcern: '',
    });
  };

  // If it's a product ID, render product details page
  if (isProductId) {
    return <ProductDetailsView 
      product={product} 
      productId={params.id}
      loading={loading} 
      error={error} 
      quantity={quantity} 
      setQuantity={setQuantity}
      activeImageIndex={activeImageIndex}
      setActiveImageIndex={setActiveImageIndex}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      relatedProducts={relatedProducts}
      handleQuantityChange={(change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (product?.inventory?.maxOrderQuantity || 999)) {
          setQuantity(newQuantity);
        }
      }}
      handleAddToCart={() => {
        addToCart(product);
        alert(`${product.name} added to cart!`);
      }}
      handleBuyNow={() => {
        if (product) {
          addToCart(product);
          // Redirect to checkout
          window.location.href = '/checkout';
        }
      }}
    />;
  }

  // Otherwise, render category page (we'll create this component)
  return <CategoryView 
    category={category} 
    products={products} 
    loading={loading} 
    error={error} 
    addToCart={addToCart}
    filters={filters}
    setFilters={setFilters}
    filterOptions={filterOptions}
    resetFilters={resetFilters}
  />;
}

// Reviews Section Component
function ReviewsSection({ productId, session }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/reviews`);
      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data.reviews);
        setAverageRating(result.data.averageRating);
        setTotalReviews(result.data.totalReviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!session) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to submit a review',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#7c3aed'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    if (reviewForm.rating === 0) {
      Swal.fire({
        title: 'Rating Required',
        text: 'Please select a rating',
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#7c3aed'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          title: 'Review Submitted!',
          text: 'Thank you for your review!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        });
        setReviewForm({ rating: 0, comment: '' });
        setShowForm(false);
        fetchReviews();
      } else {
        Swal.fire({
          title: 'Error',
          text: result.error || 'Failed to submit review',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to submit review',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Reviews Header */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4 text-base">Customer Reviews</h4>
        
        {/* Average Rating Summary */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ⭐
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-1">{totalReviews} reviews</div>
          </div>
        </div>

        {/* Write Review Button */}
        {session && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Write a Review
          </button>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">Write Your Review</h5>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitReview}>
              {/* Rating Stars */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rate this product
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className={`text-2xl ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:scale-110 transition-transform`}
                    >
                      ⭐
                    </button>
                  ))}
                  {reviewForm.rating > 0 && (
                    <span className="ml-2 text-xs text-gray-600">
                      {reviewForm.rating} out of 5
                    </span>
                  )}
                </div>
              </div>

              {/* Review Comment */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="h-8 w-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            ⭐
          </div>
          <p className="text-gray-500 text-sm">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to review and help others</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex items-start space-x-3">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {review.user?.name?.charAt(0) || review.user?.email?.charAt(0) || 'U'}
                </div>
                
                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-gray-900 text-sm">
                      {review.user?.name || 'Anonymous'}
                    </h5>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Rating Stars */}
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  
                  {/* Review Comment */}
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Product Details Component
function ProductDetailsView({ product, productId, loading, error, quantity, setQuantity, activeImageIndex, setActiveImageIndex, activeTab, setActiveTab, relatedProducts, handleQuantityChange, handleAddToCart, handleBuyNow }) {
  const { data: session } = useSession();
  const [dynamicWatchersCount, setDynamicWatchersCount] = useState(95);

  // Update watchers count dynamically within 90-100 range
  useEffect(() => {
    // Initialize with a random value between 90-100
    setDynamicWatchersCount(Math.floor(Math.random() * 11) + 90);

    const interval = setInterval(() => {
      setDynamicWatchersCount((prevCount) => {
        // Randomly decide to increase or decrease (50% chance each)
        const shouldIncrease = Math.random() < 0.5;
        
        // Random change amount between 1-3
        const changeAmount = Math.floor(Math.random() * 3) + 1;
        
        let newCount;
        if (shouldIncrease) {
          // Increase, but don't go above 100
          newCount = Math.min(100, prevCount + changeAmount);
        } else {
          // Decrease, but don't go below 90
          newCount = Math.max(90, prevCount - changeAmount);
        }
        
        return newCount;
      });
    }, Math.floor(Math.random() * 2000) + 3000); // Random interval between 3-5 seconds

    return () => clearInterval(interval);
  }, []);

  const calculateDiscountPercentage = () => {
    // If discountPercentage is explicitly set, use it
    if (product?.discountPercentage && product.discountPercentage > 0) {
      return product.discountPercentage;
    }
    
    // New pricing structure
    if (product?.regularPrice && product?.salePrice && product.regularPrice > product.salePrice) {
      return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
    }
    
    // Legacy pricing
    if (product?.originalPrice && product?.price && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    
    // Check if there's a price difference with regularPrice and price
    if (product?.regularPrice && product?.price && product.regularPrice > product.price) {
      return Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100);
    }
    
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-10 w-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            📦
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">Product not found</h3>
          <p className="text-sm text-gray-500 mb-3">{error || 'This product is no longer available'}</p>
          <Link
            href="/shop"
            className="px-4 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            See other products
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const activeImage = product.images?.[activeImageIndex] || primaryImage;
  const imageUrl = activeImage?.url || '/slider/1.webp';
  
  // Determine correct pricing
  const salePrice = product.salePrice;
  const regularPrice = product.regularPrice || product.originalPrice;
  const legacyPrice = product.price;
  
  // If we have salePrice and regularPrice, salePrice is the display price
  const displayPrice = (salePrice && regularPrice) ? salePrice : (salePrice || legacyPrice);
  const displayRegularPrice = regularPrice;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {/* Compact Breadcrumb */}
        <nav className="flex items-center space-x-1.5 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-purple-600">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-purple-600">Shop</Link>
          <span>/</span>
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Images - More Compact */}
          <div className="bg-white rounded-lg p-4">
            <div className="relative mb-3">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={activeImage?.alt || product.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Discount Badge */}
              {calculateDiscountPercentage() > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold shadow-md">
                  {calculateDiscountPercentage()}% OFF
                </div>
              )}
            </div>
            
            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-14 h-14 rounded overflow-hidden border-2 ${
                      activeImageIndex === index ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || product.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - More Compact */}
          <div className="space-y-4">
            {/* Product Details */}
            <div className="bg-white rounded-lg p-4">
              <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              
              {/* Watching Now Indicator */}
              <div className="mb-3 px-3 py-2 bg-gray-100 rounded-lg flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm text-gray-900 font-medium">
                  {dynamicWatchersCount} people watching this right now
                </span>
              </div>
              
              {/* Rating - Compact */}
              <div className="flex items-center space-x-1.5 mb-3">
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
                <span className="text-xs text-gray-600">
                  ({product.rating?.count || 0})
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-600">{product.soldCount || 0} sold</span>
              </div>

              {/* Price - Larger */}
              <div className="mb-4 pb-3 border-b border-gray-200">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ৳{displayPrice}
                  </span>
                  {displayRegularPrice && displayRegularPrice > displayPrice ? (
                    <span className="text-base text-gray-500 line-through">
                      ৳{displayRegularPrice}
                    </span>
                  ) : product.discountPercentage && product.discountPercentage > 0 && product.price ? (
                    <span className="text-base text-gray-500 line-through">
                      ৳{Math.round(product.price / (1 - product.discountPercentage / 100))}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Compact Product Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{product.brand?.name || product.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium">{product.origin || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium">{product.productCode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">
                    {product.weight?.value ? `${product.weight.value} ${product.weight.unit}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category?.name || product.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Quantity Selector - Compact */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Quantity
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-14 text-center border border-gray-300 rounded py-1 text-sm"
                    min="1"
                    max={product.inventory?.maxOrderQuantity || 999}
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons - Compact */}
              <div className="space-y-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium text-sm"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full px-4 py-2.5 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium text-sm"
                >
                  Buy Now
                </button>
              </div>

              {/* Caption - Display below buttons */}
              {product.description && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Related Products - Compact */}
            {relatedProducts.length > 0 && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Related Products</h3>
                <div className="space-y-2">
                  {relatedProducts.slice(0, 2).map((relatedProduct) => (
                    <Link
                      key={relatedProduct._id}
                      href={`/shop/${relatedProduct._id}`}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Image
                        src={relatedProduct.images?.[0]?.url || '/slider/1.webp'}
                        alt={relatedProduct.name}
                        width={50}
                        height={50}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-xs line-clamp-1">
                          {relatedProduct.name}
                        </h4>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-purple-600 text-sm">৳{relatedProduct.salePrice || relatedProduct.price}</span>
                          {(relatedProduct.regularPrice || relatedProduct.originalPrice) && 
                           (relatedProduct.regularPrice || relatedProduct.originalPrice) > (relatedProduct.salePrice || relatedProduct.price) && (
                            <span className="text-xs text-gray-500 line-through">
                              ৳{relatedProduct.regularPrice || relatedProduct.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs - Compact */}
        <div className="mt-6 bg-white rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-6 px-4">
              {[
                { id: 'description', label: 'Description' },
                { id: 'ingredients', label: 'Ingredients' },
                { id: 'usage', label: 'Usage' },
                { id: 'reviews', label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-xs ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'description' && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">Description:</h4>
                  {product.bengaliDescription ? (
                    <p className="text-gray-700 whitespace-pre-line text-xs leading-relaxed">{product.bengaliDescription}</p>
                  ) : (
                    <p className="text-gray-500 text-xs italic">No Bengali description available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Ingredients:</h4>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-xs">Ingredient information not available</p>
                )}
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Usage Instructions:</h4>
                {product.features && product.features.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-xs">Usage instructions not available</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <ReviewsSection productId={productId} session={session} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Category View Component - Same design as shop page
function CategoryView({ category, products, loading, error, addToCart, filters, setFilters, filterOptions, resetFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters({...filters, [key]: value});
  };

  const handleAddToCartProduct = (product) => {
    addToCart(product);
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

  const handleBuyNow = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      addToCart(product);
    }
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
    });
  };

  const calculateDiscount = (originalPrice, price) => {
    if (originalPrice && originalPrice > price) {
      return Math.round(((originalPrice - price) / originalPrice) * 100);
    }
    return 0;
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

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            ⚠️
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">Category not found</h3>
          <p className="text-sm text-gray-500 mb-3">{error || 'This category does not exist'}</p>
          <Link href="/shop" className="px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700">
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h1>
          <p className="text-sm text-gray-600">Find your perfect beauty products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar - EXACT SAME AS SHOP PAGE */}
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
                    handleFilterChange('subcategory', '');
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Brands</option>
                  {filterOptions.brands.map(brand => (
                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Sub Category</label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Sub Categories</option>
                  {Object.entries(filterOptions.subcategories).map(([parentName, subs]) => (
                    <optgroup key={parentName} label={parentName}>
                      {subs.map(sub => (
                        <option key={sub._id} value={sub._id}>{sub.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Skin Type Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Skin Type</label>
                <select
                  value={filters.skinType}
                  onChange={(e) => handleFilterChange('skinType', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Types</option>
                  {filterOptions.skinTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Skin Concern Filter */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Skin Concern</label>
                <select
                  value={filters.skinConcern}
                  onChange={(e) => handleFilterChange('skinConcern', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Concerns</option>
                  {filterOptions.skinConcerns.map(concern => (
                    <option key={concern} value={concern}>{concern}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={resetFilters}
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
                {products.length} products found
              </p>
              <div className="flex items-center space-x-2">
                <label className="text-xs text-gray-700">Sort by:</label>
                <select
                  defaultValue="createdAt-desc"
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  📦
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-sm text-gray-500 mb-3">No products match your current filters</p>
                <button
                  onClick={resetFilters}
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
                  // Calculate discount percentage
                  const discountPercentage = (() => {
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
                  })();

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
                              const salePrice = product.salePrice;
                              const regularPrice = product.regularPrice || product.originalPrice;
                              const legacyPrice = product.price;
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
                            onClick={() => handleAddToCartProduct(product)}
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
          </div>
        </div>
      </div>
    </div>
  );
}
