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

    // Get time period from query params
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // daily, weekly, monthly, yearly

    // Get date range based on period
    const now = new Date();
    now.setHours(23, 59, 59, 999); // End of today
    
    let startDate, endDate, previousStartDate, previousEndDate;
    
    switch (period) {
      case 'daily':
        // Today
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        // Yesterday for comparison
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 1);
        previousEndDate = new Date(previousStartDate);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
        
      case 'weekly':
        // This week (Monday to Sunday)
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
        startDate = new Date(now);
        startDate.setDate(diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        // Last week for comparison
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate = new Date(previousStartDate);
        previousEndDate.setDate(previousEndDate.getDate() + 6);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
        
      case 'monthly':
        // This month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        // Last month for comparison
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
        
      case 'yearly':
        // This year
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        // Last year for comparison
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getFullYear() - 1, 11, 31);
        previousEndDate.setHours(23, 59, 59, 999);
        break;
        
      default:
        // Default to monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousStartDate.setHours(0, 0, 0, 0);
        previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        previousEndDate.setHours(23, 59, 59, 999);
    }

    // Calculate total revenue and orders
    const [revenueStats, ordersStats, customersStats, productsStats, recentOrdersData, topProductsData, allOrdersForCost] = await Promise.all([
      // Total Revenue
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

      // Recent Orders (last 5) - filtered by period
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
      })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Top Products by sales
      Product.find({ soldCount: { $gt: 0 } })
        .select('name soldCount price images costPrice')
        .sort({ soldCount: -1 })
        .limit(5)
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

    // Calculate revenue percentage change
    const revenue = revenueStats[0] || { totalRevenue: 0, periodRevenue: 0, previousPeriodRevenue: 0 };
    const revenueChange = revenue.previousPeriodRevenue > 0
      ? ((revenue.periodRevenue - revenue.previousPeriodRevenue) / revenue.previousPeriodRevenue) * 100
      : (revenue.periodRevenue > 0 ? 100 : 0);

    // Calculate orders percentage change
    const orders = ordersStats[0] || { totalOrders: 0, periodOrders: 0, previousPeriodOrders: 0 };
    const ordersChange = orders.previousPeriodOrders > 0
      ? ((orders.periodOrders - orders.previousPeriodOrders) / orders.previousPeriodOrders) * 100
      : (orders.periodOrders > 0 ? 100 : 0);

    const customers = customersStats[0] || { totalCustomers: 0 };
    const products = productsStats[0] || { totalProducts: 0, activeProducts: 0 };

    // Calculate average order value for the period
    const avgOrderValue = revenue.periodRevenue > 0 && orders.periodOrders > 0
      ? revenue.periodRevenue / orders.periodOrders
      : 0;

    // Calculate conversion rate (simplified: orders/total customers)
    const conversionRate = customers.totalCustomers > 0
      ? (orders.periodOrders / customers.totalCustomers) * 100
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

    // Get additional order stats for the period
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'processing'] },
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const completedOrders = await Order.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const cancelledOrders = await Order.countDocuments({
      status: 'cancelled',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate Total Cost and Profit
    let totalCost = 0;
    let totalShippingCost = 0;
    let totalTaxCost = 0;
    let totalDiscountGiven = 0;

    allOrdersForCost.forEach(order => {
      // Calculate product cost
      order.items?.forEach(item => {
        const product = item.productId;
        const costPrice = product?.costPrice || 0;
        totalCost += costPrice * (item.quantity || 0);
      });
      
      // Add shipping, tax, and discount from pricing
      if (order.pricing) {
        totalShippingCost += order.pricing.shipping || 0;
        totalTaxCost += order.pricing.tax || 0;
        totalDiscountGiven += order.pricing.discount || 0;
      }
    });

    // Calculate previous period costs for comparison
    const previousPeriodOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      status: { $ne: 'cancelled' }
    })
      .select('items pricing')
      .populate('items.productId', 'costPrice')
      .lean();

    let previousPeriodCost = 0;
    let previousPeriodShippingCost = 0;
    previousPeriodOrders.forEach(order => {
      order.items?.forEach(item => {
        const product = item.productId;
        const costPrice = product?.costPrice || 0;
        previousPeriodCost += costPrice * (item.quantity || 0);
      });
      if (order.pricing) {
        previousPeriodShippingCost += order.pricing.shipping || 0;
      }
    });

    // Calculate total operating cost (product cost + shipping)
    const totalOperatingCost = totalCost + totalShippingCost;
    const previousPeriodOperatingCost = previousPeriodCost + previousPeriodShippingCost;

    // Calculate Profit (Revenue - Total Cost - Shipping)
    const totalProfit = revenue.periodRevenue - totalOperatingCost;
    const previousPeriodProfit = revenue.previousPeriodRevenue - previousPeriodOperatingCost;

    // Calculate Profit Margin (%)
    const profitMargin = revenue.periodRevenue > 0 
      ? (totalProfit / revenue.periodRevenue) * 100 
      : 0;

    // Calculate Profit Change
    const profitChange = previousPeriodProfit !== 0
      ? ((totalProfit - previousPeriodProfit) / Math.abs(previousPeriodProfit)) * 100
      : (totalProfit > 0 ? 100 : 0);

    // Calculate Operating Expense Ratio
    const operatingExpenseRatio = revenue.periodRevenue > 0
      ? (totalOperatingCost / revenue.periodRevenue) * 100
      : 0;

    // Calculate Gross Profit (Revenue - Product Cost only, before shipping)
    const grossProfit = revenue.periodRevenue - totalCost;
    const grossProfitMargin = revenue.periodRevenue > 0
      ? (grossProfit / revenue.periodRevenue) * 100
      : 0;

    // Calculate Net Revenue (After discounts)
    const netRevenue = revenue.periodRevenue; // Already after discounts in order total

    // Calculate ROI (Return on Investment) - Profit / Cost
    const roi = totalOperatingCost > 0
      ? (totalProfit / totalOperatingCost) * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          // Revenue Metrics
          totalRevenue: revenue.periodRevenue,
          revenueChange: revenueChange.toFixed(1),
          netRevenue: netRevenue,
          
          // Cost Metrics
          totalCost: totalCost,
          totalOperatingCost: totalOperatingCost,
          totalShippingCost: totalShippingCost,
          totalTaxCost: totalTaxCost,
          totalDiscountGiven: totalDiscountGiven,
          
          // Profit Metrics
          totalProfit: totalProfit,
          profitChange: profitChange.toFixed(1),
          profitMargin: profitMargin.toFixed(2),
          grossProfit: grossProfit,
          grossProfitMargin: grossProfitMargin.toFixed(2),
          
          // Financial Ratios
          operatingExpenseRatio: operatingExpenseRatio.toFixed(2),
          roi: roi.toFixed(2), // Return on Investment
          
          // Order Metrics
          totalOrders: orders.periodOrders,
          ordersChange: ordersChange.toFixed(1),
          pendingOrders: pendingOrders,
          completedOrders: completedOrders,
          cancelledOrders: cancelledOrders,
          avgOrderValue: avgOrderValue,
          
          // Customer & Product Metrics
          totalCustomers: customers.totalCustomers,
          totalProducts: products.totalProducts,
          activeProducts: products.activeProducts,
          conversionRate: conversionRate,
          
          // Period
          period: period
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

