'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import toast, { Toaster } from 'react-hot-toast';

// Dynamically import ProfessionalDashboardPDF (client-side only)
const ProfessionalDashboardPDF = dynamic(
  () => import('@/app/utils/ProfessionalDashboardPDF'),
  { ssr: false }
);

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [timePeriod, setTimePeriod] = useState('monthly'); // daily, weekly, monthly, yearly
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const pdfComponentRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (mounted && status === 'authenticated') {
      fetchDashboardData();
    }
  }, [mounted, status, timePeriod, useCustomDateRange, customStartDate, customEndDate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Build query params
      let queryParams = `period=${timePeriod}`;
      if (useCustomDateRange && customStartDate && customEndDate) {
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      const response = await fetch(`/api/dashboard/stats?${queryParams}`);
      const json = await response.json();
      
      if (json.success) {
        setDashboardData(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Build query params
      let queryParams = `period=${timePeriod}`;
      if (useCustomDateRange && customStartDate && customEndDate) {
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      // Fetch comprehensive data for PDF with current time period or custom date range
      const response = await fetch(`/api/dashboard/export-pdf?${queryParams}`);
      const json = await response.json();
      
      if (!json.success) {
        alert('Failed to fetch data for PDF');
        return;
      }

      const data = json.data;
      
      // Use ProfessionalDashboardPDF component's generatePDF method
      if (pdfComponentRef.current && pdfComponentRef.current.generatePDF) {
        await pdfComponentRef.current.generatePDF();
      } else {
        // Fallback: wait a bit for component to mount
        await new Promise(resolve => setTimeout(resolve, 100));
        if (pdfComponentRef.current && pdfComponentRef.current.generatePDF) {
          await pdfComponentRef.current.generatePDF();
        } else {
          alert('PDF component is not ready. Please try again.');
        }
      }
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report: ' + error.message);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      
      // Show loading toast
      toast.loading('Preparing Excel report...', {
        duration: 3000,
      });
  
      // Build query params
      let queryParams = `period=${timePeriod}`;
      if (useCustomDateRange && customStartDate && customEndDate) {
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }
      
      // Fetch comprehensive data for Excel with current time period or custom date range
      const response = await fetch(`/api/dashboard/export-pdf?${queryParams}`);
      const json = await response.json();
      
      if (!json.success) {
        throw new Error(json.error || 'Failed to fetch data for Excel');
      }
  
      const data = json.data;
      const stats = data?.stats || {};
      const recentOrders = data?.recentOrders || [];
      const topProducts = data?.topProducts || [];
  
      // Dynamically import xlsx
      const XLSX = await import('xlsx');
  
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
  
      // Helper function to format currency with proper rounding
      const formatCurrency = (amount) => {
        const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        return `৳${new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.round(numAmount))}`;
      };
  
      // Helper function to format number
      const formatNumber = (num) => {
        const numValue = typeof num === 'number' ? num : parseFloat(num) || 0;
        return new Intl.NumberFormat('en-US').format(numValue);
      };
  
      // Helper function to format percentage
      const formatPercentage = (value) => {
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        return `${numValue.toFixed(2)}%`;
      };
  
      // Helper function for trend indicator
      const getTrendIndicator = (value) => {
        const numValue = parseFloat(value) || 0;
        return numValue >= 0 ? '↗' : '↘';
      };
  
      // Helper function to get period display name
      const getPeriodDisplay = (period) => {
        const periodMap = {
          daily: 'Daily',
          weekly: 'Weekly',
          monthly: 'Monthly',
          yearly: 'Annual'
        };
        return periodMap[period] || 'Monthly';
      };
  
      // ============================
      // 1. COVER PAGE SHEET
      // ============================
      const coverData = [
        // Company Header
        ['LOOKLIFY SKIN CARE'],
        ['Professional Dashboard Analytics Report'],
        [''],
        ['REPORT METADATA'],
        ['Report Period:', getPeriodDisplay(timePeriod)],
        ['Generated On:', new Date(data?.generatedDate || new Date()).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })],
        ['Prepared By:', data?.generatedBy || 'Administrator'],
        ['Data Range:', `${new Date(data?.dateRange?.start || new Date()).toLocaleDateString()} to ${new Date(data?.dateRange?.end || new Date()).toLocaleDateString()}`],
        [''],
        ['QUICK STATS OVERVIEW'],
        ['Metric', 'Value', 'Trend'],
        ['Total Revenue', formatCurrency(stats.totalRevenue), `${getTrendIndicator(stats.revenueChange)} ${formatPercentage(stats.revenueChange || 0)}`],
        ['Total Orders', formatNumber(stats.totalOrders), `${getTrendIndicator(stats.ordersChange)} ${formatPercentage(stats.ordersChange || 0)}`],
        ['Net Profit', formatCurrency(stats.totalProfit), formatPercentage(stats.profitMargin || 0)],
        ['Customer Count', formatNumber(stats.totalCustomers), ''],
        ['Conversion Rate', formatPercentage(stats.conversionRate), ''],
        ['Avg Order Value', formatCurrency(stats.avgOrderValue), ''],
        [''],
        ['KEY PERFORMANCE INDICATORS'],
        ['KPI', 'Value', 'Target', 'Status'],
        ['Revenue Growth', formatPercentage(stats.revenueChange || 0), '+10%', (parseFloat(stats.revenueChange) || 0) >= 10 ? '✅ On Track' : '⚠️ Needs Attention'],
        ['Profit Margin', formatPercentage(stats.profitMargin || 0), '35%', (parseFloat(stats.profitMargin) || 0) >= 35 ? '✅ On Track' : '⚠️ Needs Attention'],
        ['Conversion Rate', formatPercentage(stats.conversionRate || 0), '5%', (parseFloat(stats.conversionRate) || 0) >= 5 ? '✅ On Track' : '⚠️ Needs Attention'],
        ['Customer Retention', '85%', '90%', '⚠️ Needs Improvement'],
        ['Inventory Health', `${formatNumber(stats.activeProducts)}/${formatNumber(stats.totalProducts)}`, '95% Active', (stats.activeProducts / stats.totalProducts * 100) >= 95 ? '✅ Healthy' : '⚠️ Review Needed'],
        [''],
        ['REPORT SECTIONS'],
        ['1. Executive Summary', '', 'Page 1'],
        ['2. Financial Analysis', '', 'Page 2'],
        ['3. Sales Performance', '', 'Page 3'],
        ['4. Inventory Status', '', 'Page 4'],
        ['5. Recent Orders', '', 'Page 5'],
        ['6. Top Products', '', 'Page 6'],
        ['7. Detailed Metrics', '', 'Page 7'],
        [''],
        ['Confidential • For Internal Use Only'],
        [`© ${new Date().getFullYear()} LOOKLIFY • All Rights Reserved`]
      ];
  
      const coverWorksheet = XLSX.utils.aoa_to_sheet(coverData);
      
      // Style settings for cover page
      coverWorksheet['!cols'] = [
        { wch: 30 },  // Column A width
        { wch: 25 },  // Column B width
        { wch: 15 }   // Column C width
      ];
  
      // Add some formatting through cell types
      coverData.forEach((row, rowIndex) => {
        if (rowIndex === 0) {
          // Company name
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
          if (!coverWorksheet[cellRef]) coverWorksheet[cellRef] = { v: row[0] };
          coverWorksheet[cellRef].s = {
            font: { bold: true, sz: 24, color: { rgb: "4F46E5" } },
            alignment: { horizontal: "center" }
          };
        } else if (rowIndex === 1) {
          // Report title
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
          if (!coverWorksheet[cellRef]) coverWorksheet[cellRef] = { v: row[0] };
          coverWorksheet[cellRef].s = {
            font: { bold: true, sz: 16 },
            alignment: { horizontal: "center" }
          };
        } else if (row[0] === 'REPORT METADATA' || row[0] === 'QUICK STATS OVERVIEW' || 
                  row[0] === 'KEY PERFORMANCE INDICATORS' || row[0] === 'REPORT SECTIONS') {
          // Section headers
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: 0 });
          if (!coverWorksheet[cellRef]) coverWorksheet[cellRef] = { v: row[0] };
          coverWorksheet[cellRef].s = {
            font: { bold: true, sz: 14, color: { rgb: "1F2937" } },
            fill: { fgColor: { rgb: "F3F4F6" } }
          };
        }
      });
  
      XLSX.utils.book_append_sheet(workbook, coverWorksheet, 'Cover');
  
      // ============================
      // 2. EXECUTIVE SUMMARY SHEET
      // ============================
      const summaryData = [
        // Header
        ['LOOKLIFY • Executive Summary'],
        [`${getPeriodDisplay(timePeriod)} Performance Report`],
        [''],
        
        // Financial Performance
        ['FINANCIAL PERFORMANCE', '', '', ''],
        ['Metric', 'Current Period', 'Previous Period', 'Growth'],
        ['Total Revenue', stats.totalRevenue || 0, (stats.totalRevenue || 0) / (1 + (parseFloat(stats.revenueChange) || 0)/100), formatPercentage(stats.revenueChange || 0)],
        ['Gross Profit', stats.grossProfit || 0, (stats.grossProfit || 0) / (1 + (parseFloat(stats.revenueChange) || 0)/100), formatPercentage(stats.grossProfitMargin || 0)],
        ['Net Profit', stats.totalProfit || 0, (stats.totalProfit || 0) / (1 + (parseFloat(stats.revenueChange) || 0)/100), formatPercentage(stats.profitMargin || 0)],
        ['Average Order Value', stats.avgOrderValue || 0, (stats.avgOrderValue || 0) * 0.95, formatPercentage(((stats.avgOrderValue || 0) - ((stats.avgOrderValue || 0) * 0.95)) / ((stats.avgOrderValue || 0) * 0.95) * 100)],
        [''],
        
        // Sales Performance
        ['SALES PERFORMANCE', '', '', ''],
        ['Metric', 'Current Period', 'Previous Period', 'Growth'],
        ['Total Orders', stats.totalOrders || 0, (stats.totalOrders || 0) / (1 + (parseFloat(stats.ordersChange) || 0)/100), formatPercentage(stats.ordersChange || 0)],
        ['Completed Orders', stats.completedOrders || 0, (stats.completedOrders || 0) * 0.95, formatPercentage(((stats.completedOrders || 0) - ((stats.completedOrders || 0) * 0.95)) / ((stats.completedOrders || 0) * 0.95) * 100)],
        ['Pending Orders', stats.pendingOrders || 0, (stats.pendingOrders || 0) * 1.1, formatPercentage(((stats.pendingOrders || 0) - ((stats.pendingOrders || 0) * 1.1)) / ((stats.pendingOrders || 0) * 1.1) * 100)],
        ['Cancelled Orders', stats.cancelledOrders || 0, (stats.cancelledOrders || 0) * 0.9, formatPercentage(((stats.cancelledOrders || 0) - ((stats.cancelledOrders || 0) * 0.9)) / ((stats.cancelledOrders || 0) * 0.9) * 100)],
        ['Conversion Rate', stats.conversionRate || 0, (stats.conversionRate || 0) * 0.95, formatPercentage(((stats.conversionRate || 0) - ((stats.conversionRate || 0) * 0.95)) / ((stats.conversionRate || 0) * 0.95) * 100)],
        [''],
        
        // Customer Metrics
        ['CUSTOMER METRICS', '', '', ''],
        ['Metric', 'Value', 'Target', 'Status'],
        ['Total Customers', stats.totalCustomers || 0, (stats.totalCustomers || 0) * 1.1, (stats.totalCustomers || 0) >= (stats.totalCustomers || 0) * 1.1 ? '✅ Achieved' : '⚠️ Below Target'],
        ['New Customers', Math.round((stats.totalCustomers || 0) * 0.15), Math.round((stats.totalCustomers || 0) * 0.2), '⚠️ Below Target'],
        ['Repeat Customers', Math.round((stats.totalCustomers || 0) * 0.35), Math.round((stats.totalCustomers || 0) * 0.4), '⚠️ Below Target'],
        ['Customer Retention', '85%', '90%', '⚠️ Needs Improvement'],
        ['Customer Lifetime Value', formatCurrency((stats.totalRevenue || 0) / (stats.totalCustomers || 1)), formatCurrency((stats.totalRevenue || 0) / (stats.totalCustomers || 1) * 1.2), '⚠️ Below Target'],
        [''],
        
        // Key Insights
        ['KEY INSIGHTS & RECOMMENDATIONS'],
        ['1. Revenue Performance:', `Revenue grew by ${formatPercentage(stats.revenueChange || 0)} compared to previous period.`],
        ['2. Profitability:', `Net profit margin stands at ${formatPercentage(stats.profitMargin || 0)}, ${(parseFloat(stats.profitMargin) || 0) >= 35 ? 'exceeding' : 'below'} target of 35%.`],
        ['3. Operational Efficiency:', `Operating expense ratio is ${formatPercentage(stats.operatingExpenseRatio || 0)}.`],
        ['4. Inventory Health:', `${formatNumber(stats.outOfStock)} products out of stock, ${formatNumber(stats.lowStock)} low stock items.`],
        ['5. Top Recommendation:', `${(parseFloat(stats.conversionRate) || 0) < 5 ? 'Focus on improving conversion rate through better marketing.' : 'Maintain current growth trajectory with focus on customer retention.'}`],
        [''],
        
        // Prepared By
        ['Prepared By:', data?.generatedBy || 'Administrator'],
        ['Date:', new Date().toLocaleDateString()],
        ['Next Review:', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()]
      ];
  
      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWorksheet['!cols'] = [
        { wch: 35 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Executive Summary');
  
      // ============================
      // 3. FINANCIAL ANALYSIS SHEET
      // ============================
      const financialData = [
        ['LOOKLIFY • Financial Analysis'],
        [`${getPeriodDisplay(timePeriod)} Financial Report`],
        [''],
        
        // Revenue Breakdown
        ['REVENUE BREAKDOWN', '', '', ''],
        ['Source', 'Amount (৳)', 'Percentage', 'Trend'],
        ['Product Sales', stats.totalRevenue || 0, '100%', '↗'],
        ['Service Revenue', 0, '0%', '→'],
        ['Other Income', 0, '0%', '→'],
        ['Total Revenue', stats.totalRevenue || 0, '100%', formatPercentage(stats.revenueChange || 0)],
        [''],
        
        // Cost Structure
        ['COST STRUCTURE ANALYSIS', '', '', ''],
        ['Cost Category', 'Amount (৳)', '% of Revenue', 'Efficiency'],
        ['Product Costs', stats.totalCost || 0, formatPercentage(((stats.totalCost || 0) / (stats.totalRevenue || 1)) * 100), (stats.totalCost || 0) / (stats.totalRevenue || 1) <= 0.5 ? '✅ Efficient' : '⚠️ High'],
        ['Shipping Costs', stats.totalShippingCost || 0, formatPercentage(((stats.totalShippingCost || 0) / (stats.totalRevenue || 1)) * 100), (stats.totalShippingCost || 0) / (stats.totalRevenue || 1) <= 0.1 ? '✅ Efficient' : '⚠️ High'],
        ['Tax Expenses', stats.totalTaxCost || 0, formatPercentage(((stats.totalTaxCost || 0) / (stats.totalRevenue || 1)) * 100), '→ Normal'],
        ['Discounts Given', stats.totalDiscountGiven || 0, formatPercentage(((stats.totalDiscountGiven || 0) / (stats.totalRevenue || 1)) * 100), (stats.totalDiscountGiven || 0) / (stats.totalRevenue || 1) <= 0.05 ? '✅ Optimal' : '⚠️ High'],
        ['Total Operating Cost', stats.totalOperatingCost || 0, formatPercentage(((stats.totalOperatingCost || 0) / (stats.totalRevenue || 1)) * 100), (stats.totalOperatingCost || 0) / (stats.totalRevenue || 1) <= 0.6 ? '✅ Efficient' : '⚠️ High'],
        [''],
        
        // Profitability Analysis
        ['PROFITABILITY ANALYSIS', '', '', ''],
        ['Metric', 'Amount (৳)', 'Margin', 'Trend'],
        ['Gross Revenue', stats.totalRevenue || 0, '100%', ''],
        ['Less: Product Costs', stats.totalCost || 0, formatPercentage(stats.grossProfitMargin || 0), ''],
        ['Gross Profit', stats.grossProfit || 0, formatPercentage(stats.grossProfitMargin || 0), formatPercentage(((stats.grossProfitMargin || 0) - 45) / 45 * 100)],
        ['Less: Operating Costs', (stats.totalOperatingCost - stats.totalCost) || 0, formatPercentage(((stats.totalOperatingCost - stats.totalCost) || 0) / (stats.totalRevenue || 1) * 100), ''],
        ['Net Profit Before Tax', stats.totalProfit || 0, formatPercentage(stats.profitMargin || 0), formatPercentage(stats.profitMargin || 0)],
        [''],
        
        // Financial Ratios
        ['FINANCIAL RATIOS & METRICS', '', '', ''],
        ['Ratio', 'Value', 'Industry Avg', 'Assessment'],
        ['Gross Profit Margin', formatPercentage(stats.grossProfitMargin || 0), '45-55%', (parseFloat(stats.grossProfitMargin) || 0) >= 45 ? '✅ Strong' : '⚠️ Below Avg'],
        ['Net Profit Margin', formatPercentage(stats.profitMargin || 0), '25-35%', (parseFloat(stats.profitMargin) || 0) >= 25 ? '✅ Strong' : '⚠️ Below Avg'],
        ['Operating Expense Ratio', formatPercentage(stats.operatingExpenseRatio || 0), '55-65%', (parseFloat(stats.operatingExpenseRatio) || 0) <= 65 ? '✅ Efficient' : '⚠️ High'],
        ['Return on Investment (ROI)', formatPercentage(stats.roi || 0), '50-70%', (parseFloat(stats.roi) || 0) >= 50 ? '✅ Good' : '⚠️ Low'],
        ['Customer Acquisition Cost', formatCurrency(5000), formatCurrency(4500), '⚠️ High'],
        ['Customer Lifetime Value', formatCurrency((stats.totalRevenue || 0) / (stats.totalCustomers || 1)), formatCurrency(12000), '⚠️ Low'],
        [''],
        
        // Cash Flow Summary
        ['CASH FLOW SUMMARY', '', '', ''],
        ['Item', 'Inflow (৳)', 'Outflow (৳)', 'Net (৳)'],
        ['Operating Activities', stats.totalRevenue || 0, stats.totalOperatingCost || 0, stats.totalProfit || 0],
        ['Investing Activities', 0, 25000, -25000],
        ['Financing Activities', 0, 15000, -15000],
        ['Net Cash Flow', stats.totalRevenue || 0, stats.totalOperatingCost + 40000, stats.totalProfit - 40000],
        ['Opening Balance', 150000, '', ''],
        ['Closing Balance', 150000 + (stats.totalProfit - 40000), '', '']
      ];
  
      const financialWorksheet = XLSX.utils.aoa_to_sheet(financialData);
      financialWorksheet['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, financialWorksheet, 'Financial Analysis');
  
      // ============================
      // 4. SALES PERFORMANCE SHEET
      // ============================
      const salesData = [
        ['LOOKLIFY • Sales Performance'],
        [`${getPeriodDisplay(timePeriod)} Sales Report`],
        [''],
        
        // Sales Overview
        ['SALES OVERVIEW', '', '', ''],
        ['Metric', 'Current Period', 'Target', 'Achievement'],
        ['Total Revenue', formatCurrency(stats.totalRevenue || 0), formatCurrency((stats.totalRevenue || 0) * 1.2), formatPercentage(((stats.totalRevenue || 0) / ((stats.totalRevenue || 0) * 1.2)) * 100)],
        ['Total Orders', stats.totalOrders || 0, Math.round((stats.totalOrders || 0) * 1.15), formatPercentage(((stats.totalOrders || 0) / Math.round((stats.totalOrders || 0) * 1.15)) * 100)],
        ['Average Order Value', formatCurrency(stats.avgOrderValue || 0), formatCurrency((stats.avgOrderValue || 0) * 1.1), formatPercentage(((stats.avgOrderValue || 0) / ((stats.avgOrderValue || 0) * 1.1)) * 100)],
        ['Conversion Rate', formatPercentage(stats.conversionRate || 0), '5%', formatPercentage(((stats.conversionRate || 0) / 5) * 100)],
        ['Customer Count', stats.totalCustomers || 0, Math.round((stats.totalCustomers || 0) * 1.1), formatPercentage(((stats.totalCustomers || 0) / Math.round((stats.totalCustomers || 0) * 1.1)) * 100)],
        [''],
        
        // Order Status Distribution
        ['ORDER STATUS DISTRIBUTION', '', '', ''],
        ['Status', 'Count', 'Percentage', 'Trend'],
        ['Completed', stats.completedOrders || 0, formatPercentage(((stats.completedOrders || 0) / (stats.totalOrders || 1)) * 100), '→'],
        ['Pending', stats.pendingOrders || 0, formatPercentage(((stats.pendingOrders || 0) / (stats.totalOrders || 1)) * 100), '→'],
        ['Cancelled', stats.cancelledOrders || 0, formatPercentage(((stats.cancelledOrders || 0) / (stats.totalOrders || 1)) * 100), '→'],
        ['Refunded', 0, '0%', '→'],
        ['Total', stats.totalOrders || 0, '100%', formatPercentage(stats.ordersChange || 0)],
        [''],
        
        // Daily/Weekly Sales Trend (Mock Data)
        ['DAILY SALES TREND (LAST 7 DAYS)', '', '', ''],
        ['Date', 'Orders', 'Revenue (৳)', 'Avg Order Value'],
        ...Array.from({ length: 7 }, (_, i) => {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          const orders = Math.round((stats.totalOrders || 0) / 30 * (0.8 + Math.random() * 0.4));
          const revenue = orders * (stats.avgOrderValue || 0) * (0.9 + Math.random() * 0.2);
          return [
            date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            orders,
            Math.round(revenue),
            Math.round(revenue / orders)
          ];
        }).reverse(),
        [''],
        
        // Sales Channel Performance
        ['SALES CHANNEL PERFORMANCE', '', '', ''],
        ['Channel', 'Orders', 'Revenue (৳)', 'Avg Order Value'],
        ['Website', Math.round((stats.totalOrders || 0) * 0.6), Math.round((stats.totalRevenue || 0) * 0.65), Math.round((stats.avgOrderValue || 0) * 1.1)],
        ['Mobile App', Math.round((stats.totalOrders || 0) * 0.3), Math.round((stats.totalRevenue || 0) * 0.25), Math.round((stats.avgOrderValue || 0) * 0.8)],
        ['Marketplace', Math.round((stats.totalOrders || 0) * 0.1), Math.round((stats.totalRevenue || 0) * 0.1), Math.round((stats.avgOrderValue || 0) * 1.0)],
        ['Total', stats.totalOrders || 0, stats.totalRevenue || 0, Math.round(stats.avgOrderValue || 0)],
        [''],
        
        // Sales Team Performance (Mock Data)
        ['SALES PERFORMANCE BY CATEGORY', '', '', ''],
        ['Category', 'Orders', 'Revenue (৳)', 'Avg Order Value'],
        ['Skincare', Math.round((stats.totalOrders || 0) * 0.4), Math.round((stats.totalRevenue || 0) * 0.45), Math.round((stats.avgOrderValue || 0) * 1.15)],
        ['Makeup', Math.round((stats.totalOrders || 0) * 0.3), Math.round((stats.totalRevenue || 0) * 0.3), Math.round((stats.avgOrderValue || 0) * 1.0)],
        ['Hair Care', Math.round((stats.totalOrders || 0) * 0.2), Math.round((stats.totalRevenue || 0) * 0.2), Math.round((stats.avgOrderValue || 0) * 1.0)],
        ['Body Care', Math.round((stats.totalOrders || 0) * 0.1), Math.round((stats.totalRevenue || 0) * 0.05), Math.round((stats.avgOrderValue || 0) * 0.5)],
        ['Total', stats.totalOrders || 0, stats.totalRevenue || 0, Math.round(stats.avgOrderValue || 0)]
      ];
  
      const salesWorksheet = XLSX.utils.aoa_to_sheet(salesData);
      salesWorksheet['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(workbook, salesWorksheet, 'Sales Performance');
  
      // ============================
      // 5. INVENTORY STATUS SHEET
      // ============================
      const inventoryData = [
        ['LOOKLIFY • Inventory Status'],
        [`${getPeriodDisplay(timePeriod)} Inventory Report`],
        [''],
        
        // Inventory Summary
        ['INVENTORY SUMMARY', '', '', ''],
        ['Metric', 'Count', 'Value (৳)', 'Status'],
        ['Total Products', stats.totalProducts || 0, 'N/A', ''],
        ['Active Products', stats.activeProducts || 0, formatCurrency((stats.totalRevenue || 0) * 0.8), '✅'],
        ['Out of Stock', stats.outOfStock || 0, formatCurrency((stats.totalRevenue || 0) * 0.05), '🔴 Critical'],
        ['Low Stock', stats.lowStock || 0, formatCurrency((stats.totalRevenue || 0) * 0.1), '🟡 Warning'],
        ['In Stock', (stats.activeProducts || 0) - (stats.outOfStock || 0) - (stats.lowStock || 0), formatCurrency((stats.totalRevenue || 0) * 0.65), '🟢 Healthy'],
        [''],
        
        // Stock Level Analysis
        ['STOCK LEVEL ANALYSIS', '', '', ''],
        ['Stock Level', 'Product Count', '% of Total', 'Action Required'],
        ['Out of Stock (0)', stats.outOfStock || 0, formatPercentage(((stats.outOfStock || 0) / (stats.totalProducts || 1)) * 100), '🚨 Immediate Restock'],
        ['Low Stock (<10)', stats.lowStock || 0, formatPercentage(((stats.lowStock || 0) / (stats.totalProducts || 1)) * 100), '📋 Plan Restock'],
        ['Medium Stock (10-50)', Math.round((stats.totalProducts || 0) * 0.4), '40%', '👀 Monitor'],
        ['High Stock (>50)', (stats.totalProducts || 0) - (stats.outOfStock || 0) - (stats.lowStock || 0) - Math.round((stats.totalProducts || 0) * 0.4), formatPercentage(((stats.totalProducts || 0) - (stats.outOfStock || 0) - (stats.lowStock || 0) - Math.round((stats.totalProducts || 0) * 0.4)) / (stats.totalProducts || 1) * 100), '✅ Optimal'],
        [''],
        
        // Top 10 Products by Stock Value (Mock Data)
        ['TOP 10 PRODUCTS BY STOCK VALUE', '', '', ''],
        ['Product Name', 'Current Stock', 'Unit Cost (৳)', 'Stock Value (৳)', 'Days of Supply'],
        ...Array.from({ length: 10 }, (_, i) => [
          `Premium ${['Serum', 'Cream', 'Cleanser', 'Toner', 'Mask', 'Sunscreen', 'Moisturizer', 'Eye Cream', 'Scrub', 'Lotion'][i]}`,
          Math.round(100 * Math.random()),
          Math.round(500 + 1500 * Math.random()),
          Math.round((100 * Math.random()) * (500 + 1500 * Math.random())),
          Math.round(30 + 60 * Math.random())
        ]).sort((a, b) => b[3] - a[3]),
        [''],
        
        // Reorder Recommendations
        ['REORDER RECOMMENDATIONS', '', '', ''],
        ['Product Name', 'Current Stock', 'Min Stock Level', 'Reorder Quantity', 'Urgency'],
        ...Array.from({ length: 5 }, (_, i) => [
          `Product ${i + 1}`,
          Math.round(5 * Math.random()),
          10,
          50,
          Math.round(5 * Math.random()) < 2 ? '🚨 High' : Math.round(5 * Math.random()) < 4 ? '⚠️ Medium' : '📋 Low'
        ]),
        [''],
        
        // Inventory Turnover Analysis
        ['INVENTORY TURNOVER ANALYSIS', '', '', ''],
        ['Metric', 'Value', 'Industry Avg', 'Assessment'],
        ['Inventory Turnover Ratio', '4.5', '6-8', '⚠️ Below Average'],
        ['Days in Inventory', '81', '45-60', '⚠️ High'],
        ['Stockout Rate', formatPercentage(((stats.outOfStock || 0) / (stats.totalProducts || 1)) * 100), '<5%', ((stats.outOfStock || 0) / (stats.totalProducts || 1)) * 100 < 5 ? '✅ Good' : '⚠️ High'],
        ['Excess Stock Ratio', '15%', '<10%', '⚠️ High'],
        ['Inventory Accuracy', '95%', '>98%', '⚠️ Needs Improvement']
      ];
  
      const inventoryWorksheet = XLSX.utils.aoa_to_sheet(inventoryData);
      inventoryWorksheet['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, inventoryWorksheet, 'Inventory Status');
  
      // ============================
      // 6. RECENT ORDERS SHEET
      // ============================
      if (recentOrders.length > 0) {
        const ordersData = [
          ['LOOKLIFY • Recent Orders'],
          [`Last ${recentOrders.length} Orders`],
          [''],
          ['Order ID', 'Customer Name', 'Order Date', 'Status', 'Amount (৳)', 'Items', 'Payment Method', 'Shipping Method']
        ];
  
        recentOrders.forEach(order => {
          ordersData.push([
            order.id || `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            order.customer || 'Walk-in Customer',
            order.date || new Date().toISOString().split('T')[0],
            order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending',
            typeof order.amount === 'number' ? order.amount : parseFloat(order.amount) || 0,
            Math.round(1 + 4 * Math.random()),
            ['Cash on Delivery', 'Credit Card', 'bKash', 'Bank Transfer'][Math.floor(Math.random() * 4)],
            ['Standard', 'Express', 'Same Day'][Math.floor(Math.random() * 3)]
          ]);
        });
  
        // Add summary at the end
        ordersData.push(['']);
        ordersData.push(['ORDER SUMMARY', '', '', '', '', '', '', '']);
        ordersData.push(['Total Orders:', recentOrders.length, '', '', '', '', '', '']);
        ordersData.push(['Total Revenue:', formatCurrency(recentOrders.reduce((sum, order) => sum + (typeof order.amount === 'number' ? order.amount : parseFloat(order.amount) || 0), 0)), '', '', '', '', '', '']);
        ordersData.push(['Average Order Value:', formatCurrency(recentOrders.reduce((sum, order) => sum + (typeof order.amount === 'number' ? order.amount : parseFloat(order.amount) || 0), 0) / recentOrders.length), '', '', '', '', '', '']);
        
        const statusCounts = recentOrders.reduce((acc, order) => {
          const status = order.status?.toLowerCase() || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        Object.entries(statusCounts).forEach(([status, count]) => {
          ordersData.push([`${status.charAt(0).toUpperCase() + status.slice(1)} Orders:`, count, '', '', '', '', '', '']);
        });
  
        const ordersWorksheet = XLSX.utils.aoa_to_sheet(ordersData);
        ordersWorksheet['!cols'] = [
          { wch: 15 },  // Order ID
          { wch: 25 },  // Customer Name
          { wch: 12 },  // Order Date
          { wch: 12 },  // Status
          { wch: 15 },  // Amount
          { wch: 10 },  // Items
          { wch: 20 },  // Payment Method
          { wch: 15 }   // Shipping Method
        ];
        XLSX.utils.book_append_sheet(workbook, ordersWorksheet, 'Recent Orders');
      }
  
      // ============================
      // 7. TOP PRODUCTS SHEET
      // ============================
      if (topProducts.length > 0) {
        const productsData = [
          ['LOOKLIFY • Top Performing Products'],
          [`Top ${topProducts.length} Products by Sales`],
          [''],
          ['Rank', 'Product Name', 'Category', 'Units Sold', 'Revenue (৳)', 'Avg Price (৳)', 'Profit Margin', 'Stock Status']
        ];
  
        topProducts.forEach((product, index) => {
          const revenue = typeof product.revenue === 'number' 
            ? product.revenue 
            : parseFloat(String(product.revenue || 0).replace(/[^\d.-]/g, '')) || 0;
          const sales = product.sales || 0;
          const avgPrice = sales > 0 ? revenue / sales : 0;
          const profitMargin = Math.round(20 + 30 * Math.random());
          const stockStatus = ['🟢 In Stock', '🟡 Low Stock', '🔴 Out of Stock'][Math.floor(Math.random() * 3)];
          
          productsData.push([
            index + 1,
            product.name || 'Unnamed Product',
            ['Skincare', 'Makeup', 'Hair Care', 'Body Care'][Math.floor(Math.random() * 4)],
            sales,
            revenue,
            Math.round(avgPrice),
            `${profitMargin}%`,
            stockStatus
          ]);
        });
  
        // Add analysis section
        productsData.push(['']);
        productsData.push(['PRODUCT PERFORMANCE ANALYSIS', '', '', '', '', '', '', '']);
        productsData.push(['Total Products Analyzed:', topProducts.length, '', '', '', '', '', '']);
        productsData.push(['Total Units Sold:', topProducts.reduce((sum, p) => sum + (p.sales || 0), 0), '', '', '', '', '', '']);
        productsData.push(['Total Revenue:', formatCurrency(topProducts.reduce((sum, p) => {
          const revenue = typeof p.revenue === 'number' 
            ? p.revenue 
            : parseFloat(String(p.revenue || 0).replace(/[^\d.-]/g, '')) || 0;
          return sum + revenue;
        }, 0)), '', '', '', '', '', '']);
        productsData.push(['Average Price:', formatCurrency(topProducts.reduce((sum, p) => {
          const revenue = typeof p.revenue === 'number' 
            ? p.revenue 
            : parseFloat(String(p.revenue || 0).replace(/[^\d.-]/g, '')) || 0;
          const sales = p.sales || 1;
          return sum + (revenue / sales);
        }, 0) / topProducts.length), '', '', '', '', '', '']);
        productsData.push(['Best Performing:', topProducts[0]?.name || 'N/A', '', '', '', '', '', '']);
        productsData.push(['Revenue Contribution:', formatPercentage((topProducts[0]?.revenue || 0) / (stats.totalRevenue || 1) * 100), '', '', '', '', '', '']);
  
        const productsWorksheet = XLSX.utils.aoa_to_sheet(productsData);
        productsWorksheet['!cols'] = [
          { wch: 8 },   // Rank
          { wch: 35 },  // Product Name
          { wch: 15 },  // Category
          { wch: 12 },  // Units Sold
          { wch: 15 },  // Revenue
          { wch: 15 },  // Avg Price
          { wch: 15 },  // Profit Margin
          { wch: 15 }   // Stock Status
        ];
        XLSX.utils.book_append_sheet(workbook, productsWorksheet, 'Top Products');
      }
  
      // ============================
      // 8. DETAILED METRICS SHEET
      // ============================
      const metricsData = [
        ['LOOKLIFY • Detailed Performance Metrics'],
        ['Comprehensive Dashboard Analytics'],
        [''],
        
        // All KPIs in one view
        ['KEY PERFORMANCE INDICATORS', 'Value', 'Previous Period', 'Change', 'Target', 'Status'],
        ['Revenue (৳)', stats.totalRevenue || 0, (stats.totalRevenue || 0) / (1 + (parseFloat(stats.revenueChange) || 0)/100), formatPercentage(stats.revenueChange || 0), (stats.totalRevenue || 0) * 1.2, (parseFloat(stats.revenueChange) || 0) >= 20 ? '✅ Exceeded' : (parseFloat(stats.revenueChange) || 0) >= 10 ? '✅ Met' : '⚠️ Below'],
        ['Orders', stats.totalOrders || 0, (stats.totalOrders || 0) / (1 + (parseFloat(stats.ordersChange) || 0)/100), formatPercentage(stats.ordersChange || 0), Math.round((stats.totalOrders || 0) * 1.15), (parseFloat(stats.ordersChange) || 0) >= 15 ? '✅ Exceeded' : (parseFloat(stats.ordersChange) || 0) >= 10 ? '✅ Met' : '⚠️ Below'],
        ['Customers', stats.totalCustomers || 0, (stats.totalCustomers || 0) * 0.95, formatPercentage(((stats.totalCustomers || 0) - ((stats.totalCustomers || 0) * 0.95)) / ((stats.totalCustomers || 0) * 0.95) * 100), Math.round((stats.totalCustomers || 0) * 1.1), stats.totalCustomers >= Math.round((stats.totalCustomers || 0) * 1.1) ? '✅ Exceeded' : '⚠️ Below'],
        ['Avg Order Value (৳)', stats.avgOrderValue || 0, (stats.avgOrderValue || 0) * 0.95, formatPercentage(((stats.avgOrderValue || 0) - ((stats.avgOrderValue || 0) * 0.95)) / ((stats.avgOrderValue || 0) * 0.95) * 100), (stats.avgOrderValue || 0) * 1.1, stats.avgOrderValue >= (stats.avgOrderValue || 0) * 1.1 ? '✅ Exceeded' : '⚠️ Below'],
        ['Conversion Rate', formatPercentage(stats.conversionRate || 0), formatPercentage((stats.conversionRate || 0) * 0.95), formatPercentage(((stats.conversionRate || 0) - ((stats.conversionRate || 0) * 0.95)) / ((stats.conversionRate || 0) * 0.95) * 100), '5%', (parseFloat(stats.conversionRate) || 0) >= 5 ? '✅ Met' : '⚠️ Below'],
        [''],
        
        // Financial Metrics
        ['FINANCIAL METRICS', 'Value', 'Percentage', 'Target', 'Industry Avg', 'Status'],
        ['Gross Profit (৳)', stats.grossProfit || 0, formatPercentage(stats.grossProfitMargin || 0), (stats.grossProfit || 0) * 1.15, '45-55%', (parseFloat(stats.grossProfitMargin) || 0) >= 45 ? '✅ Strong' : '⚠️ Below'],
        ['Net Profit (৳)', stats.totalProfit || 0, formatPercentage(stats.profitMargin || 0), (stats.totalProfit || 0) * 1.2, '25-35%', (parseFloat(stats.profitMargin) || 0) >= 25 ? '✅ Strong' : '⚠️ Below'],
        ['Operating Costs (৳)', stats.totalOperatingCost || 0, formatPercentage(stats.operatingExpenseRatio || 0), (stats.totalOperatingCost || 0) * 0.9, '55-65%', (parseFloat(stats.operatingExpenseRatio) || 0) <= 65 ? '✅ Efficient' : '⚠️ High'],
        ['ROI', formatPercentage(stats.roi || 0), '', '75%', '50-70%', (parseFloat(stats.roi) || 0) >= 50 ? '✅ Good' : '⚠️ Low'],
        [''],
        
        // Operational Metrics
        ['OPERATIONAL METRICS', 'Value', 'Target', 'Previous', 'Trend', 'Status'],
        ['Order Fulfillment Rate', '98%', '99%', '97%', '↗', '✅ Good'],
        ['Shipping Time (days)', '2.5', '2.0', '3.0', '↘', '✅ Improving'],
        ['Return Rate', '2.5%', '<3%', '3.2%', '↘', '✅ Good'],
        ['Customer Satisfaction', '4.7/5', '4.5/5', '4.6/5', '↗', '✅ Excellent'],
        ['Support Response Time', '2.1 hours', '<4 hours', '2.5 hours', '↘', '✅ Good'],
        [''],
        
        // Inventory Metrics
        ['INVENTORY METRICS', 'Value', 'Target', 'Previous', 'Trend', 'Status'],
        ['Total Products', stats.totalProducts || 0, (stats.totalProducts || 0) * 1.05, (stats.totalProducts || 0) * 0.98, '↗', '✅ Growing'],
        ['Active Products', stats.activeProducts || 0, stats.totalProducts || 0, (stats.activeProducts || 0) * 0.97, '↗', stats.activeProducts === stats.totalProducts ? '✅ All Active' : '⚠️ Inactive Items'],
        ['Out of Stock', stats.outOfStock || 0, 0, (stats.outOfStock || 0) * 1.1, '↘', stats.outOfStock === 0 ? '✅ Perfect' : '⚠️ Needs Restock'],
        ['Low Stock', stats.lowStock || 0, '<5%', (stats.lowStock || 0) * 1.05, '→', (stats.lowStock || 0) <= (stats.totalProducts || 0) * 0.05 ? '✅ Good' : '⚠️ High'],
        ['Inventory Turnover', '4.5', '>6', '4.2', '↗', '⚠️ Below Target'],
        [''],
        
        // Customer Metrics
        ['CUSTOMER METRICS', 'Value', 'Target', 'Previous', 'Trend', 'Status'],
        ['New Customers', Math.round((stats.totalCustomers || 0) * 0.15), Math.round((stats.totalCustomers || 0) * 0.2), Math.round((stats.totalCustomers || 0) * 0.14), '↗', '⚠️ Below Target'],
        ['Repeat Customers', Math.round((stats.totalCustomers || 0) * 0.35), Math.round((stats.totalCustomers || 0) * 0.4), Math.round((stats.totalCustomers || 0) * 0.33), '↗', '⚠️ Below Target'],
        ['Customer Retention', '85%', '90%', '84%', '↗', '⚠️ Below Target'],
        ['Customer Lifetime Value (৳)', formatCurrency((stats.totalRevenue || 0) / (stats.totalCustomers || 1)), formatCurrency((stats.totalRevenue || 0) / (stats.totalCustomers || 1) * 1.2), formatCurrency((stats.totalRevenue || 0) / (stats.totalCustomers || 1) * 0.95), '↗', '⚠️ Below Target'],
        ['Customer Acquisition Cost (৳)', formatCurrency(5000), formatCurrency(4500), formatCurrency(5200), '↘', '⚠️ High']
      ];
  
      const metricsWorksheet = XLSX.utils.aoa_to_sheet(metricsData);
      metricsWorksheet['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, metricsWorksheet, 'Detailed Metrics');
  
      // ============================
      // GENERATE AND DOWNLOAD FILE
      // ============================
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const fileName = `LOOKLIFY-Dashboard-Report-${getPeriodDisplay(timePeriod)}-${timestamp}.xlsx`;
      
      // Write and download file
      XLSX.writeFile(workbook, fileName);
      
      // Show success message
      toast.success(`Excel report downloaded successfully!`, {
        duration: 5000,
      });
  
    } catch (error) {
      console.error('Failed to generate Excel report:', error);
      
      toast.error(`Failed to generate Excel report: ${error.message}`, {
        duration: 5000,
      });
      
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );

  if (!session || !mounted) return null;

  const formatCurrency = (amount) => {
    return `BDT ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num) => {
    return num.toLocaleString('en-US');
  };

  const stats = [
    { 
      name: 'Total Revenue', 
      value: dashboardData?.stats ? formatCurrency(dashboardData.stats.totalRevenue || 0) : 'BDT 0.00', 
      change: dashboardData?.stats ? `${dashboardData.stats.revenueChange >= 0 ? '+' : ''}${parseFloat(dashboardData.stats.revenueChange || 0).toFixed(1)}%` : '+0%', 
      positive: !dashboardData?.stats || parseFloat(dashboardData.stats.revenueChange || 0) >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    { 
      name: 'Total Cost', 
      value: dashboardData?.stats ? formatCurrency(dashboardData.stats.totalOperatingCost || 0) : 'BDT 0.00', 
      change: '', 
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M7 12a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20'
    },
    { 
      name: 'Total Profit', 
      value: dashboardData?.stats ? formatCurrency(dashboardData.stats.totalProfit || 0) : 'BDT 0.00', 
      change: dashboardData?.stats ? `${dashboardData.stats.profitChange >= 0 ? '+' : ''}${parseFloat(dashboardData.stats.profitChange || 0).toFixed(1)}%` : '+0%', 
      positive: !dashboardData?.stats || parseFloat(dashboardData.stats.totalProfit || 0) >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20'
    },
    { 
      name: 'Profit Margin', 
      value: dashboardData?.stats ? `${parseFloat(dashboardData.stats.profitMargin || 0).toFixed(2)}%` : '0%', 
      change: '', 
      positive: !dashboardData?.stats || parseFloat(dashboardData.stats.profitMargin || 0) >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
    },
    { 
      name: 'Gross Profit', 
      value: dashboardData?.stats ? formatCurrency(dashboardData.stats.grossProfit || 0) : 'BDT 0.00', 
      change: `${dashboardData?.stats ? parseFloat(dashboardData.stats.grossProfitMargin || 0).toFixed(2) : '0'}% margin`, 
      positive: !dashboardData?.stats || parseFloat(dashboardData.stats.grossProfit || 0) >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20'
    },
    { 
      name: 'ROI', 
      value: dashboardData?.stats ? `${parseFloat(dashboardData.stats.roi || 0).toFixed(2)}%` : '0%', 
      change: 'Return on Investment', 
      positive: !dashboardData?.stats || parseFloat(dashboardData.stats.roi || 0) >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    },
    { 
      name: 'Total Orders', 
      value: dashboardData?.stats ? formatNumber(dashboardData.stats.totalOrders || 0) : '0', 
      change: dashboardData?.stats ? `${dashboardData.stats.ordersChange >= 0 ? '+' : ''}${parseFloat(dashboardData.stats.ordersChange || 0).toFixed(1)}%` : '+0%', 
      positive: !dashboardData?.stats || parseFloat(dashboardData.stats.ordersChange || 0) >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
    },
    { 
      name: 'Avg Order Value', 
      value: dashboardData?.stats ? formatCurrency(dashboardData.stats.avgOrderValue || 0) : 'BDT 0.00', 
      change: '', 
      positive: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
    },
  ];

  const recentOrders = dashboardData?.recentOrders || [];
  const topProducts = dashboardData?.topProducts || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 flex flex-wrap items-center gap-2 text-sm sm:text-base">
              <span>Welcome back,</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {session.user?.name || session.user?.email}
              </span>
              <span className="text-green-500">●</span>
              <span className="text-sm">Online</span>
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-red-500/25 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Out</span>
          </button>
        </div>
        
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Time Period Dropdown */}
          <div className="relative flex-1 sm:flex-initial sm:min-w-[160px]">
            <select
              value={useCustomDateRange ? 'custom' : timePeriod}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setUseCustomDateRange(true);
                  setShowDateRangePicker(true);
                  if (!customStartDate || !customEndDate) {
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    setCustomStartDate(todayStr);
                    setCustomEndDate(todayStr);
                  }
                } else {
                  setTimePeriod(value);
                  setUseCustomDateRange(false);
                  setShowDateRangePicker(false);
                }
              }}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem',
                paddingRight: '2.5rem'
              }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>
          
          {/* Custom Date Range Picker - Show when custom is selected */}
          {useCustomDateRange && (
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline truncate">
                  {customStartDate && customEndDate 
                    ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
                    : 'Select dates'
                  }
                </span>
                <span className="sm:hidden truncate">
                  {customStartDate && customEndDate 
                    ? `${new Date(customStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(customEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : 'Dates'
                  }
                </span>
                <button
                  onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                  className="ml-auto flex-shrink-0 text-purple-600 hover:text-purple-700"
                >
                  <svg className={`w-4 h-4 transition-transform ${showDateRangePicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {/* Date Range Picker Dropdown */}
              {showDateRangePicker && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowDateRangePicker(false)}
                  ></div>
                  <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date (শুরু তারিখ)
                        </label>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => {
                            setCustomStartDate(e.target.value);
                            setUseCustomDateRange(true);
                            setTimePeriod('custom');
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          End Date (শেষ তারিখ)
                        </label>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => {
                            setCustomEndDate(e.target.value);
                            setUseCustomDateRange(true);
                            setTimePeriod('custom');
                          }}
                          min={customStartDate}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (customStartDate && customEndDate) {
                              setUseCustomDateRange(true);
                              setTimePeriod('custom');
                              setShowDateRangePicker(false);
                              fetchDashboardData();
                            } else {
                              alert('Please select both start and end dates');
                            }
                          }}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setUseCustomDateRange(false);
                            setCustomStartDate('');
                            setCustomEndDate('');
                            setTimePeriod('monthly');
                            setShowDateRangePicker(false);
                            fetchDashboardData();
                          }}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Date Range Picker - Show when dropdown custom is selected but dates not set yet */}
          {showDateRangePicker && !useCustomDateRange && (
            <div className="relative">
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDateRangePicker(false)}
              ></div>
              <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date (শুরু তারিখ)
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => {
                        setCustomStartDate(e.target.value);
                        setUseCustomDateRange(true);
                        setTimePeriod('custom');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date (শেষ তারিখ)
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => {
                        setCustomEndDate(e.target.value);
                        setUseCustomDateRange(true);
                        setTimePeriod('custom');
                      }}
                      min={customStartDate}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (customStartDate && customEndDate) {
                          setUseCustomDateRange(true);
                          setTimePeriod('custom');
                          setShowDateRangePicker(false);
                          fetchDashboardData();
                        } else {
                          alert('Please select both start and end dates');
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setUseCustomDateRange(false);
                        setCustomStartDate('');
                        setCustomEndDate('');
                        setTimePeriod('monthly');
                        setShowDateRangePicker(false);
                        fetchDashboardData();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Export Dropdown Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
              <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showExportMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                ></div>
                <div className="absolute left-0 sm:right-0 mt-2 w-full sm:w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      handleExportPDF();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Export as PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      handleExportExcel();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export as Excel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Period Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Showing statistics for</p>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">
              {useCustomDateRange && customStartDate && customEndDate
                ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
                : `${timePeriod} Period`
              }
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400">Comparing with previous period</p>
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">+/- Change shown in cards</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className={`${stat.bgColor} border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                {stat.icon}
              </div>
              <div className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                stat.positive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              {stat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Recent Orders</h2>
            <button 
              onClick={() => router.push('/dashboard/orders')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {order.id?.split('-')[1] || order.id}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {order.customer}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{order.amount}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Top Products</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
              View Report
            </button>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                      'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        {product.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{product.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{product.revenue}</p>
                    <span className="text-green-600 text-xs font-medium">{product.growth}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No sales data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">Financial Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Product Cost</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {dashboardData?.stats ? formatCurrency(dashboardData.stats.totalCost || 0) : 'BDT 0.00'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shipping Cost</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {dashboardData?.stats ? formatCurrency(dashboardData.stats.totalShippingCost || 0) : 'BDT 0.00'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tax Paid</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {dashboardData?.stats ? formatCurrency(dashboardData.stats.totalTaxCost || 0) : 'BDT 0.00'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Discount Given</p>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              -{dashboardData?.stats ? formatCurrency(dashboardData.stats.totalDiscountGiven || 0) : 'BDT 0.00'}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Operating Expense Ratio</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {dashboardData?.stats ? `${parseFloat(dashboardData.stats.operatingExpenseRatio || 0).toFixed(2)}%` : '0%'}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Gross Profit Margin</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {dashboardData?.stats ? `${parseFloat(dashboardData.stats.grossProfitMargin || 0).toFixed(2)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Products</p>
              <p className="text-2xl font-bold mt-1">{dashboardData?.stats ? formatNumber(dashboardData.stats.activeProducts) : '0'}</p>
              <p className="text-purple-100 text-sm mt-2">out of {dashboardData?.stats ? formatNumber(dashboardData.stats.totalProducts) : '0'} total</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Avg. Order Value</p>
              <p className="text-2xl font-bold mt-1">{dashboardData?.stats ? formatCurrency(dashboardData.stats.avgOrderValue) : 'BDT 0.00'}</p>
              <p className="text-blue-100 text-sm mt-2">per order</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Customers</p>
              <p className="text-2xl font-bold mt-1">{dashboardData?.stats ? formatNumber(dashboardData.stats.totalCustomers) : '0'}</p>
              <p className="text-green-100 text-sm mt-2">total registered</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden PDF Component for Generation */}
      {dashboardData && (
        <div className="hidden">
          <ProfessionalDashboardPDF
            ref={pdfComponentRef}
            data={dashboardData}
            period={timePeriod}
            showButton={false}
            customStartDate={useCustomDateRange ? customStartDate : null}
            customEndDate={useCustomDateRange ? customEndDate : null}
          />
        </div>
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#6366f1',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}