import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Gauge, 
    TrendingUp, 
    AlertTriangle,
    Activity,
    Plus,
    Edit,
    Trash2,
    Bell,
    BarChart3,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function UsageMeteringSystem() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('meters');
    const [showDialog, setShowDialog] = useState(false);
    const [dialogType, setDialogType] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    // Fetch data
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: meters = [] } = useQuery({
        queryKey: ['usage-meters'],
        queryFn: () => base44.entities.MerchantUsageMeter.list()
    });

    const { data: rules = [] } = useQuery({
        queryKey: ['metering-rules'],
        queryFn: () => base44.entities.MeteringRule.list()
    });

    const { data: events = [] } = useQuery({
        queryKey: ['usage-events'],
        queryFn: () => base44.entities.UsageEvent.list('-event_timestamp', 100)
    });

    // Forms
    const [meterForm, setMeterForm] = useState({
        psp_id: '',
        merchant_id: '',
        merchant_name: '',
        metric_type: 'transaction_count',
        reset_frequency: 'monthly',
        threshold_limit: 0,
        threshold_percentage: 80,
        alert_enabled: false,
        unit: 'transactions',
        status: 'active'
    });

    const [ruleForm, setRuleForm] = useState({
        psp_id: '',
        rule_name: '',
        description: '',
        metric_type: 'transaction_count',
        applies_to: 'all_merchants',
        auto_create_meter: true,
        billing_period: 'monthly',
        threshold_config: {
            enabled: false,
            limit: 0,
            alert_percentage: 80,
            notification_emails: []
        },
        is_active: true
    });

    // Mutations
    const createMeterMutation = useMutation({
        mutationFn: (data) => {
            const psp = psps.find(p => p.id === data.psp_id);
            return base44.entities.MerchantUsageMeter.create({
                ...data,
                meter_id: `METER-${Date.now()}`,
                psp_code: psp?.psp_code || 'UNKNOWN',
                current_count: 0,
                current_volume: 0,
                billing_period_start: new Date().toISOString(),
                billing_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['usage-meters']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Usage meter created');
        }
    });

    const updateMeterMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MerchantUsageMeter.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['usage-meters']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Usage meter updated');
        }
    });

    const deleteMeterMutation = useMutation({
        mutationFn: (id) => base44.entities.MerchantUsageMeter.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['usage-meters']);
            toast.success('Usage meter deleted');
        }
    });

    const createRuleMutation = useMutation({
        mutationFn: (data) => {
            const psp = psps.find(p => p.id === data.psp_id);
            return base44.entities.MeteringRule.create({
                ...data,
                rule_id: `RULE-${Date.now()}`,
                psp_code: psp?.psp_code || 'UNKNOWN'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['metering-rules']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Metering rule created');
        }
    });

    const updateRuleMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MeteringRule.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['metering-rules']);
            setShowDialog(false);
            setEditingItem(null);
            toast.success('Metering rule updated');
        }
    });

    const simulateEventMutation = useMutation({
        mutationFn: () => base44.functions.invoke('simulateUsageEvents', {
            psp_id: psps[0]?.id,
            count: 100
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['usage-events']);
            queryClient.invalidateQueries(['usage-meters']);
            toast.success('Simulated 100 usage events');
        }
    });

    // Stats
    const totalMeters = meters.length;
    const activeMeters = meters.filter(m => m.status === 'active').length;
    const metersNearLimit = meters.filter(m => 
        m.threshold_limit && m.current_count >= (m.threshold_limit * (m.threshold_percentage / 100))
    ).length;
    const totalEventsToday = events.filter(e => 
        new Date(e.event_timestamp).toDateString() === new Date().toDateString()
    ).length;

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="UsageMeteringSystem" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Usage Metering System</h2>
                        <p className="text-xs text-slate-600">Track merchant consumption for usage-based billing</p>
                    </div>
                    <Button onClick={() => simulateEventMutation.mutate()} variant="outline">
                        <Activity className="h-4 w-4 mr-2" />
                        Simulate Events
                    </Button>
                </header>

                <main className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Meters</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalMeters}</p>
                                    </div>
                                    <Gauge className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Meters</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{activeMeters}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Near Limit</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{metersNearLimit}</p>
                                    </div>
                                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Events Today</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">{totalEventsToday}</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="meters">Usage Meters</TabsTrigger>
                            <TabsTrigger value="rules">Metering Rules</TabsTrigger>
                            <TabsTrigger value="events">Recent Events</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        </TabsList>

                        {/* Usage Meters */}
                        <TabsContent value="meters" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{meters.length} usage meters across all PSPs</p>
                                <Button onClick={() => {
                                    setDialogType('meter');
                                    setEditingItem(null);
                                    setMeterForm({
                                        psp_id: '',
                                        merchant_id: '',
                                        merchant_name: '',
                                        metric_type: 'transaction_count',
                                        reset_frequency: 'monthly',
                                        threshold_limit: 0,
                                        threshold_percentage: 80,
                                        alert_enabled: false,
                                        unit: 'transactions',
                                        status: 'active'
                                    });
                                    setShowDialog(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Meter
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {meters.map(meter => {
                                    const psp = psps.find(p => p.id === meter.psp_id);
                                    const usage = meter.threshold_limit ? (meter.current_count / meter.threshold_limit) * 100 : 0;
                                    const nearLimit = usage >= meter.threshold_percentage;
                                    
                                    return (
                                        <Card key={meter.id}>
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="font-semibold">{meter.merchant_name || meter.merchant_id}</h4>
                                                            <Badge className={meter.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                                {meter.status}
                                                            </Badge>
                                                            <Badge variant="outline">{psp?.psp_name || meter.psp_code}</Badge>
                                                            {nearLimit && <Badge className="bg-amber-100 text-amber-700"><Bell className="h-3 w-3 mr-1" />Near Limit</Badge>}
                                                        </div>
                                                        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                                            <div>
                                                                <p className="text-slate-600">Metric</p>
                                                                <p className="font-medium capitalize">{meter.metric_type.replace('_', ' ')}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-600">Current Count</p>
                                                                <p className="font-medium">{meter.current_count.toLocaleString()} {meter.unit}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-600">Period</p>
                                                                <p className="font-medium capitalize">{meter.reset_frequency}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-600">Limit</p>
                                                                <p className="font-medium">{meter.threshold_limit ? meter.threshold_limit.toLocaleString() : 'No limit'}</p>
                                                            </div>
                                                        </div>
                                                        {meter.threshold_limit && (
                                                            <div className="mb-2">
                                                                <div className="flex justify-between text-xs text-slate-600 mb-1">
                                                                    <span>Usage</span>
                                                                    <span>{usage.toFixed(1)}%</span>
                                                                </div>
                                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={`h-full ${nearLimit ? 'bg-amber-500' : 'bg-blue-500'}`}
                                                                        style={{ width: `${Math.min(usage, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingItem(meter);
                                                                setMeterForm(meter);
                                                                setDialogType('meter');
                                                                setShowDialog(true);
                                                            }}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => deleteMeterMutation.mutate(meter.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}

                                {meters.length === 0 && (
                                    <div className="text-center py-12">
                                        <Gauge className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600">No usage meters configured yet</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Metering Rules */}
                        <TabsContent value="rules" className="space-y-4 mt-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-600">{rules.length} metering rules configured</p>
                                <Button onClick={() => {
                                    setDialogType('rule');
                                    setEditingItem(null);
                                    setRuleForm({
                                        psp_id: '',
                                        rule_name: '',
                                        description: '',
                                        metric_type: 'transaction_count',
                                        applies_to: 'all_merchants',
                                        auto_create_meter: true,
                                        billing_period: 'monthly',
                                        threshold_config: {
                                            enabled: false,
                                            limit: 0,
                                            alert_percentage: 80,
                                            notification_emails: []
                                        },
                                        is_active: true
                                    });
                                    setShowDialog(true);
                                }}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Rule
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {rules.map(rule => {
                                    const psp = psps.find(p => p.id === rule.psp_id);
                                    return (
                                        <Card key={rule.id}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                                                    <Badge className={rule.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                        {rule.is_active ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-slate-600 mb-3">{rule.description}</p>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">PSP:</span>
                                                        <span className="font-medium">{psp?.psp_name || rule.psp_code}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Metric:</span>
                                                        <span className="font-medium capitalize">{rule.metric_type.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Applies to:</span>
                                                        <span className="font-medium capitalize">{rule.applies_to.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Billing Period:</span>
                                                        <span className="font-medium capitalize">{rule.billing_period}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 mt-4">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingItem(rule);
                                                            setRuleForm(rule);
                                                            setDialogType('rule');
                                                            setShowDialog(true);
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        Edit
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </TabsContent>

                        {/* Recent Events */}
                        <TabsContent value="events" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Recent Usage Events
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {events.slice(0, 50).map(event => (
                                            <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{event.metric_type.replace('_', ' ')}</p>
                                                    <p className="text-xs text-slate-600">
                                                        Merchant: {event.merchant_id} • {new Date(event.event_timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">+{event.count_increment}</p>
                                                    {event.volume_increment > 0 && (
                                                        <p className="text-xs text-slate-600">${event.volume_increment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics */}
                        <TabsContent value="analytics" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Usage Analytics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-slate-600 mb-1">Total Usage Events</p>
                                            <p className="text-2xl font-bold text-blue-600">{events.length.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-lg">
                                            <p className="text-sm text-slate-600 mb-1">Active Monitoring</p>
                                            <p className="text-2xl font-bold text-emerald-600">{activeMeters} meters</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-lg">
                                            <p className="text-sm text-slate-600 mb-1">Alerts Triggered</p>
                                            <p className="text-2xl font-bold text-amber-600">{metersNearLimit}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Meter Dialog */}
            <Dialog open={showDialog && dialogType === 'meter'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Create'} Usage Meter</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>PSP</Label>
                            <Select 
                                value={meterForm.psp_id}
                                onValueChange={(v) => setMeterForm({...meterForm, psp_id: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PSP" />
                                </SelectTrigger>
                                <SelectContent>
                                    {psps.map(psp => (
                                        <SelectItem key={psp.id} value={psp.id}>{psp.psp_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Merchant ID</Label>
                                <Input
                                    value={meterForm.merchant_id}
                                    onChange={(e) => setMeterForm({...meterForm, merchant_id: e.target.value})}
                                    placeholder="MERCH-123"
                                />
                            </div>
                            <div>
                                <Label>Merchant Name</Label>
                                <Input
                                    value={meterForm.merchant_name}
                                    onChange={(e) => setMeterForm({...meterForm, merchant_name: e.target.value})}
                                    placeholder="Acme Corp"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Metric Type</Label>
                                <Select 
                                    value={meterForm.metric_type}
                                    onValueChange={(v) => setMeterForm({...meterForm, metric_type: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="transaction_count">Transaction Count</SelectItem>
                                        <SelectItem value="transaction_volume">Transaction Volume</SelectItem>
                                        <SelectItem value="api_calls">API Calls</SelectItem>
                                        <SelectItem value="storage_gb">Storage (GB)</SelectItem>
                                        <SelectItem value="webhook_deliveries">Webhook Deliveries</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Reset Frequency</Label>
                                <Select 
                                    value={meterForm.reset_frequency}
                                    onValueChange={(v) => setMeterForm({...meterForm, reset_frequency: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Threshold Limit</Label>
                                <Input
                                    type="number"
                                    value={meterForm.threshold_limit}
                                    onChange={(e) => setMeterForm({...meterForm, threshold_limit: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div>
                                <Label>Alert at (%)</Label>
                                <Input
                                    type="number"
                                    value={meterForm.threshold_percentage}
                                    onChange={(e) => setMeterForm({...meterForm, threshold_percentage: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                                if (editingItem) {
                                    updateMeterMutation.mutate({ id: editingItem.id, data: meterForm });
                                } else {
                                    createMeterMutation.mutate(meterForm);
                                }
                            }}>
                                {editingItem ? 'Update' : 'Create'} Meter
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rule Dialog */}
            <Dialog open={showDialog && dialogType === 'rule'} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit' : 'Create'} Metering Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>PSP</Label>
                            <Select 
                                value={ruleForm.psp_id}
                                onValueChange={(v) => setRuleForm({...ruleForm, psp_id: v})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select PSP" />
                                </SelectTrigger>
                                <SelectContent>
                                    {psps.map(psp => (
                                        <SelectItem key={psp.id} value={psp.id}>{psp.psp_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Rule Name</Label>
                            <Input
                                value={ruleForm.rule_name}
                                onChange={(e) => setRuleForm({...ruleForm, rule_name: e.target.value})}
                                placeholder="Track All API Calls"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Input
                                value={ruleForm.description}
                                onChange={(e) => setRuleForm({...ruleForm, description: e.target.value})}
                                placeholder="Track all API calls for billing"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Metric Type</Label>
                                <Select 
                                    value={ruleForm.metric_type}
                                    onValueChange={(v) => setRuleForm({...ruleForm, metric_type: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="transaction_count">Transaction Count</SelectItem>
                                        <SelectItem value="api_calls">API Calls</SelectItem>
                                        <SelectItem value="storage_gb">Storage (GB)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Applies To</Label>
                                <Select 
                                    value={ruleForm.applies_to}
                                    onValueChange={(v) => setRuleForm({...ruleForm, applies_to: v})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_merchants">All Merchants</SelectItem>
                                        <SelectItem value="specific_merchants">Specific Merchants</SelectItem>
                                        <SelectItem value="merchant_tier">By Tier</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={() => {
                                if (editingItem) {
                                    updateRuleMutation.mutate({ id: editingItem.id, data: ruleForm });
                                } else {
                                    createRuleMutation.mutate(ruleForm);
                                }
                            }}>
                                {editingItem ? 'Update' : 'Create'} Rule
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}