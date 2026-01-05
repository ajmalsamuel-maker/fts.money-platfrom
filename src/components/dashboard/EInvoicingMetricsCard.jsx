import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertTriangle, Clock, Globe } from 'lucide-react';

export default function EInvoicingMetricsCard() {
    const { data: invoices = [] } = useQuery({
        queryKey: ['einvoices-dashboard'],
        queryFn: async () => {
            const result = await base44.entities.Invoice.list('-created_date', 100);
            return (result || []).filter(inv => inv.einvoice_format);
        },
        refetchInterval: 30000
    });

    const submitted = invoices.filter(inv => inv.einvoice_status === 'submitted').length;
    const pending = invoices.filter(inv => inv.einvoice_status === 'generated' || inv.einvoice_status === 'validated').length;
    const failed = invoices.filter(inv => inv.einvoice_status === 'validation_failed').length;
    const uniqueFormats = new Set(invoices.map(inv => inv.einvoice_format)).size;

    return (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-700">E-Invoicing</CardTitle>
                    <FileText className="h-5 w-5 text-blue-600" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <div className="text-2xl font-bold text-slate-900">{invoices.length}</div>
                    <p className="text-xs text-slate-600">E-Invoices Generated</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <div className="text-sm font-semibold text-slate-900">{submitted}</div>
                        </div>
                        <div className="text-xs text-slate-600">Submitted</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3 text-amber-600" />
                            <div className="text-sm font-semibold text-slate-900">{pending}</div>
                        </div>
                        <div className="text-xs text-slate-600">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <div className="text-sm font-semibold text-slate-900">{failed}</div>
                        </div>
                        <div className="text-xs text-slate-600">Failed</div>
                    </div>
                </div>
                <Badge className="w-full justify-center bg-blue-100 text-blue-800 hover:bg-blue-200">
                    <Globe className="h-3 w-3 mr-1" />
                    {uniqueFormats} standards
                </Badge>
            </CardContent>
        </Card>
    );
}