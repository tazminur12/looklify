'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    averagePrice: 0,
    totalValue: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [error, setError] = useState(null);

  const categories = [
    'all', 'Skin Care', 'Hair Care', 'Lip Care', 'Eye Care', 'Body Care', 'Facial Care', 'Teeth Care', 'Health & Beauty'
  ];

  // Fetch products from API
  const fetchProducts = async (page = 1, search = '', category = '', sort = 'createdAt', order = 'desc') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50', // Increased limit for better UX
        sortBy: sort,
        sortOrder: order
      });
      
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);

      const response = await fetch(`/api/products?${params}`);
      const result = await response.json();

      if (result.success) {
        setProducts(result.data.products);
        setFilteredProducts(result.data.products);
        setStats(result.data.stats);
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

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProducts();
    }
  }, [status]);

  useEffect(() => {
    // Debounce search and filtering
    const timeoutId = setTimeout(() => {
      fetchProducts(1, searchTerm, selectedCategory, sortBy, sortOrder);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-600';
    if (stock < 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Calculate discount percentage for display
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

  // Get display price
  const getDisplayPrice = (product) => {
    return product.salePrice || product.price;
  };

  // Get regular price
  const getRegularPrice = (product) => {
    return product.regularPrice || product.originalPrice;
  };

  const handleEditProduct = (product) => {
    router.push(`/dashboard/products/edit/${product._id}`);
  };

  const handleDeleteProduct = async (productId) => {
    const product = products.find(p => p._id === productId);
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: product ? `Do you want to delete "${product.name}"?` : 'Do you want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'rounded-lg shadow-xl',
        confirmButton: 'px-4 py-2 rounded-lg font-medium transition-colors',
        cancelButton: 'px-4 py-2 rounded-lg font-medium transition-colors'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        });
        
        const deleteResult = await response.json();
        
        if (deleteResult.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: 'Product has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#ffffff',
            color: '#1f2937',
            customClass: {
              popup: 'rounded-lg shadow-xl'
            }
          });
          // Refresh the products list
          fetchProducts(pagination.currentPage, searchTerm, selectedCategory, sortBy, sortOrder);
        } else {
          Swal.fire({
            title: 'Error!',
            text: deleteResult.error || 'Failed to delete product',
            icon: 'error',
            confirmButtonColor: '#dc2626',
            background: '#ffffff',
            color: '#1f2937',
            customClass: {
              popup: 'rounded-lg shadow-xl',
              confirmButton: 'px-4 py-2 rounded-lg font-medium'
            }
          });
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Network error. Please try again.',
          icon: 'error',
          confirmButtonColor: '#dc2626',
          background: '#ffffff',
          color: '#1f2937',
          customClass: {
            popup: 'rounded-lg shadow-xl',
            confirmButton: 'px-4 py-2 rounded-lg font-medium'
          }
        });
      }
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;

      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the products list
        fetchProducts(pagination.currentPage, searchTerm, selectedCategory, sortBy, sortOrder);
      } else {
        alert(result.error || 'Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your product inventory and listings
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
          >
            {viewMode === 'grid' ? '📋' : '⊞'} {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <button
            onClick={() => router.push('/dashboard/products/add')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm flex items-center gap-2"
          >
            ➕ Add Product
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📦
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Products</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.activeProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.outOfStock}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              ⚠️
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.lowStock}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              📉
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="rating.average">Sort by Rating</option>
              <option value="createdAt">Sort by Date</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
                              <ProductCard
                    key={product._id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onToggleStatus={handleToggleStatus}
                    getStatusColor={getStatusColor}
                    getStockColor={getStockColor}
                    calculateDiscount={calculateDiscount}
                    getDisplayPrice={getDisplayPrice}
                    getRegularPrice={getRegularPrice}
                  />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onToggleStatus={handleToggleStatus}
                    getStatusColor={getStatusColor}
                    getStockColor={getStockColor}
                    calculateDiscount={calculateDiscount}
                    getDisplayPrice={getDisplayPrice}
                    getRegularPrice={getRegularPrice}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            📦
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No products found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => router.push('/dashboard/products/add')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            Add Your First Product
          </button>
        </div>
      )}

    </div>
  );
}

// Product Card Component
function ProductCard({ product, onEdit, onDelete, onToggleStatus, getStatusColor, getStockColor, calculateDiscount, getDisplayPrice, getRegularPrice }) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || '/slider/1.webp';
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={imageUrl}
          alt={primaryImage?.alt || product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
            {product.status.replace('_', ' ')}
          </span>
        </div>
        <div className="absolute top-2 left-2">
          {calculateDiscount && calculateDiscount(product) > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
              -{calculateDiscount(product)}%
            </span>
          )}
          {!calculateDiscount && ((product.regularPrice && product.salePrice) || (product.originalPrice && product.price)) && (
            <span className="bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
              -{(() => {
                if (product.regularPrice && product.salePrice) {
                  return Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100);
                }
                if (product.originalPrice && product.price) {
                  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                }
                return 0;
              })()}%
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {typeof product.category === 'string' ? product.category : product.category?.name || 'Unknown Category'} • SKU: {product.sku}
        </p>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              BDT {getDisplayPrice && getDisplayPrice(product) || (product.salePrice || product.price)}
            </span>
            {(getRegularPrice && getRegularPrice(product) || (product.regularPrice || product.originalPrice)) && 
             (getRegularPrice && getRegularPrice(product) || (product.regularPrice || product.originalPrice)) > 
             (getDisplayPrice && getDisplayPrice(product) || (product.salePrice || product.price)) && (
              <span className="text-sm text-gray-500 line-through">
                BDT {getRegularPrice && getRegularPrice(product) || (product.regularPrice || product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">⭐</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {product.rating?.average || 0} ({product.rating?.count || 0})
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className={`text-sm font-medium ${getStockColor(product.stock)}`}>
            Stock: {product.stock}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(product._id)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg ${
              product.status === 'active'
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {product.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Row Component for Table View
function ProductRow({ product, onEdit, onDelete, onToggleStatus, getStatusColor, getStockColor, calculateDiscount, getDisplayPrice, getRegularPrice }) {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage?.url || '/slider/1.webp';
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={imageUrl}
            alt={primaryImage?.alt || product.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {product.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              SKU: {product.sku}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {typeof product.category === 'string' ? product.category : product.category?.name || 'Unknown Category'}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100">
          BDT {getDisplayPrice(product)}
          {getRegularPrice(product) && getRegularPrice(product) > getDisplayPrice(product) && (
            <span className="ml-1 text-xs text-gray-500 line-through">
              BDT {getRegularPrice(product)}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`text-sm font-medium ${getStockColor(product.stock)}`}>
          {product.stock}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
          {product.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-yellow-400">⭐</span>
          <span className="ml-1 text-sm text-gray-900 dark:text-gray-100">
            {product.rating?.average || 0} ({product.rating?.count || 0})
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product)}
            className="text-purple-600 hover:text-purple-900"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(product._id)}
            className={`${
              product.status === 'active'
                ? 'text-yellow-600 hover:text-yellow-900'
                : 'text-green-600 hover:text-green-900'
            }`}
          >
            {product.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="text-red-600 hover:text-red-900"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

