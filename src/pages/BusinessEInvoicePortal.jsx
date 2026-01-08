import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { Building2, FileText, Upload, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function BusinessEInvoicePortal() {
    const [businessSession, setBusinessSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem('business_einvoice_session');
        if (!session) {
            window.location.href = createPageUrl('BusinessEInvoiceLogin');
            return;
        }
        setBusinessSession(JSON.parse(session));
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const getStatusBadge = (status) => {
        const variants = {
            active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
            pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
            incomplete: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
        };
        const variant = variants[status] || variants.pending;
        const Icon = variant.icon;
        return (
            <Badge className={variant.color}>
                <Icon className="h-3 w-3 mr-1" />
                {status}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Business E-Invoice Portal</h1>
                            <p className="text-sm text-slate-600">{businessSession?.company_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(businessSession?.onboarding_status)}
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                localStorage.removeItem('business_einvoice_session');
                                window.location.href = createPageUrl('BusinessEInvoiceLogin');
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Onboarding Status */}
                {businessSession?.onboarding_status !== 'active' && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-blue-900 mb-2">Complete Your Onboarding</h3>
                                    <p className="text-sm text-blue-700 mb-4">
                                        You need to complete the 10-step onboarding process to start submitting e-invoices.
                                    </p>
                                    <Button 
                                        className="bg-blue-600 hover:bg-blue-700"
                                        onClick={() => window.location.href = createPageUrl('BusinessOnboarding')}
                                    >
                                        Continue Onboarding
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('BusinessInvoiceCreate')}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Plus className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Create Invoice</h3>
                                    <p className="text-sm text-slate-600">Generate new e-invoice</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('BusinessInvoiceImport')}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Upload className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Import Data</h3>
                                    <p className="text-sm text-slate-600">Upload CSV/Excel/API</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = createPageUrl('BusinessInvoiceList')}>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <FileText className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">View Invoices</h3>
                                    <p className="text-sm text-slate-600">Manage submissions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics */}
                <div className="grid md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-slate-900">0</div>
                            <div className="text-sm text-slate-600">Total Invoices</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">0</div>
                            <div className="text-sm text-slate-600">Submitted</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-yellow-600">0</div>
                            <div className="text-sm text-slate-600">Pending</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">0</div>
                            <div className="text-sm text-slate-600">Failed</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-slate-500">
                            No invoices yet. Create your first invoice to get started.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}