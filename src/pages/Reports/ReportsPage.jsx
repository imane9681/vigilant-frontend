// frontend/src/pages/Reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  FileText, Download, Calendar, Share2, Eye, BarChart3,
  TrendingUp, Users, ShoppingBag, DollarSign, Package, Plus,
  Clock, Grid, List, Filter, AlertCircle, CheckCircle, X,
  ChevronDown, RefreshCw, Trash2, Database, FileSpreadsheet, FileJson,
  Zap, Target, PieChart, Layers
} from 'lucide-react';
import { FaArrowRightLong } from "react-icons/fa6";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import MetricCard from '../Dashboard/components/MetricCard';
import IconWrapper from './../../components/ui/IconWrapper';
import FilterControls from '../../components/ui/FilterControls';
import { reportsService, orderService, productService, customerService } from '../../services/api';


const ReportsPage = ({ darkMode }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [liveData, setLiveData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStock: 0,
    orders: [],
  products: [],
  customers: []
  });
  const [reportConfig, setReportConfig] = useState({
    type: 'sales',
    dateRange: 'month',
    startDate: '',
    endDate: ''
  });

  // الألوان الأصلية
  const colors = {
    primary: '#8B7ABA',
    secondary: '#F08FAE',
    accent: '#EE9C6C',
    success: '#34D19C'
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  
const fetchAllData = async () => {
  try {
    setLoading(true);
    
    // جلب جميع البيانات بالتوازي
    const [reportsRes, ordersRes, productsRes, customersRes] = await Promise.all([
      reportsService.getAll(),
      orderService.getAll(),
      productService.getAll(),
      customerService.getAll()
    ]);
    
    const reportsData = reportsRes.data.results || reportsRes.data;
    const orders = ordersRes.data.results || ordersRes.data;
    const products = productsRes.data.results || productsRes.data;
    const customers = customersRes.data.results || customersRes.data;
    
    // تحديث liveData بالبيانات الكاملة والإحصائيات
    setLiveData({
      totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCustomers: customers.length,
      lowStock: products.filter(p => p.quantity <= 10 && p.quantity > 0).length,
      orders: orders,
      products: products,
      customers: customers
    });
    
    // إضافة ملخص لكل تقرير
    const reportsWithSummary = reportsData.map(report => ({
      ...report,
      summary: getReportSummary(report.type, {
        totalRevenue: orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        lowStock: products.filter(p => p.quantity <= 10 && p.quantity > 0).length
      })
    }));
    
    setReports(reportsWithSummary);
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to load reports');
  } finally {
    setLoading(false);
  }
};

  const getReportSummary = (type, data) => {
    const summaries = {
      sales: [
        { label: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: colors.success },
        { label: 'Total Orders', value: data.totalOrders.toLocaleString(), icon: ShoppingBag, color: colors.primary },
        { label: 'Avg Order', value: `$${(data.totalRevenue / (data.totalOrders || 1)).toFixed(2)}`, icon: TrendingUp, color: colors.accent }
      ],
      inventory: [
        { label: 'Total Products', value: data.totalProducts.toLocaleString(), icon: Package, color: colors.primary },
        { label: 'Low Stock', value: data.lowStock.toLocaleString(), icon: AlertCircle, color: colors.accent },
        { label: 'In Stock', value: (data.totalProducts - data.lowStock).toLocaleString(), icon: CheckCircle, color: colors.success }
      ],
      customer: [
        { label: 'Total Customers', value: data.totalCustomers.toLocaleString(), icon: Users, color: colors.primary },
        { label: 'Total Orders', value: data.totalOrders.toLocaleString(), icon: ShoppingBag, color: colors.accent },
        { label: 'Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: colors.success }
      ],
      financial: [
        { label: 'Total Revenue', value: `$${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: colors.success },
        { label: 'Total Orders', value: data.totalOrders.toLocaleString(), icon: ShoppingBag, color: colors.primary },
        { label: 'Customers', value: data.totalCustomers.toLocaleString(), icon: Users, color: colors.accent }
      ],
      product: [
        { label: 'Total Products', value: data.totalProducts.toLocaleString(), icon: Package, color: colors.primary },
        { label: 'Total Value', value: `$${(data.totalRevenue).toLocaleString()}`, icon: DollarSign, color: colors.success },
        { label: 'Categories', value: '8', icon: Layers, color: colors.accent }
      ]
    };
    return summaries[type] || summaries.sales;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

const handleDownload = async (report, format) => {
    

  setDownloading(report.id);
  setOpenDropdown(null);
  
  try {
    if (format === 'csv') {
      const response = await reportsService.download(report.id, 'csv');
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title.toLowerCase().replace(/ /g, '_')}_${report.created_at?.split('T')[0] || Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

       await reportsService.incrementDownload(report.id);

    } 
else if (format === 'pdf') {
  const doc = new jsPDF({ orientation: 'landscape' });
  
  // عنوان التقرير
  doc.setFontSize(16);
  doc.setTextColor(139, 122, 186);
  doc.text(report.title, 14, 20);
  
  // معلومات التقرير
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Report Type: ${report.type?.toUpperCase()}`, 14, 36);
  
  let yPos = 50;
  
  // ========== القسم 1: الملخص ==========
  if (report.summary && report.summary.length > 0) {
    doc.setFontSize(11);
    doc.setTextColor(139, 122, 186);
    doc.text('Report Summary', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    for (let i = 0; i < report.summary.length; i++) {
      const item = report.summary[i];
      const col = i % 3;
      const xPos = 14 + (col * 60);
      if (col === 0 && i > 0) yPos += 12;
      doc.text(`${item.label}: ${item.value}`, xPos, yPos);
    }
    yPos += 15;
  }
  
  // ========== القسم 2: البيانات الكاملة ==========
  let headers = [];
  let pdfData = [];
  
  if (report.type === 'sales') {
    headers = ['Order ID', 'Customer', 'Amount', 'Status', 'Date'];
    pdfData = liveData.orders?.slice(0, 50).map(o => [
      o.order_number || `ORD-${o.id}`,
      o.customer_name || o.customer?.name || 'N/A',
      `$${parseFloat(o.total_amount || 0).toLocaleString()}`,
      o.status || 'pending',
      new Date(o.created_at).toLocaleDateString()
    ]) || [];
    doc.text('Order Details', 14, yPos);
  } 
  else if (report.type === 'inventory') {
    headers = ['Product Name', 'Category', 'Price', 'Stock', 'Status'];
    pdfData = liveData.products?.map(p => [
      p.name,
      p.category || 'Uncategorized',
      `$${parseFloat(p.price || 0).toLocaleString()}`,
      p.quantity || 0,
      p.quantity === 0 ? 'Out of Stock' : p.quantity <= 10 ? 'Low Stock' : 'In Stock'
    ]) || [];
    doc.text('Product Details', 14, yPos);
  } 
  else if (report.type === 'customer') {
    headers = ['Name', 'Email', 'Phone', 'Orders', 'Spent'];
    pdfData = liveData.customers?.map(c => [
      c.name,
      c.email,
      c.phone || 'N/A',
      c.total_orders || 0,
      `$${parseFloat(c.total_spent || 0).toLocaleString()}`
    ]) || [];
    doc.text('Customer Details', 14, yPos);
  } 
  else {
    headers = ['Product Name', 'Category', 'Price', 'Stock', 'Status'];
    pdfData = liveData.products?.map(p => [
      p.name,
      p.category || 'Uncategorized',
      `$${parseFloat(p.price || 0).toLocaleString()}`,
      p.quantity || 0,
      p.quantity === 0 ? 'Out of Stock' : p.quantity <= 10 ? 'Low Stock' : 'In Stock'
    ]) || [];
    doc.text('Details', 14, yPos);
  }
  
  yPos += 10;
  
  if (pdfData.length > 0) {
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(139, 122, 186);
    let xPos = 14;
    const colWidths = [30, 40, 25, 20, 25];
    
    for (let i = 0; i < headers.length; i++) {
      doc.rect(xPos, yPos, colWidths[i], 8, 'F');
      doc.text(headers[i], xPos + 2, yPos + 5);
      xPos += colWidths[i];
    }
    
    let tableY = yPos + 8;
    doc.setTextColor(0, 0, 0);
    
    for (let row of pdfData.slice(0, 30)) {
      if (tableY > 250) {
        doc.addPage();
        tableY = 20;
        xPos = 14;
        doc.setFillColor(139, 122, 186);
        for (let i = 0; i < headers.length; i++) {
          doc.rect(xPos, tableY, colWidths[i], 8, 'F');
          doc.text(headers[i], xPos + 2, tableY + 5);
          xPos += colWidths[i];
        }
        tableY += 8;
      }
      xPos = 14;
      for (let i = 0; i < row.length; i++) {
        const text = String(row[i] || '');
        doc.text(text.substring(0, 25), xPos + 2, tableY + 4);
        xPos += colWidths[i];
      }
      tableY += 8;
    }
  } else {
    doc.text('No data available for this report', 14, yPos);
  }
  
  doc.save(`${report.title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        await reportsService.incrementDownload(report.id);

}
  else if (format === 'excel') {
      const response = await reportsService.download(report.id, 'csv');
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.ms-excel' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.title.toLowerCase().replace(/ /g, '_')}_${report.created_at?.split('T')[0] || Date.now()}.xls`);
      document.body.appendChild(link); 
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
            await reportsService.incrementDownload(report.id);

    }

        await fetchAllData();

    
  } catch (err) {
    console.error('Error downloading report:', err);
    alert('Failed to download report');
  } finally {
    setDownloading(null);
  }
};
  const handleDelete = async () => {
    if (!selectedReport) return;
    try {
      await reportsService.delete(selectedReport.id);
      await fetchAllData();
      setShowDeleteConfirm(false);
      setSelectedReport(null);
    } catch (err) {
      console.error('Error deleting report:', err);
      alert('Failed to delete report');
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const data = {
        type: reportConfig.type,
        date_range: reportConfig.dateRange,
        start_date: reportConfig.dateRange === 'custom' ? reportConfig.startDate : null,
        end_date: reportConfig.dateRange === 'custom' ? reportConfig.endDate : null
      };
      
      await reportsService.generate(data);
      await fetchAllData();
      setShowGenerateModal(false);
      setReportConfig({ type: 'sales', dateRange: 'month', startDate: '', endDate: '' });
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const getReportColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'sales': return { bg: 'bg-[#F08FAE]/10', iconBg: 'bg-[#F08FAE]/10', text: 'text-[#F08FAE]', icon: DollarSign };
      case 'customer': return { bg: 'bg-[#34D19C]/10', iconBg: 'bg-[#34D19C]/10', text: 'text-[#34D19C]', icon: Users };
      case 'inventory': return { bg: 'bg-[#8B7ABA]/10', iconBg: 'bg-[#8B7ABA]/10', text: 'text-[#8B7ABA]', icon: Package };
      case 'financial': return { bg: 'bg-[#8B7ABA]/10', iconBg: 'bg-[#8B7ABA]/10', text: 'text-[#8B7ABA]', icon: DollarSign };
      case 'product': return { bg: 'bg-[#F08FAE]/10', iconBg: 'bg-[#F08FAE]/10', text: 'text-[#F08FAE]', icon: ShoppingBag };
      case 'marketing': return { bg: 'bg-[#EE9C6C]/10', iconBg: 'bg-[#EE9C6C]/10', text: 'text-[#EE9C6C]', icon: TrendingUp };
      default: return { bg: 'bg-neutral-100', iconBg: 'bg-neutral-100', text: 'text-neutral-600', icon: FileText };
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter !== 'all' && report.type?.toLowerCase() !== filter.toLowerCase()) return false;
    if (searchTerm && !report.title?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const statsData = {
    total: reports.length,
    totalDownloads: reports.reduce((sum, r) => sum + (r.download_count || 0), 0),
    totalSize: reports.reduce((sum, r) => sum + (r.file_size || 0), 0),
    recentCount: reports.filter(r => {
      const created = new Date(r.created_at);
      const now = new Date();
      const diffDays = (now - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length
  };

  if (loading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (<div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (<div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse"></div>))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-8 text-center ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button onClick={fetchAllData} className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  return (
    <div className="space-y-7 mt-2 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Reports" value={statsData.total} icon={<FileText size={20} />} subtitle="All generated reports" variant="success" darkMode={darkMode} lightBgOpacity={0.6} />
        <MetricCard title="Total Downloads" value={statsData.totalDownloads} icon={<Download size={20} />} subtitle="Times downloaded" variant="primary" darkMode={darkMode} lightBgOpacity={0.6} />
        <MetricCard title="Storage Used" value={formatFileSize(statsData.totalSize)} icon={<Database size={20} />} subtitle="Total file size" variant="secondary" darkMode={darkMode} />
        <MetricCard title="Last 7 Days" value={statsData.recentCount} icon={<Calendar size={20} />} subtitle="New reports this week" variant="warning" darkMode={darkMode} />
      </div>

      {/* Filters Section */}
      <FilterControls
        darkMode={darkMode}
        title="Reports Library"
        description="View, download and manage your generated reports"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Search reports by title..."
        filters={[{
          value: filter, onChange: setFilter, defaultValue: 'all', defaultLabel: 'All Report Types', icon: 'type',
          options: [
            { value: 'all', label: 'All Report Types', icon: <FileText size={14} /> },
            { value: 'sales', label: 'Sales Reports', icon: <DollarSign size={14} className="text-green-500" /> },
            { value: 'inventory', label: 'Inventory Reports', icon: <Package size={14} className="text-purple-500" /> },
            { value: 'customer', label: 'Customer Reports', icon: <Users size={14} className="text-blue-500" /> },
            { value: 'financial', label: 'Financial Reports', icon: <BarChart3 size={14} className="text-red-500" /> },
            { value: 'product', label: 'Product Reports', icon: <ShoppingBag size={14} className="text-pink-500" /> },
            { value: 'marketing', label: 'Marketing Reports', icon: <TrendingUp size={14} className="text-orange-500" /> }
          ]
        }]}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actionButton={{ show: true, text: "Generate Report", icon: <Plus size={18} />, onClick: () => setShowGenerateModal(true) }}
        extraButtons={[{ text: "Refresh", icon: <RefreshCw size={16} />, onClick: fetchAllData }]}
        filteredCount={filteredReports.length}
        totalCount={reports.length}
        onReset={() => { setSearchTerm(''); setFilter('all'); }}
      />

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl p-12 text-center bg-white dark:bg-neutral-800 shadow-lg border border-neutral-100 dark:border-neutral-700">
          <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at 20% 50%, ${colors.primary} 0%, transparent 50%)` }} />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#8B7ABA]/20 to-[#F08FAE]/20 flex items-center justify-center">
              <FileText size={32} style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No reports found</h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">No reports available. Click "Generate Report" to create one.</p>
            <button onClick={() => setShowGenerateModal(true)} className="px-6 py-2.5 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
              <Plus size={18} className="inline mr-2" /> Generate Report
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const reportColors = getReportColor(report.type);
            const ReportIcon = reportColors.icon;
            const isDownloading = downloading === report.id;
            const isDropdownOpen = openDropdown === report.id;
            const summaryItems = report.summary || [];
            
            return (
              <div key={report.id} className="group relative rounded-2xl bg-white dark:bg-neutral-800 shadow-sm hover:shadow-xl border border-neutral-200/60 dark:border-neutral-700/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
                <div className={`h-1.5 w-full ${reportColors.bg.replace('bg-', 'bg-').replace('/10', '')}`} />
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2.5 rounded-xl ${reportColors.iconBg}`}><ReportIcon size={20} className={reportColors.text} /></div>
                      <span className={`text-sm font-semibold px-2.5 py-1 rounded-lg ${reportColors.text}`}>{report.type?.charAt(0).toUpperCase() + report.type?.slice(1)}</span>
                    </div>
                    <span className="text-xs text-neutral-400">{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-neutral-700 dark:text-white mb-3 truncate">{report.title}</h3>
                  
                  {/* Real-time Summary Cards */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {summaryItems.map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={idx} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-700/30 text-center">
                          <ItemIcon size={14} className="mx-auto mb-1" style={{ color: item.color }} />
                          <p className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{item.label}</p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    <div className="flex items-center gap-1"><Download size={12} /> {report.download_count || 0} downloads</div>
                    <div className="flex items-center gap-1"><FileText size={12} /> {report.size_display || formatFileSize(report.file_size)}</div>
                  </div>
                  
                  <div className="flex-1" />
                  
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-1">
                      {/* Download Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(isDropdownOpen ? null : report.id)}
                          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1"
                        >
                          {isDownloading ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                          <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-hidden min-w-[160px] z-10 border border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => handleDownload(report, 'csv')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 transition-colors">
                              <FileJson size={16} className="text-green-500" />
                              <span>CSV Format</span>
                            </button>
                            <button onClick={() => handleDownload(report, 'pdf')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 transition-colors">
                              <FileText size={16} className="text-red-500" />
                              <span>PDF Format</span>
                            </button>
                            <button onClick={() => handleDownload(report, 'excel')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3 transition-colors">
                              <FileSpreadsheet size={16} className="text-emerald-500" />
                              <span>Excel Format</span>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button onClick={() => {
                        setSelectedReport(report);
                        setShowPreviewModal(true);
                      }} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => { setSelectedReport(report); setShowDeleteConfirm(true); }} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-neutral-500 hover:text-red-500">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const reportColors = getReportColor(report.type);
            const ReportIcon = reportColors.icon;
            const isDownloading = downloading === report.id;
            const isDropdownOpen = openDropdown === report.id;
            
            return (
              <div key={report.id} className="group relative rounded-xl bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md border border-neutral-200/60 dark:border-neutral-700/60 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${reportColors.iconBg}`}><ReportIcon size={20} className={reportColors.text} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{report.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${reportColors.bg} ${reportColors.text}`}>{report.type}</span>
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Created: {new Date(report.created_at).toLocaleString()} • {report.download_count || 0} downloads • {report.size_display || formatFileSize(report.file_size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="relative">
                        <button onClick={() => setOpenDropdown(isDropdownOpen ? null : report.id)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1">
                          {isDownloading ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
                          <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-neutral-800 shadow-lg rounded-lg overflow-hidden min-w-[160px] z-10 border border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => handleDownload(report, 'csv')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3"><FileJson size={16} className="text-green-500" /><span>CSV</span></button>
                            <button onClick={() => handleDownload(report, 'pdf')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3"><FileText size={16} className="text-red-500" /><span>PDF</span></button>
                            <button onClick={() => handleDownload(report, 'excel')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-3"><FileSpreadsheet size={16} className="text-emerald-500" /><span>Excel</span></button>
                          </div>
                        )}
                      </div>
                      <button onClick={() => { setSelectedReport(report); setShowPreviewModal(true); }} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"><Eye size={18} /></button>
                      <button onClick={() => { setSelectedReport(report); setShowDeleteConfirm(true); }} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-100'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: `${colors.primary}15` }}>
                  <PieChart size={20} style={{ color: colors.primary }} />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>Generate Report</h2>
                  <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Create a new analytics report</p>
                </div>
              </div>
              <button onClick={() => setShowGenerateModal(false)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Report Type Selection */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Report Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'sales', label: 'Sales Report', icon: DollarSign, color: colors.success },
                    { value: 'inventory', label: 'Inventory', icon: Package, color: colors.primary },
                    { value: 'customer', label: 'Customers', icon: Users, color: colors.secondary },
                    { value: 'financial', label: 'Financial', icon: BarChart3, color: colors.accent },
                    { value: 'product', label: 'Products', icon: ShoppingBag, color: colors.primary },
                    { value: 'marketing', label: 'Marketing', icon: TrendingUp, color: colors.accent }
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = reportConfig.type === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setReportConfig({...reportConfig, type: option.value})}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${isSelected ? 'border-[#8B7ABA] bg-[#8B7ABA]/10' : darkMode ? 'border-neutral-700 hover:bg-neutral-700/50' : 'border-neutral-200 hover:bg-neutral-50'}`}
                      >
                        <Icon size={16} style={{ color: option.color }} />
                        <span className={`text-sm font-medium ${isSelected ? 'text-[#8B7ABA]' : ''}`}>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range Selection */}
              <div>
                <label className={`block text-xs font-semibold mb-2 uppercase tracking-wider ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Date Range</label>
                <div className="grid grid-cols-3 gap-2">
                  {['today', 'week', 'month', 'quarter', 'year', 'custom'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setReportConfig({...reportConfig, dateRange: range})}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${reportConfig.dateRange === range ? 'text-white' : darkMode ? 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                      style={reportConfig.dateRange === range ? { background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` } : {}}
                    >
                      {range === 'today' ? 'Today' : range === 'week' ? 'Week' : range === 'month' ? 'Month' : range === 'quarter' ? 'Quarter' : range === 'year' ? 'Year' : 'Custom'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              {reportConfig.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-700/30">
                  <div>
                    <label className={`block text-xs mb-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Start Date</label>
                    <input type="date" value={reportConfig.startDate} onChange={(e) => setReportConfig({...reportConfig, startDate: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`} />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>End Date</label>
                    <input type="date" value={reportConfig.endDate} onChange={(e) => setReportConfig({...reportConfig, endDate: e.target.value})} className={`w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-[#8B7ABA]/50 ${darkMode ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-white border-neutral-200'}`} />
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-3 p-5 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-100'}`}>
              <button onClick={() => setShowGenerateModal(false)} className="px-5 py-2 rounded-xl text-sm font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors">Cancel</button>
              <button onClick={handleGenerateReport} disabled={generating} className="px-6 py-2 rounded-xl text-sm text-white font-medium transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                {generating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                {generating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className={`flex items-center justify-between p-5 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-100'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl" style={{ background: `${colors.primary}15` }}><Eye size={20} style={{ color: colors.primary }} /></div>
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-neutral-800'}`}>{selectedReport.title}</h2>
                  <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>Report details and information</p>
                </div>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}><X size={18} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5">
              <div className={`space-y-4 ${darkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
                    <p className="text-xs text-neutral-500 mb-1">Report Type</p>
                    <p className="font-semibold capitalize">{selectedReport.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
                    <p className="text-xs text-neutral-500 mb-1">Generated</p>
                    <p className="font-semibold">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
                    <p className="text-xs text-neutral-500 mb-1">File Size</p>
                    <p className="font-semibold">{selectedReport.size_display || formatFileSize(selectedReport.file_size)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
                    <p className="text-xs text-neutral-500 mb-1">Downloads</p>
                    <p className="font-semibold">{selectedReport.download_count || 0}</p>
                  </div>
                </div>
                
                {/* Summary for selected report */}
                {selectedReport.summary && selectedReport.summary.length > 0 && (
                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-700/30">
                    <h3 className="text-sm font-semibold mb-2">Report Summary</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedReport.summary.map((item, idx) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={idx} className="text-center">
                            <ItemIcon size={16} className="mx-auto mb-1" style={{ color: item.color }} />
                            <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                            <p className="text-xs text-neutral-500">{item.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`flex justify-end gap-3 p-5 border-t ${darkMode ? 'border-neutral-700' : 'border-neutral-100'}`}>
              <button onClick={() => setShowPreviewModal(false)} className="px-5 py-2 rounded-xl text-sm font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600">Close</button>
              <button onClick={() => handleDownload(selectedReport, 'csv')} className="px-6 py-2 rounded-xl text-sm text-white font-medium transition-all hover:scale-105 flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                <Download size={16} /> Download Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><Trash2 size={28} className="text-red-500" /></div>
              <h3 className="text-xl font-bold mb-2">Delete Report</h3>
              <p className="text-neutral-500 mb-6">Are you sure you want to delete <span className="font-semibold">{selectedReport.title}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 rounded-lg font-medium bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600">Cancel</button>
                <button onClick={handleDelete} className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;