import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { 
    Building2, FileText, Upload, Plus, CheckCircle, Clock, AlertCircle, 
    TrendingUp, DollarSign, Shield, Menu, X, Settings, LogOut, BarChart3,
    Users, Globe, ChevronRight, Activity
} from 'lucide-react';

export default function BusinessEInvoicePortal() {
    const [businessSession, setBusinessSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    const navigationItems = [
        { icon: Activity, label: 'Dashboard', path: 'BusinessEInvoicePortal', active: true },
        { icon: FileText, label: 'Invoices', path: 'BusinessInvoiceList' },
        { icon: Users, label: 'Customers', path: 'BusinessEInvoicePortal' },
        { icon: Shield, label: 'Compliance', path: 'BusinessEInvoicePortal' },
        { icon: BarChart3, label: 'Reports', path: 'BusinessEInvoicePortal' },
        { icon: Settings, label: 'Settings', path: 'BusinessEInvoicePortal' }
    ];

    const getComplianceStatus = () => {
        const country = businessSession?.country || 'US';
        return {
            country,
            status: businessSession?.onboarding_status === 'active' ? 'compliant' : 'setup_required',
            standard: businessSession?.tax_submission_standards || 'PEPPOL'
        };
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <span className="font-semibold text-slate-900">E-Invoice</span>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                <nav className="p-4 space-y-1">
                    {navigationItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => window.location.href = createPageUrl(item.path)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                item.active 
                                    ? 'bg-blue-50 text-blue-700 font-medium' 
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs font-medium text-slate-900 mb-1">{businessSession?.company_name}</div>
                        <div className="text-xs text-slate-500">{businessSession?.business_email}</div>
                    </div>
                    <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                            localStorage.removeItem('business_einvoice_session');
                            window.location.href = createPageUrl('BusinessEInvoiceLogin');
                        }}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40">
                    <div className="h-full px-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-900">Good Morning 👋</h1>
                                <p className="text-xs text-slate-500">Here's your e-invoicing overview</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {businessSession?.onboarding_status || 'Setup Required'}
                            </Badge>
                        </div>
                    </div>
                </header>

                <main className="p-6 space-y-6">
                    {/* Onboarding Alert */}
                    {businessSession?.onboarding_status !== 'active' && (
                        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-blue-900 mb-1">Complete Your Setup</h3>
                                        <p className="text-sm text-blue-700 mb-3">
                                            Complete onboarding to start submitting e-invoices and ensure compliance.
                                        </p>
                                        <Button 
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                            onClick={() => window.location.href = createPageUrl('BusinessOnboarding')}
                                        >
                                            Continue Setup
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* KPI Cards */}
                    <div className="grid md:grid-cols-4 gap-6">
                        <Card className="border-slate-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-slate-900">0</div>
                                <div className="text-sm text-slate-600">Total Invoices</div>
                                <div className="text-xs text-green-600 mt-1">+0% vs last month</div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <span className="text-xs text-slate-500">100%</span>
                                </div>
                                <div className="text-2xl font-bold text-green-600">0</div>
                                <div className="text-sm text-slate-600">Submitted</div>
                                <div className="text-xs text-slate-500 mt-1">Compliance rate</div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-yellow-600">0</div>
                                <div className="text-sm text-slate-600">Pending Review</div>
                                <div className="text-xs text-slate-500 mt-1">Awaiting approval</div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-red-600">0</div>
                                <div className="text-sm text-slate-600">Failed Submissions</div>
                                <div className="text-xs text-slate-500 mt-1">Requires action</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-4">
                                <button 
                                    onClick={() => window.location.href = createPageUrl('BusinessInvoiceCreate')}
                                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                                >
                                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <Plus className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900">Create Invoice</div>
                                        <div className="text-sm text-slate-600">Generate new e-invoice</div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => window.location.href = createPageUrl('BusinessInvoiceImport')}
                                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                                >
                                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                        <Upload className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900">Import Data</div>
                                        <div className="text-sm text-slate-600">Upload CSV/Excel/API</div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => window.location.href = createPageUrl('BusinessInvoiceList')}
                                    className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                                >
                                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <FileText className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900">View Invoices</div>
                                        <div className="text-sm text-slate-600">Manage all submissions</div>
                                    </div>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Compliance Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                Compliance Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-slate-600" />
                                        <div>
                                            <div className="font-medium text-slate-900">
                                                {getComplianceStatus().country}
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                Standard: {getComplianceStatus().standard}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge className={
                                        getComplianceStatus().status === 'compliant' 
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    }>
                                        {getComplianceStatus().status === 'compliant' ? 'Compliant' : 'Setup Required'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Invoices */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Recent Invoices</CardTitle>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.location.href = createPageUrl('BusinessInvoiceList')}
                                >
                                    View All
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <div className="text-slate-500 mb-4">No invoices yet</div>
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => window.location.href = createPageUrl('BusinessInvoiceCreate')}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Invoice
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}