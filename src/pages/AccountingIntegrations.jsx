import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    Upload, 
    Settings, 
    CheckCircle, 
    XCircle, 
    RefreshCw, 
    Download,
    Menu,
    AlertCircle,
    FileText,
    Link as LinkIcon,
    Zap,
    Database
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/I18nextProvider';

const ACCOUNTING_PACKAGES = [
    { 
        id: 'xero', 
        name: 'Xero', 
        logo: '💼', 
        description: 'Cloud accounting for small to medium businesses',
        features: ['Real-time sync', 'Multi-currency', 'Auto reconciliation'],
        supported: true
    },
    { 
        id: 'quickbooks', 
        name: 'QuickBooks Online', 
        logo: '📗', 
        description: 'Comprehensive accounting solution',
        features: ['Invoice sync', 'Expense tracking', 'Tax management'],
        supported: true
    },
    { 
        id: 'sage', 
        name: 'Sage Intacct', 
        logo: '🟢', 
        description: 'Enterprise financial management',
        features: ['Multi-entity', 'Advanced reporting', 'GL integration'],
        supported: true
    },
    { 
        id: 'netsuite', 
        name: 'NetSuite', 
        logo: '🔷', 
        description: 'Cloud ERP and accounting',
        features: ['Full ERP', 'Revenue recognition', 'Financial consolidation'],
        supported: true
    },
    { 
        id: 'freshbooks', 
        name: 'FreshBooks', 
        logo: '📘', 
        description: 'Accounting for service businesses',
        features: ['Time tracking', 'Project accounting', 'Client portal'],
        supported: false
    },
    { 
        id: 'zoho', 
        name: 'Zoho Books', 
        logo: '📙', 
        description: 'Online accounting software',
        features: ['Inventory', 'Purchase orders', 'Banking'],
        supported: false
    }
];

