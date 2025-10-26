'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function PromoCodesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState([]);
  const [filteredPromoCodes, setFilteredPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [stats, setStats] = useState({
    totalPromoCodes: 0,
    activePromoCodes: 0,
    expiredPromoCodes: 0,
    exhaustedPromoCodes: 0,
    totalUsage: 0,
    totalDiscountGiven: 0
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

  const statusOptions = [
    'all', 'active', 'inactive', 'expired', 'exhausted'
  ];

  const typeOptions = [
    'all', 'percentage', 'fixed_amount', 'free_shipping'
  ];

  // Fetch promo codes from API
  const fetchPromoCodes = async (page = 1, search = '', status = '', type = '', sort = 'createdAt', order = 'desc') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: sort,
        sortOrder: order
      });
      
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      if (type && type !== 'all') params.append('type', type);

      const response = await fetch(`/api/promo-codes?${params}`);
      const result = await response.json();

      if (result.success) {
        setPromoCodes(result.data.promoCodes);
        setFilteredPromoCodes(result.data.promoCodes);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to fetch promo codes');
      }
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPromoCodes();
    }
  }, [status]);

  useEffect(() => {
    // Debounce search and filtering
    const timeoutId = setTimeout(() => {
      fetchPromoCodes(1, searchTerm, selectedStatus, selectedType, sortBy, sortOrder);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, selectedType, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'expired':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'exhausted':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'percentage':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'fixed_amount':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'free_shipping':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleEditPromoCode = (promoCode) => {
    router.push(`/dashboard/promo-codes/edit/${promoCode._id}`);
  };

  const handleDeletePromoCode = async (promoCodeId) => {
    const promoCode = promoCodes.find(p => p._id === promoCodeId);
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: promoCode ? `Do you want to delete "${promoCode.name}"?` : 'Do you want to delete this promo code?',
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
        const response = await fetch(`/api/promo-codes/${promoCodeId}`, {
          method: 'DELETE'
        });
        
        const deleteResult = await response.json();
        
        if (deleteResult.success) {
          await Swal.fire({
            title: 'Deleted!',
            text: 'Promo code has been deleted successfully.',
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
          // Refresh the promo codes list
          fetchPromoCodes(pagination.currentPage, searchTerm, selectedStatus, selectedType, sortBy, sortOrder);
        } else {
          Swal.fire({
            title: 'Error!',
            text: deleteResult.error || 'Failed to delete promo code',
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
        console.error('Error deleting promo code:', error);
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

  const handleToggleStatus = async (promoCodeId) => {
    try {
      const promoCode = promoCodes.find(p => p._id === promoCodeId);
      if (!promoCode) return;

      const newStatus = promoCode.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`/api/promo-codes/${promoCodeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the promo codes list
        fetchPromoCodes(pagination.currentPage, searchTerm, selectedStatus, selectedType, sortBy, sortOrder);
      } else {
        alert(result.error || 'Failed to update promo code status');
      }
    } catch (error) {
      console.error('Error updating promo code status:', error);
      alert('Network error. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading promo codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Promo Codes</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage discount codes and promotional offers
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-2"
          >
            {viewMode === 'grid' ? '📋' : '⊞'} {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </button>
          <button
            onClick={() => router.push('/dashboard/promo-codes/new')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 text-sm flex items-center gap-2"
          >
            ➕ Create Promo Code
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Promo Codes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalPromoCodes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              🎫
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Codes</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.activePromoCodes}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Usage</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalUsage}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              📊
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Discount Given</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(stats.totalDiscountGiven)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              💰
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
                placeholder="Search promo codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
          >
            {typeOptions.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
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
              <option value="code">Sort by Code</option>
              <option value="name">Sort by Name</option>
              <option value="value">Sort by Value</option>
              <option value="usedCount">Sort by Usage</option>
              <option value="validFrom">Sort by Start Date</option>
              <option value="validUntil">Sort by End Date</option>
              <option value="createdAt">Sort by Created Date</option>
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

      {/* Promo Codes Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPromoCodes.map((promoCode) => (
            <PromoCodeCard
              key={promoCode._id}
              promoCode={promoCode}
              onEdit={handleEditPromoCode}
              onDelete={handleDeletePromoCode}
              onToggleStatus={handleToggleStatus}
              getStatusColor={getStatusColor}
              getTypeColor={getTypeColor}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
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
                    Promo Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPromoCodes.map((promoCode) => (
                  <PromoCodeRow
                    key={promoCode._id}
                    promoCode={promoCode}
                    onEdit={handleEditPromoCode}
                    onDelete={handleDeletePromoCode}
                    onToggleStatus={handleToggleStatus}
                    getStatusColor={getStatusColor}
                    getTypeColor={getTypeColor}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredPromoCodes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            🎫
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No promo codes found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => router.push('/dashboard/promo-codes/new')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
          >
            Create Your First Promo Code
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchPromoCodes(pagination.currentPage - 1, searchTerm, selectedStatus, selectedType, sortBy, sortOrder)}
              disabled={!pagination.hasPrevPage}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => fetchPromoCodes(pagination.currentPage + 1, searchTerm, selectedStatus, selectedType, sortBy, sortOrder)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Promo Code Card Component
function PromoCodeCard({ promoCode, onEdit, onDelete, onToggleStatus, getStatusColor, getTypeColor, formatDate, formatCurrency }) {
  const getDiscountDisplay = (promoCode) => {
    switch (promoCode.type) {
      case 'percentage':
        return `${promoCode.value}% OFF`;
      case 'fixed_amount':
        return `${formatCurrency(promoCode.value)} OFF`;
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return 'DISCOUNT';
    }
  };

  const getRemainingUsage = (promoCode) => {
    if (promoCode.usageLimit === null) return 'Unlimited';
    return Math.max(0, promoCode.usageLimit - promoCode.usedCount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
              {promoCode.code}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promoCode.status)}`}>
              {promoCode.status}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(promoCode.type)}`}>
            {promoCode.type.replace('_', ' ')}
          </span>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {promoCode.name}
        </h3>
        
        {promoCode.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {promoCode.description}
          </p>
        )}
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Discount:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {getDiscountDisplay(promoCode)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Usage:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {promoCode.usedCount} / {getRemainingUsage(promoCode)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">Valid Until:</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {formatDate(promoCode.validUntil)}
            </span>
          </div>
          
          {promoCode.minimumOrderAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Min Order:</span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {formatCurrency(promoCode.minimumOrderAmount)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(promoCode)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(promoCode._id)}
            className={`flex-1 px-3 py-2 text-sm rounded-lg ${
              promoCode.status === 'active'
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
            }`}
          >
            {promoCode.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(promoCode._id)}
            className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

// Promo Code Row Component for Table View
function PromoCodeRow({ promoCode, onEdit, onDelete, onToggleStatus, getStatusColor, getTypeColor, formatDate, formatCurrency }) {
  const getDiscountDisplay = (promoCode) => {
    switch (promoCode.type) {
      case 'percentage':
        return `${promoCode.value}%`;
      case 'fixed_amount':
        return formatCurrency(promoCode.value);
      case 'free_shipping':
        return 'Free Shipping';
      default:
        return 'Discount';
    }
  };

  const getRemainingUsage = (promoCode) => {
    if (promoCode.usageLimit === null) return '∞';
    return Math.max(0, promoCode.usageLimit - promoCode.usedCount);
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
            {promoCode.code}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {promoCode.name}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(promoCode.type)}`}>
          {promoCode.type.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {getDiscountDisplay(promoCode)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {promoCode.usedCount} / {getRemainingUsage(promoCode)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100">
          {formatDate(promoCode.validUntil)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promoCode.status)}`}>
          {promoCode.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(promoCode)}
            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleStatus(promoCode._id)}
            className={`${
              promoCode.status === 'active'
                ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
            }`}
          >
            {promoCode.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => onDelete(promoCode._id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
