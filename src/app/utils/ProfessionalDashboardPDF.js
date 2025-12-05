import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ProfessionalDashboardPDF = forwardRef(({ data, period = 'monthly', showButton = false, customStartDate, customEndDate }, ref) => {
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

  const getPeriodLabel = (period) => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate).toLocaleDateString();
      const end = new Date(customEndDate).toLocaleDateString();
      return `Custom (${start} - ${end})`;
    }
    const periodMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    };
    return periodMap[period] || 'Monthly';
  };

  const generatePDF = async () => {
    setLoading(true);
    setProgress(0);

    try {
      setProgress(10);

      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 794px;
        height: auto;
        background: white;
        z-index: 9999;
        padding: 40px;
        box-sizing: border-box;
        overflow: hidden;
        visibility: hidden;
      `;

      // Clone the PDF content
      const contentClone = pdfRef.current.cloneNode(true);
      
      // Remove the original styles that hide the content
      contentClone.style.cssText = `
        position: static;
        left: auto;
        top: auto;
        visibility: visible;
        opacity: 1;
        z-index: auto;
        display: block;
        width: 794px;
        height: auto;
      `;

      // Append cloned content to temp container
      tempContainer.appendChild(contentClone);
      document.body.appendChild(tempContainer);

      setProgress(30);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Ensure fonts are loaded
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      setProgress(50);

      // Generate canvas from the cloned content
      const canvas = await html2canvas(contentClone, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        height: contentClone.scrollHeight,
        windowWidth: 794,
        windowHeight: contentClone.scrollHeight,
        removeContainer: true,
        foreignObjectRendering: false,
      });

      setProgress(70);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      // Add header to PDF
      const addHeader = (pdf, pageNum, totalPages) => {
        pdf.setFillColor(79, 70, 229);
        pdf.rect(0, 0, pdfWidth, 25, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('LOOKLIFY', pdfWidth / 2, 15, { align: 'center' });
        
        pdf.setFontSize(10);
        pdf.text('Premium Skin Care Analytics Report', pdfWidth / 2, 22, { align: 'center' });
      };

      // Add footer to PDF
      const addFooter = (pdf, pageNum, totalPages) => {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        
        const footerY = pdfHeight - 10;
        
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, footerY);
        pdf.text(`Page ${pageNum} of ${totalPages}`, pdfWidth / 2, footerY, { align: 'center' });
        pdf.text(`© ${new Date().getFullYear()} LOOKLIFY`, pdfWidth - margin, footerY, { align: 'right' });
      };

      // Calculate dimensions for content - Fit everything in one page
      const imgData = canvas.toDataURL('image/png', 1.0);
      const headerHeight = 25;
      const footerHeight = 15;
      const availableHeight = pdfHeight - headerHeight - footerHeight - (margin * 2);
      
      // Calculate scale to fit content in one page
      const originalWidth = canvas.width;
      const originalHeight = canvas.height;
      const targetWidth = pdfWidth - (margin * 2);
      const targetHeight = availableHeight;
      
      // Calculate scale factor to fit content
      const widthScale = targetWidth / originalWidth;
      const heightScale = targetHeight / originalHeight;
      const scale = Math.min(widthScale, heightScale);
      
      const scaledWidth = originalWidth * scale;
      const scaledHeight = originalHeight * scale;
      
      // Center the content vertically if it's smaller than available space
      const yPos = margin + headerHeight + (availableHeight - scaledHeight) / 2;

      // Add header
      addHeader(pdf, 1, 1);

      // Add image to PDF - Single page
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        yPos,
        scaledWidth,
        scaledHeight
      );

      // Add footer
      addFooter(pdf, 1, 1);

      setProgress(90);

      // Save the PDF
      pdf.save(`looklify-dashboard-${getPeriodLabel(period).toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);

      setProgress(100);

      // Clean up
      document.body.removeChild(tempContainer);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message || 'Unknown error'}. Please try again.`);
    } finally {
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
  

  return (
    <div className="relative">
      {/* Progress Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating PDF Report</h3>
              <p className="text-gray-600 mb-6">Please wait while we prepare your professional report...</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    background: 'linear-gradient(to right, #6366F1, #9333EA)',
                  }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">{progress}% Complete</p>
            </div>
          </div>
        </div>
      )}

      {/* Download Button */}
      {showButton && (
        <div className="flex justify-end mb-6">
          <button
            onClick={generatePDF}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download Professional Report
              </>
            )}
          </button>
        </div>
      )}

      {/* PDF Content - Hidden but accessible for cloning */}
      <div 
        ref={pdfRef}
        className="bg-white hidden"
        style={{ 
          width: '794px',
          padding: '50px 40px 40px 40px',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Header */}
        <div style={{ marginTop: '10px', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '12px', paddingTop: '10px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 6px 0', color: '#000' }}>LOOKLIFY</h1>
          <p style={{ fontSize: '13px', margin: '0 0 10px 0', color: '#666' }}>Dashboard Report - {getPeriodLabel(period)}</p>
          <p style={{ fontSize: '11px', margin: 0, color: '#666' }}>
            Generated: {new Date().toLocaleDateString()} | By: {data?.generatedBy || 'Admin'}
          </p>
        </div>

        {/* Key Stats */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Summary</h2>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 5px 0' }}>Total Revenue</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(stats.totalRevenue)}</p>
              <p style={{ fontSize: '10px', color: '#22c55e', margin: '5px 0 0 0' }}>
                +{Math.abs(parseFloat(stats.revenueChange) || 0).toFixed(1)}%
              </p>
            </div>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 5px 0' }}>Total Orders</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatNumber(stats.totalOrders)}</p>
              <p style={{ fontSize: '10px', color: '#22c55e', margin: '5px 0 0 0' }}>
                +{Math.abs(parseFloat(stats.ordersChange) || 0).toFixed(1)}%
              </p>
            </div>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 5px 0' }}>Net Profit</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(stats.totalProfit)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: '5px 0 0 0' }}>
                Margin: {formatPercentage(stats.profitMargin)}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Key Metrics</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>Customers</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatNumber(stats.totalCustomers)}</p>
            </div>
            <div style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>Avg Order Value</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatCurrency(stats.avgOrderValue)}</p>
            </div>
            <div style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>Conversion Rate</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatPercentage(stats.conversionRate)}</p>
            </div>
            <div style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <p style={{ fontSize: '10px', color: '#666', margin: '0 0 5px 0' }}>ROI</p>
              <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>{formatPercentage(stats.roi)}</p>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Financial Breakdown</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Revenue & Costs</h3>
              <div style={{ fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>Gross Revenue</span>
                  <span style={{ fontWeight: 'bold' }}>{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#dc2626' }}>
                  <span>Product Cost</span>
                  <span>-{formatCurrency(stats.totalCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#dc2626' }}>
                  <span>Operating Cost</span>
                  <span>-{formatCurrency((parseFloat(stats.totalOperatingCost) || 0) - (parseFloat(stats.totalCost) || 0))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #ddd', fontWeight: 'bold', color: '#16a34a' }}>
                  <span>Net Profit</span>
                  <span>{formatCurrency(stats.totalProfit)}</span>
                </div>
                <p style={{ fontSize: '10px', color: '#666', margin: '5px 0 0 0' }}>
                  Margin: {formatPercentage(stats.profitMargin)}
                </p>
              </div>
            </div>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Cost Details</h3>
              <div style={{ fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>Product Cost</span>
                  <span>{formatCurrency(stats.totalCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>Shipping Cost</span>
                  <span>{formatCurrency(stats.totalShippingCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>Tax Cost</span>
                  <span>{formatCurrency(stats.totalTaxCost)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span>Discounts</span>
                  <span>{formatCurrency(stats.totalDiscountGiven)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Status */}
        <div style={{ marginBottom: '25px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Inventory Status</h2>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>Active Products</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{formatNumber(stats.activeProducts)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>of {formatNumber(stats.totalProducts)} total</p>
            </div>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>Low Stock</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{formatNumber(stats.lowStock)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Below threshold</p>
            </div>
            <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '4px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>Out of Stock</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{formatNumber(stats.outOfStock)}</p>
              <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>Needs restocking</p>
            </div>
          </div>
        </div>


        {/* Footer */}
        <div style={{ 
          paddingTop: '12px', 
          borderTop: '1px solid #ddd', 
          textAlign: 'center', 
          fontSize: '10px', 
          color: '#666'
        }}>
          <p style={{ margin: '4px 0' }}>Generated by LOOKLIFY Dashboard</p>
          <p style={{ margin: '4px 0' }}>© {new Date().getFullYear()} LOOKLIFY</p>
        </div>
      </div>
    </div>
  );
});

ProfessionalDashboardPDF.displayName = 'ProfessionalDashboardPDF';

export default ProfessionalDashboardPDF;