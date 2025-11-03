'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [method, setMethod] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      fetchPayments();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, paymentStatus, method, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });
      if (paymentStatus !== 'all') params.append('paymentStatus', paymentStatus);
      if (method !== 'all') params.append('method', method);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to load payments');

      setPayments(result.data.orders || []);
      setPagination(result.data.pagination);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      setSavingId(orderId);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: newStatus })
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to update payment');
      toast.success('Payment status updated');
      setPayments(prev => prev.map(o => o._id === result.data._id ? result.data : o));
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-purple-200 dark:border-gray-600">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Payments</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track and manage all payments</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-3">
          <div>
            <span className="text-sm font-medium mr-2">Payment Status:</span>
            {['all','pending','processing','completed','failed','refunded'].map(s => (
              <button
                key={s}
                onClick={() => { setPaymentStatus(s); setPagination(p => ({ ...p, page: 1 })); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${paymentStatus === s ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {s.charAt(0).toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
          <div>
            <span className="text-sm font-medium mr-2">Method:</span>
            {['all','cod','online','bank_transfer'].map(m => (
              <button
                key={m}
                onClick={() => { setMethod(m); setPagination(p => ({ ...p, page: 1 })); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${method === m ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {m === 'all' ? 'All' : m.charAt(0).toUpperCase()+m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPagination(p => ({ ...p, page: 1 })); fetchPayments(); }}}
            placeholder="Search by Order ID, Phone or Transaction ID"
            className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-gray-900"
          />
          <button
            onClick={() => { setPagination(p => ({ ...p, page: 1 })); fetchPayments(); }}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Search
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No payments found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Txn ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Paid At</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-purple-600">{order.orderId}</td>
                    <td className="px-4 py-3 capitalize">{order.payment?.method || 'N/A'}</td>
                    <td className="px-4 py-3 uppercase">{order.payment?.provider || '-'}</td>
                    <td className="px-4 py-3">{order.payment?.phoneNumber || '-'}</td>
                    <td className="px-4 py-3">{order.payment?.transactionId || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.payment?.status || 'pending'}
                        onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                        className="border rounded-lg px-2 py-1 bg-white dark:bg-gray-900"
                        disabled={savingId === order._id}
                      >
                        {['pending','processing','completed','failed','refunded'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">{formatDateTime(order.payment?.paidAt)}</td>
                    <td className="px-4 py-3 font-semibold">৳{order.pricing?.total?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/dashboard/orders`)}
                        className="px-3 py-1 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
                      >
                        View Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (pagination.page > 1) setPagination(p => ({ ...p, page: p.page - 1 })); }}
                className="px-4 py-2 border rounded-lg"
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <button
                onClick={() => { if (pagination.page < pagination.totalPages) setPagination(p => ({ ...p, page: p.page + 1 })); }}
                className="px-4 py-2 border rounded-lg"
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


