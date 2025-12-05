import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { 
    Shield,
    AlertTriangle,
    Search,
    MoreHorizontal,
    Eye,
    CheckCircle,
    XCircle,
    Zap,
    TrendingUp,
    Globe,
    CreditCard,
    Clock,
    Activity,
    Settings,
    RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import RealTimeFraudDetection from '@/components/fraud/RealTimeFraudDetection';

const severityConfig = {
    low: { label: 'Low', className: 'bg-blue-100 text-blue-700', color: '#3b82f6' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700', color: '#f59e0b' },
    high: { label: 'High', className: 'bg-orange-100 text-orange-700', color: '#f97316' },
    critical: { label: 'Critical', className: 'bg-red-100 text-red-700', color: '#ef4444' },
};

const alertTypeConfig = {
    velocity: { label: 'Velocity Alert', icon: Zap },
    chargeback_threshold: { label: 'Chargeback Threshold', icon: AlertTriangle },
    fraud_pattern: { label: 'Fraud Pattern', icon: Shield },
    volume_spike: { label: 'Volume Spike', icon: TrendingUp },
    decline_rate: { label: 'High Decline Rate', icon: XCircle },
    geographic_anomaly: { label: 'Geographic Anomaly', icon: Globe },
    bin_attack: { label: 'BIN Attack', icon: CreditCard },
    card_testing: { label: 'Card Testing', icon: Activity },
    aml_flag: { label: 'AML Flag', icon: AlertTriangle },
    sanctions_match: { label: 'Sanctions Match', icon: Shield },
};

const fraudRules = [
    { id: 1, name: 'Velocity Check', description: 'Block if more than 5 transactions from same card in 5 minutes', enabled: true, threshold: 5 },
    { id: 2, name: 'Amount Threshold', description: 'Flag transactions above $5,000 for manual review', enabled: true, threshold: 5000 },
    { id: 3, name: 'Geographic Mismatch', description: 'Flag if IP country differs from card issuing country', enabled: true },
    { id: 4, name: 'High Risk Countries', description: 'Block transactions from high-risk jurisdictions', enabled: true },
    { id: 5, name: 'AVS Mismatch', description: 'Decline if AVS check fails completely', enabled: true },
    { id: 6, name: 'CVV Verification', description: 'Require CVV for all card-not-present transactions', enabled: true },
    { id: 7, name: '3D Secure', description: 'Require 3DS authentication for transactions above threshold', enabled: true, threshold: 100 },
    { id: 8, name: 'BIN Attack Detection', description: 'Block if sequential card numbers detected', enabled: true },
    { id: 9, name: 'Device Fingerprint', description: 'Track and analyze device fingerprints', enabled: false },
    { id: 10, name: 'Email Domain Check', description: 'Flag disposable email domains', enabled: true },
];

const riskScoreData = [
    { score: '0-20', transactions: 8500, label: 'Very Low' },
    { score: '21-40', transactions: 3200, label: 'Low' },
    { score: '41-60', transactions: 1500, label: 'Medium' },
    { score: '61-80', transactions: 450, label: 'High' },
    { score: '81-100', transactions: 120, label: 'Critical' },
];

const hourlyFraudData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    attempts: Math.round(5 + Math.random() * 25),
    blocked: Math.round(3 + Math.random() * 15),
}));

