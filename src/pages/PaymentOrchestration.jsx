import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
    Route,
    Plus,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Play,
    Pause,
    Copy,
    ArrowRight,
    ArrowDown,
    Zap,
    Globe,
    CreditCard,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Settings,
    Layers,
    GitBranch,
    RefreshCw,
    Activity,
    Server,
    Shuffle
} from 'lucide-react';

const processors = [
    { id: 'stripe', name: 'Stripe', type: 'gateway', status: 'active', successRate: 98.5, avgLatency: 245, fee: 2.9, networks: ['visa', 'mastercard', 'amex'] },
    { id: 'adyen', name: 'Adyen', type: 'psp', status: 'active', successRate: 97.8, avgLatency: 320, fee: 2.5, networks: ['visa', 'mastercard', 'amex', 'discover'] },
    { id: 'worldpay', name: 'Worldpay', type: 'acquirer', status: 'active', successRate: 96.2, avgLatency: 380, fee: 2.2, networks: ['visa', 'mastercard'] },
    { id: 'checkout', name: 'Checkout.com', type: 'gateway', status: 'active', successRate: 97.5, avgLatency: 290, fee: 2.7, networks: ['visa', 'mastercard', 'amex'] },
    { id: 'braintree', name: 'Braintree', type: 'gateway', status: 'degraded', successRate: 94.1, avgLatency: 420, fee: 2.9, networks: ['visa', 'mastercard'] },
    { id: 'paypal', name: 'PayPal', type: 'psp', status: 'active', successRate: 99.1, avgLatency: 280, fee: 3.4, networks: ['visa', 'mastercard', 'amex'] },
];

const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700', icon: Pause },
    testing: { label: 'Testing', className: 'bg-blue-100 text-blue-700', icon: Play },
    degraded: { label: 'Degraded', className: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    maintenance: { label: 'Maintenance', className: 'bg-orange-100 text-orange-700', icon: Settings },
};

const ruleTypeConfig = {
    routing: { label: 'Smart Routing', icon: Route, color: 'text-blue-600 bg-blue-50' },
    cascading: { label: 'Cascading', icon: ArrowDown, color: 'text-purple-600 bg-purple-50' },
    fallback: { label: 'Fallback', icon: RefreshCw, color: 'text-amber-600 bg-amber-50' },
    split: { label: 'Traffic Split', icon: Shuffle, color: 'text-emerald-600 bg-emerald-50' },
};

const defaultRules = [
    { id: '1', rule_id: 'RULE-001', name: 'High Value Transactions', description: 'Route transactions above $1000 to premium processor', rule_type: 'routing', status: 'active', priority: 10, primary_processor: 'adyen', fallback_processors: ['stripe', 'checkout'], min_amount: 1000, card_networks: ['visa', 'mastercard', 'amex'] },
    { id: '2', rule_id: 'RULE-002', name: 'EU Traffic Routing', description: 'Route EU transactions to local acquirer', rule_type: 'routing', status: 'active', priority: 20, primary_processor: 'worldpay', fallback_processors: ['adyen'], countries: ['DE', 'FR', 'IT', 'ES', 'NL'], card_networks: ['visa', 'mastercard'] },
    { id: '3', rule_id: 'RULE-003', name: 'Decline Recovery Cascade', description: 'Retry declined transactions through cascade', rule_type: 'cascading', status: 'active', priority: 30, primary_processor: 'stripe', fallback_processors: ['adyen', 'checkout', 'worldpay'], retry_attempts: 3 },
    { id: '4', rule_id: 'RULE-004', name: 'Cost Optimization Split', description: 'Split traffic to optimize processing costs', rule_type: 'split', status: 'testing', priority: 40, primary_processor: 'stripe', split_config: { stripe: 40, adyen: 35, worldpay: 25 } },
    { id: '5', rule_id: 'RULE-005', name: 'AMEX Dedicated Route', description: 'Route all AMEX transactions to specialized processor', rule_type: 'routing', status: 'active', priority: 5, primary_processor: 'paypal', card_networks: ['amex'] },
];

