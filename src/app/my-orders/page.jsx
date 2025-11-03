'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/my-orders');
      return;
    }

    if (status === 'authenticated' && session) {
      fetchOrders();
    }
  }, [status, session, router, filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/orders?${params}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '✅', label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '⚙️', label: 'Processing' },
      shipped: { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🚚', label: 'Shipped' },
      delivered: { color: 'bg-green-100 text-green-800 border-green-200', icon: '📦', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: '❌', label: 'Cancelled' },
      returned: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '↩️', label: 'Returned' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const paymentConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };

    const config = paymentConfig[status] || paymentConfig.pending;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-14 w-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link href="/profile" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">My Orders</h1>
          <p className="text-sm sm:text-lg text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Status:</span>
            {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => setFilter(statusOption)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === statusOption
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-sm text-gray-600 mb-6">
              {filter === 'all' ? 'You haven\'t placed any orders yet.' : `No orders with status "${filter}".`}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 font-mono truncate">{order.orderId}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">৳{order.pricing?.total?.toFixed(2)}</p>
                    {getPaymentStatusBadge(order.payment?.status)}
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-sm sm:text-base">৳{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-xs sm:text-sm text-gray-600 text-center pt-2">
                      +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-200">
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>
                      {order.items?.length} item{order.items?.length > 1 ? 's' : ''} •
                      {' '}Payment: {order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-2xl shadow-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (pagination.page > 1) {
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                  }
                }}
                disabled={pagination.page === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (pagination.page < pagination.totalPages) {
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                  }
                }}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 text-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
                    <p className="text-purple-100 mt-1 font-mono font-semibold text-xs sm:text-sm">{selectedOrder.orderId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                {/* Order Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order Status</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Placed on {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                          {item.sku && (
                            <p className="text-[11px] sm:text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-sm sm:text-base">৳{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-[11px] sm:text-xs text-gray-500">৳{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Shipping Information</h3>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
                    <p><span className="font-medium">Name:</span> {selectedOrder.shipping?.fullName}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.shipping?.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.shipping?.phone}</p>
                    <p><span className="font-medium">Address:</span> {selectedOrder.shipping?.address}</p>
                    <p><span className="font-medium">City:</span> {selectedOrder.shipping?.city}</p>
                    <p><span className="font-medium">Postal Code:</span> {selectedOrder.shipping?.postalCode}</p>
                    <p><span className="font-medium">Location:</span> {
                      selectedOrder.shipping?.location === 'insideDhaka' ? 'Inside Dhaka' : 'Outside Dhaka'
                    }</p>
                    {selectedOrder.shipping?.deliveryNotes && (
                      <p><span className="font-medium">Notes:</span> {selectedOrder.shipping.deliveryNotes}</p>
                    )}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment Information</h3>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="font-medium">Method:</span>
                      <span className="capitalize">{selectedOrder.payment?.method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="font-medium">Status:</span>
                      {getPaymentStatusBadge(selectedOrder.payment?.status)}
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Price Breakdown</h3>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Subtotal:</span>
                      <span>৳{selectedOrder.pricing?.subtotal?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.pricing?.tax > 0 && (
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Tax:</span>
                        <span>৳{selectedOrder.pricing.tax.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm sm:text-base">
                      <span>Shipping:</span>
                      <span>৳{selectedOrder.pricing?.shipping?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.pricing?.discount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm sm:text-base">
                        <span>Discount:</span>
                        <span>-৳{selectedOrder.pricing.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-base sm:text-lg">
                      <span>Total:</span>
                      <span className="text-purple-600">৳{selectedOrder.pricing?.total?.toFixed(2)}</span>
                    </div>
                    {selectedOrder.promoCodeString && (
                      <div className="mt-2 text-xs sm:text-sm text-gray-600">
                        Promo Code: <span className="font-semibold">{selectedOrder.promoCodeString}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

