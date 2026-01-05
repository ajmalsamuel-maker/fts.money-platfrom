import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function VATInvoiceTemplate({ invoice, merchant, config }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(amount || 0);
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">INVOICE</h1>
                        <p className="text-lg text-slate-600 mt-1">{invoice.invoice_number}</p>
                    </div>
                    <div className="text-right">
                        {invoice.paid ? (
                            <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                PAID
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-sm px-3 py-1">UNPAID</Badge>
                        )}
                    </div>
                </div>

                {/* From/To Section */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold text-sm text-slate-500 uppercase mb-2">From</h3>
                        <p className="font-bold text-lg">{merchant?.business_name || invoice.merchant_name}</p>
                        {merchant?.address && <p className="text-sm text-slate-600">{merchant.address}</p>}
                        <p className="text-sm text-slate-600">{merchant?.country || invoice.merchant_country}</p>
                        {invoice.seller_tax_id && (
                            <p className="text-sm text-slate-600 mt-2">
                                <span className="font-medium">Tax ID:</span> {invoice.seller_tax_id}
                            </p>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm text-slate-500 uppercase mb-2">Bill To</h3>
                        <p className="font-bold text-lg">{invoice.customer_name || 'Customer'}</p>
                        <p className="text-sm text-slate-600">{invoice.customer_email}</p>
                        <p className="text-sm text-slate-600">{invoice.customer_country}</p>
                        {invoice.buyer_tax_id && (
                            <div className="text-sm text-slate-600 mt-2 flex items-center gap-2">
                                <span className="font-medium">Tax ID:</span> 
                                <span>{invoice.buyer_tax_id}</span>
                                {invoice.buyer_tax_id_validated && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-50 p-4 rounded-lg">
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Invoice Date</p>
                        <p className="font-medium">{formatDate(invoice.invoice_date)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Due Date</p>
                        <p className="font-medium">{formatDate(invoice.due_date)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase">Payment Date</p>
                        <p className="font-medium">{invoice.paid ? formatDate(invoice.payment_date) : '-'}</p>
                    </div>
                </div>

                {/* Reverse Charge Notice */}
                {invoice.reverse_charge_applied && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-900">VAT Reverse Charge Applied</p>
                                <p className="text-sm text-amber-800 mt-1">
                                    As a business customer with a valid VAT ID, you are responsible for 
                                    accounting for VAT in your jurisdiction under the reverse charge mechanism.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Line Items */}
                <div className="mb-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="text-left py-3 text-sm font-semibold text-slate-700">Description</th>
                                <th className="text-center py-3 text-sm font-semibold text-slate-700">Qty</th>
                                <th className="text-right py-3 text-sm font-semibold text-slate-700">Unit Price</th>
                                <th className="text-right py-3 text-sm font-semibold text-slate-700">VAT Rate</th>
                                <th className="text-right py-3 text-sm font-semibold text-slate-700">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.line_items?.map((item, idx) => (
                                <tr key={idx} className="border-b border-slate-100">
                                    <td className="py-3 text-sm">{item.description}</td>
                                    <td className="text-center py-3 text-sm">{item.quantity}</td>
                                    <td className="text-right py-3 text-sm">{formatCurrency(item.unit_price, invoice.currency)}</td>
                                    <td className="text-right py-3 text-sm">{item.vat_rate}%</td>
                                    <td className="text-right py-3 text-sm font-medium">{formatCurrency(item.total, invoice.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-80">
                        <div className="flex justify-between py-2">
                            <span className="text-slate-600">Subtotal:</span>
                            <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                        </div>
                        {invoice.vat_amount > 0 && !invoice.reverse_charge_applied && (
                            <div className="flex justify-between py-2 text-blue-600">
                                <span>VAT ({invoice.vat_rate}% - {invoice.vat_jurisdiction}):</span>
                                <span className="font-medium">{formatCurrency(invoice.vat_amount, invoice.currency)}</span>
                            </div>
                        )}
                        {invoice.reverse_charge_applied && (
                            <div className="flex justify-between py-2 text-amber-600">
                                <span>VAT ({invoice.vat_rate}% - Reverse Charge):</span>
                                <span className="font-medium">{formatCurrency(0, invoice.currency)}</span>
                            </div>
                        )}
                        <Separator className="my-2" />
                        <div className="flex justify-between py-2 text-lg font-bold">
                            <span>Total:</span>
                            <span>{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer - Tax Information */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                        <div>
                            {invoice.moss_oss_number && (
                                <p><strong>EU OSS/MOSS Number:</strong> {invoice.moss_oss_number}</p>
                            )}
                            <p><strong>Invoice Format:</strong> {invoice.invoice_format}</p>
                            {invoice.vat_jurisdiction && (
                                <p><strong>VAT Jurisdiction:</strong> {invoice.vat_jurisdiction}</p>
                            )}
                        </div>
                        <div>
                            <p><strong>Transaction ID:</strong> {invoice.transaction_id}</p>
                            {invoice.vat_category && (
                                <p><strong>Tax Category:</strong> {invoice.vat_category}</p>
                            )}
                        </div>
                    </div>
                    {invoice.notes && (
                        <p className="text-xs text-slate-500 mt-4 italic">{invoice.notes}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}