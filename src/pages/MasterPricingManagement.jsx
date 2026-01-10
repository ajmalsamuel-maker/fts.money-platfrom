import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth, PLATFORM_PERMISSIONS, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingSyncManager from '@/components/pricing/PricingSyncManager';
import ProviderAgreementsManager from '@/components/pricing/ProviderAgreementsManager';
import PricingEnhancedManager from '@/components/pricing/PricingEnhancedManager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
    DollarSign, 
    Plus, 
    TrendingUp, 
    Search,
    Edit,
    Trash2,
    CheckCircle,
    AlertCircle,
    ArrowUpDown,
    Download,
    RefreshCw,
    Menu,
    FileDown,
    BarChart3,
    Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const serviceTypes = [
    { value: 'psp_payment_processing', label: 'PSP Payment Processing' },
    { value: 'crypto_vasp', label: 'Crypto Banking / VASP' },
    { value: 'iso_gateway', label: 'ISO Gateway' },
    { value: 'orchestration', label: 'Orchestration' },
    { value: 'rwa_tokenization', label: 'RWA Tokenization' },
    { value: 'tax_management', label: 'Tax Management' },
    { value: 'einvoicing', label: 'E-Invoicing' },
    { value: 'nano_marketplace', label: 'NANO Marketplace' },
    { value: 'pci_compliance', label: 'PCI Compliance' },
    { value: 'lei_compliance', label: 'LEI Compliance' },
    { value: 'digital_identity', label: 'Digital Identity' },
    { value: 'other', label: 'Other' }
];

const categories = [
    { value: 'payment_rail', label: 'Payment Rails' },
    { value: 'payout_route', label: 'Payout Routes' },
    { value: 'api_endpoint', label: 'API Endpoints' },
    { value: 'service', label: 'Services' },
    { value: 'merchant_onboarding', label: 'Merchant Onboarding' },
    { value: 'transaction_processing', label: 'Transaction Processing' },
    { value: 'settlement', label: 'Settlement' },
    { value: 'compliance_service', label: 'Compliance Services' },
    { value: 'fraud_detection', label: 'Fraud Detection' },
    { value: 'network_tokenization', label: 'Network Tokenization' },
    { value: 'account_updater', label: 'Account Updater' },
    { value: 'instant_payment', label: 'Instant Payments' },
    { value: 'crypto_processing', label: 'Crypto Processing' },
    { value: 'wallet_creation', label: 'Wallet Creation' },
    { value: 'card_issuance', label: 'Card Issuance' },
    { value: 'kyc_verification', label: 'KYC Verification' },
    { value: 'iso_message_translation', label: 'ISO Message Translation' },
    { value: 'routing_fee', label: 'Routing Fee' },
    { value: 'token_deployment', label: 'Token Deployment' },
    { value: 'custody_fee', label: 'Custody Fee' },
    { value: 'tax_calculation', label: 'Tax Calculation' },
    { value: 'einvoice_submission', label: 'E-Invoice Submission' },
    { value: 'carbon_offset', label: 'Carbon Offset' },
    { value: 'data_storage', label: 'Data Storage' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'webhook', label: 'Webhooks' },
    { value: 'terminal_rental', label: 'Terminal Rental' },
    { value: 'subscription_management', label: 'Subscription Management' },
    { value: 'dispute_handling', label: 'Dispute Handling' },
    { value: 'chargeback_fee', label: 'Chargeback Fees' },
    { value: 'refund_processing', label: 'Refund Processing' },
    { value: 'platform_fee', label: 'Platform Fees' },
    { value: 'setup_fee', label: 'Setup Fees' },
    { value: 'monthly_fee', label: 'Monthly Fees' }
];

