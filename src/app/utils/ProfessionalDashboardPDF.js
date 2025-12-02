import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Download, Loader2, Calendar, BarChart3, TrendingUp, Package, Users, DollarSign, ShoppingCart, PieChart, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ProfessionalDashboardPDF = forwardRef(({ data, period = 'monthly', showButton = false }, ref) => {
  const pdfRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const formatCurrency = (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return `৳${new Intl.NumberFormat('en-US').format(Math.round(numAmount))}`;
  };

  const formatNumber = (num) => {
    const numValue = typeof num === 'number' ? num : parseFloat(num) || 0;
    return new Intl.NumberFormat('en-US').format(numValue);
  };

  const formatPercentage = (value) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    return `${numValue.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPeriodLabel = (period) => {
    const periodMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return periodMap[period] || 'Monthly';
  };

  const generatePDF = async () => {
    if (!pdfRef.current) {
      alert('PDF content not ready. Please try again.');
      return;
    }

    setLoading(true);
    setProgress(0);

    let originalStyles = null;
    let content = null;

    try {
      content = pdfRef.current;
      
      if (!content || !content.parentNode) {
        alert('PDF content element not found.');
        return;
      }

      // Store original styles only - DON'T MOVE THE ELEMENT
      originalStyles = {
        position: content.style.position || '',
        left: content.style.left || '',
        top: content.style.top || '',
        visibility: content.style.visibility || '',
        opacity: content.style.opacity || '',
        zIndex: content.style.zIndex || '',
        display: content.style.display || '',
        width: content.style.width || '',
        height: content.style.height || ''
      };

      // Just ensure content is visible and has proper dimensions - DON'T MOVE IT
      content.style.position = 'absolute';
      content.style.left = '-9999px';
      content.style.top = '0';
      content.style.visibility = 'visible';
      content.style.opacity = '1';
      content.style.zIndex = '-1';
      content.style.display = 'block';
      content.style.width = '794px';
      content.style.height = 'auto';

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force reflow
      void content.offsetHeight;

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      setProgress(20);

      // Create a clone of the content for PDF generation
      const contentClone = content.cloneNode(true);
      contentClone.setAttribute('data-pdf-clone', 'true');
      contentClone.style.position = 'static';
      contentClone.style.left = 'auto';
      contentClone.style.top = 'auto';
      contentClone.style.visibility = 'visible';
      contentClone.style.opacity = '1';
      contentClone.style.display = 'block';
      contentClone.style.width = '794px';
      contentClone.style.height = 'auto';
      
      // Create a temporary container for the clone - OFF SCREEN
      const cloneContainer = document.createElement('div');
      cloneContainer.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        visibility: visible;
        opacity: 1;
        z-index: -9999;
        pointer-events: none;
        overflow: hidden;
      `;
      
      cloneContainer.appendChild(contentClone);
      document.body.appendChild(cloneContainer);

      // Wait for clone to render
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate canvas from the clone
      let canvas;
      try {
        canvas = await html2canvas(contentClone, {
          scale: 1.5,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794,
          height: contentClone.scrollHeight || 1123,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          ignoreElements: (element) => {
            if (!element) return true;
            try {
              const style = window.getComputedStyle(element);
              return style.display === 'none' || style.visibility === 'hidden';
            } catch {
              return false;
            }
          },
        });
      } finally {
        // Always clean up the clone
        try {
          if (cloneContainer && cloneContainer.parentNode) {
            cloneContainer.parentNode.removeChild(cloneContainer);
          }
        } catch (e) {
          console.warn('Error removing clone container:', e);
        }
      }

      setProgress(60);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Helper function to add header
      const addHeader = (pdf, pageNum, totalPages) => {
        // Add background color
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        // Add company header
        pdf.setFillColor(79, 70, 229);
        pdf.rect(0, 0, pdfWidth, 25, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LOOKLIFY', pdfWidth / 2, 15, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.text('Premium Skin Care Analytics Report', pdfWidth / 2, 22, { align: 'center' });
      };

      // Helper function to add footer
      const addFooter = (pdf, pageNum, totalPages) => {
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        
        const footerY = pdfHeight - 8;
        
        // Left: Report Generated
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, footerY, { maxWidth: pdfWidth / 3 - 10 });
        
        // Center: Page number
        pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth / 2, footerY, { align: 'center', maxWidth: pdfWidth / 3 });
        
        // Right: Copyright
        pdf.text(`© ${new Date().getFullYear()} LOOKLIFY`, pdfWidth - 10, footerY, { align: 'right', maxWidth: pdfWidth / 3 - 10 });
      };

      setProgress(70);

      // Calculate dimensions
      const headerHeight = 30;
      const footerHeight = 15;
      const margins = 10;
      const availableHeight = pdfHeight - headerHeight - footerHeight - (margins * 2);
      
      // Calculate how many pages we need
      const totalContentHeight = imgHeight;
      const pagesNeeded = Math.ceil(totalContentHeight / availableHeight) || 1;
      
      setProgress(75);

      // Split content across pages
      for (let page = 1; page <= pagesNeeded; page++) {
        if (page > 1) {
          pdf.addPage();
        }

        // Add header
        addHeader(pdf, page, pagesNeeded);

        // Calculate the portion of image to show on this page
        const sourceY = (page - 1) * availableHeight;
        const remainingHeight = totalContentHeight - sourceY;
        const pageContentHeight = Math.min(availableHeight, remainingHeight);
        
        // For the full image approach (simpler)
        const scaleFactor = (imgWidth - (margins * 2)) / imgWidth;
        const scaledContentHeight = imgHeight * scaleFactor;
        const sourceYScaled = sourceY / scaleFactor;
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        const sourceHeightInCanvas = (pageContentHeight / scaleFactor);
        pageCanvas.height = sourceHeightInCanvas;
        const pageCtx = pageCanvas.getContext('2d');
        
        // Draw the slice of the image
        pageCtx.drawImage(
          canvas,
          0, sourceYScaled, canvas.width, sourceHeightInCanvas,
          0, 0, pageCanvas.width, pageCanvas.height
        );
        
        const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
        
        // Add content image for this page
        pdf.addImage(
          pageImgData,
          'PNG',
          margins,
          headerHeight + margins,
          imgWidth - (margins * 2),
          pageContentHeight
        );

        // Add footer
        addFooter(pdf, page, pagesNeeded);
      }

      setProgress(90);

      setProgress(95);

      // Save the PDF
      pdf.save(`looklify-dashboard-${getPeriodLabel(period).toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);

      setProgress(100);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
      // Restore original styles only - element never moved, so no DOM manipulation needed
      try {
        if (content && originalStyles) {
          // Simply restore the original styles
          Object.keys(originalStyles).forEach(key => {
            try {
              content.style[key] = originalStyles[key] || '';
            } catch (e) {
              // Ignore individual style errors
            }
          });
        }
      } catch (e) {
        // Silently handle any cleanup errors - PDF was already generated
        console.warn('Cleanup error (non-critical):', e);
      }
      
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };

  // Expose generatePDF method via ref
  useImperativeHandle(ref, () => ({
    generatePDF: generatePDF
  }));

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];

  return (
    <div className="relative" style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1 }}>
      {/* Progress Overlay - Always visible on top */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" style={{ left: 0, top: 0 }}>
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating PDF Report</h3>
              <p className="text-gray-600 mb-6">Please wait while we prepare your professional report...</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    background: 'linear-gradient(to right, #6366F1, #9333EA)',
                    backgroundColor: '#6366F1'
                  }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">{progress}% Complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Download Button - Only show if showButton prop is true */}
      {showButton && (
        <div className="flex justify-end mb-6">
          <button
            onClick={generatePDF}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{ backgroundColor: '#4F46E5' }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Download Professional Report
              </>
            )}
          </button>
        </div>
      )}

      {/* PDF Content - Positioned off-screen but visible for html2canvas */}
      <div 
        ref={pdfRef}
        data-pdf-content="true"
        className="bg-white"
        style={{ 
          width: '794px', // A4 width in pixels at 96 DPI
          padding: '40px',
          boxSizing: 'border-box',
          fontFamily: "'Arial', 'Helvetica', sans-serif",
          backgroundColor: '#ffffff',
          position: 'absolute',
          left: '-9999px',
          top: '0',
          visibility: 'visible',
          opacity: '1',
          zIndex: -1,
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#000000',
          display: 'block'
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: '25px', borderBottom: '2px solid #333', paddingBottom: '12px', pageBreakAfter: 'avoid' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#000' }}>LOOKLIFY</h1>
              <p style={{ fontSize: '13px', margin: 0, color: '#666' }}>Dashboard Report</p>
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {getPeriodLabel(period)} Report
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '8px' }}>
            <span>Generated: {formatDate(data?.generatedDate)}</span>
            <span>By: {data?.generatedBy || 'Admin'}</span>
          </div>
        </div>

        {/* Key Stats */}
        <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Summary</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 5px 0' }}>Total Revenue</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(stats.totalRevenue)}</p>
              <p style={{ fontSize: '10px', color: (parseFloat(stats.revenueChange) || 0) >= 0 ? '#22c55e' : '#ef4444', margin: '5px 0 0 0' }}>
                {(parseFloat(stats.revenueChange) || 0) >= 0 ? '+' : ''}{Math.abs(parseFloat(stats.revenueChange) || 0).toFixed(1)}%
              </p>
            </div>

            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 5px 0' }}>Total Orders</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatNumber(stats.totalOrders)}</p>
              <p style={{ fontSize: '10px', color: (parseFloat(stats.ordersChange) || 0) >= 0 ? '#22c55e' : '#ef4444', margin: '5px 0 0 0' }}>
                {(parseFloat(stats.ordersChange) || 0) >= 0 ? '+' : ''}{Math.abs(parseFloat(stats.ordersChange) || 0).toFixed(1)}%
              </p>
            </div>

            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 5px 0' }}>Net Profit</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(stats.totalProfit)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: '5px 0 0 0' }}>
                Margin: {formatPercentage(stats.profitMargin)}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Key Metrics</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>Customers</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatNumber(stats.totalCustomers)}</p>
            </div>

            <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>Avg Order Value</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(stats.avgOrderValue)}</p>
            </div>

            <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>Conversion Rate</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatPercentage(stats.conversionRate)}</p>
            </div>

            <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>ROI</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatPercentage(stats.roi)}</p>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Financial Breakdown</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Revenue & Costs</h3>
              <table style={{ width: '100%', fontSize: '11px' }}>
                <tr>
                  <td style={{ padding: '5px 0' }}>Gross Revenue</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '5px 0' }}>{formatCurrency(stats.totalRevenue)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0' }}>Product Cost</td>
                  <td style={{ textAlign: 'right', color: '#dc2626', padding: '5px 0' }}>-{formatCurrency(stats.totalCost)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0' }}>Operating Cost</td>
                  <td style={{ textAlign: 'right', color: '#dc2626', padding: '5px 0' }}>-{formatCurrency((parseFloat(stats.totalOperatingCost) || 0) - (parseFloat(stats.totalCost) || 0))}</td>
                </tr>
                <tr style={{ borderTop: '1px solid #ddd', marginTop: '10px' }}>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Net Profit</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#16a34a', padding: '8px 0' }}>{formatCurrency(stats.totalProfit)}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ padding: '5px 0', fontSize: '10px', color: '#666' }}>Margin: {formatPercentage(stats.profitMargin)}</td>
                </tr>
              </table>
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Cost Details</h3>
              <table style={{ width: '100%', fontSize: '11px' }}>
                <tr>
                  <td style={{ padding: '5px 0' }}>Product Cost</td>
                  <td style={{ textAlign: 'right', padding: '5px 0' }}>{formatCurrency(stats.totalCost)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0' }}>Shipping Cost</td>
                  <td style={{ textAlign: 'right', padding: '5px 0' }}>{formatCurrency(stats.totalShippingCost)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0' }}>Tax Cost</td>
                  <td style={{ textAlign: 'right', padding: '5px 0' }}>{formatCurrency(stats.totalTaxCost)}</td>
                </tr>
                <tr>
                  <td style={{ padding: '5px 0' }}>Discounts</td>
                  <td style={{ textAlign: 'right', padding: '5px 0' }}>{formatCurrency(stats.totalDiscountGiven)}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory Status */}
        <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Inventory Status</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>Active Products</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{formatNumber(stats.activeProducts)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>of {formatNumber(stats.totalProducts)} total</p>
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>Low Stock</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{formatNumber(stats.lowStock)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Below threshold</p>
            </div>

            <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>Out of Stock</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{formatNumber(stats.outOfStock)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Needs restocking</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Recent Orders</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.slice(0, 8).map((order, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>#{order.id}</td>
                  <td style={{ padding: '8px' }}>{order.customer}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{typeof order.amount === 'number' ? formatCurrency(order.amount) : order.amount || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{order.date}</td>
                  <td style={{ padding: '8px' }}>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>Top Products</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Product Name</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Units Sold</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.slice(0, 8).map((product, index) => {
                const revenue = typeof product.revenue === 'number' 
                  ? product.revenue 
                  : parseFloat(String(product.revenue || 0).replace(/[^\d.-]/g, '')) || 0;
                return (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{product.name || 'Unnamed Product'}</td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>{formatNumber(product.sales || 0)}</td>
                    <td style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>{formatCurrency(revenue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer - Ensure it fits in PDF */}
        <div style={{ 
          marginTop: '15px', 
          paddingTop: '8px', 
          paddingBottom: '8px',
          borderTop: '1px solid #ddd', 
          textAlign: 'center', 
          fontSize: '8px', 
          color: '#666',
          maxWidth: '100%',
          overflow: 'hidden',
          pageBreakInside: 'avoid'
        }}>
          <p style={{ margin: '2px 0', wordWrap: 'break-word' }}>Generated by LOOKLIFY Dashboard</p>
          <p style={{ margin: '2px 0', wordWrap: 'break-word' }}>© {new Date().getFullYear()} LOOKLIFY</p>
        </div>
      </div>
    </div>
  );
});

ProfessionalDashboardPDF.displayName = 'ProfessionalDashboardPDF';

export default ProfessionalDashboardPDF;