export default function FraudPrevention() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('alerts');
    const [searchQuery, setSearchQuery] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [rules, setRules] = useState(fraudRules);

    const queryClient = useQueryClient();

    const { data: alerts = [], isLoading } = useQuery({
        queryKey: ['risk-alerts'],
        queryFn: () => base44.entities.RiskAlert.list('-created_date'),
    });

    const updateAlertMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.RiskAlert.update(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['risk-alerts'] }),
    });

    const filteredAlerts = alerts.filter(a => {
        const matchesSearch = !searchQuery || 
            a.alert_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'open');

    const toggleRule = (ruleId) => {
        setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="FraudPrevention" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Fraud Prevention</h1>
                            <p className="text-slate-500">Monitor and manage risk alerts</p>
                        </div>
                        <Button className="gap-2" variant="outline">
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Alerts</p>
                                    <p className="text-xl font-bold">{alerts.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Open Alerts</p>
                                    <p className="text-xl font-bold text-amber-600">{openAlerts.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-red-200 bg-red-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-600">Critical</p>
                                    <p className="text-xl font-bold text-red-600">{criticalAlerts.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Blocked Today</p>
                                    <p className="text-xl font-bold text-emerald-600">127</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="realtime">Real-Time Detection</TabsTrigger>
                            <TabsTrigger value="alerts">Risk Alerts</TabsTrigger>
                            <TabsTrigger value="rules">Fraud Rules</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="realtime">
                            <RealTimeFraudDetection 
                                onAlertClick={(alert) => {
                                    setActiveTab('alerts');
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="alerts">
                            {/* Filters */}
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="relative flex-1 min-w-[250px]">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Search alerts..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                        <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Severity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Severity</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Alerts Table */}
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Alert</TableHead>
                                                <TableHead>Merchant</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Severity</TableHead>
                                                <TableHead>Impact</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Created</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAlerts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                        {isLoading ? 'Loading...' : 'No alerts found'}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredAlerts.map((alert) => {
                                                    const TypeIcon = alertTypeConfig[alert.alert_type]?.icon || AlertTriangle;
                                                    return (
                                                        <TableRow key={alert.id} className="hover:bg-slate-50/50">
                                                            <TableCell>
                                                                <span className="font-mono text-sm text-blue-600">{alert.alert_id}</span>
                                                            </TableCell>
                                                            <TableCell className="font-medium">{alert.merchant_name}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center gap-2">
                                                                    <TypeIcon className="h-4 w-4 text-slate-400" />
                                                                    <span className="text-sm">{alertTypeConfig[alert.alert_type]?.label}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={cn("text-xs", severityConfig[alert.severity]?.className)}>
                                                                    {severityConfig[alert.severity]?.label}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm">
                                                                    <p>{alert.affected_transactions || 0} txns</p>
                                                                    <p className="text-slate-500">${(alert.affected_amount || 0).toLocaleString()}</p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="capitalize">{alert.status}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-slate-600">
                                                                {alert.created_date && format(new Date(alert.created_date), 'MMM dd, HH:mm')}
                                                            </TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => setSelectedAlert(alert)}>
                                                                            <Eye className="h-4 w-4 mr-2" />View Details
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => updateAlertMutation.mutate({ id: alert.id, data: { status: 'investigating' }})}>
                                                                            <Activity className="h-4 w-4 mr-2" />Investigate
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => updateAlertMutation.mutate({ id: alert.id, data: { status: 'resolved' }})}>
                                                                            <CheckCircle className="h-4 w-4 mr-2" />Resolve
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => updateAlertMutation.mutate({ id: alert.id, data: { status: 'false_positive' }})}>
                                                                            <XCircle className="h-4 w-4 mr-2" />False Positive
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="rules">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fraud Detection Rules</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {rules.map((rule) => (
                                            <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-4">
                                                    <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                                                    <div>
                                                        <p className="font-medium">{rule.name}</p>
                                                        <p className="text-sm text-slate-500">{rule.description}</p>
                                                    </div>
                                                </div>
                                                {rule.threshold && (
                                                    <Badge variant="outline">Threshold: {rule.threshold}</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Risk Score Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {riskScoreData.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-20 text-sm font-medium">{item.score}</div>
                                                    <div className="flex-1">
                                                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                                            <div 
                                                                className={cn("h-full rounded-full", idx < 2 ? "bg-emerald-500" : idx === 2 ? "bg-amber-500" : idx === 3 ? "bg-orange-500" : "bg-red-500")}
                                                                style={{ width: `${(item.transactions / 8500) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="w-20 text-right text-sm text-slate-600">
                                                        {item.transactions.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Fraud Attempts (24h)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={hourlyFraudData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Area type="monotone" dataKey="attempts" stroke="#ef4444" fill="#fecaca" name="Attempts" />
                                                    <Area type="monotone" dataKey="blocked" stroke="#10b981" fill="#d1fae5" name="Blocked" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}