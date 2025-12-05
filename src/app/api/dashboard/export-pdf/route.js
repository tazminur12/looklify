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

    // Get time period from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly, yearly
    const customStartDate = searchParams.get('startDate');
    const customEndDate = searchParams.get('endDate');

    // Get date range based on period or custom date range
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    let startDate, endDate, previousStartDate, previousEndDate;
    
    // If custom date range is provided, use it
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);
      
      // For comparison, use the same duration before the start date
      const duration = endDate.getTime() - startDate.getTime();
      previousEndDate = new Date(startDate);
      previousEndDate.setTime(previousEndDate.getTime() - 1);
      previousEndDate.setHours(23, 59, 59, 999);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setTime(previousStartDate.getTime() - duration);
      previousStartDate.setHours(0, 0, 0, 0);
    } else {
      // Use period-based date range
      switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 1);
        previousEndDate = new Date(previousStartDate);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate = new Date(previousStartDate);
        previousEndDate.setDate(previousEndDate.getDate() + 6);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        previousEndDate.setHours(23, 59, 59, 999);
      }
    }

    // Fetch comprehensive dashboard data
    const [revenueStats, ordersStats, customersStats, productsStats, recentOrdersData, topProductsData, allOrdersForCost] = await Promise.all([
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            periodRevenue: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$createdAt', startDate] }, { $lte: ['$createdAt', endDate] }] },
                  '$pricing.total',
                  0
                ]
              }
            },
            previousPeriodRevenue: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$createdAt', previousStartDate] }, { $lte: ['$createdAt', previousEndDate] }] },
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
            periodOrders: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$createdAt', startDate] }, { $lte: ['$createdAt', endDate] }] },
                  1,
                  0
                ]
              }
            },
            previousPeriodOrders: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ['$createdAt', previousStartDate] }, { $lte: ['$createdAt', previousEndDate] }] },
                  1,
                  0
                ]
              }
            },
            pendingOrders: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'pending'] }, { $gte: ['$createdAt', startDate] }, { $lte: ['$createdAt', endDate] }] },
                  1,
                  0
                ]
              }
            },
            completedOrders: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'completed'] }, { $gte: ['$createdAt', startDate] }, { $lte: ['$createdAt', endDate] }] },
                  1,
                  0
                ]
              }
            },
            cancelledOrders: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$status', 'cancelled'] }, { $gte: ['$createdAt', startDate] }, { $lte: ['$createdAt', endDate] }] },
                  1,
                  0
                ]
              }
            }
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
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Product.find({ soldCount: { $gt: 0 } })
        .select('name soldCount price images costPrice')
        .sort({ soldCount: -1 })
        .limit(10)
        .lean(),
      // Get all orders for cost calculation
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      })
        .select('items pricing')
        .populate('items.productId', 'costPrice')
        .lean()
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, periodRevenue: 0, previousPeriodRevenue: 0, avgOrderValue: 0 };
    const orders = ordersStats[0] || { totalOrders: 0, periodOrders: 0, previousPeriodOrders: 0, pendingOrders: 0, completedOrders: 0, cancelledOrders: 0 };
    const customers = customersStats[0] || { totalCustomers: 0 };
    const products = productsStats[0] || { totalProducts: 0, activeProducts: 0, outOfStock: 0, lowStock: 0 };

    const revenueChange = revenue.previousPeriodRevenue > 0
      ? ((revenue.periodRevenue - revenue.previousPeriodRevenue) / revenue.previousPeriodRevenue) * 100
      : (revenue.periodRevenue > 0 ? 100 : 0);

    const ordersChange = orders.previousPeriodOrders > 0
      ? ((orders.periodOrders - orders.previousPeriodOrders) / orders.previousPeriodOrders) * 100
      : (orders.periodOrders > 0 ? 100 : 0);

    const avgOrderValue = revenue.periodRevenue > 0 && orders.periodOrders > 0
      ? revenue.periodRevenue / orders.periodOrders
      : 0;

    const conversionRate = customers.totalCustomers > 0
      ? (orders.periodOrders / customers.totalCustomers) * 100
      : 0;

    // Calculate Total Cost and Profit
    let totalCost = 0;
    let totalShippingCost = 0;
    let totalTaxCost = 0;
    let totalDiscountGiven = 0;

    allOrdersForCost.forEach(order => {
      order.items?.forEach(item => {
        const product = item.productId;
        const costPrice = product?.costPrice || 0;
        totalCost += costPrice * (item.quantity || 0);
      });
      
      if (order.pricing) {
        totalShippingCost += order.pricing.shipping || 0;
        totalTaxCost += order.pricing.tax || 0;
        totalDiscountGiven += order.pricing.discount || 0;
      }
    });

    const totalOperatingCost = totalCost + totalShippingCost;
    const totalProfit = revenue.periodRevenue - totalOperatingCost;
    const profitMargin = revenue.periodRevenue > 0 
      ? (totalProfit / revenue.periodRevenue) * 100 
      : 0;
    const grossProfit = revenue.periodRevenue - totalCost;
    const grossProfitMargin = revenue.periodRevenue > 0
      ? (grossProfit / revenue.periodRevenue) * 100
      : 0;
    const operatingExpenseRatio = revenue.periodRevenue > 0
      ? (totalOperatingCost / revenue.periodRevenue) * 100
      : 0;
    const roi = totalOperatingCost > 0
      ? (totalProfit / totalOperatingCost) * 100
      : 0;

    // Return data for client-side PDF generation
    return NextResponse.json({
      success: true,
      data: {
        generatedDate: now.toISOString(),
        generatedBy: session.user.name || session.user.email,
        period: period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        stats: {
          totalRevenue: revenue.periodRevenue,
          revenueChange: parseFloat(revenueChange.toFixed(1)),
          avgOrderValue: avgOrderValue,
          totalOrders: orders.periodOrders,
          ordersChange: parseFloat(ordersChange.toFixed(1)),
          pendingOrders: orders.pendingOrders,
          completedOrders: orders.completedOrders,
          cancelledOrders: orders.cancelledOrders,
          totalCustomers: customers.totalCustomers,
          totalProducts: products.totalProducts,
          activeProducts: products.activeProducts,
          outOfStock: products.outOfStock,
          lowStock: products.lowStock,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          // Financial metrics
          totalCost: totalCost,
          totalOperatingCost: totalOperatingCost,
          totalShippingCost: totalShippingCost,
          totalTaxCost: totalTaxCost,
          totalDiscountGiven: totalDiscountGiven,
          totalProfit: totalProfit,
          profitMargin: parseFloat(profitMargin.toFixed(2)),
          grossProfit: grossProfit,
          grossProfitMargin: parseFloat(grossProfitMargin.toFixed(2)),
          operatingExpenseRatio: parseFloat(operatingExpenseRatio.toFixed(2)),
          roi: parseFloat(roi.toFixed(2))
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