export default function PaymentOrchestration() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('rules');
    const [showRuleDialog, setShowRuleDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [rules, setRules] = useState(defaultRules);
    
    const [newRule, setNewRule] = useState({
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
        cost_optimization: false,
    });

    const queryClient = useQueryClient();

    const { data: routingRules = [] } = useQuery({
        queryKey: ['routing-rules'],
        queryFn: () => base44.entities.RoutingRule.list('-priority'),
    });

    const { data: merchantMIDs = [] } = useQuery({
        queryKey: ['merchantMIDs'],
        queryFn: () => base44.entities.MerchantMID.list(),
    });

    const { data: bankMIDs = [] } = useQuery({
        queryKey: ['bankMIDs'],
        queryFn: () => base44.entities.BankMID.list(),
    });

    const { data: midRoutingRules = [] } = useQuery({
        queryKey: ['midRoutingRules'],
        queryFn: () => base44.entities.MIDRoutingRule.list('priority'),
    });

    const createRuleMutation = useMutation({
        mutationFn: (data) => base44.entities.RoutingRule.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routing-rules'] });
            setShowRuleDialog(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setNewRule({
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
            cost_optimization: false,
        });
        setEditingRule(null);
    };

    const toggleRuleStatus = (ruleId) => {
        setRules(rules.map(r => 
            r.id === ruleId 
                ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } 
                : r
        ));
    };

    const allRules = [...rules, ...routingRules];

    const activeRulesCount = allRules.filter(r => r.status === 'active').length;
    const cascadeRulesCount = allRules.filter(r => r.rule_type === 'cascading').length;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="PaymentOrchestration" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Payment Orchestration</h1>
                            <p className="text-slate-500">Configure routing rules, cascading, and processor management</p>
                        </div>
                        <Button 
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setShowRuleDialog(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Create Rule
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Route className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Orchestration Rules</p>
                                    <p className="text-xl font-bold">{activeRulesCount}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <Layers className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Merchant MIDs</p>
                                    <p className="text-xl font-bold">{merchantMIDs.filter(m => m.status === 'active').length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                    <Server className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Bank MIDs</p>
                                    <p className="text-xl font-bold">{bankMIDs.filter(b => b.status === 'active').length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <GitBranch className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">MID Routes</p>
                                    <p className="text-xl font-bold">{midRoutingRules.filter(r => r.status === 'active').length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Success Rate</p>
                                    <p className="text-xl font-bold text-emerald-600">97.2%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="rules">Orchestration Rules</TabsTrigger>
                            <TabsTrigger value="mids">MID Routing</TabsTrigger>
                            <TabsTrigger value="processors">Processors</TabsTrigger>
                            <TabsTrigger value="cascade">Cascade Config</TabsTrigger>
                            <TabsTrigger value="simulator">Route Simulator</TabsTrigger>
                        </TabsList>

                        {/* MID Routing Tab */}
                        <TabsContent value="mids">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">MID Routing Configuration</CardTitle>
                                        <Badge variant="secondary">{midRoutingRules.length} routes</Badge>
                                    </div>
                                    <CardDescription>
                                        Configure how Merchant MIDs route to Bank MIDs with priority-based failover
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Merchant MID</TableHead>
                                                <TableHead>Routes To</TableHead>
                                                <TableHead>Bank MID</TableHead>
                                                <TableHead>Failover</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {midRoutingRules.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                                        No MID routing rules configured. Visit MID Routing page to create rules.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                midRoutingRules.map((rule) => (
                                                    <TableRow key={rule.id}>
                                                        <TableCell>
                                                            <Badge className="bg-blue-100 text-blue-700">
                                                                P{rule.priority}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{rule.merchant_name}</TableCell>
                                                        <TableCell>
                                                            <ArrowRight className="h-4 w-4 text-slate-400" />
                                                        </TableCell>
                                                        <TableCell className="font-medium">{rule.bank_mid_name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={rule.failover_enabled ? 'bg-emerald-50' : 'bg-slate-50'}>
                                                                {rule.failover_enabled ? 'Enabled' : 'Disabled'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={cn(statusConfig[rule.status]?.className)}>
                                                                {statusConfig[rule.status]?.label || rule.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Routing Rules Tab */}
                        <TabsContent value="rules">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Routing Rules</CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span>Drag to reorder priority</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead className="w-16">Priority</TableHead>
                                                <TableHead>Rule</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Primary Processor</TableHead>
                                                <TableHead>Fallbacks</TableHead>
                                                <TableHead>Conditions</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allRules.sort((a, b) => a.priority - b.priority).map((rule) => {
                                                const TypeIcon = ruleTypeConfig[rule.rule_type]?.icon || Route;
                                                const StatusIcon = statusConfig[rule.status]?.icon || CheckCircle;
                                                return (
                                                    <TableRow key={rule.id} className="hover:bg-slate-50/50">
                                                        <TableCell>
                                                            <Badge variant="outline" className="font-mono">
                                                                #{rule.priority}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{rule.name}</p>
                                                                <p className="text-xs text-slate-500">{rule.description}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium", ruleTypeConfig[rule.rule_type]?.color)}>
                                                                <TypeIcon className="h-3.5 w-3.5" />
                                                                {ruleTypeConfig[rule.rule_type]?.label}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {rule.primary_processor}
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
                                                                        <DollarSign className="h-3 w-3 mr-1" />
                                                                        ≥${rule.min_amount}
                                                                    </Badge>
                                                                )}
                                                                {rule.split_config && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <Shuffle className="h-3 w-3 mr-1" />
                                                                        Split
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={cn("gap-1", statusConfig[rule.status]?.className)}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {statusConfig[rule.status]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>
                                                                        <Eye className="h-4 w-4 mr-2" />View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Edit className="h-4 w-4 mr-2" />Edit Rule
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Copy className="h-4 w-4 mr-2" />Duplicate
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => toggleRuleStatus(rule.id)}>
                                                                        {rule.status === 'active' ? (
                                                                            <><Pause className="h-4 w-4 mr-2" />Deactivate</>
                                                                        ) : (
                                                                            <><Play className="h-4 w-4 mr-2" />Activate</>
                                                                        )}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <Trash2 className="h-4 w-4 mr-2" />Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Processors Tab */}
                        <TabsContent value="processors">
                            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {processors.map((processor) => {
                                    const StatusIcon = statusConfig[processor.status]?.icon || CheckCircle;
                                    return (
                                        <Card key={processor.id} className="relative">
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                            <Server className="h-6 w-6 text-slate-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold">{processor.name}</h3>
                                                            <p className="text-sm text-slate-500 capitalize">{processor.type}</p>
                                                        </div>
                                                    </div>
                                                    <Badge className={statusConfig[processor.status]?.className}>
                                                        {statusConfig[processor.status]?.label}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-slate-500">Success Rate</span>
                                                        <span className={cn("font-medium", processor.successRate >= 97 ? "text-emerald-600" : processor.successRate >= 95 ? "text-amber-600" : "text-red-600")}>
                                                            {processor.successRate}%
                                                        </span>
                                                    </div>
                                                    <Progress value={processor.successRate} className="h-1.5" />
                                                    
                                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                                        <div>
                                                            <p className="text-xs text-slate-500">Avg Latency</p>
                                                            <p className="font-medium">{processor.avgLatency}ms</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Fee</p>
                                                            <p className="font-medium">{processor.fee}%</p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t">
                                                        <p className="text-xs text-slate-500 mb-2">Supported Networks</p>
                                                        <div className="flex gap-1">
                                                            {processor.networks.map((n, i) => (
                                                                <Badge key={i} variant="outline" className="text-xs capitalize">{n}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        {/* Cascade Config Tab */}
                        <TabsContent value="cascade">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ArrowDown className="h-5 w-5" />
                                            Cascade Flow
                                        </CardTitle>
                                        <CardDescription>Configure retry logic and fallback sequence</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {processors.filter(p => p.status === 'active').slice(0, 4).map((processor, idx) => (
                                                <div key={processor.id} className="relative">
                                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border">
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium">{processor.name}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {processor.successRate}% success • {processor.avgLatency}ms
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className={processor.status === 'active' ? 'border-emerald-200 text-emerald-700' : ''}>
                                                            {idx === 0 ? 'Primary' : `Fallback ${idx}`}
                                                        </Badge>
                                                    </div>
                                                    {idx < 3 && (
                                                        <div className="flex justify-center py-2">
                                                            <ArrowDown className="h-4 w-4 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            Retry Settings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-3">
                                            <Label>Maximum Retry Attempts</Label>
                                            <div className="flex items-center gap-4">
                                                <Slider defaultValue={[3]} max={5} min={1} className="flex-1" />
                                                <span className="font-medium w-8 text-center">3</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Retry Delay (ms)</Label>
                                            <div className="flex items-center gap-4">
                                                <Slider defaultValue={[1000]} max={5000} min={100} step={100} className="flex-1" />
                                                <span className="font-medium w-16 text-center">1000ms</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Retry Conditions</Label>
                                            <div className="space-y-2">
                                                {[
                                                    { label: 'Soft Declines (Insufficient Funds)', enabled: true },
                                                    { label: 'Timeout Errors', enabled: true },
                                                    { label: 'Processor Unavailable', enabled: true },
                                                    { label: 'Card Not Supported', enabled: false },
                                                    { label: 'Authentication Failed', enabled: false },
                                                ].map((condition, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                        <span className="text-sm">{condition.label}</span>
                                                        <Switch defaultChecked={condition.enabled} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Route Simulator Tab */}
                        <TabsContent value="simulator">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Transaction Simulator</CardTitle>
                                        <CardDescription>Test which route a transaction would take</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Amount</Label>
                                                <Input type="number" placeholder="100.00" defaultValue="1500" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Currency</Label>
                                                <Select defaultValue="USD">
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD</SelectItem>
                                                        <SelectItem value="EUR">EUR</SelectItem>
                                                        <SelectItem value="GBP">GBP</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Card Network</Label>
                                                <Select defaultValue="visa">
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="visa">Visa</SelectItem>
                                                        <SelectItem value="mastercard">Mastercard</SelectItem>
                                                        <SelectItem value="amex">Amex</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Country</Label>
                                                <Select defaultValue="US">
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="US">United States</SelectItem>
                                                        <SelectItem value="GB">United Kingdom</SelectItem>
                                                        <SelectItem value="DE">Germany</SelectItem>
                                                        <SelectItem value="FR">France</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                                            <Play className="h-4 w-4" />
                                            Simulate Route
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Simulation Result</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                    <span className="font-medium text-emerald-700">Route Matched</span>
                                                </div>
                                                <p className="text-sm text-emerald-600">Rule: High Value Transactions (RULE-001)</p>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-medium text-sm text-slate-500">Complete Routing Path</h4>
                                                <div className="space-y-2 p-3 bg-slate-50 rounded-lg text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-600">1. Orchestration Layer:</span>
                                                        <Badge variant="outline" className="text-xs">Selects Merchant MID</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-600">2. MID Routing Layer:</span>
                                                        <Badge variant="outline" className="text-xs">Routes to Bank MID</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-600">3. Processing Layer:</span>
                                                        <Badge variant="outline" className="text-xs">Executes via Acquirer</Badge>
                                                    </div>
                                                </div>
                                                
                                                <h4 className="font-medium text-sm text-slate-500 mt-4">Processor Cascade</h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                        <p className="font-medium text-blue-700">Adyen</p>
                                                        <p className="text-xs text-blue-600">Primary</p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                                    <div className="flex-1 p-3 bg-slate-50 border rounded-lg">
                                                        <p className="font-medium text-slate-700">Stripe</p>
                                                        <p className="text-xs text-slate-500">Fallback 1</p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-slate-300" />
                                                    <div className="flex-1 p-3 bg-slate-50 border rounded-lg">
                                                        <p className="font-medium text-slate-700">Checkout</p>
                                                        <p className="text-xs text-slate-500">Fallback 2</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                                <div>
                                                    <p className="text-xs text-slate-500">Est. Success</p>
                                                    <p className="font-medium text-emerald-600">97.8%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Est. Latency</p>
                                                    <p className="font-medium">320ms</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Est. Fee</p>
                                                    <p className="font-medium">2.5%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Create Rule Dialog */}
                    <Dialog open={showRuleDialog} onOpenChange={setShowRuleDialog}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Routing Rule</DialogTitle>
                                <DialogDescription>
                                    Define conditions and processors for this routing rule
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Rule Name *</Label>
                                        <Input 
                                            value={newRule.name}
                                            onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                                            placeholder="e.g., High Value EU Transactions"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rule Type *</Label>
                                        <Select 
                                            value={newRule.rule_type}
                                            onValueChange={(val) => setNewRule({...newRule, rule_type: val})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
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
                                        value={newRule.description}
                                        onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                                        placeholder="Describe when this rule should apply..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Primary Processor *</Label>
                                        <Select 
                                            value={newRule.primary_processor}
                                            onValueChange={(val) => setNewRule({...newRule, primary_processor: val})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select processor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {processors.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Input 
                                            type="number"
                                            value={newRule.priority}
                                            onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value)})}
                                            placeholder="100"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Conditions</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-500">Min Amount</Label>
                                            <Input 
                                                type="number"
                                                value={newRule.min_amount || ''}
                                                onChange={(e) => setNewRule({...newRule, min_amount: e.target.value ? parseFloat(e.target.value) : null})}
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-slate-500">Max Amount</Label>
                                            <Input 
                                                type="number"
                                                value={newRule.max_amount || ''}
                                                onChange={(e) => setNewRule({...newRule, max_amount: e.target.value ? parseFloat(e.target.value) : null})}
                                                placeholder="No limit"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Switch 
                                            checked={newRule.cost_optimization}
                                            onCheckedChange={(checked) => setNewRule({...newRule, cost_optimization: checked})}
                                        />
                                        <Label>Cost Optimization</Label>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => { setShowRuleDialog(false); resetForm(); }}>
                                    Cancel
                                </Button>
                                <Button 
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => createRuleMutation.mutate({
                                        ...newRule,
                                        rule_id: `RULE-${Date.now()}`
                                    })}
                                    disabled={!newRule.name || !newRule.primary_processor}
                                >
                                    Create Rule
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}