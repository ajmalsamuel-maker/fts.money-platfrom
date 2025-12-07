import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from 'lucide-react';

export default function InvoicePreview({ open, onOpenChange, template }) {
    const sampleInvoice = {
        invoice_number: 'INV-2024-001',
        issue_date: '2024-12-07',
        due_date: '2025-01-06',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_address: '123 Main St, City, State 12345',
        line_items: [
            { description: 'Professional Services', quantity: 10, unit_price: 150, tax_rate: 10 },
            { description: 'Software License', quantity: 1, unit_price: 500, tax_rate: 10 }
        ],
        subtotal: 2000,
        tax_amount: 200,
        total_amount: 2200,
        payment_terms: 'net_30'
    };

    const getLayoutClass = () => {
        switch (template?.layout_style) {
            case 'classic': return 'font-serif';
            case 'modern': return 'font-sans';
            case 'minimal': return 'font-light';
            case 'professional': return 'font-medium';
            default: return 'font-sans';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Invoice Preview</DialogTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div 
                    className={`bg-white p-8 border rounded-lg ${getLayoutClass()}`}
                    style={{ 
                        fontFamily: template?.branding?.font_family || 'Inter',
                        color: template?.branding?.secondary_color || '#64748b'
                    }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 pb-6 border-b-2" style={{ borderColor: template?.branding?.primary_color }}>
                        <div>
                            {template?.branding?.logo_url && template?.header?.show_logo && (
                                <img 
                                    src={template.branding.logo_url} 
                                    alt="Logo" 
                                    className="h-16 mb-4"
                                />
                            )}
                            {template?.header?.show_company_name && (
                                <h1 
                                    className="text-3xl font-bold mb-2"
                                    style={{ color: template?.branding?.primary_color }}
                                >
                                    {template?.branding?.company_name || 'Company Name'}
                                </h1>
                            )}
                            {template?.header?.custom_text && (
                                <p className="text-sm">{template.header.custom_text}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold mb-2" style={{ color: template?.branding?.primary_color }}>
                                INVOICE
                            </h2>
                            {template?.fields?.show_invoice_number && (
                                <p className="text-sm mb-1">
                                    <span className="font-semibold">Invoice #:</span> {sampleInvoice.invoice_number}
                                </p>
                            )}
                            {template?.fields?.show_issue_date && (
                                <p className="text-sm mb-1">
                                    <span className="font-semibold">Issue Date:</span> {sampleInvoice.issue_date}
                                </p>
                            )}
                            {template?.fields?.show_due_date && (
                                <p className="text-sm">
                                    <span className="font-semibold">Due Date:</span> {sampleInvoice.due_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-2" style={{ color: template?.branding?.primary_color }}>
                            Bill To:
                        </h3>
                        <p className="font-medium">{sampleInvoice.customer_name}</p>
                        <p className="text-sm">{sampleInvoice.customer_email}</p>
                        <p className="text-sm">{sampleInvoice.customer_address}</p>
                    </div>

                    {/* Line Items */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2" style={{ borderColor: template?.branding?.primary_color }}>
                                <th className="text-left py-3 px-2">Description</th>
                                <th className="text-right py-3 px-2">Qty</th>
                                <th className="text-right py-3 px-2">Price</th>
                                <th className="text-right py-3 px-2">Tax</th>
                                <th className="text-right py-3 px-2">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sampleInvoice.line_items.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="py-3 px-2">{item.description}</td>
                                    <td className="text-right py-3 px-2">{item.quantity}</td>
                                    <td className="text-right py-3 px-2">${item.unit_price}</td>
                                    <td className="text-right py-3 px-2">{item.tax_rate}%</td>
                                    <td className="text-right py-3 px-2 font-semibold">
                                        ${(item.quantity * item.unit_price * (1 + item.tax_rate / 100)).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64">
                            <div className="flex justify-between py-2 border-b">
                                <span>Subtotal:</span>
                                <span className="font-semibold">${sampleInvoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Tax:</span>
                                <span className="font-semibold">${sampleInvoice.tax_amount.toFixed(2)}</span>
                            </div>
                            <div 
                                className="flex justify-between py-3 text-lg font-bold"
                                style={{ color: template?.branding?.primary_color }}
                            >
                                <span>Total:</span>
                                <span>${sampleInvoice.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-6 space-y-4">
                        {template?.footer?.payment_instructions && (
                            <div>
                                <h4 className="font-semibold mb-2" style={{ color: template?.branding?.primary_color }}>
                                    Payment Instructions
                                </h4>
                                <p className="text-sm">{template.footer.payment_instructions}</p>
                            </div>
                        )}
                        
                        {template?.footer?.terms_and_conditions && (
                            <div>
                                <h4 className="font-semibold mb-2" style={{ color: template?.branding?.primary_color }}>
                                    Terms & Conditions
                                </h4>
                                <p className="text-sm">{template.footer.terms_and_conditions}</p>
                            </div>
                        )}

                        {template?.footer?.thank_you_message && (
                            <p className="text-center font-medium mt-6" style={{ color: template?.branding?.primary_color }}>
                                {template.footer.thank_you_message}
                            </p>
                        )}

                        {template?.footer?.contact_info && (
                            <p className="text-center text-sm mt-4">
                                {template.footer.contact_info}
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}