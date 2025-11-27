'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  
  // Fixed categories (not from backend)
  const categories = [
    { name: 'Skin Care', slug: 'skin-care' },
    { name: 'Hair Care', slug: 'hair-care' },
    { name: 'Lip Care', slug: 'lip-care' },
    { name: 'Eye Care', slug: 'eye-care' },
    { name: 'Body Care', slug: 'body-care' },
    { name: 'Facial Care', slug: 'facial-care' },
    { name: 'Teeth Care', slug: 'teeth-care' },
    { name: 'Health & Beauty', slug: 'health-beauty' }
  ];
  const { data: session, status } = useSession();
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const profileMenuRef = useRef(null);

  // Fetch subcategories from backend for search dropdown only
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoadingSubcategories(true);
        const response = await fetch('/api/shop/filters');
        const data = await response.json();
        
        if (data.success) {
          // Only fetch subcategories for search dropdown
          if (data.data.subcategories) {
            const allSubcategories = Object.values(data.data.subcategories).flat();
            setSubcategories(allSubcategories);
          }
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      // Close search results when clicking outside of either search area
      const clickedInsideDesktopSearch = desktopSearchRef.current?.contains(event.target);
      const clickedInsideMobileSearch = mobileSearchRef.current?.contains(event.target);
      if (!clickedInsideDesktopSearch && !clickedInsideMobileSearch) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search term is empty, clear results
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Set loading state
    setSearchLoading(true);

    // Debounce search API call
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          search: searchTerm.trim(),
          limit: '10',
          status: 'active'
        });

        if (selectedSubcategory) {
          params.append('subcategory', selectedSubcategory);
        }

        const response = await fetch(`/api/products?${params}`);
        const result = await response.json();

        if (result.success) {
          setSearchResults(result.data.products || []);
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
          setShowSearchResults(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setSearchLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, selectedSubcategory]);

  // Fixed navigation items (not from backend)
  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    { name: 'Skin Care', href: '/shop/skin-care' },
    { name: 'Hair Care', href: '/shop/hair-care' },
    { name: 'Lip Care', href: '/shop/lip-care' },
    { name: 'Eye Care', href: '/shop/eye-care' },
    { name: 'Body Care', href: '/shop/body-care' },
    { name: 'Facial Care', href: '/shop/facial-care' },
    { name: 'Teeth Care', href: '/shop/teeth-care' },
    { name: 'Health & Beauty', href: '/shop/health-beauty' },
    { name: 'Comboo', href: '/shop/combo-deals' },
    { name: 'Flash Sale', href: '/shop/flash-sale' },
  ];

  // Mobile navigation items - exclude Home, show all other items
  const mobileNavigationItems = navigationItems.filter(item => item.name !== 'Home');

  // Group subcategories by parent category
  const subcategoriesByParent = subcategories.reduce((acc, subcategory) => {
    const parentName = subcategory.parent?.name || 'Other';
    if (!acc[parentName]) {
      acc[parentName] = [];
    }
    acc[parentName].push(subcategory);
    return acc;
  }, {});

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim() && !selectedSubcategory) return;
    
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.append('search', searchTerm.trim());
    }
    
    if (selectedSubcategory) {
      params.append('subcategory', selectedSubcategory);
    }
    
    // Navigate to shop page with search parameters
    const queryString = params.toString();
    router.push(`/shop${queryString ? `?${queryString}` : ''}`);
    
    // Close search results and mobile search
    setShowSearchResults(false);
  };

  // Calculate discount percentage
  const calculateDiscount = (product) => {
    if (product.discountPercentage && product.discountPercentage > 0) {
      return product.discountPercentage;
    }
    if (product.regularPrice && product.salePrice && product.regularPrice > product.salePrice) {
      return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
    }
    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  // Get display price
  const getDisplayPrice = (product) => {
    return product.salePrice || product.price;
  };

  // Get regular price
  const getRegularPrice = (product) => {
    return product.regularPrice || product.originalPrice;
  };

  // Format price with ৳ symbol
  const formatPrice = (price) => {
    if (!price) return '';
    return `৳ ${parseInt(price).toLocaleString('en-BD')}`;
  };


  return (
    <header className="bg-white shadow-lg sticky top-0 z-60 border-b border-gray-100">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-2">
        <div className="flex items-center gap-1.5 sm:gap-2 w-full">
          {/* Logo Section - Text only - Visible on all screens */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <div className="text-base sm:text-lg lg:text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                Looklify
              </div>
            </Link>
          </div>

          {/* Mobile Search Bar - inline with header - Only visible on mobile */}
          <div className="flex flex-1 lg:hidden items-center gap-1.5 sm:gap-2 justify-between">
            <div ref={mobileSearchRef} className="flex-1 relative max-w-[calc(100%-60px)]">
              <form onSubmit={handleSearch} className="w-full">
                <div className="flex items-stretch w-full border border-[#cbb5f7] rounded-[18px] overflow-hidden bg-white shadow-[0_2px_6px_rgba(111,59,160,0.08)]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.trim()) {
                        setShowSearchResults(true);
                      }
                    }}
                    onFocus={() => {
                      if (searchTerm.trim() && searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    placeholder="Search"
                    className="flex-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-[#7b809a] placeholder-[#9fa3b8] focus:outline-none font-semibold bg-[#f5f5fb]"
                  />
                  <button
                    type="submit"
                    className="bg-[#6e33a6] text-white px-3 sm:px-4 flex items-center justify-center flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Mobile Search Results */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[60vh] overflow-y-auto z-50">
                  {searchLoading ? (
                    <div className="p-6 text-center">
                      <div className="inline-block w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-xs text-gray-600">Searching...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-gray-600">No products found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((product) => {
                        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                        const imageUrl = primaryImage?.url || '/slider/1.webp';
                        const displayPrice = getDisplayPrice(product);
                        const regularPrice = getRegularPrice(product);
                        const discount = calculateDiscount(product);
                        const isOutOfStock = product.status === 'out_of_stock' || product.stock === 0;

                        return (
                          <Link
                            key={product._id}
                            href={`/shop/${product._id}`}
                            onClick={() => {
                              setShowSearchResults(false);
                              setSearchTerm('');
                            }}
                            className="flex items-center p-3 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <div className="flex-shrink-0 w-16 h-16 relative bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={imageUrl}
                                alt={primaryImage?.alt || product.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                            <div className="flex-1 ml-3 min-w-0">
                              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {typeof product.brand === 'object' ? product.brand?.name : product.brand || 'No Brand'}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  isOutOfStock
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                </span>
                                {discount > 0 && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                                    {discount}% OFF
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-base font-bold text-gray-900">
                                  {formatPrice(displayPrice)}
                                </span>
                                {regularPrice && regularPrice > displayPrice && (
                                  <span className="text-xs text-gray-500 line-through">
                                    {formatPrice(regularPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                      {searchResults.length > 0 && (
                        <div className="p-2 bg-gray-50 border-t border-gray-200">
                          <button
                            onClick={handleSearch}
                            className="w-full text-center text-xs font-semibold text-purple-600 hover:text-purple-700 py-2"
                          >
                            View All Results ({searchResults.length}+)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button - Hamburger menu - Only visible on mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 rounded-lg flex-shrink-0 ml-1 sm:ml-2"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop Search Bar - Professional design */}
          <div ref={desktopSearchRef} className="hidden lg:flex flex-1 max-w-2xl mx-6 lg:mx-8 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="flex items-center w-full shadow-sm border border-purple-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-all duration-300">
                <select 
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="bg-gray-50 border-r border-purple-200 px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[180px] cursor-pointer font-medium"
                >
                  <option value="">All Categories</option>
                  {loadingSubcategories ? (
                    <option value="" disabled>Loading...</option>
                  ) : (
                    subcategories.map((subcategory) => (
                      <option key={subcategory._id || subcategory.slug} value={subcategory.slug}>
                        {subcategory.name}
                      </option>
                    ))
                  )}
                </select>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.trim()) {
                      setShowSearchResults(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchTerm.trim() && searchResults.length > 0) {
                      setShowSearchResults(true);
                    }
                  }}
                  placeholder="Search for products..." 
                  className="flex-1 px-4 py-3.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3.5 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Search Results Panel */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[600px] overflow-y-auto z-50">
                {searchLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-sm text-gray-600">Searching...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-gray-600">No products found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {searchResults.map((product) => {
                      const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                      const imageUrl = primaryImage?.url || '/slider/1.webp';
                      const displayPrice = getDisplayPrice(product);
                      const regularPrice = getRegularPrice(product);
                      const discount = calculateDiscount(product);
                      const isOutOfStock = product.status === 'out_of_stock' || product.stock === 0;

                      return (
                        <Link
                          key={product._id}
                          href={`/shop/${product._id}`}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchTerm('');
                          }}
                          className="flex items-center p-4 hover:bg-gray-50 transition-colors duration-200"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 relative bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={primaryImage?.alt || product.name}
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 ml-4 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1">
                              {typeof product.brand === 'object' ? product.brand?.name : product.brand || 'No Brand'}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                isOutOfStock 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-base sm:text-lg font-bold text-gray-900">
                                {formatPrice(displayPrice)}
                              </span>
                              {regularPrice && regularPrice > displayPrice && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through">
                                  {formatPrice(regularPrice)}
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    {/* View All Results Link */}
                    {searchResults.length > 0 && (
                      <div className="p-3 bg-gray-50 border-t border-gray-200">
                        <button
                          onClick={handleSearch}
                          className="w-full text-center text-sm font-semibold text-purple-600 hover:text-purple-700 py-2"
                        >
                          View All Results ({searchResults.length}+)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Section - Cart, Wishlist, Profile, Login/Signup - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-2 sm:space-x-3 lg:space-x-6 flex-shrink-0">
            {/* Wishlist Section */}
            {session && (
              <Link href="/wishlist" className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 group p-2 rounded-lg hover:bg-purple-50">
                <div className="relative">
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold text-[10px]">{getWishlistCount()}</span>
                  )}
                </div>
                <span className="hidden sm:block text-sm font-semibold">Wishlist</span>
              </Link>
            )}
            
            {/* Cart Section */}
            <Link href="/cart" className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-all duration-200 group p-2 rounded-lg hover:bg-purple-50">
              <div className="relative">
                {/* Professional shopping bag icon */}
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7V6a3 3 0 116 0v1m-9 0h12l-1.2 11.04A2 2 0 0114.81 21H9.19a2 2 0 01-1.99-1.96L7 7z" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold text-[10px]">{getCartCount()}</span>
              </div>
              <span className="hidden sm:block text-sm font-semibold">Cart</span>
            </Link>

            {/* Profile/Login Section */}
            <div className="flex items-center space-x-3">
              {session ? (
                // User is logged in - show profile
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-50"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold">
                      {session.user?.name || session.user?.email?.split('@')[0]}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                        {session.user?.role && (
                          <p className="text-xs text-purple-600 font-medium mt-1">
                            {session.user.role}
                          </p>
                        )}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/my-orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      
                      {/* Admin Links */}
                      {session.user?.role && ['Super Admin', 'Admin'].includes(session.user.role) && (
                        <>
                          <div className="border-t border-gray-100 my-1"></div>
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' });
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // User is not logged in - show login/signup buttons
                <div className="flex items-center space-x-3">
                  <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-purple-50">Log In</Link>
                  <Link href="/signup" className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar */}
      <nav className="hidden md:block bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 lg:space-x-2 py-1 lg:py-1.5">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-purple-100 font-medium transition-all duration-200 text-xs whitespace-nowrap px-2 py-1 rounded-md hover:bg-purple-500/30 hover:shadow-sm"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        {/* Bottom gradient line */}
        <div className="h-1 bg-gradient-to-r from-purple-400 to-pink-400"></div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-purple-100 shadow-xl max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="px-4 py-6 space-y-1">
            {/* Home Link */}
            <Link
              href="/"
              className="block px-4 py-3.5 text-gray-900 hover:text-purple-600 hover:bg-purple-50 rounded-lg font-bold transition-all duration-200 text-base"
              onClick={() => {
                setIsMenuOpen(false);
              }}
            >
              Home
            </Link>
            
            {/* Fixed Navigation Items - All items from navigationItems except Home */}
            {mobileNavigationItems.map((item) => {
              const isCategory = categories.some(cat => cat.name === item.name);
              const isExpanded = expandedCategories.has(item.name);
              const categorySubcategories = isCategory ? (subcategoriesByParent[item.name] || []) : [];
              
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      className="flex-1 px-4 py-3 text-gray-900 hover:text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-all duration-200 text-base"
                      onClick={() => {
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </Link>
                    {categorySubcategories.length > 0 && (
                      <button
                        onClick={() => toggleCategory(item.name)}
                        className="px-3 py-3 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                        aria-label="Toggle submenu"
                      >
                        <svg 
                          className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Subcategories - Show when expanded */}
                  {isExpanded && categorySubcategories.length > 0 && (
                    <div className="ml-4 space-y-1 border-l-2 border-purple-100 pl-4">
                      {categorySubcategories.map((subcategory) => (
                        <Link
                          key={subcategory._id || subcategory.slug}
                          href={`/shop/${subcategory.slug}`}
                          className="block px-4 py-2.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg font-medium transition-all duration-200 text-sm"
                          onClick={() => {
                            setIsMenuOpen(false);
                          }}
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* User Actions */}
            <div className="border-t border-purple-100 my-6 pt-6">
              {session ? (
                // Mobile logged-in user menu
                <div className="space-y-4">
                  <div className="px-4 py-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{session.user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="block w-full px-4 py-3.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 text-center rounded-xl font-semibold transition-all duration-200"
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/my-orders"
                    className="block w-full px-4 py-3.5 text-gray-700 hover:bg-purple-50 hover:text-purple-600 text-center rounded-xl font-semibold transition-all duration-200"
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: '/' });
                      setIsMenuOpen(false);
                    }}
                    className="block w-full px-4 py-3.5 border-2 border-red-600 text-red-600 text-center rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 hover:shadow-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                // Mobile login/signup buttons
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block w-full px-4 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full px-4 py-3.5 border-2 border-purple-600 text-purple-600 text-center rounded-xl font-semibold hover:bg-purple-50 transition-all duration-200 hover:shadow-sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}