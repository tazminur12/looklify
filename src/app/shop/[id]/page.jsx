'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductDetailsPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setProduct(result.data);
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

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory?.maxOrderQuantity || 999)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Add to cart functionality
    console.log('Adding to cart:', { productId: product._id, quantity });
  };

  const handleBuyNow = () => {
    // Buy now functionality
    console.log('Buying now:', { productId: product._id, quantity });
  };

  const calculateDiscountPercentage = () => {
    if (product?.originalPrice && product?.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">পণ্য লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            📦
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">পণ্য পাওয়া যায়নি</h3>
          <p className="text-gray-500 mb-4">{error || 'এই পণ্যটি আর পাওয়া যায় না'}</p>
          <Link
            href="/shop"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            অন্যান্য পণ্য দেখুন
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || '/slider/1.webp';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-purple-600">হোম</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-purple-600">দোকান</Link>
          <span>/</span>
          <Link href={`/shop/${product.category.toLowerCase().replace(' ', '-')}`} className="hover:text-purple-600">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.bengaliName || product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6">
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={imageUrl}
                    alt={primaryImage?.alt || product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Discount Badge */}
                {calculateDiscountPercentage() > 0 && (
                  <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {calculateDiscountPercentage()}% OFF
                  </div>
                )}

                {/* Image Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex space-x-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          activeImageIndex === index ? 'border-purple-600' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={image.alt || product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Details */}
            <div className="bg-white rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {product.bengaliName || product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < Math.floor(product.rating?.average || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating?.average || 0} ({product.rating?.count || 0} রিভিউ)
                </span>
              </div>

              {/* Sales Info */}
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span>{product.soldCount || 0} টি বিক্রিত হয়েছে</span>
                <span>{product.watchersCount || 0} জন দেখছেন</span>
              </div>

              {/* Product Info */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">পণ্য কোড:</span>
                  <span className="font-medium">{product.productCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ব্র্যান্ড:</span>
                  <span className="font-medium">{product.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">উৎপাদনের দেশ:</span>
                  <span className="font-medium">{product.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">আকার:</span>
                  <span className="font-medium">{product.weight?.value} {product.weight?.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ক্যাটাগরি:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">অবস্থা:</span>
                  <span className={`font-medium ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.stock > 0 ? 'স্টকে আছে' : 'স্টক নেই'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ৳{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পরিমাণ
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-16 text-center border border-gray-300 rounded-lg py-2"
                    min="1"
                    max={product.inventory?.maxOrderQuantity || 999}
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
                >
                  কার্টে যোগ করুন
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 font-medium"
                >
                  এখনই কিনুন
                </button>
              </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">সম্পর্কিত পণ্য</h3>
                <div className="space-y-4">
                  {relatedProducts.slice(0, 3).map((relatedProduct) => (
                    <Link
                      key={relatedProduct._id}
                      href={`/shop/${relatedProduct._id}`}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <Image
                        src={relatedProduct.images?.[0]?.url || '/slider/1.webp'}
                        alt={relatedProduct.name}
                        width={60}
                        height={60}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {relatedProduct.bengaliName || relatedProduct.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-purple-600">৳{relatedProduct.price}</span>
                          {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.price && (
                            <span className="text-xs text-gray-500 line-through">
                              ৳{relatedProduct.originalPrice}
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

        {/* Product Details Tabs */}
        <div className="mt-8 bg-white rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'description', label: 'বর্ণনা' },
                { id: 'ingredients', label: 'উপাদান' },
                { id: 'usage', label: 'ব্যবহার' },
                { id: 'reviews', label: 'রিভিউ' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                {product.bengaliDescription && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">বাংলা বর্ণনা:</h4>
                    <p className="text-gray-700 whitespace-pre-line">{product.bengaliDescription}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">ইংরেজি বর্ণনা:</h4>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">উপাদানসমূহ:</h4>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">উপাদানের তথ্য পাওয়া যায়নি</p>
                )}
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">ব্যবহারের নির্দেশনা:</h4>
                {product.features && product.features.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">ব্যবহারের নির্দেশনা পাওয়া যায়নি</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">রিভিউসমূহ:</h4>
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    ⭐
                  </div>
                  <p className="text-gray-500">কোনো রিভিউ নেই</p>
                  <p className="text-sm text-gray-400 mt-1">প্রথম রিভিউ দিন এবং অন্যদের সাহায্য করুন</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
