import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plug, Plus, Shuffle, TrendingUp, DollarSign, Activity, CheckCircle, XCircle, Clock, Shield, Zap, BarChart3, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

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

                        {/* Routing & Orchestration Tab */}
                        <TabsContent value="routing">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Smart Routing Rules</CardTitle>
                                    <Button onClick={() => setShowRoutingDialog(true)} className="gap-2">
                                        <Plus className="h-4 w-4" /> Create Routing Rule
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-blue-900 mb-1">Payment Switch Routing Features</h4>
                                                    <ul className="text-sm text-blue-800 space-y-1">
                                                        <li>• <strong>Load Balancing:</strong> Distribute transactions across providers based on weight</li>
                                                        <li>• <strong>Failover:</strong> Automatic fallback to backup providers on failure</li>
                                                        <li>• <strong>Cost Optimization:</strong> Route to lowest-cost provider based on transaction type</li>
                                                        <li>• <strong>Geographic Routing:</strong> Route based on customer location</li>
                                                        <li>• <strong>Currency Routing:</strong> Optimal provider selection per currency</li>
                                                        <li>• <strong>Volume Limits:</strong> Automatic switching when limits reached</li>
                                                        <li>• <strong>Health Monitoring:</strong> Real-time provider health checks</li>
                                                        <li>• <strong>Smart Retry:</strong> Intelligent retry logic with cascading fallback</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-center text-slate-500 py-8">Routing rule builder coming soon</p>
                                    </div>
                                </CardContent>
                            </Card>
                    </TabsContent>

                        {/* Provider Registry Tab */}
                        <TabsContent value="providers">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Available Payment Providers</CardTitle>
                                    <p className="text-sm text-slate-600">Configured in Payment Provider Management</p>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Payment Methods</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Assigned To</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paymentProviders.map(provider => {
                                                const assignmentCount = assignments.filter(a => a.payment_provider_id === provider.id).length;
                                                return (
                                                    <TableRow key={provider.id}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-10 h-10 rounded border flex items-center justify-center bg-white">
                                                                    {provider.logo_url ? (
                                                                        <img src={provider.logo_url} alt={provider.name} className="w-full h-full object-contain" />
                                                                    ) : '💳'}
                                                                </div>
                                                                <span className="font-medium">{provider.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="capitalize">{provider.type?.replace('_', ' ')}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {(provider.supported_methods || []).slice(0, 3).map(method => (
                                                                    <Badge key={method} variant="outline" className="text-xs">{method}</Badge>
                                                                ))}
                                                                {(provider.supported_methods || []).length > 3 && (
                                                                    <Badge variant="outline" className="text-xs">+{provider.supported_methods.length - 3}</Badge>
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