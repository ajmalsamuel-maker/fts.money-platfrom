import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, DollarSign, TrendingUp, Calendar as CalendarIcon, Code, GitBranch, Wallet, Briefcase, Menu, FileDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subMonths } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

export default function FTSRevenue() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
    const [dateRange, setDateRange] = React.useState({ from: subMonths(new Date(), 3), to: new Date() });
    const [serviceLineFilter, setServiceLineFilter] = React.useState('all');
    const [customerSegmentFilter, setCustomerSegmentFilter] = React.useState('all');
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const { data: isoCustomers = [] } = useQuery({
        queryKey: ['iso-customers'],
        queryFn: () => base44.entities.ISOGatewayCustomer.list()
    });

    const { data: orchestrationCustomers = [] } = useQuery({
        queryKey: ['orchestration-customers'],
        queryFn: () => base44.entities.OrchestrationCustomer.list()
    });

    const { data: cryptoCustomers = [] } = useQuery({
        queryKey: ['crypto-customers'],
        queryFn: () => base44.entities.CryptoGatewayCustomer.list()
    });

    const { data: rwaProviders = [] } = useQuery({
        queryKey: ['rwa-providers'],
        queryFn: () => base44.entities.RWAWhiteLabelCustomer.list()
    });

    // Apply filters
    const filteredPSPs = psps.filter(p => {
        const segmentMatch = customerSegmentFilter === 'all' || customerSegmentFilter === 'psp';
        return segmentMatch;
    });
    const filteredISO = isoCustomers.filter(c => customerSegmentFilter === 'all' || customerSegmentFilter === 'iso_customer');
    const filteredOrch = orchestrationCustomers.filter(c => customerSegmentFilter === 'all' || customerSegmentFilter === 'orchestration_customer');
    const filteredCrypto = cryptoCustomers.filter(c => customerSegmentFilter === 'all' || customerSegmentFilter === 'crypto_customer');
    const filteredRWA = rwaProviders.filter(p => customerSegmentFilter === 'all' || customerSegmentFilter === 'rwa_provider');

    const pspRevenue = filteredPSPs.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const isoRevenue = filteredISO.reduce((sum, c) => sum + (c.monthly_billing || 0), 0);
    const orchestrationRevenue = filteredOrch.reduce((sum, c) => sum + (c.monthly_billing || 0), 0);
    const cryptoRevenue = filteredCrypto.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0);
    const rwaRevenue = filteredRWA.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    
    let totalRevenue = pspRevenue + isoRevenue + orchestrationRevenue + cryptoRevenue + rwaRevenue;
    
    // Service line filter
    if (serviceLineFilter !== 'all') {
        if (serviceLineFilter === 'psp') totalRevenue = pspRevenue;
        else if (serviceLineFilter === 'iso') totalRevenue = isoRevenue;
        else if (serviceLineFilter === 'orchestration') totalRevenue = orchestrationRevenue;
        else if (serviceLineFilter === 'crypto') totalRevenue = cryptoRevenue;
        else if (serviceLineFilter === 'rwa') totalRevenue = rwaRevenue;
    }

    // Chart data
    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b'];
    const revenueByServiceChart = [
        { name: 'PSP Platform', value: pspRevenue, customers: filteredPSPs.length },
        { name: 'ISO Gateway', value: isoRevenue, customers: filteredISO.length },
        { name: 'Orchestration', value: orchestrationRevenue, customers: filteredOrch.length },
        { name: 'Crypto Banking', value: cryptoRevenue, customers: filteredCrypto.length },
        { name: 'RWA Platform', value: rwaRevenue, customers: filteredRWA.length }
    ].filter(s => s.value > 0);

    // Trend data (mock - 6 months)
    const revenueTrendData = [
        { month: 'Aug', psp: pspRevenue * 0.7, iso: isoRevenue * 0.75, orch: orchestrationRevenue * 0.8, crypto: cryptoRevenue * 0.65, rwa: rwaRevenue * 0.6 },
        { month: 'Sep', psp: pspRevenue * 0.78, iso: isoRevenue * 0.82, orch: orchestrationRevenue * 0.85, crypto: cryptoRevenue * 0.73, rwa: rwaRevenue * 0.72 },
        { month: 'Oct', psp: pspRevenue * 0.85, iso: isoRevenue * 0.88, orch: orchestrationRevenue * 0.9, crypto: cryptoRevenue * 0.81, rwa: rwaRevenue * 0.8 },
        { month: 'Nov', psp: pspRevenue * 0.92, iso: isoRevenue * 0.94, orch: orchestrationRevenue * 0.95, crypto: cryptoRevenue * 0.9, rwa: rwaRevenue * 0.88 },
        { month: 'Dec', psp: pspRevenue * 0.96, iso: isoRevenue * 0.97, orch: orchestrationRevenue * 0.98, crypto: cryptoRevenue * 0.95, rwa: rwaRevenue * 0.93 },
        { month: 'Jan', psp: pspRevenue, iso: isoRevenue, orch: orchestrationRevenue, crypto: cryptoRevenue, rwa: rwaRevenue }
    ];

    const exportToCSV = () => {
        const headers = ['Service', 'Customers', 'Monthly Revenue', '% of Total'];
        const rows = revenueByServiceChart.map(s => [
            s.name,
            s.customers,
            s.value,
            ((s.value / totalRevenue) * 100).toFixed(1) + '%'
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Exported to CSV');
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('FTS.Money Revenue Report', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        
        doc.setFontSize(14);
        doc.text('Summary', 14, 42);
        doc.setFontSize(10);
        doc.text(`Total Monthly Revenue: $${(totalRevenue / 1000).toFixed(0)}K`, 14, 50);
        doc.text(`Annual Run Rate: $${((totalRevenue * 12) / 1000000).toFixed(1)}M`, 14, 56);
        doc.text(`Total Customers: ${psps.length + isoCustomers.length + orchestrationCustomers.length + cryptoCustomers.length + rwaProviders.length}`, 14, 62);
        
        const tableData = revenueByServiceChart.map(s => [
            s.name,
            s.customers,
            `$${(s.value / 1000).toFixed(1)}K`,
            `${((s.value / totalRevenue) * 100).toFixed(0)}%`
        ]);
        
        doc.autoTable({
            startY: 70,
            head: [['Service', 'Customers', 'Monthly Revenue', '% of Total']],
            body: tableData,
            theme: 'grid'
        });
        
        doc.save(`revenue-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF exported successfully');
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">{t('common:labels.loading')}</div>;
    }

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
                    currentPage="FTSRevenue" 
                    userRole={getRoleLabel(platformUser?.platform_role)} 
                    userEmail={platformUser?.email}
                    isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
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
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">{t('platform:pages.revenue.title')}</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">{t('platform:pages.revenue.subtitle')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <LanguageSwitcher variant="select" showLabel={false} />
                        <Button variant="outline" size="sm" className="gap-2" onClick={exportToCSV}>
                            <FileDown className="h-4 w-4" />
                            CSV
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={exportToPDF}>
                            <FileDown className="h-4 w-4" />
                            PDF
                        </Button>
                        <div className="text-right hidden lg:block">
                            <p className="text-xs text-slate-600">{t('common:labels.loggedInAs')}</p>
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[150px]">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="p-6 space-y-6">
                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex gap-4 flex-wrap items-center">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-64 justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange.from && dateRange.to ? (
                                            `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                                        ) : 'Select date range'}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                            <Select value={serviceLineFilter} onValueChange={setServiceLineFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Service Line" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Services</SelectItem>
                                    <SelectItem value="psp">PSP Platform</SelectItem>
                                    <SelectItem value="iso">ISO Gateway</SelectItem>
                                    <SelectItem value="orchestration">Orchestration</SelectItem>
                                    <SelectItem value="crypto">Crypto Banking</SelectItem>
                                    <SelectItem value="rwa">RWA Platform</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={customerSegmentFilter} onValueChange={setCustomerSegmentFilter}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Customer Segment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Segments</SelectItem>
                                    <SelectItem value="psp">PSP</SelectItem>
                                    <SelectItem value="iso_customer">ISO Customer</SelectItem>
                                    <SelectItem value="orchestration_customer">Orchestration</SelectItem>
                                    <SelectItem value="crypto_customer">Crypto</SelectItem>
                                    <SelectItem value="rwa_provider">RWA Provider</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" onClick={() => {
                                setDateRange({ from: subMonths(new Date(), 3), to: new Date() });
                                setServiceLineFilter('all');
                                setCustomerSegmentFilter('all');
                            }}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.revenue.totalMonthlyRevenue')}</p>
                                    <p className="text-3xl font-bold text-slate-900">${(totalRevenue / 1000).toFixed(0)}K</p>
                                    <p className="text-xs text-emerald-600 mt-1">{t('platform:pages.revenue.allServices')}</p>
                                </div>
                                <DollarSign className="h-10 w-10 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.revenue.annualRunRate')}</p>
                                    <p className="text-3xl font-bold text-slate-900">${((totalRevenue * 12) / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-slate-500 mt-1">{t('platform:pages.revenue.projected')}</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('platform:pages.revenue.activeCustomers')}</p>
                                    <p className="text-3xl font-bold text-slate-900">{psps.length + isoCustomers.length + orchestrationCustomers.length + cryptoCustomers.length + rwaProviders.length}</p>
                                    <p className="text-xs text-slate-500 mt-1">{t('platform:pages.revenue.allPlatforms')}</p>
                                </div>
                                <Calendar className="h-10 w-10 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">{t('common:labels.growth')}</p>
                                    <p className="text-3xl font-bold text-emerald-600">+28%</p>
                                    <p className="text-xs text-slate-500 mt-1">{t('platform:pages.revenue.vsLastMonth')}</p>
                                </div>
                                <TrendingUp className="h-10 w-10 text-emerald-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.pspRevenue')}</p>
                                    <p className="text-lg font-bold">${(pspRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <Code className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.isoGateway')}</p>
                                    <p className="text-lg font-bold">${(isoRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <GitBranch className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.orchestration')}</p>
                                    <p className="text-lg font-bold">${(orchestrationRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                    <Wallet className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.cryptoBanking')}</p>
                                    <p className="text-lg font-bold">${(cryptoRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Briefcase className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">{t('platform:pages.revenue.rwaPlatform')}</p>
                                    <p className="text-lg font-bold">${(rwaRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="charts">Analytics</TabsTrigger>
                        <TabsTrigger value="breakdown">Service Breakdown</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('platform:pages.revenue.revenueByService')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('platform:pages.revenue.service')}</TableHead>
                                                <TableHead>{t('platform:pages.revenue.customers')}</TableHead>
                                                <TableHead className="text-right">{t('platform:pages.revenue.monthlyRevenue')}</TableHead>
                                                <TableHead className="text-right">{t('platform:pages.revenue.percentTotal')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {revenueByServiceChart.map((service) => (
                                                <TableRow key={service.name}>
                                                    <TableCell className="font-medium">{service.name}</TableCell>
                                                    <TableCell>{service.customers}</TableCell>
                                                    <TableCell className="text-right font-semibold">${(service.value / 1000).toFixed(1)}K</TableCell>
                                                    <TableCell className="text-right">{totalRevenue > 0 ? ((service.value / totalRevenue) * 100).toFixed(0) : 0}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('platform:pages.revenue.topPSPCustomers')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('platform:pages.revenue.pspName')}</TableHead>
                                                <TableHead>{t('platform:pages.revenue.tier')}</TableHead>
                                                <TableHead className="text-right">{t('platform:pages.revenue.monthlyRevenue')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredPSPs.slice(0, 8).map((psp) => (
                                                <TableRow key={psp.id}>
                                                    <TableCell className="font-medium">{psp.psp_name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{psp.tier}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}K</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="charts" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Trend (6 Months)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={revenueTrendData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
                                            <Legend />
                                            <Area type="monotone" dataKey="psp" stackId="1" stroke="#10b981" fill="#10b981" name="PSP" />
                                            <Area type="monotone" dataKey="iso" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="ISO" />
                                            <Area type="monotone" dataKey="orch" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Orchestration" />
                                            <Area type="monotone" dataKey="crypto" stackId="1" stroke="#06b6d4" fill="#06b6d4" name="Crypto" />
                                            <Area type="monotone" dataKey="rwa" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="RWA" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={revenueByServiceChart}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={90}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {revenueByServiceChart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${(value / 1000).toFixed(1)}K`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Customer Count by Service</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={revenueByServiceChart}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="customers" fill="#8b5cf6" name="Customers" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="breakdown" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {revenueByServiceChart.map((service, idx) => (
                                <Card key={service.name}>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                            {service.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600">Monthly Revenue</span>
                                            <span className="font-bold">${(service.value / 1000).toFixed(1)}K</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600">Annual Run Rate</span>
                                            <span className="font-bold">${((service.value * 12) / 1000000).toFixed(2)}M</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600">Active Customers</span>
                                            <span className="font-bold">{service.customers}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600">Avg per Customer</span>
                                            <span className="font-bold">${service.customers > 0 ? ((service.value / service.customers) / 1000).toFixed(1) : 0}K</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
                </div>
            </div>
        </div>
    );
}