import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Globe, CheckCircle, AlertTriangle, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { EINVOICING_STANDARDS, getStandardForCountry } from '@/components/utils/eInvoicingStandards';
import { ValidationSummaryBadge } from '@/components/invoice/ValidationErrorDisplay';
import { toast } from 'sonner';

export default function EInvoicingDashboard() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const queryClient = useQueryClient();

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices-with-einvoicing'],
        queryFn: async () => {
            const result = await base44.entities.Invoice.list('-created_date', 100);
            return result || [];
        }
    });

    const eInvoiceCount = invoices.filter(inv => inv.einvoice_format).length;
    const pendingSubmission = invoices.filter(inv => inv.einvoice_status === 'generated').length;
    const submitted = invoices.filter(inv => inv.einvoice_status === 'submitted').length;
    const validationFailed = invoices.filter(inv => inv.einvoice_status === 'validation_failed').length;

    const retryValidation = async (invoice) => {
        try {
            toast.loading('Validating invoice...');
            const response = await base44.functions.invoke('validateEInvoiceSchema', {
                invoice_id: invoice.id,
                xml_content: invoice.einvoice_xml,
                format: invoice.einvoice_format,
                strict_mode: true
            });

            if (response.data.success && response.data.validation.valid) {
                toast.success('Validation passed!');
                queryClient.invalidateQueries(['invoices-with-einvoicing']);
            } else {
                toast.error(`Validation failed: ${response.data.validation.error_count} errors`);
            }
        } catch (error) {
            toast.error('Validation failed: ' + error.message);
        }
    };

    const resubmitInvoice = async (invoice) => {
        try {
            toast.loading('Submitting to gateway...');
            const response = await base44.functions.invoke('eInvoicingEngine', {
                invoice_id: invoice.id,
                format: invoice.einvoice_format,
                submit_to_gateway: true
            });

            if (response.data.success) {
                toast.success('Invoice submitted successfully!');
                queryClient.invalidateQueries(['invoices-with-einvoicing']);
            } else {
                toast.error('Submission failed: ' + response.data.error);
            }
        } catch (error) {
            toast.error('Submission failed: ' + error.message);
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="EInvoicingDashboard" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Global E-Invoicing Dashboard</h1>
                        <p className="text-slate-600 mt-1">Manage electronic invoices across all standards worldwide</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 mb-8">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">E-Invoices Generated</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{eInvoiceCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Pending Submission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-amber-600">{pendingSubmission}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Submitted</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{submitted}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Validation Failed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{validationFailed}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Supported Standards</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">{Object.keys(EINVOICING_STANDARDS).length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Supported Standards */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Supported E-Invoicing Standards</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(EINVOICING_STANDARDS).map(([key, standard]) => (
                                    <Card key={key} className="bg-slate-50">
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">{standard.name}</h4>
                                                    <p className="text-xs text-slate-600">{standard.format}</p>
                                                </div>
                                                {standard.mandatory && (
                                                    <Badge className="bg-red-100 text-red-800 text-xs">Mandatory</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{standard.description}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {standard.regions?.slice(0, 5).map(region => (
                                                    <Badge key={region} variant="outline" className="text-xs">
                                                        {region}
                                                    </Badge>
                                                ))}
                                                {(standard.regions?.length || 0) > 5 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{standard.regions.length - 5}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-3 text-xs">
                                                {standard.digital_signature && (
                                                    <Badge className="bg-purple-100 text-purple-800">Signature Required</Badge>
                                                )}
                                                {standard.gateway_required && (
                                                    <Badge className="bg-blue-100 text-blue-800">Gateway</Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent E-Invoices */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent E-Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {invoices.filter(inv => inv.einvoice_format).slice(0, 10).map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="font-medium">{invoice.invoice_number}</p>
                                                <p className="text-xs text-slate-600">
                                                    {invoice.customer_name} • {invoice.customer_country}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="uppercase">
                                                {invoice.einvoice_format}
                                            </Badge>
                                            {invoice.einvoice_status === 'submitted' ? (
                                                <Badge className="bg-green-100 text-green-800">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Submitted
                                                </Badge>
                                            ) : invoice.einvoice_status === 'validation_failed' ? (
                                                <Badge className="bg-red-100 text-red-800">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    Failed
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-800">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}
                                            {invoice.einvoice_validation && (
                                                <ValidationSummaryBadge validation={invoice.einvoice_validation} />
                                            )}
                                            {invoice.einvoice_status === 'validation_failed' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => retryValidation(invoice)}
                                                    className="gap-1"
                                                >
                                                    <RefreshCw className="h-3 w-3" />
                                                    Retry
                                                </Button>
                                            )}
                                            {invoice.einvoice_status === 'validated' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="default"
                                                    onClick={() => resubmitInvoice(invoice)}
                                                    className="gap-1 bg-green-600 hover:bg-green-700"
                                                >
                                                    Submit
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}