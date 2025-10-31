import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

// GET /api/dashboard/analytics - Get comprehensive analytics data
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

    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last90Days = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Sales Trend Data (Last 30 days)
    const salesTrendData = await Order.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
          customers: { $addToSet: '$user' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          orders: 1,
          customers: { $size: '$customers' },
          _id: 0
        }
      }
    ]);

    // Revenue by Category
    const revenueByCategory = await Order.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$category.name',
          revenue: { $sum: '$items.price' },
          quantity: { $sum: '$items.quantity' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Top Products
    const topProducts = await Order.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.price' }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Hourly Sales Pattern
    const hourlyPattern = await Order.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          hour: '$_id',
          orders: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    // Customer Growth
    const customerGrowth = await User.aggregate([
      {
        $match: { 
          role: { $in: ['Customer', 'User'] },
          createdAt: { $gte: last90Days }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          customers: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          customers: 1,
          _id: 0
        }
      }
    ]);

    // Get comparison stats
    const [currentMonthStats, lastMonthStats] = await Promise.all([
      Order.aggregate([
        {
          $match: { createdAt: { $gte: thisMonth } }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$pricing.total' }
          }
        }
      ]),
      Order.aggregate([
        {
          $match: { 
            createdAt: { 
              $gte: lastMonth,
              $lt: thisMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: '$pricing.total' }
          }
        }
      ])
    ]);

    const current = currentMonthStats[0] || { revenue: 0, orders: 0, avgOrderValue: 0 };
    const last = lastMonthStats[0] || { revenue: 0, orders: 0, avgOrderValue: 0 };

    const revenueGrowth = last.revenue > 0 
      ? ((current.revenue - last.revenue) / last.revenue) * 100 
      : 0;
    const ordersGrowth = last.orders > 0 
      ? ((current.orders - last.orders) / last.orders) * 100 
      : 0;

    // Convert hourly pattern to 24-hour format
    const hourlySalesData = Array.from({ length: 24 }, (_, i) => {
      const hourData = hourlyPattern.find(h => h.hour === i);
      return {
        hour: `${i}:00`,
        orders: hourData?.orders || 0,
        revenue: hourData?.revenue || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        salesTrend: salesTrendData,
        revenueByCategory: revenueByCategory,
        topProducts: topProducts,
        hourlyPattern: hourlySalesData,
        customerGrowth: customerGrowth,
        comparison: {
          currentMonth: {
            revenue: current.revenue,
            orders: current.orders,
            avgOrderValue: current.avgOrderValue
          },
          lastMonth: {
            revenue: last.revenue,
            orders: last.orders,
            avgOrderValue: last.avgOrderValue
          },
          revenueGrowth: revenueGrowth,
          ordersGrowth: ordersGrowth
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}

