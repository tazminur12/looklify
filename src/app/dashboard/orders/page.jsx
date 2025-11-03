'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchOrders();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, filter]);

  useEffect(() => {
    if (selectedOrder) {
      setEditStatus(selectedOrder.status || 'pending');
      setEditPaymentStatus(selectedOrder.payment?.status || 'pending');
      setEditTracking(selectedOrder.trackingNumber || '');
      setEditNotes(selectedOrder.notes || '');
    } else {
      setEditStatus('');
      setEditPaymentStatus('');
      setEditTracking('');
      setEditNotes('');
    }
  }, [selectedOrder]);

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-purple-200 dark:border-gray-600">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage and track all orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Status:</span>
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setFilter(statusOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === statusOption
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No orders found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filter === 'all' ? 'No orders have been placed yet.' : `No orders with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-purple-600 dark:text-purple-400">
                        {order.orderId}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {order.shipping?.fullName || order.user?.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.shipping?.email || order.user?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {order.items?.length || 0} items
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        ৳{order.pricing?.total?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getPaymentStatusBadge(order.payment?.status)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (pagination.page > 1) {
                    setPagination(prev => ({ ...prev, page: prev.page - 1 }));
                    fetchOrders();
                  }
                }}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (pagination.page < pagination.totalPages) {
                    setPagination(prev => ({ ...prev, page: prev.page + 1 }));
                    fetchOrders();
                  }
                }}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-purple-100 mt-1 font-mono font-semibold">{selectedOrder.orderId}</p>
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

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order Status</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>

              {/* Update Controls */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Order Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    >
                      {['pending','confirmed','processing','shipped','delivered','cancelled','returned'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Status</label>
                    <select
                      value={editPaymentStatus}
                      onChange={(e) => setEditPaymentStatus(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                    >
                      {['pending','processing','completed','failed','refunded'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tracking Number</label>
                    <input
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                      placeholder="e.g., SUNDAR-12345"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
                      placeholder="Internal notes"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-lg border"
                    disabled={saving}
                  >
                    Close
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setSaving(true);
                        const res = await fetch(`/api/orders/${selectedOrder._id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            status: editStatus,
                            paymentStatus: editPaymentStatus,
                            trackingNumber: editTracking,
                            notes: editNotes
                          })
                        });
                        const result = await res.json();
                        if (!res.ok || !result.success) {
                          throw new Error(result.error || 'Failed to update order');
                        }
                        toast.success('Order updated');
                        // Update selected order and list
                        setSelectedOrder(result.data);
                        // Optimistically update in-place list item
                        setOrders(prev => prev.map(o => o._id === result.data._id ? result.data : o));
                      } catch (err) {
                        console.error(err);
                        toast.error(err.message || 'Update failed');
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-white ${saving ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-lg object-cover" />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                          ৳{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">৳{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Shipping Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Payment Information</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Method:</span>
                    <span className="capitalize">{selectedOrder.payment?.method || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    {getPaymentStatusBadge(selectedOrder.payment?.status)}
                  </div>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Price Breakdown</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{selectedOrder.pricing?.subtotal?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.pricing?.tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>৳{selectedOrder.pricing.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>৳{selectedOrder.pricing?.shipping?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.pricing?.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-৳{selectedOrder.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-purple-600">৳{selectedOrder.pricing?.total?.toFixed(2)}</span>
                  </div>
                  {selectedOrder.promoCodeString && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
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
  );
}

