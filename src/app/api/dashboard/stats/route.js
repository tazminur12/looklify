import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

// GET /api/dashboard/stats - Get dashboard statistics
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

    // Calculate total revenue and orders
    const [revenueStats, ordersStats, customersStats, productsStats, recentOrdersData, topProductsData] = await Promise.all([
      // Total Revenue
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
            }
          }
        }
      ]),

      // Total Orders
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
            }
          }
        }
      ]),

      // Total Customers
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

      // Products Stats
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            }
          }
        }
      ]),

      // Recent Orders (last 5)
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Top Products by sales
      Product.find({ soldCount: { $gt: 0 } })
        .select('name soldCount price images')
        .sort({ soldCount: -1 })
        .limit(5)
        .lean()
    ]);

    // Calculate revenue percentage change
    const revenue = revenueStats[0] || { totalRevenue: 0, last30DaysRevenue: 0, previous30DaysRevenue: 0 };
    const revenueChange = revenue.previous30DaysRevenue > 0
      ? ((revenue.last30DaysRevenue - revenue.previous30DaysRevenue) / revenue.previous30DaysRevenue) * 100
      : 0;

    // Calculate orders percentage change
    const orders = ordersStats[0] || { totalOrders: 0, last30DaysOrders: 0, previous30DaysOrders: 0 };
    const ordersChange = orders.previous30DaysOrders > 0
      ? ((orders.last30DaysOrders - orders.previous30DaysOrders) / orders.previous30DaysOrders) * 100
      : 0;

    const customers = customersStats[0] || { totalCustomers: 0 };
    const products = productsStats[0] || { totalProducts: 0, activeProducts: 0 };

    // Calculate average order value
    const avgOrderValue = revenue.totalRevenue > 0 && orders.totalOrders > 0
      ? revenue.totalRevenue / orders.totalOrders
      : 0;

    // Calculate conversion rate (simplified: orders/total customers)
    const conversionRate = customers.totalCustomers > 0
      ? (orders.totalOrders / customers.totalCustomers) * 100
      : 0;

    // Format recent orders
    const recentOrders = recentOrdersData.map(order => ({
      id: order.orderId,
      customer: order.user?.name || order.shipping.fullName,
      amount: `BDT ${order.pricing.total.toFixed(2)}`,
      status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      date: new Date(order.createdAt).toISOString().split('T')[0]
    }));

    // Format top products
    const topProducts = topProductsData.map(product => ({
      name: product.name,
      sales: product.soldCount || 0,
      revenue: `BDT ${((product.soldCount || 0) * (product.price || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      growth: '+0%' // Can be calculated if we track historical sales
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue: revenue.totalRevenue,
          revenueChange: revenueChange.toFixed(1),
          totalOrders: orders.totalOrders,
          ordersChange: ordersChange.toFixed(1),
          totalCustomers: customers.totalCustomers,
          totalProducts: products.totalProducts,
          activeProducts: products.activeProducts,
          avgOrderValue: avgOrderValue,
          conversionRate: conversionRate,
        },
        recentOrders,
        topProducts
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}

