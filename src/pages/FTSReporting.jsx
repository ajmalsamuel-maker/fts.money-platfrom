import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { 
    BarChart3, 
    Download, 
    FileText, 
    TrendingUp, 
    Users, 
    DollarSign,
    Building2,
    Activity,
    Calendar as CalendarIcon,
    Filter,
    RefreshCw,
    Trophy,
    Leaf
} from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export default function FTSReporting() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
    const [reportType, setReportType] = useState('overview');
    const [isGenerating, setIsGenerating] = useState(false);

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: services = [] } = useQuery({
        queryKey: ['service-catalog'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['psp-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list()
    });

    const { data: auditLogs = [] } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => base44.entities.PSPAuditTrail.list('-created_date', 1000)
    });

    const { data: fixScores = [] } = useQuery({
        queryKey: ['fix-scores'],
        queryFn: () => base44.entities.FIXScore.list('-overall_score', 100)
    });

    const { data: nanoTasks = [] } = useQuery({
        queryKey: ['nano-tasks'],
        queryFn: () => base44.entities.NanoTask.list('-created_date', 100)
    });

    const { data: rwaAssets = [] } = useQuery({
        queryKey: ['rwa-assets'],
        queryFn: () => base44.entities.RWAAsset.list('-created_date', 100)
    });

    const { data: taxRates = [] } = useQuery({
        queryKey: ['tax-rates'],
        queryFn: () => base44.entities.TaxRate.list()
    });

    const { data: esgReports = [] } = useQuery({
        queryKey: ['esg-reports'],
        queryFn: () => base44.entities.ESGReport.list('-created_date', 100)
    });

    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: () => base44.entities.Invoice.list('-created_date', 100)
    });

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    // Aggregate metrics
    const totalRevenue = psps.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
    const monthlyRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const totalVolume = psps.reduce((sum, p) => sum + (p.total_volume || 0), 0);
    const totalMerchants = psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0);
    const activePSPs = psps.filter(p => p.status === 'active').length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

    // Module metrics
    const avgFIXScore = fixScores.length > 0 ? Math.round(fixScores.reduce((sum, f) => sum + (f.overall_score || 0), 0) / fixScores.length) : 0;
    const totalRWAValue = rwaAssets.reduce((sum, a) => sum + (a.total_value || 0), 0);
    const activeTaxCountries = taxRates.filter(t => t.is_active).length;
    const esgScore = esgReports.length > 0 ? Math.round(esgReports.reduce((sum, r) => sum + (r.sustainability_score || 0), 0) / esgReports.length) : 0;
    const invoiceCount = invoices.length;
    const nanoTasksCount = nanoTasks.filter(t => t.status === 'active').length;

    // Revenue by PSP
    const revenueByPSP = psps.map(psp => ({
        name: psp.psp_code,
        revenue: psp.monthly_revenue || 0,
        volume: psp.monthly_volume || 0
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    // PSP Status Distribution
    const pspStatusData = [
        { name: 'Active', value: psps.filter(p => p.status === 'active').length },
        { name: 'Provisioning', value: psps.filter(p => p.status === 'provisioning').length },
        { name: 'Suspended', value: psps.filter(p => p.status === 'suspended').length },
        { name: 'Terminated', value: psps.filter(p => p.status === 'terminated').length }
    ].filter(d => d.value > 0);

    // Service subscriptions by category
    const servicesByCategory = services.reduce((acc, service) => {
        const cat = service.service_category || 'other';
        acc[cat] = (acc[cat] || 0) + subscriptions.filter(s => s.service_id === service.id && s.status === 'active').length;
        return acc;
    }, {});

    const serviceCategoryData = Object.entries(servicesByCategory).map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value
    }));

    // Mock time series data (in production, fetch from actual transaction logs)
    const revenueTimeSeriesData = Array.from({ length: 30 }, (_, i) => ({
        date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'MMM dd'),
        revenue: Math.floor(Math.random() * 50000) + 20000,
        volume: Math.floor(Math.random() * 1000000) + 500000,
        transactions: Math.floor(Math.random() * 5000) + 1000
    }));

    const handleExport = async (format) => {
        setIsGenerating(true);
        try {
            const response = await base44.functions.invoke('generateFTSReport', {
                format,
                reportType,
                dateRange: {
                    from: dateRange.from?.toISOString(),
                    to: dateRange.to?.toISOString()
                },
                data: {
                    psps,
                    providers,
                    services,
                    subscriptions,
                    metrics: {
                        totalRevenue,
                        monthlyRevenue,
                        totalVolume,
                        totalMerchants,
                        activePSPs,
                        activeSubscriptions
                    },
                    revenueByPSP,
                    pspStatusData,
                    serviceCategoryData,
                    revenueTimeSeries: revenueTimeSeriesData
                }
            });

            if (format === 'csv' || format === 'excel') {
                // For CSV/Excel, backend returns download URL or base64
                const blob = new Blob([response.data.content], { 
                    type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
                });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fts-report-${reportType}-${format === 'excel' ? 'xlsx' : 'csv'}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else if (format === 'pdf') {
                // For PDF, backend returns base64
                const blob = new Blob([Uint8Array.from(atob(response.data.content), c => c.charCodeAt(0))], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fts-report-${reportType}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }

            toast.success(`Report exported as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error('Failed to generate report: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSReporting" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.customReports')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:subMenuItems.customReportsDesc')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <CalendarIcon className="h-4 w-4" />
                                    {dateRange.from && dateRange.to && `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-6 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-100">Total Revenue</p>
                                        <p className="text-3xl font-bold mt-1">${(totalRevenue / 1000000).toFixed(2)}M</p>
                                        <p className="text-xs text-blue-100 mt-1">Lifetime</p>
                                    </div>
                                    <DollarSign className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-purple-100">Monthly Revenue</p>
                                        <p className="text-3xl font-bold mt-1">${(monthlyRevenue / 1000).toFixed(0)}k</p>
                                        <p className="text-xs text-purple-100 mt-1">This month</p>
                                    </div>
                                    <TrendingUp className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-emerald-100">Active PSPs</p>
                                        <p className="text-3xl font-bold mt-1">{activePSPs}</p>
                                        <p className="text-xs text-emerald-100 mt-1">of {psps.length} total</p>
                                    </div>
                                    <Building2 className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-amber-100">Total Merchants</p>
                                        <p className="text-3xl font-bold mt-1">{totalMerchants.toLocaleString()}</p>
                                        <p className="text-xs text-amber-100 mt-1">Across all PSPs</p>
                                    </div>
                                    <Users className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-pink-100">Subscriptions</p>
                                        <p className="text-3xl font-bold mt-1">{activeSubscriptions}</p>
                                        <p className="text-xs text-pink-100 mt-1">Active services</p>
                                    </div>
                                    <Activity className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-cyan-100">Total Volume</p>
                                        <p className="text-3xl font-bold mt-1">${(totalVolume / 1000000).toFixed(1)}M</p>
                                        <p className="text-xs text-cyan-100 mt-1">Processed</p>
                                    </div>
                                    <BarChart3 className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="visualizations" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                            <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
                            <TabsTrigger value="export">Export Reports</TabsTrigger>
                        </TabsList>

                        <TabsContent value="visualizations" className="space-y-6">
                            {/* Revenue Time Series */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={revenueTimeSeriesData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-6">
                                {/* Revenue by PSP */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top PSPs by Revenue</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={revenueByPSP}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="revenue" fill="#8b5cf6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* PSP Status Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>PSP Status Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={pspStatusData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {pspStatusData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Service Subscriptions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Service Subscriptions by Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={serviceCategoryData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#10b981" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="detailed" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>PSP Performance Report</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 px-4 font-semibold">PSP Code</th>
                                                    <th className="text-left py-3 px-4 font-semibold">PSP Name</th>
                                                    <th className="text-right py-3 px-4 font-semibold">Merchants</th>
                                                    <th className="text-right py-3 px-4 font-semibold">Monthly Volume</th>
                                                    <th className="text-right py-3 px-4 font-semibold">Monthly Revenue</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {psps.map((psp) => (
                                                    <tr key={psp.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-3 px-4 font-mono text-xs">{psp.psp_code}</td>
                                                        <td className="py-3 px-4">{psp.psp_name}</td>
                                                        <td className="py-3 px-4 text-right">{psp.total_merchants || 0}</td>
                                                        <td className="py-3 px-4 text-right">${((psp.monthly_volume || 0) / 1000).toFixed(1)}k</td>
                                                        <td className="py-3 px-4 text-right">${((psp.monthly_revenue || 0) / 1000).toFixed(2)}k</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Badge className={
                                                                psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                psp.status === 'provisioning' ? 'bg-blue-100 text-blue-700' :
                                                                psp.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {psp.status}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Audit Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {auditLogs.slice(0, 20).map((log, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium">{log.action}</p>
                                                    <p className="text-xs text-slate-600">{log.psp_code} • {log.user_email}</p>
                                                </div>
                                                <p className="text-xs text-slate-500">{format(new Date(log.created_date), 'MMM dd, HH:mm')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="export" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Export Reports</CardTitle>
                                    <p className="text-sm text-slate-600">Generate comprehensive reports in multiple formats</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label>Report Type</Label>
                                        <Select value={reportType} onValueChange={setReportType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="overview">Platform Overview</SelectItem>
                                                <SelectItem value="psp_performance">PSP Performance</SelectItem>
                                                <SelectItem value="revenue">Revenue Analysis</SelectItem>
                                                <SelectItem value="services">Service Subscriptions</SelectItem>
                                                <SelectItem value="rwa">RWA Tokenization</SelectItem>
                                                <SelectItem value="crypto">Crypto Banking / VASP</SelectItem>
                                                <SelectItem value="iso">ISO Gateway</SelectItem>
                                                <SelectItem value="orchestration">Orchestration</SelectItem>
                                                <SelectItem value="tax">Tax Management</SelectItem>
                                                <SelectItem value="einvoicing">E-Invoicing</SelectItem>
                                                <SelectItem value="esg">ESG & Sustainability</SelectItem>
                                                <SelectItem value="fix_score">FIX Score Management</SelectItem>
                                                <SelectItem value="nano_marketplace">Nano Marketplace</SelectItem>
                                                <SelectItem value="audit">Audit Trail</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <Card className="border-2 border-emerald-200 bg-emerald-50">
                                            <CardContent className="p-6 text-center">
                                                <FileText className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                                                <h4 className="font-semibold text-slate-900 mb-2">CSV Export</h4>
                                                <p className="text-xs text-slate-600 mb-4">Tabular data for Excel/Sheets</p>
                                                <Button 
                                                    onClick={() => handleExport('csv')}
                                                    disabled={isGenerating}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download CSV
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-2 border-blue-200 bg-blue-50">
                                            <CardContent className="p-6 text-center">
                                                <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                                                <h4 className="font-semibold text-slate-900 mb-2">Excel Export</h4>
                                                <p className="text-xs text-slate-600 mb-4">Formatted spreadsheet with charts</p>
                                                <Button 
                                                    onClick={() => handleExport('excel')}
                                                    disabled={isGenerating}
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download Excel
                                                </Button>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-2 border-purple-200 bg-purple-50">
                                            <CardContent className="p-6 text-center">
                                                <FileText className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                                                <h4 className="font-semibold text-slate-900 mb-2">PDF Report</h4>
                                                <p className="text-xs text-slate-600 mb-4">Professional formatted document</p>
                                                <Button 
                                                    onClick={() => handleExport('pdf')}
                                                    disabled={isGenerating}
                                                    className="w-full bg-purple-600 hover:bg-purple-700"
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download PDF
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {isGenerating && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                            <p className="text-sm text-blue-900">Generating report, please wait...</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}