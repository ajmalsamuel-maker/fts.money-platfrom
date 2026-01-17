import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

export default function InvoiceGeneratorWidget({ merchantData, transactions }) {
  const [formData, setFormData] = useState({
    invoiceType: 'settlement',
    period: 'month',
    format: 'pdf',
  });

  const handleGenerateInvoice = async () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('Invoice', 20, 20);
    
    // Merchant info
    doc.setFontSize(10);
    doc.text(`Merchant: ${merchantData?.business_name || 'N/A'}`, 20, 35);
    doc.text(`Invoice Type: ${formData.invoiceType}`, 20, 42);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 49);
    
    // Transaction summary
    const totalAmount = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    doc.text(`Total Amount: $${totalAmount.toFixed(2)}`, 20, 65);
    doc.text(`Transaction Count: ${transactions?.length || 0}`, 20, 72);
    
    // Footer
    doc.setFontSize(8);
    doc.text('This is an automated invoice. Please keep for your records.', 20, 270);
    
    // Download
    doc.save(`invoice-${Date.now()}.pdf`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Invoice Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={formData.invoiceType} onValueChange={(value) => setFormData({...formData, invoiceType: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Invoice Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="settlement">Settlement</SelectItem>
              <SelectItem value="transaction">Transaction</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={formData.period} onValueChange={(value) => setFormData({...formData, period: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerateInvoice} className="w-full gap-2">
          <Download className="w-4 h-4" />
          Generate & Download Invoice
        </Button>
      </CardContent>
    </Card>
  );
}