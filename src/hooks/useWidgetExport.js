// hooks/useWidgetExport.js
import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; 
import * as XLSX from 'xlsx';

export const useWidgetExport = ({ 
  widgetRef,
  fileName = 'export',
  darkMode = false 
}) => {
  const formatDataForExport = useCallback((data, format) => {
    if (format === 'csv' || format === 'excel') {
      if (Array.isArray(data)) {
        return data;
      }
      if (typeof data === 'object') {
        return Object.entries(data).map(([key, value]) => ({ key, value }));
      }
    }
    return data;
  }, []);

  const exportToPDF = useCallback(async (data, title = 'Report') => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Header
      doc.setFillColor(darkMode ? 30 : 249, darkMode ? 41 : 115, darkMode ? 59 : 22);
      doc.rect(0, 0, 297, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 148.5, 12, { align: 'center' });

      // Date
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 25);

      // Chart Image if ref exists
      if (widgetRef?.current) {
        const canvas = await html2canvas(widgetRef.current, {
          scale: 1.5,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 20, 30, 257, 120);
      }

      // Data Table
      if (data && Array.isArray(data)) {
        const tableColumn = Object.keys(data[0] || {});
        const tableRows = data.map(item => Object.values(item));

        doc.autoTable({
          startY: 160,
          head: [tableColumn],
          body: tableRows,
          theme: 'striped',
          headStyles: {
            fillColor: darkMode ? [59, 130, 246] : [249, 115, 22],
            textColor: 255
          }
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 280, 200, { align: 'right' });
      }

      doc.save(`${fileName}_${new Date().toISOString().slice(0,10)}.pdf`);
      return true;
    } catch (error) {
      console.error('PDF export failed:', error);
      return false;
    }
  }, [widgetRef, fileName, darkMode]);

  const exportToCSV = useCallback((data) => {
    try {
      const formattedData = formatDataForExport(data, 'csv');
      
      if (!formattedData || !formattedData.length) {
        throw new Error('No data to export');
      }

      const headers = Object.keys(formattedData[0]).join(',');
      const rows = formattedData.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${fileName}_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('CSV export failed:', error);
      return false;
    }
  }, [fileName, formatDataForExport]);

  const exportToExcel = useCallback((data) => {
    try {
      const formattedData = formatDataForExport(data, 'excel');
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Excel export failed:', error);
      return false;
    }
  }, [fileName, formatDataForExport]);

  const exportToImage = useCallback(async () => {
    if (!widgetRef?.current) return false;

    try {
      const canvas = await html2canvas(widgetRef.current, {
        scale: 2,
        backgroundColor: darkMode ? '#1f2937' : '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `${fileName}_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      return true;
    } catch (error) {
      console.error('Image export failed:', error);
      return false;
    }
  }, [widgetRef, fileName, darkMode]);

  return {
    exportToPDF,
    exportToCSV,
    exportToExcel,
    exportToImage
  };
};