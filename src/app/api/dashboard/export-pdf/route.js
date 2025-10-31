import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

// GET /api/dashboard/export-pdf - Generate and download PDF report
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Check if user is admin/staff
    const isAdminOrStaff = ['Super Admin', 'Admin', 'Staff', 'Support'].includes(session.user.role);
    
    if (!isAdminOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get date range for comparison (last 30 days vs previous 30 days)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch comprehensive dashboard data
    const [revenueStats, ordersStats, customersStats, productsStats, recentOrdersData, topProductsData] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            last30DaysRevenue: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', last30Days] }, '$pricing.total', 0]
              }
            },
            previous30DaysRevenue: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$createdAt', previous30Days] }, { $lt: ['$createdAt', last30Days] }] },
                  '$pricing.total',
                  0
                ]
              }
            },
            avgOrderValue: { $avg: '$pricing.total' }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            last30DaysOrders: {
              $sum: { $cond: [{ $gte: ['$createdAt', last30Days] }, 1, 0] }
            },
            previous30DaysOrders: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$createdAt', previous30Days] }, { $lt: ['$createdAt', last30Days] }] },
                  1,
                  0
                ]
              }
            },
            pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
          }
        }
      ]),
      User.aggregate([
        {
          $match: { role: { $in: ['Customer', 'User'] } }
        },
        {
          $group: {
            _id: null,
            totalCustomers: { $sum: 1 }
          }
        }
      ]),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            outOfStock: {
              $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
            },
            lowStock: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Product.find({ soldCount: { $gt: 0 } })
        .select('name soldCount price images')
        .sort({ soldCount: -1 })
        .limit(10)
        .lean()
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, last30DaysRevenue: 0, previous30DaysRevenue: 0, avgOrderValue: 0 };
    const orders = ordersStats[0] || { totalOrders: 0, last30DaysOrders: 0, previous30DaysOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0 };
    const customers = customersStats[0] || { totalCustomers: 0 };
    const products = productsStats[0] || { totalProducts: 0, activeProducts: 0, outOfStock: 0, lowStock: 0 };

    const revenueChange = revenue.previous30DaysRevenue > 0
      ? ((revenue.last30DaysRevenue - revenue.previous30DaysRevenue) / revenue.previous30DaysRevenue) * 100
      : 0;

    const ordersChange = orders.previous30DaysOrders > 0
      ? ((orders.last30DaysOrders - orders.previous30DaysOrders) / orders.previous30DaysOrders) * 100
      : 0;

    const conversionRate = customers.totalCustomers > 0
      ? (orders.totalOrders / customers.totalCustomers) * 100
      : 0;

    // Return data for client-side PDF generation
    return NextResponse.json({
      success: true,
      data: {
        generatedDate: now.toISOString(),
        generatedBy: session.user.name || session.user.email,
        stats: {
          totalRevenue: revenue.totalRevenue,
          revenueChange: parseFloat(revenueChange.toFixed(1)),
          avgOrderValue: revenue.avgOrderValue,
          totalOrders: orders.totalOrders,
          ordersChange: parseFloat(ordersChange.toFixed(1)),
          pendingOrders: orders.pendingOrders,
          completedOrders: orders.completedOrders,
          cancelledOrders: orders.cancelledOrders,
          totalCustomers: customers.totalCustomers,
          totalProducts: products.totalProducts,
          activeProducts: products.activeProducts,
          outOfStock: products.outOfStock,
          lowStock: products.lowStock,
          conversionRate: parseFloat(conversionRate.toFixed(2))
        },
        recentOrders: recentOrdersData.map(order => ({
          id: order.orderId,
          customer: order.user?.name || order.shipping.fullName,
          amount: order.pricing.total,
          status: order.status,
          date: new Date(order.createdAt).toISOString().split('T')[0]
        })),
        topProducts: topProductsData.map(product => ({
          name: product.name,
          sales: product.soldCount || 0,
          revenue: (product.soldCount || 0) * (product.price || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data for PDF:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}