export default function MasterPricingManagement() {
    const { t } = useI18n();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [customerSegmentFilter, setCustomerSegmentFilter] = useState('all');
    const [serviceLineFilter, setServiceLineFilter] = useState('all');

    const { data: pricingItems = [] } = useQuery({
        queryKey: ['master-pricing'],
        queryFn: () => base44.entities.MasterPricing.list()
    });

    const { data: serviceCatalog = [] } = useQuery({
        queryKey: ['service-catalog'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const { data: payoutRoutes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list()
    });

    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    // Extract unique payment methods from providers
    const paymentMethods = [
        'visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners_club', 'unionpay',
        'bank_transfer', 'atm_transfer', 'alipay', 'wechat', 'paypal',
        'mobile_money', 'crypto', 'e_wallet', 'cash', 'other'
    ];

    const { data: feeTemplates = [] } = useQuery({
        queryKey: ['fee-templates'],
        queryFn: () => base44.entities.FeeType.list()
    });

    const { data: providerAgreements = [] } = useQuery({
        queryKey: ['provider-agreements'],
        queryFn: () => base44.entities.ProviderAgreement.list()
    });

    const { data: serviceBillingConfigs = [] } = useQuery({
        queryKey: ['service-billing-configs'],
        queryFn: () => base44.entities.ServiceBillingConfig.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.MasterPricing.create({
            ...data,
            item_id: `PRC-${Date.now()}`,
            status: 'pending_approval',
            created_by: platformUser?.email
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['master-pricing']);
            setShowDialog(false);
            setFormData({});
            toast.success('Pricing item submitted for approval');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MasterPricing.update(id, {
            ...data,
            status: 'pending_approval'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['master-pricing']);
            setShowDialog(false);
            setEditingItem(null);
            setFormData({});
            toast.success('Pricing changes submitted for approval');
        }
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, approved }) => base44.entities.MasterPricing.update(id, {
            status: approved ? 'active' : 'inactive',
            approved_by: platformUser?.email,
            approval_date: new Date().toISOString().split('T')[0]
        }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['master-pricing']);
            toast.success(variables.approved ? 'Pricing approved and activated' : 'Pricing rejected');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.MasterPricing.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['master-pricing']);
            toast.success('Pricing item deleted');
        }
    });

    // Get active provider agreements
    const activeAgreements = providerAgreements.filter(a => a.status === 'active');

    // Consolidate all pricing sources with provider agreement rates
    const consolidatedPricing = [
        ...pricingItems.map(item => {
            // Find matching provider agreement rate
            const providerRate = activeAgreements
                .filter(a => a.provider_name === item.provider_name)
                .sort((a, b) => a.priority - b.priority)[0]
                ?.rate_cards?.find(rc => rc.service_name === item.item_name);

            return {
                ...item,
                source: 'master_pricing',
                has_provider_rate: !!providerRate,
                provider_rate_percentage: providerRate?.negotiated_rate_percentage,
                provider_rate_fixed: providerRate?.negotiated_rate_fixed,
                provider_agreement: providerRate ? activeAgreements.find(a => 
                    a.rate_cards?.some(rc => rc.service_name === item.item_name)
                )?.agreement_name : null
            };
        }),
        ...serviceCatalog.map(service => ({
            id: service.id,
            item_id: service.service_id,
            item_name: service.service_name,
            category: 'service',
            provider_name: service.provider_name,
            buy_rate_fixed: service.base_price,
            buy_rate_percentage: service.variable_price,
            sell_rate_fixed: service.base_price ? service.base_price * 1.2 : 0,
            margin_percentage: 20,
            status: service.status,
            source: 'service_catalog',
            original_data: service
        })),
        ...payoutRoutes.map(route => ({
            id: route.id,
            item_id: route.route_name,
            item_name: route.route_name,
            category: 'payout_route',
            provider_name: route.provider,
            buy_rate_percentage: route.cost_percentage,
            buy_rate_fixed: route.cost_fixed,
            status: route.status,
            source: 'payout_route',
            original_data: route
        })),
        ...feeTemplates.map(fee => ({
            id: fee.id,
            item_id: fee.fee_code,
            item_name: fee.fee_name,
            category: fee.category || 'platform_fee',
            buy_rate_percentage: fee.percentage_amount,
            buy_rate_fixed: fee.fixed_amount,
            status: fee.status,
            source: 'fee_template',
            original_data: fee
        }))
    ];

    const filteredItems = consolidatedPricing.filter(item => {
        const matchesSearch = !searchTerm || 
            item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.provider_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesServiceType = serviceTypeFilter === 'all' || item.service_type === serviceTypeFilter;
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesServiceLine = serviceLineFilter === 'all' || item.service_type === serviceLineFilter;
        
        // Date range filtering (if applicable)
        let matchesDateRange = true;
        if (dateRange.from && item.created_date) {
            const itemDate = new Date(item.created_date);
            matchesDateRange = itemDate >= dateRange.from;
            if (dateRange.to) {
                matchesDateRange = matchesDateRange && itemDate <= dateRange.to;
            }
        }
        
        return matchesSearch && matchesServiceType && matchesCategory && matchesStatus && matchesServiceLine && matchesDateRange;
    });

    const stats = {
        total: consolidatedPricing.length,
        active: consolidatedPricing.filter(i => i.status === 'active').length,
        pendingApproval: pricingItems.filter(i => i.status === 'pending_approval').length,
        totalRevenue: pricingItems.reduce((sum, i) => sum + (i.total_revenue || 0), 0),
        totalCost: pricingItems.reduce((sum, i) => sum + (i.total_cost || 0), 0),
        margin: pricingItems.reduce((sum, i) => sum + ((i.total_revenue || 0) - (i.total_cost || 0)), 0),
        bySource: {
            master: pricingItems.length,
            services: serviceCatalog.length,
            payouts: payoutRoutes.length,
            fees: feeTemplates.length
        }
    };

    const canApprove = platformUser?.platform_role === PLATFORM_ROLES.FINANCE_MANAGER || 
                       platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN ||
                       platformUser?.platform_role === PLATFORM_ROLES.ADMIN;

    const handleSubmit = () => {
        const margin = (formData.sell_rate_percentage || 0) - (formData.buy_rate_percentage || 0);
        const dataToSubmit = {
            ...formData,
            margin_percentage: margin
        };

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: dataToSubmit });
        } else {
            createMutation.mutate(dataToSubmit);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData(item);
        setShowDialog(true);
    };

    const resetForm = () => {
        setFormData({
            category: '',
            item_name: '',
            buy_rate_type: 'percentage',
            sell_rate_type: 'percentage',
            currency: 'USD',
            status: 'active'
        });
        setEditingItem(null);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text('Master Pricing Report', 14, 22);
        doc.setFontSize(11);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        
        const tableData = filteredItems.map(item => [
            item.item_name,
            item.service_type || '-',
            item.provider_name || '-',
            `${item.buy_rate_percentage || 0}%`,
            `${item.sell_rate_percentage || 0}%`,
            `${item.margin_percentage?.toFixed(2) || 0}%`,
            item.status
        ]);
        
        doc.autoTable({
            startY: 35,
            head: [['Item', 'Service', 'Provider', 'Buy Rate', 'Sell Rate', 'Margin', 'Status']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 }
        });
        
        doc.save(`master-pricing-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('PDF exported successfully');
    };

    const exportToCSV = () => {
        const headers = ['Item', 'Service Type', 'Category', 'Provider', 'Buy Rate %', 'Buy Rate Fixed', 'Sell Rate %', 'Sell Rate Fixed', 'FX Spread %', 'Margin %', 'Status'];
        const rows = filteredItems.map(item => [
            item.item_name,
            item.service_type || '',
            item.category || '',
            item.provider_name || '',
            item.buy_rate_percentage || '',
            item.buy_rate_fixed || '',
            item.sell_rate_percentage || '',
            item.sell_rate_fixed || '',
            item.fx_spread_percentage || '',
            item.margin_percentage?.toFixed(2) || '',
            item.status
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `master-pricing-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
    };

    // Chart data
    const revenueByServiceChart = Object.entries(
        filteredItems.reduce((acc, item) => {
            const service = item.service_type || 'Other';
            acc[service] = (acc[service] || 0) + (item.total_revenue || 0);
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value }));

    const marginTrendData = filteredItems.slice(0, 10).map((item, idx) => ({
        name: item.item_name?.substring(0, 15) + '...',
        margin: item.margin_percentage || 0,
        revenue: item.total_revenue || 0
    }));

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
                    currentPage="MasterPricingManagement" 
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
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">{t('platform:pages.masterPricing.title')}</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">{t('platform:pages.masterPricing.subtitle')}</p>
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
                        <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2 bg-blue-600" size="sm">
                            <Plus className="h-4 w-4" />
                            New
                        </Button>
                    </div>
                </header>

                <main className="p-6">
                    <Tabs defaultValue="pricing" className="mb-6">
                        <TabsList>
                            <TabsTrigger value="pricing">Pricing Matrix</TabsTrigger>
                            <TabsTrigger value="agreements">Provider Agreements</TabsTrigger>
                            <TabsTrigger value="enhanced">Enhanced Features</TabsTrigger>
                            <TabsTrigger value="sync">Sync & Reconciliation</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="pricing" className="space-y-6 mt-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Items</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingApproval}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">${stats.totalRevenue.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Total Cost</p>
                                    <p className="text-2xl font-bold text-red-600 mt-1">${stats.totalCost.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Gross Margin</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">${stats.margin.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600 mb-2">Sources</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">Services:</span>
                                            <span className="font-medium">{stats.bySource.services}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">Payouts:</span>
                                            <span className="font-medium">{stats.bySource.payouts}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-600">Fees:</span>
                                            <span className="font-medium">{stats.bySource.fees}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Approval Alert */}
                    {stats.pendingApproval > 0 && canApprove && (
                        <Card className="mb-6 border-amber-300 bg-amber-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                    <div>
                                        <p className="font-semibold text-amber-900">
                                            {stats.pendingApproval} pricing {stats.pendingApproval === 1 ? 'item' : 'items'} awaiting your approval
                                        </p>
                                        <p className="text-sm text-amber-700">Review and approve pricing changes below</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Service Billing Status Banner */}
                    {serviceBillingConfigs.some(s => s.configuration_status !== 'complete') && (
                        <Card className="mb-6 border-blue-300 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-blue-900 mb-2">Service Pricing Configuration Required</p>
                                        <div className="space-y-1">
                                            {serviceBillingConfigs.filter(s => s.configuration_status !== 'complete').map(service => (
                                                <div key={service.id} className="flex items-center justify-between text-sm">
                                                    <span className="text-blue-800">{service.service_name}</span>
                                                    <Badge className="bg-amber-100 text-amber-700">
                                                        {service.configuration_status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Enhanced Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex-1 min-w-[200px] relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search pricing items..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-56 justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange.from ? (
                                                dateRange.to ? (
                                                    `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                                                ) : format(dateRange.from, 'MMM d, yyyy')
                                            ) : 'Date Range'}
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
                                    <SelectTrigger className="w-56">
                                        <SelectValue placeholder="Service Line" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Service Lines</SelectItem>
                                        {serviceTypes.map(st => (
                                            <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending_approval">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                                {(dateRange.from || serviceLineFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setDateRange({ from: null, to: null });
                                        setServiceLineFilter('all');
                                        setCategoryFilter('all');
                                        setStatusFilter('all');
                                    }}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analytics Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Revenue by Service Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={revenueByServiceChart}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
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

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Margin Analysis (Top 10 Items)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={marginTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" fontSize={10} angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="margin" fill="#10b981" name="Margin %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                        {/* Pricing Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pricing Matrix</CardTitle>
                            </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-4 font-semibold">Item</th>
                                            <th className="text-left py-3 px-4 font-semibold">Service</th>
                                            <th className="text-left py-3 px-4 font-semibold">Source</th>
                                            <th className="text-left py-3 px-4 font-semibold">Category</th>
                                            <th className="text-left py-3 px-4 font-semibold">Provider</th>
                                            <th className="text-right py-3 px-4 font-semibold">Buy Rate</th>
                                            <th className="text-right py-3 px-4 font-semibold">Sell Rate</th>
                                            <th className="text-right py-3 px-4 font-semibold">FX Spread</th>
                                            <th className="text-right py-3 px-4 font-semibold">Margin</th>
                                            <th className="text-left py-3 px-4 font-semibold">Status</th>
                                            <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredItems.map((item) => (
                                            <tr key={`${item.source}-${item.id}`} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900">{item.item_name}</p>
                                                        <p className="text-xs text-slate-500">{item.item_id}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {item.service_type ? (
                                                        <Badge className="bg-indigo-100 text-indigo-700">
                                                            {serviceTypes.find(s => s.value === item.service_type)?.label || item.service_type}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className={
                                                        item.source === 'service_catalog' ? 'bg-blue-50 text-blue-700' :
                                                        item.source === 'payout_route' ? 'bg-green-50 text-green-700' :
                                                        item.source === 'fee_template' ? 'bg-purple-50 text-purple-700' :
                                                        'bg-slate-50 text-slate-700'
                                                    }>
                                                        {item.source?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className="capitalize">
                                                        {item.category?.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-slate-600">{item.provider_name || '-'}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="space-y-1">
                                                        <div className={item.has_provider_rate ? 'line-through text-slate-400 text-xs' : 'text-slate-900'}>
                                                            {item.buy_rate_percentage ? `${item.buy_rate_percentage}%` : '-'}
                                                            {item.buy_rate_fixed ? ` + $${item.buy_rate_fixed}` : ''}
                                                        </div>
                                                        {item.has_provider_rate && (
                                                            <div>
                                                                <div className="font-semibold text-emerald-600">
                                                                    {item.provider_rate_percentage ? `${item.provider_rate_percentage}%` : '-'}
                                                                    {item.provider_rate_fixed ? ` + $${item.provider_rate_fixed}` : ''}
                                                                </div>
                                                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                                                    {item.provider_agreement}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-right text-slate-900">
                                                    {item.sell_rate_percentage ? `${item.sell_rate_percentage}%` : '-'}
                                                    {item.sell_rate_fixed ? ` + $${item.sell_rate_fixed}` : ''}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    {item.fx_spread_percentage ? (
                                                        <span className="text-blue-600 font-medium">
                                                            {item.fx_spread_percentage}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className={item.margin_percentage >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
                                                        {item.margin_percentage?.toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge className={
                                                        item.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                        item.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    }>
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {item.source === 'master_pricing' ? (
                                                            <>
                                                                {item.status === 'pending_approval' && canApprove ? (
                                                                    <>
                                                                        <Button 
                                                                            size="sm" 
                                                                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                                            onClick={() => approveMutation.mutate({ id: item.id, approved: true })}
                                                                        >
                                                                            Approve
                                                                        </Button>
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="outline"
                                                                            className="text-red-600 hover:bg-red-50"
                                                                            onClick={() => approveMutation.mutate({ id: item.id, approved: false })}
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                                                            <Edit className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(item.id)} className="text-red-600">
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <Button size="sm" variant="outline" onClick={() => {
                                                                const newItem = {
                                                                    category: item.category,
                                                                    item_name: item.item_name,
                                                                    provider_name: item.provider_name,
                                                                    buy_rate_percentage: item.buy_rate_percentage,
                                                                    buy_rate_fixed: item.buy_rate_fixed,
                                                                    sell_rate_percentage: item.sell_rate_percentage,
                                                                    sell_rate_fixed: item.sell_rate_fixed,
                                                                    source_ref: item.source,
                                                                    source_id: item.id
                                                                };
                                                                setFormData(newItem);
                                                                setShowDialog(true);
                                                            }}>
                                                                Import to Master
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredItems.length === 0 && (
                                    <div className="text-center py-12 text-slate-600">
                                        No pricing items found
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        </Card>
                        </TabsContent>

                        <TabsContent value="agreements" className="mt-6">
                            <ProviderAgreementsManager />
                        </TabsContent>

                        <TabsContent value="enhanced" className="mt-6">
                            <PricingEnhancedManager />
                        </TabsContent>

                        <TabsContent value="sync" className="mt-6">
                            <PricingSyncManager />
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Pricing Item' : 'New Pricing Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Service Type *</Label>
                                <Select value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {serviceTypes.map(st => (
                                            <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Category *</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Item Name *</Label>
                            <Input
                                value={formData.item_name || ''}
                                onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                                placeholder="e.g., Stripe Payment Processing"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.item_description || ''}
                                onChange={(e) => setFormData({...formData, item_description: e.target.value})}
                                placeholder="Detailed description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Provider Name</Label>
                                <Input
                                    value={formData.provider_name || ''}
                                    onChange={(e) => setFormData({...formData, provider_name: e.target.value})}
                                    placeholder="e.g., Stripe, Adyen"
                                />
                            </div>
                            <div>
                                <Label>Currency</Label>
                                <Input
                                    value={formData.currency || 'USD'}
                                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-slate-900 mb-3">Buy Rates (What We Pay)</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <Label>Rate Type</Label>
                                    <Select value={formData.buy_rate_type || 'percentage'} onValueChange={(value) => setFormData({...formData, buy_rate_type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed</SelectItem>
                                            <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                                            <SelectItem value="tiered">Tiered (Volume-based)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Per Transaction Cost</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.cost_per_transaction || ''}
                                        onChange={(e) => setFormData({...formData, cost_per_transaction: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                            {formData.buy_rate_type !== 'tiered' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Percentage (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.buy_rate_percentage || ''}
                                            onChange={(e) => setFormData({...formData, buy_rate_percentage: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Fixed Amount</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.buy_rate_fixed || ''}
                                            onChange={(e) => setFormData({...formData, buy_rate_fixed: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-slate-900 mb-3">Sell Rates (What We Charge)</h4>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <Label>Rate Type</Label>
                                    <Select value={formData.sell_rate_type || 'percentage'} onValueChange={(value) => setFormData({...formData, sell_rate_type: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed</SelectItem>
                                            <SelectItem value="hybrid">Hybrid (Both)</SelectItem>
                                            <SelectItem value="tiered">Tiered (Volume-based)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Per Transaction Revenue</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.revenue_per_transaction || ''}
                                        onChange={(e) => setFormData({...formData, revenue_per_transaction: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <Label>FX Spread (%)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 0.80 for 0.8%"
                                        value={formData.fx_spread_percentage || ''}
                                        onChange={(e) => setFormData({...formData, fx_spread_percentage: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                            {formData.sell_rate_type !== 'tiered' && (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label>Percentage (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.sell_rate_percentage || ''}
                                            onChange={(e) => setFormData({...formData, sell_rate_percentage: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Fixed Amount</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.sell_rate_fixed || ''}
                                            onChange={(e) => setFormData({...formData, sell_rate_fixed: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <Label>FX Spread (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="e.g., 1.5"
                                            value={formData.fx_spread_percentage || ''}
                                            onChange={(e) => setFormData({...formData, fx_spread_percentage: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tiered Pricing Configuration */}
                        {(formData.buy_rate_type === 'tiered' || formData.sell_rate_type === 'tiered') && (
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-sm mb-3">Tiered Pricing Configuration</h4>
                                
                                {formData.buy_rate_type === 'tiered' && (
                                    <div className="mb-4">
                                        <Label className="mb-2 block">Buy Rate Tiers</Label>
                                        <div className="space-y-3">
                                            {(formData.buy_rate_tiers || []).map((tier, idx) => (
                                                <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="font-semibold">Tier {idx + 1}</Label>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const newTiers = formData.buy_rate_tiers.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                            }}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Label className="text-xs">Tier Label</Label>
                                                            <Input
                                                                placeholder="e.g., Up to 2 million"
                                                                value={tier.tier_label || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.buy_rate_tiers];
                                                                    newTiers[idx].tier_label = e.target.value;
                                                                    setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Payment Method</Label>
                                                            <Select
                                                                value={tier.payment_method || ''}
                                                                onValueChange={(value) => {
                                                                    const newTiers = [...formData.buy_rate_tiers];
                                                                    newTiers[idx].payment_method = value;
                                                                    setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select method" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {paymentMethods.map(method => (
                                                                        <SelectItem key={method} value={method}>
                                                                            {method.replace(/_/g, ' ').toUpperCase()}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {tier.payment_method === 'other' && (
                                                                <Input
                                                                    placeholder="Enter custom method"
                                                                    className="mt-2"
                                                                    value={tier.payment_method_custom || ''}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...formData.buy_rate_tiers];
                                                                        newTiers[idx].payment_method_custom = e.target.value;
                                                                        setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Currency</Label>
                                                            <Input
                                                                placeholder="USD"
                                                                value={tier.currency || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.buy_rate_tiers];
                                                                    newTiers[idx].currency = e.target.value;
                                                                    setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Fixed Fee</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={tier.fixed_fee || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.buy_rate_tiers];
                                                                    newTiers[idx].fixed_fee = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Rate (%)</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={tier.rate_percentage || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.buy_rate_tiers];
                                                                    newTiers[idx].rate_percentage = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">FX Spread (%)</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={tier.fx_spread_percentage || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.buy_rate_tiers];
                                                                    newTiers[idx].fx_spread_percentage = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Volume Range</Label>
                                                            <div className="flex gap-1">
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Min"
                                                                    value={tier.volume_min || ''}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...formData.buy_rate_tiers];
                                                                        newTiers[idx].volume_min = parseFloat(e.target.value) || 0;
                                                                        setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                    }}
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Max"
                                                                    value={tier.volume_max || ''}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...formData.buy_rate_tiers];
                                                                        newTiers[idx].volume_max = parseFloat(e.target.value) || 0;
                                                                        setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const newTiers = [...(formData.buy_rate_tiers || []), { 
                                                        tier_label: '', 
                                                        payment_method: '', 
                                                        currency: 'USD',
                                                        fixed_fee: 0,
                                                        rate_percentage: 0,
                                                        volume_min: 0, 
                                                        volume_max: 0 
                                                    }];
                                                    setFormData({ ...formData, buy_rate_tiers: newTiers });
                                                }}
                                                className="w-full"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Buy Tier
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {formData.sell_rate_type === 'tiered' && (
                                    <div>
                                        <Label className="mb-2 block">Sell Rate Tiers</Label>
                                        <div className="space-y-3">
                                            {(formData.sell_rate_tiers || []).map((tier, idx) => (
                                                <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="font-semibold">Tier {idx + 1}</Label>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                const newTiers = formData.sell_rate_tiers.filter((_, i) => i !== idx);
                                                                setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                            }}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <Label className="text-xs">Tier Label</Label>
                                                            <Input
                                                                placeholder="e.g., 2-10 million"
                                                                value={tier.tier_label || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.sell_rate_tiers];
                                                                    newTiers[idx].tier_label = e.target.value;
                                                                    setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Payment Method</Label>
                                                            <Select
                                                                value={tier.payment_method || ''}
                                                                onValueChange={(value) => {
                                                                    const newTiers = [...formData.sell_rate_tiers];
                                                                    newTiers[idx].payment_method = value;
                                                                    setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                }}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select method" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {paymentMethods.map(method => (
                                                                        <SelectItem key={method} value={method}>
                                                                            {method.replace(/_/g, ' ').toUpperCase()}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {tier.payment_method === 'other' && (
                                                                <Input
                                                                    placeholder="Enter custom method"
                                                                    className="mt-2"
                                                                    value={tier.payment_method_custom || ''}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...formData.sell_rate_tiers];
                                                                        newTiers[idx].payment_method_custom = e.target.value;
                                                                        setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Currency</Label>
                                                            <Input
                                                                placeholder="USD"
                                                                value={tier.currency || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.sell_rate_tiers];
                                                                    newTiers[idx].currency = e.target.value;
                                                                    setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Fixed Fee</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={tier.fixed_fee || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.sell_rate_tiers];
                                                                    newTiers[idx].fixed_fee = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Rate (%)</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={tier.rate_percentage || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.sell_rate_tiers];
                                                                    newTiers[idx].rate_percentage = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">FX Spread (%)</Label>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={tier.fx_spread_percentage || ''}
                                                                onChange={(e) => {
                                                                    const newTiers = [...formData.sell_rate_tiers];
                                                                    newTiers[idx].fx_spread_percentage = parseFloat(e.target.value) || 0;
                                                                    setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs">Volume Range</Label>
                                                            <div className="flex gap-1">
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Min"
                                                                    value={tier.volume_min || ''}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...formData.sell_rate_tiers];
                                                                        newTiers[idx].volume_min = parseFloat(e.target.value) || 0;
                                                                        setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                    }}
                                                                />
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Max"
                                                                    value={tier.volume_max || ''}
                                                                    onChange={(e) => {
                                                                        const newTiers = [...formData.sell_rate_tiers];
                                                                        newTiers[idx].volume_max = parseFloat(e.target.value) || 0;
                                                                        setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    const newTiers = [...(formData.sell_rate_tiers || []), { 
                                                        tier_label: '', 
                                                        payment_method: '', 
                                                        currency: 'USD',
                                                        fixed_fee: 0,
                                                        rate_percentage: 0,
                                                        volume_min: 0, 
                                                        volume_max: 0 
                                                    }];
                                                    setFormData({ ...formData, sell_rate_tiers: newTiers });
                                                }}
                                                className="w-full"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Sell Tier
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Hybrid Model Configuration */}
                        {formData.buy_rate_type === 'hybrid' && (
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-sm mb-3">Hybrid Model Configuration</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Country</Label>
                                        <Input
                                            placeholder="e.g., Argentina, Bolivia"
                                            value={formData.hybrid_model?.country || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                hybrid_model: { ...formData.hybrid_model, country: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Payment Method</Label>
                                        <Input
                                            placeholder="e.g., Bank Transfer, Mobile Money"
                                            value={formData.hybrid_model?.payment_method || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                hybrid_model: { ...formData.hybrid_model, payment_method: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Account Currency</Label>
                                        <Input
                                            placeholder="e.g., USD, EUR"
                                            value={formData.hybrid_model?.account_currency || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                hybrid_model: { ...formData.hybrid_model, account_currency: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Rate (with currency note)</Label>
                                        <Input
                                            placeholder="e.g., 0.35 USD"
                                            value={formData.hybrid_model?.rate || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                hybrid_model: { ...formData.hybrid_model, rate: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Local Tax</Label>
                                        <Input
                                            placeholder="e.g., IMP DEB & CRED 1.2%"
                                            value={formData.hybrid_model?.local_tax || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                hybrid_model: { ...formData.hybrid_model, local_tax: e.target.value }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>FX Spread (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.80"
                                            value={formData.hybrid_model?.fx_spread_percentage || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                hybrid_model: { ...formData.hybrid_model, fx_spread_percentage: parseFloat(e.target.value) }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Payout Currency</Label>
                                        <Input
                                            placeholder="e.g., ARS, BOB, BRL"
                                            value={formData.hybrid_model?.payout_currency || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                hybrid_model: { ...formData.hybrid_model, payout_currency: e.target.value }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Volume Commitments */}
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-slate-900 mb-3">Volume Commitments</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Monthly Volume Commitment</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 10000000 (USD 10M)"
                                        value={formData.monthly_volume_commitment || ''}
                                        onChange={(e) => setFormData({ ...formData, monthly_volume_commitment: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>Minimum Monthly Commitment</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="e.g., 5000 (USD 5K)"
                                        value={formData.minimum_monthly_commitment || ''}
                                        onChange={(e) => setFormData({ ...formData, minimum_monthly_commitment: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-slate-900 mb-3">Limits</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Minimum Charge</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.minimum_charge || ''}
                                        onChange={(e) => setFormData({ ...formData, minimum_charge: parseFloat(e.target.value) })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <Label>Maximum Charge (optional)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.maximum_charge || ''}
                                        onChange={(e) => setFormData({ ...formData, maximum_charge: e.target.value ? parseFloat(e.target.value) : null })}
                                        placeholder="No limit"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-slate-900 mb-3">Xero Integration</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Xero Account Code</Label>
                                    <Input
                                        value={formData.xero_account_code || ''}
                                        onChange={(e) => setFormData({...formData, xero_account_code: e.target.value})}
                                        placeholder="e.g., 200"
                                    />
                                </div>
                                <div>
                                    <Label>Xero Tax Type</Label>
                                    <Input
                                        value={formData.xero_tax_type || ''}
                                        onChange={(e) => setFormData({...formData, xero_tax_type: e.target.value})}
                                        placeholder="e.g., OUTPUT2"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} className="bg-blue-600">
                                {editingItem ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}