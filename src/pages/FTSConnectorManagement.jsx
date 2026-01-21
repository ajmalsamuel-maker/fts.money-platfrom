import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plug, Plus, Shuffle, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, Clock, Shield, Zap, BarChart3, AlertTriangle, CreditCard, Globe, Edit, Eye, EyeOff, Route, ArrowDown, RefreshCw, GitBranch, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import PaymentMethodSelector from '@/components/providers/PaymentMethodSelector';
import { getPaymentMethodLogo, getPaymentMethodDisplayName } from '@/components/utils/paymentLogos';

export default function FTSConnectorManagement() {
    const [platformUser] = useState(() => JSON.parse(localStorage.getItem('platform_admin_session') || '{}'));
    const { t } = useI18n();
    const queryClient = useQueryClient();
    
    const [activeTab, setActiveTab] = useState('switch');
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showRoutingDialog, setShowRoutingDialog] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    
    const [assignmentForm, setAssignmentForm] = useState({
        service_type: 'psp',
        service_id: '',
        service_name: '',
        payment_provider_id: '',
        priority: 100,
        weight: 100,
        monthly_volume_limit: '',
        monthly_transaction_limit: '',
        daily_volume_limit: '',
        routing_rules: {},
        failover_enabled: true,
        health_check_enabled: true
    });

    const [routingRuleForm, setRoutingRuleForm] = useState({
        rule_name: '',
        payment_provider_id: '',
        conditions: {},
        priority: 100,
        enabled: true
    });

    // Provider Form State (merged from PaymentProviderManagement)
    const [showProviderDialog, setShowProviderDialog] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [showMethodSelector, setShowMethodSelector] = useState(false);
    const [providerForm, setProviderForm] = useState({
        name: '',
        provider_type: 'gateway',
        logo_url: '',
        merchant_id: '',
        api_base_url: '',
        api_key: '',
        api_secret: '',
        webhook_url: '',
        supported_methods: [],
        supported_currencies: ['USD', 'EUR', 'GBP'],
        supported_regions: ['US', 'EU', 'APAC'],
        status: 'active',
        notes: ''
    });

    // Routing Rule Dialog State (merged from PaymentOrchestration)
    const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);
    const [newRoutingRule, setNewRoutingRule] = useState({
        name: '',
        description: '',
        rule_type: 'routing',
        status: 'inactive',
        priority: 100,
        primary_processor: '',
        fallback_processors: [],
        card_networks: [],
        countries: [],
        currencies: [],
        min_amount: null,
        max_amount: null,
        retry_attempts: 3,
        cost_optimization: false
    });

    // Fetch all payment providers from Payment Provider Management
    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    // Fetch connector assignments (multi-service)
    const { data: assignments = [] } = useQuery({
        queryKey: ['connector-assignments'],
        queryFn: () => base44.entities.PSPConnectorAssignment.list('-created_date')
    });

    // Fetch all service types for assignment
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ status: 'active' })
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

    const { data: rwaCustomers = [] } = useQuery({
        queryKey: ['rwa-customers'],
        queryFn: () => base44.entities.RWAWhiteLabelCustomer.list()
    });

    const { data: usageMetrics = [] } = useQuery({
        queryKey: ['connector-usage'],
        queryFn: () => base44.entities.ConnectorUsageMetric.list('-created_date', 100)
    });

    // Routing Rules (from PaymentOrchestration)
    const { data: routingRules = [] } = useQuery({
        queryKey: ['routing-rules'],
        queryFn: () => base44.entities.RoutingRule.list('-priority')
    });

    // Master Pricing for provider pricing
    const { data: masterPricing = [] } = useQuery({
        queryKey: ['master-pricing'],
        queryFn: () => base44.entities.MasterPricing.list()
    });

    const assignProviderMutation = useMutation({
        mutationFn: (data) => {
            const provider = paymentProviders.find(p => p.id === data.payment_provider_id);
            return base44.entities.PSPConnectorAssignment.create({
                service_type: data.service_type,
                service_id: data.service_id,
                service_name: data.service_name,
                psp_code: data.service_type === 'psp' ? data.service_id : null,
                payment_provider_id: data.payment_provider_id,
                connector_name: provider?.name,
                assignment_status: 'active',
                assigned_date: new Date().toISOString(),
                priority: data.priority || 100,
                weight: data.weight || 100,
                failover_enabled: data.failover_enabled,
                health_check_enabled: data.health_check_enabled,
                usage_limits: {
                    monthly_volume_limit: parseInt(data.monthly_volume_limit) || null,
                    monthly_transaction_limit: parseInt(data.monthly_transaction_limit) || null,
                    daily_volume_limit: parseInt(data.daily_volume_limit) || null
                },
                routing_rules: data.routing_rules || {}
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connector-assignments'] });
            toast.success('Payment provider assigned to service');
            setShowAssignDialog(false);
            resetAssignmentForm();
        }
    });

    const toggleProviderMutation = useMutation({
        mutationFn: ({ id, enabled }) => 
            base44.entities.PSPConnectorAssignment.update(id, { 
                enabled_by_psp: enabled,
                assignment_status: enabled ? 'active' : 'suspended'
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connector-assignments'] });
            toast.success('Provider status updated');
        }
    });

    // Create Provider Mutation (merged from PaymentProviderManagement)
    const createProviderMutation = useMutation({
        mutationFn: async (data) => {
            const provider = await base44.entities.PaymentProvider.create({
                name: data.name,
                type: data.provider_type,
                logo_url: data.logo_url,
                merchant_id: data.merchant_id,
                api_base_url: data.api_base_url,
                api_key: data.api_key,
                api_secret: data.api_secret,
                webhook_url: data.webhook_url,
                supported_currencies: data.supported_currencies,
                supported_regions: data.supported_regions,
                supported_methods: data.supported_methods,
                status: data.status,
                notes: data.notes
            });
            return provider;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-providers']);
            setShowProviderDialog(false);
            resetProviderForm();
            toast.success('Payment provider created!');
        },
        onError: (error) => {
            toast.error(`Failed to create provider: ${error.message}`);
        }
    });

    // Update Provider Mutation
    const updateProviderMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return base44.entities.PaymentProvider.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-providers']);
            setShowProviderDialog(false);
            setEditingProvider(null);
            resetProviderForm();
            toast.success('Payment provider updated!');
        }
    });

    // Delete Provider Mutation
    const deleteProviderMutation = useMutation({
        mutationFn: (id) => base44.entities.PaymentProvider.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['payment-providers']);
            toast.success('Provider deleted');
        }
    });

    // Create Routing Rule Mutation (merged from PaymentOrchestration)
    const createRoutingRuleMutation = useMutation({
        mutationFn: (data) => base44.entities.RoutingRule.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
            setShowCreateRuleDialog(false);
            resetRoutingRuleForm();
            toast.success('Routing rule created!');
        }
    });

    // Delete Routing Rule Mutation
    const deleteRoutingRuleMutation = useMutation({
        mutationFn: (id) => base44.entities.RoutingRule.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
            toast.success('Routing rule deleted');
        }
    });

    // Toggle Routing Rule Status
    const toggleRoutingRuleMutation = useMutation({
        mutationFn: ({ id, status }) => 
            base44.entities.RoutingRule.update(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
            toast.success('Rule status updated');
        }
    });

    const resetProviderForm = () => {
        setProviderForm({
            name: '',
            provider_type: 'gateway',
            logo_url: '',
            merchant_id: '',
            api_base_url: '',
            api_key: '',
            api_secret: '',
            webhook_url: '',
            supported_methods: [],
            supported_currencies: ['USD', 'EUR', 'GBP'],
            supported_regions: ['US', 'EU', 'APAC'],
            status: 'active',
            notes: ''
        });
        setEditingProvider(null);
    };

    const resetRoutingRuleForm = () => {
        setNewRoutingRule({
            name: '',
            description: '',
            rule_type: 'routing',
            status: 'inactive',
            priority: 100,
            primary_processor: '',
            fallback_processors: [],
            card_networks: [],
            countries: [],
            currencies: [],
            min_amount: null,
            max_amount: null,
            retry_attempts: 3,
            cost_optimization: false
        });
    };

    const handleSaveProvider = () => {
        if (editingProvider) {
            updateProviderMutation.mutate({ id: editingProvider.id, data: providerForm });
        } else {
            createProviderMutation.mutate(providerForm);
        }
    };

    const ruleTypeConfig = {
        routing: { label: 'Smart Routing', icon: Route, color: 'text-blue-600 bg-blue-50' },
        cascading: { label: 'Cascading', icon: ArrowDown, color: 'text-purple-600 bg-purple-50' },
        fallback: { label: 'Fallback', icon: RefreshCw, color: 'text-amber-600 bg-amber-50' },
        split: { label: 'Traffic Split', icon: Shuffle, color: 'text-emerald-600 bg-emerald-50' }
    };

    const resetAssignmentForm = () => {
        setAssignmentForm({
            service_type: 'psp',
            service_id: '',
            service_name: '',
            payment_provider_id: '',
            priority: 100,
            weight: 100,
            monthly_volume_limit: '',
            monthly_transaction_limit: '',
            daily_volume_limit: '',
            routing_rules: {},
            failover_enabled: true,
            health_check_enabled: true
        });
    };

    const totalVolume = usageMetrics.reduce((sum, m) => sum + (m.total_volume || 0), 0);
    const totalTransactions = usageMetrics.reduce((sum, m) => sum + (m.total_transactions || 0), 0);
    const totalFees = usageMetrics.reduce((sum, m) => sum + (m.platform_fees_charged || 0), 0);
    const activeProviders = paymentProviders.filter(p => p.status === 'active').length;
    const avgSuccessRate = usageMetrics.length > 0 
        ? usageMetrics.reduce((sum, m) => sum + (m.success_rate || 0), 0) / usageMetrics.length 
        : 0;

    const getServiceList = (serviceType) => {
        switch(serviceType) {
            case 'psp': return psps;
            case 'iso_gateway': return isoCustomers;
            case 'orchestration': return orchestrationCustomers;
            case 'crypto': return cryptoCustomers;
            case 'rwa': return rwaCustomers;
            default: return [];
        }
    };

    const getServiceDisplayName = (service, type) => {
        switch(type) {
            case 'psp': return `${service.psp_name} (${service.psp_code})`;
            case 'iso_gateway': return service.customer_name || service.customer_id;
            case 'orchestration': return service.customer_name || service.customer_id;
            case 'crypto': return service.customer_name || service.customer_id;
            case 'rwa': return service.customer_name || service.customer_id;
            default: return 'Unknown';
        }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSConnectorManagement"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Shuffle className="h-5 w-5 text-blue-600" />
                            Payment Switch Management
                        </h2>
                        <p className="text-xs text-slate-600">Centralized routing, orchestration & multi-service provider mapping</p>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={true} />
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Plug className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Payment Providers</p>
                                        <p className="text-2xl font-bold">{activeProviders}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Shuffle className="h-8 w-8 text-emerald-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Active Routes</p>
                                        <p className="text-2xl font-bold">{assignments.filter(a => a.assignment_status === 'active').length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Total Volume</p>
                                        <p className="text-2xl font-bold">${(totalVolume / 1000000).toFixed(1)}M</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Success Rate</p>
                                        <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Platform Fees</p>
                                        <p className="text-2xl font-bold">${(totalFees / 1000).toFixed(1)}K</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="switch">Payment Switch</TabsTrigger>
                            <TabsTrigger value="routing">Routing & Orchestration</TabsTrigger>
                            <TabsTrigger value="providers">Provider Registry</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="health">Health Monitoring</TabsTrigger>
                        </TabsList>

                        {/* Payment Switch Tab */}
                        <TabsContent value="switch">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Multi-Service Payment Switch</CardTitle>
                                        <p className="text-sm text-slate-600 mt-1">Route payment providers to PSP, ISO Gateway, Orchestration, Crypto & RWA services</p>
                                    </div>
                                    <Button onClick={() => setShowAssignDialog(true)} className="gap-2">
                                        <Plus className="h-4 w-4" /> Assign Provider to Service
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Service Type</TableHead>
                                                <TableHead>Service</TableHead>
                                                <TableHead>Payment Provider</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Limits</TableHead>
                                                <TableHead>Health</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {assignments.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                        <Shuffle className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                                                        <p className="font-semibold mb-1">No provider assignments yet</p>
                                                        <p className="text-sm">Assign payment providers to your services to start routing payments</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                assignments.map(assignment => (
                                                    <TableRow key={assignment.id}>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {(assignment.service_type || 'psp').replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {assignment.service_name || assignment.psp_code || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                                                                    {paymentProviders.find(p => p.id === assignment.payment_provider_id)?.logo_url ? (
                                                                        <img 
                                                                            src={paymentProviders.find(p => p.id === assignment.payment_provider_id)?.logo_url} 
                                                                            alt="" 
                                                                            className="w-full h-full object-contain"
                                                                        />
                                                                    ) : '💳'}
                                                                </div>
                                                                <span className="text-sm">{assignment.connector_name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{assignment.priority || 100}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Switch
                                                                checked={assignment.enabled_by_psp !== false && assignment.assignment_status === 'active'}
                                                                onCheckedChange={(checked) => 
                                                                    toggleProviderMutation.mutate({ id: assignment.id, enabled: checked })
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {assignment.usage_limits?.monthly_volume_limit 
                                                                ? `$${(assignment.usage_limits.monthly_volume_limit / 1000).toFixed(0)}K/mo`
                                                                : 'Unlimited'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {assignment.health_check_enabled ? (
                                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-slate-400" />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="sm">
                                                                Configure
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                    </TabsContent>

                        {/* Routing & Orchestration Tab - MERGED FROM PaymentOrchestration */}
                        <TabsContent value="routing">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Smart Routing Rules</CardTitle>
                                        <CardDescription>Configure routing, cascading, failover, and split payment rules</CardDescription>
                                    </div>
                                    <Button onClick={() => setShowCreateRuleDialog(true)} className="gap-2">
                                        <Plus className="h-4 w-4" /> Create Routing Rule
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {routingRules.length === 0 ? (
                                        <div className="p-6">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                                <div className="flex items-start gap-3">
                                                    <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-semibold text-blue-900 mb-1">Payment Switch Routing Features</h4>
                                                        <ul className="text-sm text-blue-800 space-y-1">
                                                            <li>• <strong>Load Balancing:</strong> Distribute transactions across providers based on weight</li>
                                                            <li>• <strong>Failover:</strong> Automatic fallback to backup providers on failure</li>
                                                            <li>• <strong>Cost Optimization:</strong> Route to lowest-cost provider based on transaction type</li>
                                                            <li>• <strong>Geographic Routing:</strong> Route based on customer location</li>
                                                            <li>• <strong>Smart Retry:</strong> Intelligent retry logic with cascading fallback</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center py-8 text-slate-500">
                                                <Route className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                                                <p className="font-semibold mb-1">No routing rules configured</p>
                                                <p className="text-sm mb-4">Create your first routing rule to optimize payment flows</p>
                                                <Button onClick={() => setShowCreateRuleDialog(true)}>
                                                    <Plus className="h-4 w-4 mr-2" /> Create First Rule
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead className="w-16">Priority</TableHead>
                                                    <TableHead>Rule</TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Primary Provider</TableHead>
                                                    <TableHead>Fallbacks</TableHead>
                                                    <TableHead>Conditions</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="w-24">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {routingRules.sort((a, b) => (a.priority || 100) - (b.priority || 100)).map((rule) => {
                                                    const TypeIcon = ruleTypeConfig[rule.rule_type]?.icon || Route;
                                                    return (
                                                        <TableRow key={rule.id}>
                                                            <TableCell>
                                                                <Badge variant="outline" className="font-mono">
                                                                    #{rule.priority || 100}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div>
                                                                    <p className="font-medium">{rule.name}</p>
                                                                    {rule.description && (
                                                                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{rule.description}</p>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium", ruleTypeConfig[rule.rule_type]?.color)}>
                                                                    <TypeIcon className="h-3.5 w-3.5" />
                                                                    {ruleTypeConfig[rule.rule_type]?.label || rule.rule_type}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="capitalize">
                                                                    {rule.primary_processor || '-'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-1">
                                                                    {rule.fallback_processors?.slice(0, 2).map((p, i) => (
                                                                        <Badge key={i} variant="secondary" className="text-xs capitalize">
                                                                            {p}
                                                                        </Badge>
                                                                    ))}
                                                                    {rule.fallback_processors?.length > 2 && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            +{rule.fallback_processors.length - 2}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {rule.card_networks?.length > 0 && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <CreditCard className="h-3 w-3 mr-1" />
                                                                            {rule.card_networks.length}
                                                                        </Badge>
                                                                    )}
                                                                    {rule.countries?.length > 0 && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <Globe className="h-3 w-3 mr-1" />
                                                                            {rule.countries.length}
                                                                        </Badge>
                                                                    )}
                                                                    {rule.min_amount && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            <DollarSign className="h-3 w-3" />
                                                                            ≥${rule.min_amount}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Switch
                                                                    checked={rule.status === 'active'}
                                                                    onCheckedChange={(checked) => 
                                                                        toggleRoutingRuleMutation.mutate({ 
                                                                            id: rule.id, 
                                                                            status: checked ? 'active' : 'inactive' 
                                                                        })
                                                                    }
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        if (confirm('Delete this routing rule?')) {
                                                                            deleteRoutingRuleMutation.mutate(rule.id);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                    </TabsContent>

                        {/* Provider Registry Tab - MERGED FROM PaymentProviderManagement */}
                        <TabsContent value="providers">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Global Payment Provider Registry</CardTitle>
                                        <CardDescription>Manage all payment providers, their credentials, and pricing</CardDescription>
                                    </div>
                                    <Button onClick={() => { resetProviderForm(); setShowProviderDialog(true); }} className="gap-2">
                                        <Plus className="h-4 w-4" /> Add Provider
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Payment Methods</TableHead>
                                                <TableHead>Currencies</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Assigned To</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paymentProviders.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                        <CreditCard className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                                                        <p className="font-semibold mb-1">No payment providers configured</p>
                                                        <p className="text-sm">Add your first payment provider to get started</p>
                                                    </TableCell>
                                                </TableRow>
                                            ) : paymentProviders.map(provider => {
                                                const assignmentCount = assignments.filter(a => a.payment_provider_id === provider.id).length;
                                                return (
                                                    <TableRow key={provider.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded-lg border flex items-center justify-center bg-white">
                                                                    {provider.logo_url ? (
                                                                        <img src={provider.logo_url} alt={provider.name} className="w-full h-full object-contain p-1" />
                                                                    ) : <CreditCard className="h-6 w-6 text-slate-400" />}
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium">{provider.name}</span>
                                                                    {provider.merchant_id && (
                                                                        <p className="text-xs text-slate-500">MID: {provider.merchant_id}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {provider.type?.replace('_', ' ')}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                {(provider.supported_methods || []).slice(0, 3).map(method => (
                                                                    <Badge key={method} variant="secondary" className="text-xs">
                                                                        {getPaymentMethodDisplayName(method)}
                                                                    </Badge>
                                                                ))}
                                                                {(provider.supported_methods || []).length > 3 && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        +{provider.supported_methods.length - 3}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(provider.supported_currencies || []).slice(0, 3).map(c => (
                                                                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                                                ))}
                                                                {(provider.supported_currencies || []).length > 3 && (
                                                                    <span className="text-xs text-slate-500">+{provider.supported_currencies.length - 3}</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={provider.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                                {provider.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary">{assignmentCount} services</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-1">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setEditingProvider(provider);
                                                                        setProviderForm({
                                                                            name: provider.name,
                                                                            provider_type: provider.type,
                                                                            logo_url: provider.logo_url || '',
                                                                            merchant_id: provider.merchant_id || '',
                                                                            api_base_url: provider.api_base_url || '',
                                                                            api_key: provider.api_key || '',
                                                                            api_secret: provider.api_secret || '',
                                                                            webhook_url: provider.webhook_url || '',
                                                                            supported_methods: provider.supported_methods || [],
                                                                            supported_currencies: provider.supported_currencies || [],
                                                                            supported_regions: provider.supported_regions || [],
                                                                            status: provider.status,
                                                                            notes: provider.notes || ''
                                                                        });
                                                                        setShowProviderDialog(true);
                                                                    }}
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setAssignmentForm({ ...assignmentForm, payment_provider_id: provider.id });
                                                                        setShowAssignDialog(true);
                                                                    }}
                                                                >
                                                                    Assign
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Provider Usage & Performance Analytics</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Service</TableHead>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Period</TableHead>
                                                <TableHead>Transactions</TableHead>
                                                <TableHead>Volume</TableHead>
                                                <TableHead>Success Rate</TableHead>
                                                <TableHead>Avg Latency</TableHead>
                                                <TableHead>Fees</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {usageMetrics.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                        No usage data yet
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                usageMetrics.map(metric => (
                                                    <TableRow key={metric.id}>
                                                        <TableCell className="font-medium">{metric.psp_code || metric.service_id}</TableCell>
                                                        <TableCell className="capitalize">{metric.connector_name}</TableCell>
                                                        <TableCell className="text-sm text-slate-600">
                                                            {metric.period_start && format(new Date(metric.period_start), 'MMM dd')}
                                                            {metric.period_end && ` - ${format(new Date(metric.period_end), 'MMM dd')}`}
                                                        </TableCell>
                                                        <TableCell>{metric.total_transactions?.toLocaleString()}</TableCell>
                                                        <TableCell className="font-medium">${metric.total_volume?.toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className={metric.success_rate >= 95 ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                                                                    {metric.success_rate?.toFixed(1)}%
                                                                </span>
                                                                {metric.success_rate < 90 && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">{metric.avg_latency_ms || '-'}ms</TableCell>
                                                        <TableCell className="font-semibold text-blue-600">
                                                            ${metric.platform_fees_charged?.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Health Monitoring Tab */}
                        <TabsContent value="health">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Provider Health Monitoring</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-green-900 mb-1">Real-Time Health Checks</h4>
                                                    <ul className="text-sm text-green-800 space-y-1">
                                                        <li>• Automated health pings every 30 seconds</li>
                                                        <li>• Automatic failover on provider downtime</li>
                                                        <li>• Circuit breaker patterns for failing providers</li>
                                                        <li>• Performance degradation detection</li>
                                                        <li>• Webhook alerts for critical failures</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-center text-slate-500 py-8">Provider health dashboard coming soon</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Create/Edit Provider Dialog */}
                <Dialog open={showProviderDialog} onOpenChange={setShowProviderDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProvider ? 'Edit Payment Provider' : 'Add Payment Provider'}</DialogTitle>
                            <DialogDescription>Configure payment provider credentials and supported methods</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Provider Name *</Label>
                                    <Input
                                        value={providerForm.name}
                                        onChange={(e) => setProviderForm({...providerForm, name: e.target.value})}
                                        placeholder="Stripe, PayPal, Adyen..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Provider Type</Label>
                                    <Select 
                                        value={providerForm.provider_type}
                                        onValueChange={(v) => setProviderForm({...providerForm, provider_type: v})}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gateway">Payment Gateway</SelectItem>
                                            <SelectItem value="acquirer">Acquirer/Processor</SelectItem>
                                            <SelectItem value="card_network">Card Network</SelectItem>
                                            <SelectItem value="bank">Bank/PSP</SelectItem>
                                            <SelectItem value="wallet">Digital Wallet</SelectItem>
                                            <SelectItem value="crypto">Crypto Exchange</SelectItem>
                                            <SelectItem value="apm">Alternative Payment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Merchant ID / Bank MID</Label>
                                    <Input
                                        value={providerForm.merchant_id}
                                        onChange={(e) => setProviderForm({...providerForm, merchant_id: e.target.value})}
                                        placeholder="MID from provider"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo URL</Label>
                                    <Input
                                        value={providerForm.logo_url}
                                        onChange={(e) => setProviderForm({...providerForm, logo_url: e.target.value})}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>API Base URL</Label>
                                <Input
                                    value={providerForm.api_base_url}
                                    onChange={(e) => setProviderForm({...providerForm, api_base_url: e.target.value})}
                                    placeholder="https://api.provider.com/v1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>API Key</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={providerForm.api_key}
                                            onChange={(e) => setProviderForm({...providerForm, api_key: e.target.value})}
                                            placeholder="pk_live_..."
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                        >
                                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>API Secret</Label>
                                    <Input
                                        type="password"
                                        value={providerForm.api_secret}
                                        onChange={(e) => setProviderForm({...providerForm, api_secret: e.target.value})}
                                        placeholder="sk_live_..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Supported Payment Methods</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowMethodSelector(true)}
                                    >
                                        <Globe className="h-4 w-4 mr-2" />
                                        Select Methods ({providerForm.supported_methods.length})
                                    </Button>
                                </div>
                                {providerForm.supported_methods.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
                                        {providerForm.supported_methods.map(method => (
                                            <Badge key={method} variant="secondary" className="gap-1">
                                                {getPaymentMethodDisplayName(method)}
                                                <button
                                                    onClick={() => setProviderForm({
                                                        ...providerForm,
                                                        supported_methods: providerForm.supported_methods.filter(m => m !== method)
                                                    })}
                                                    className="ml-1 hover:text-red-600"
                                                >×</button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select 
                                    value={providerForm.status}
                                    onValueChange={(v) => setProviderForm({...providerForm, status: v})}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Textarea
                                    value={providerForm.notes}
                                    onChange={(e) => setProviderForm({...providerForm, notes: e.target.value})}
                                    placeholder="Additional information..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setShowProviderDialog(false); resetProviderForm(); }}>Cancel</Button>
                            <Button onClick={handleSaveProvider} disabled={createProviderMutation.isPending || updateProviderMutation.isPending}>
                                {editingProvider ? 'Update Provider' : 'Create Provider'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Payment Method Selector */}
                <PaymentMethodSelector
                    open={showMethodSelector}
                    onOpenChange={setShowMethodSelector}
                    selectedMethods={providerForm.supported_methods}
                    onSelectionChange={(methods) => setProviderForm({...providerForm, supported_methods: methods})}
                />

                {/* Create Routing Rule Dialog */}
                <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Routing Rule</DialogTitle>
                            <DialogDescription>Define conditions and processors for this routing rule</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Rule Name *</Label>
                                    <Input 
                                        value={newRoutingRule.name}
                                        onChange={(e) => setNewRoutingRule({...newRoutingRule, name: e.target.value})}
                                        placeholder="e.g., High Value EU Transactions"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rule Type</Label>
                                    <Select 
                                        value={newRoutingRule.rule_type}
                                        onValueChange={(v) => setNewRoutingRule({...newRoutingRule, rule_type: v})}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="routing">Smart Routing</SelectItem>
                                            <SelectItem value="cascading">Cascading</SelectItem>
                                            <SelectItem value="fallback">Fallback</SelectItem>
                                            <SelectItem value="split">Traffic Split</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    value={newRoutingRule.description}
                                    onChange={(e) => setNewRoutingRule({...newRoutingRule, description: e.target.value})}
                                    placeholder="Describe when this rule should apply..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Primary Provider *</Label>
                                    <Select 
                                        value={newRoutingRule.primary_processor}
                                        onValueChange={(v) => setNewRoutingRule({...newRoutingRule, primary_processor: v})}
                                    >
                                        <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                                        <SelectContent>
                                            {paymentProviders.filter(p => p.status === 'active').map(p => (
                                                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Input 
                                        type="number"
                                        value={newRoutingRule.priority}
                                        onChange={(e) => setNewRoutingRule({...newRoutingRule, priority: parseInt(e.target.value) || 100})}
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Card Networks</Label>
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
                                    {['visa', 'mastercard', 'amex', 'discover', 'unionpay', 'jcb'].map(network => (
                                        <label key={network} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={newRoutingRule.card_networks?.includes(network) || false}
                                                onChange={(e) => {
                                                    const current = newRoutingRule.card_networks || [];
                                                    const updated = e.target.checked
                                                        ? [...current, network]
                                                        : current.filter(n => n !== network);
                                                    setNewRoutingRule({ ...newRoutingRule, card_networks: updated });
                                                }}
                                                className="rounded"
                                            />
                                            <span className="capitalize">{network}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Min Amount ($)</Label>
                                    <Input 
                                        type="number"
                                        value={newRoutingRule.min_amount || ''}
                                        onChange={(e) => setNewRoutingRule({...newRoutingRule, min_amount: e.target.value ? parseFloat(e.target.value) : null})}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Amount ($)</Label>
                                    <Input 
                                        type="number"
                                        value={newRoutingRule.max_amount || ''}
                                        onChange={(e) => setNewRoutingRule({...newRoutingRule, max_amount: e.target.value ? parseFloat(e.target.value) : null})}
                                        placeholder="No limit"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Switch 
                                        checked={newRoutingRule.cost_optimization}
                                        onCheckedChange={(checked) => setNewRoutingRule({...newRoutingRule, cost_optimization: checked})}
                                    />
                                    <Label>Cost Optimization</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setShowCreateRuleDialog(false); resetRoutingRuleForm(); }}>Cancel</Button>
                            <Button 
                                onClick={() => createRoutingRuleMutation.mutate({
                                    ...newRoutingRule,
                                    rule_id: `RULE-${Date.now()}`
                                })}
                                disabled={!newRoutingRule.name || !newRoutingRule.primary_processor}
                            >
                                Create Rule
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Assign Provider to Service Dialog */}
                <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Assign Payment Provider to Service</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Service Type</Label>
                                <Select value={assignmentForm.service_type} onValueChange={(v) => setAssignmentForm({...assignmentForm, service_type: v, service_id: '', service_name: ''})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="psp">PSP (Payment Service Provider)</SelectItem>
                                        <SelectItem value="iso_gateway">ISO 8583 Gateway</SelectItem>
                                        <SelectItem value="orchestration">Orchestration Customer</SelectItem>
                                        <SelectItem value="crypto">Crypto Banking Customer</SelectItem>
                                        <SelectItem value="rwa">RWA Tokenization Customer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Select {assignmentForm.service_type.toUpperCase().replace('_', ' ')}</Label>
                                <Select value={assignmentForm.service_id} onValueChange={(v) => {
                                    const services = getServiceList(assignmentForm.service_type);
                                    const service = services.find(s => (s.psp_code || s.customer_id || s.id) === v);
                                    setAssignmentForm({
                                        ...assignmentForm, 
                                        service_id: v, 
                                        service_name: getServiceDisplayName(service, assignmentForm.service_type)
                                    });
                                }}>
                                    <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                                    <SelectContent>
                                        {getServiceList(assignmentForm.service_type).map(service => (
                                            <SelectItem key={service.id} value={service.psp_code || service.customer_id || service.id}>
                                                {getServiceDisplayName(service, assignmentForm.service_type)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Provider</Label>
                                <Select value={assignmentForm.payment_provider_id} onValueChange={(v) => setAssignmentForm({...assignmentForm, payment_provider_id: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                                    <SelectContent>
                                        {paymentProviders.filter(p => p.status === 'active').map(provider => (
                                            <SelectItem key={provider.id} value={provider.id}>
                                                <div className="flex items-center gap-2">
                                                    {provider.name} - {provider.type}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Priority (lower = higher priority)</Label>
                                    <Input 
                                        type="number"
                                        value={assignmentForm.priority}
                                        onChange={(e) => setAssignmentForm({...assignmentForm, priority: e.target.value})}
                                        placeholder="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Weight (for load balancing)</Label>
                                    <Input 
                                        type="number"
                                        value={assignmentForm.weight}
                                        onChange={(e) => setAssignmentForm({...assignmentForm, weight: e.target.value})}
                                        placeholder="100"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Monthly Volume Limit ($)</Label>
                                    <Input 
                                        type="number"
                                        value={assignmentForm.monthly_volume_limit}
                                        onChange={(e) => setAssignmentForm({...assignmentForm, monthly_volume_limit: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monthly Txn Limit</Label>
                                    <Input 
                                        type="number"
                                        value={assignmentForm.monthly_transaction_limit}
                                        onChange={(e) => setAssignmentForm({...assignmentForm, monthly_transaction_limit: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Daily Volume Limit ($)</Label>
                                    <Input 
                                        type="number"
                                        value={assignmentForm.daily_volume_limit}
                                        onChange={(e) => setAssignmentForm({...assignmentForm, daily_volume_limit: e.target.value})}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={assignmentForm.failover_enabled}
                                        onCheckedChange={(checked) => setAssignmentForm({...assignmentForm, failover_enabled: checked})}
                                    />
                                    <Label>Enable Failover</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={assignmentForm.health_check_enabled}
                                        onCheckedChange={(checked) => setAssignmentForm({...assignmentForm, health_check_enabled: checked})}
                                    />
                                    <Label>Health Monitoring</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
                            <Button onClick={() => assignProviderMutation.mutate(assignmentForm)}>
                                Assign Provider
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}