export default function AccountingIntegrations() {
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [configDialog, setConfigDialog] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [configData, setConfigData] = useState({});

    const { data: invoices = [] } = useQuery({
        queryKey: ['consolidated-invoices'],
        queryFn: () => base44.entities.ConsolidatedInvoice.list('-created_date', 100)
    });

    const { data: masterPricing = [] } = useQuery({
        queryKey: ['master-pricing'],
        queryFn: () => base44.entities.MasterPricing.list()
    });

    const uploadToAccountingMutation = useMutation({
        mutationFn: async ({ packageId, file }) => {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            
            // In real implementation, call backend function to process and sync
            return { success: true, file_url, package: packageId };
        },
        onSuccess: () => {
            toast.success('Data uploaded successfully');
            setUploadDialog(false);
            setUploadFile(null);
        }
    });

    const handleUpload = () => {
        if (!uploadFile || !selectedPackage) {
            toast.error('Please select a file and accounting package');
            return;
        }
        uploadToAccountingMutation.mutate({ packageId: selectedPackage.id, file: uploadFile });
    };

    const handleConnectAPI = () => {
        toast.success(`API connection to ${selectedPackage.name} configured (demo mode)`);
        setConfigDialog(false);
        setConfigData({});
    };

    const exportInvoicesToCSV = () => {
        const headers = ['Invoice Number', 'Customer', 'Amount', 'Tax', 'Total', 'Status', 'Date', 'Due Date'];
        const rows = invoices.map(inv => [
            inv.invoice_number,
            inv.customer_email,
            inv.subtotal || 0,
            inv.tax_amount || 0,
            inv.total_amount,
            inv.status,
            new Date(inv.created_date).toLocaleDateString(),
            new Date(inv.due_date).toLocaleDateString()
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Invoices exported to CSV');
    };

    const exportPricingToCSV = () => {
        const headers = ['Item', 'Service', 'Provider', 'Buy Rate %', 'Sell Rate %', 'Margin %', 'Status'];
        const rows = masterPricing.map(item => [
            item.item_name,
            item.service_type || '',
            item.provider_name || '',
            item.buy_rate_percentage || '',
            item.sell_rate_percentage || '',
            item.margin_percentage?.toFixed(2) || '',
            item.status
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pricing-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Pricing data exported to CSV');
    };

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
            
            <div className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300",
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <FTSPlatformSidebar 
                    currentPage="AccountingIntegrations" 
                    userRole={platformUser?.platform_role}
                    userEmail={platformUser?.email}
                    isSuperAdmin={platformUser?.platform_role === 'super_admin'}
                />
            </div>

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden flex-shrink-0"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">Accounting Integrations</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">Connect and sync with global accounting packages</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <LanguageSwitcher variant="select" showLabel={false} />
                    </div>
                </header>

                <main className="p-6 space-y-6">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Download className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">Export Invoices</p>
                                        <p className="text-xs text-slate-600">{invoices.length} invoices ready</p>
                                    </div>
                                    <Button onClick={exportInvoicesToCSV} size="sm" className="bg-blue-600">
                                        Export
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                                        <Database className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">Export Pricing</p>
                                        <p className="text-xs text-slate-600">{masterPricing.length} pricing items</p>
                                    </div>
                                    <Button onClick={exportPricingToCSV} size="sm" className="bg-emerald-600">
                                        Export
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-900">Upload Data</p>
                                        <p className="text-xs text-slate-600">Import from file</p>
                                    </div>
                                    <Button onClick={() => setUploadDialog(true)} size="sm" className="bg-purple-600">
                                        Upload
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Accounting Packages */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Available Accounting Packages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="all" className="space-y-4">
                                <TabsList>
                                    <TabsTrigger value="all">All Packages</TabsTrigger>
                                    <TabsTrigger value="connected">Connected</TabsTrigger>
                                    <TabsTrigger value="available">Available</TabsTrigger>
                                </TabsList>

                                <TabsContent value="all" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ACCOUNTING_PACKAGES.map((pkg) => (
                                            <Card key={pkg.id} className={cn(
                                                "hover:shadow-lg transition-shadow",
                                                !pkg.supported && "opacity-60"
                                            )}>
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-3xl">{pkg.logo}</div>
                                                            <div>
                                                                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                                                {pkg.supported ? (
                                                                    <Badge className="bg-green-100 text-green-700 mt-1">Supported</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="mt-1">Coming Soon</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-slate-600 mb-4">{pkg.description}</p>
                                                    <div className="space-y-2 mb-4">
                                                        {pkg.features.map((feature, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                                {feature}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {pkg.supported && (
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                className="flex-1 gap-2"
                                                                onClick={() => {
                                                                    setSelectedPackage(pkg);
                                                                    setConfigDialog(true);
                                                                }}
                                                            >
                                                                <Settings className="h-3 w-3" />
                                                                Configure API
                                                            </Button>
                                                            <Button 
                                                                size="sm"
                                                                className="flex-1 gap-2 bg-blue-600"
                                                                onClick={() => {
                                                                    setSelectedPackage(pkg);
                                                                    setUploadDialog(true);
                                                                }}
                                                            >
                                                                <Upload className="h-3 w-3" />
                                                                Upload
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value="connected">
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                            <p className="text-slate-600">No accounting packages connected yet</p>
                                            <p className="text-sm text-slate-500 mt-1">Configure API connections to get started</p>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="available">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {ACCOUNTING_PACKAGES.filter(p => p.supported).map((pkg) => (
                                            <Card key={pkg.id}>
                                                <CardHeader>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-3xl">{pkg.logo}</div>
                                                        <CardTitle className="text-base">{pkg.name}</CardTitle>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <Button 
                                                        className="w-full gap-2 bg-blue-600"
                                                        onClick={() => {
                                                            setSelectedPackage(pkg);
                                                            setConfigDialog(true);
                                                        }}
                                                    >
                                                        <LinkIcon className="h-4 w-4" />
                                                        Connect
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Data Export Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Data Export</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900">Total Invoices</p>
                                        <p className="text-sm text-slate-600">{invoices.length} records</p>
                                    </div>
                                    <Button size="sm" onClick={exportInvoicesToCSV} className="gap-2">
                                        <Download className="h-3 w-3" />
                                        Export CSV
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>Export Format</Label>
                                    <Select defaultValue="csv">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                                            <SelectItem value="xero">Xero Format</SelectItem>
                                            <SelectItem value="quickbooks">QuickBooks IIF</SelectItem>
                                            <SelectItem value="sage">Sage Import</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing Data Export</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900">Master Pricing Items</p>
                                        <p className="text-sm text-slate-600">{masterPricing.length} items</p>
                                    </div>
                                    <Button size="sm" onClick={exportPricingToCSV} className="gap-2">
                                        <Download className="h-3 w-3" />
                                        Export CSV
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label>Export Format</Label>
                                    <Select defaultValue="csv">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="csv">CSV (Excel Compatible)</SelectItem>
                                            <SelectItem value="price_list">Price List PDF</SelectItem>
                                            <SelectItem value="cost_analysis">Cost Analysis</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Integration Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Status & Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-900">Auto-sync Status</p>
                                            <p className="text-xs text-slate-500">Last sync: Never</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-slate-100">Not Configured</Badge>
                                </div>
                                <div className="text-center py-8 text-slate-500">
                                    <FileText className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                    <p>No sync logs yet</p>
                                    <p className="text-sm mt-1">Configure an integration to start syncing</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Upload Dialog */}
            <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload to {selectedPackage?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Select File</Label>
                            <Input
                                type="file"
                                accept=".csv,.xlsx,.xls,.json"
                                onChange={(e) => setUploadFile(e.target.files[0])}
                                className="mt-2"
                            />
                            <p className="text-xs text-slate-500 mt-1">Supported: CSV, Excel, JSON</p>
                        </div>
                        <div>
                            <Label>Data Type</Label>
                            <Select defaultValue="invoices">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="invoices">Invoices</SelectItem>
                                    <SelectItem value="expenses">Expenses</SelectItem>
                                    <SelectItem value="pricing">Pricing Data</SelectItem>
                                    <SelectItem value="chart_of_accounts">Chart of Accounts</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setUploadDialog(false)}>Cancel</Button>
                            <Button onClick={handleUpload} className="bg-blue-600">Upload</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* API Configuration Dialog */}
            <Dialog open={configDialog} onOpenChange={setConfigDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Configure {selectedPackage?.name} API</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-semibold mb-1">OAuth Integration Available</p>
                                    <p className="text-blue-700">For Xero and QuickBooks, you can use OAuth for secure API access without storing credentials.</p>
                                </div>
                            </div>
                        </div>

                        {selectedPackage?.id === 'xero' && (
                            <div className="space-y-3">
                                <div>
                                    <Label>Client ID</Label>
                                    <Input
                                        value={configData.client_id || ''}
                                        onChange={(e) => setConfigData({...configData, client_id: e.target.value})}
                                        placeholder="Your Xero Client ID"
                                    />
                                </div>
                                <div>
                                    <Label>Client Secret</Label>
                                    <Input
                                        type="password"
                                        value={configData.client_secret || ''}
                                        onChange={(e) => setConfigData({...configData, client_secret: e.target.value})}
                                        placeholder="Your Xero Client Secret"
                                    />
                                </div>
                                <div>
                                    <Label>Organization ID</Label>
                                    <Input
                                        value={configData.org_id || ''}
                                        onChange={(e) => setConfigData({...configData, org_id: e.target.value})}
                                        placeholder="Xero Organization ID"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedPackage?.id === 'quickbooks' && (
                            <div className="space-y-3">
                                <div>
                                    <Label>Company ID</Label>
                                    <Input
                                        value={configData.company_id || ''}
                                        onChange={(e) => setConfigData({...configData, company_id: e.target.value})}
                                        placeholder="QuickBooks Company ID"
                                    />
                                </div>
                                <div>
                                    <Label>API Key</Label>
                                    <Input
                                        type="password"
                                        value={configData.api_key || ''}
                                        onChange={(e) => setConfigData({...configData, api_key: e.target.value})}
                                        placeholder="QuickBooks API Key"
                                    />
                                </div>
                            </div>
                        )}

                        {(selectedPackage?.id === 'sage' || selectedPackage?.id === 'netsuite') && (
                            <div className="space-y-3">
                                <div>
                                    <Label>API Endpoint</Label>
                                    <Input
                                        value={configData.endpoint || ''}
                                        onChange={(e) => setConfigData({...configData, endpoint: e.target.value})}
                                        placeholder={`${selectedPackage.name} API URL`}
                                    />
                                </div>
                                <div>
                                    <Label>API Key</Label>
                                    <Input
                                        type="password"
                                        value={configData.api_key || ''}
                                        onChange={(e) => setConfigData({...configData, api_key: e.target.value})}
                                        placeholder="API Key"
                                    />
                                </div>
                                <div>
                                    <Label>Account ID</Label>
                                    <Input
                                        value={configData.account_id || ''}
                                        onChange={(e) => setConfigData({...configData, account_id: e.target.value})}
                                        placeholder="Account ID"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-sm mb-3">Sync Settings</h4>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Auto-sync Invoices</Label>
                                    <input type="checkbox" className="rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Auto-sync Expenses</Label>
                                    <input type="checkbox" className="rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Sync Frequency</Label>
                                    <Select defaultValue="daily">
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="realtime">Real-time</SelectItem>
                                            <SelectItem value="hourly">Hourly</SelectItem>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setConfigDialog(false)}>Cancel</Button>
                            <Button onClick={handleConnectAPI} className="bg-blue-600 gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Connect API
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}