import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Wallet, DollarSign, Clock, TrendingUp, Calendar, Plus, RefreshCw, 
    ArrowRight, CheckCircle, AlertCircle, Zap, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MerchantPayouts() {
    const { user } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = useState('');
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showPayoutDialog, setShowPayoutDialog] = useState(false);
    const [showRouteConfig, setShowRouteConfig] = useState(false);
    const [availableRoutes, setAvailableRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const queryClient = useQueryClient();

    const [scheduleForm, setScheduleForm] = useState({
        schedule_name: '', frequency: 'weekly', min_balance: 1000,
        reserve_amount: 0, auto_reconcile: true
    });

    const [payoutForm, setPayoutForm] = useState({
        amount: '', currency: 'USD', country: 'US',
        beneficiary_name: '', beneficiary_account: '', beneficiary_bank: ''
    });

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ id: user?.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id,
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids', user?.merchant_id],
        queryFn: () => base44.entities.MerchantMID.filter({ merchant_id: user?.merchant_id }),
        enabled: !!user?.merchant_id,
    });

    const { data: balances = [] } = useQuery({
        queryKey: ['balances', user?.merchant_id],
        queryFn: () => base44.entities.MerchantBalance.filter({ merchant_id: user?.merchant_id }),
        enabled: !!user?.merchant_id,
    });

    const { data: schedules = [] } = useQuery({
        queryKey: ['schedules', user?.merchant_id],
        queryFn: () => base44.entities.PayoutSchedule.filter({ merchant_id: user?.merchant_id }),
        enabled: !!user?.merchant_id,
    });

    const { data: payouts = [] } = useQuery({
        queryKey: ['payouts', user?.merchant_id],
        queryFn: () => base44.entities.Payout.filter({ merchant_id: user?.merchant_id }),
        enabled: !!user?.merchant_id,
    });

    const { data: allRoutes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.filter({ status: 'active' }),
    });

    useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids]);

    const createScheduleMutation = useMutation({
        mutationFn: (data) => base44.entities.PayoutSchedule.create({
            ...data,
            merchant_id: user?.merchant_id,
            merchant_name: merchant?.business_name,
            status: 'active'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            setShowScheduleDialog(false);
            toast.success('Payout schedule created');
        },
    });

    const initiatePayoutMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('payoutOrchestrator', {
                action: 'process_payout',
                merchant_id: user?.merchant_id,
                amount: parseFloat(data.amount),
                currency: data.currency,
                country: data.country,
                beneficiary: {
                    name: data.beneficiary_name,
                    account: data.beneficiary_account,
                    bank: data.beneficiary_bank
                },
                criteria: { prioritize: 'balanced' }
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payouts'] });
            queryClient.invalidateQueries({ queryKey: ['balances'] });
            setShowPayoutDialog(false);
            toast.success('Payout initiated successfully');
        },
    });

    const calculateRoutes = async () => {
        if (!payoutForm.amount || !payoutForm.currency) return;
        
        try {
            const response = await base44.functions.invoke('payoutOrchestrator', {
                action: 'calculate_routes',
                amount: parseFloat(payoutForm.amount),
                currency: payoutForm.currency,
                country: payoutForm.country
            });
            setAvailableRoutes(response.data.routes || []);
        } catch (error) {
            toast.error('Failed to calculate routes');
        }
    };

    const totalAvailable = balances.reduce((sum, b) => sum + (b.available_balance || 0), 0);
    const totalPending = balances.reduce((sum, b) => sum + (b.pending_balance || 0), 0);
    const completedPayouts = payouts.filter(p => p.status === 'completed').length;
    const pendingPayouts = payouts.filter(p => p.status === 'processing' || p.status === 'pending').length;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantPayouts"
                user={user}
                merchant={merchant}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
                                <p className="text-slate-500">Manage your payout schedules and withdrawals</p>
                            </div>
                            <Button onClick={() => setShowPayoutDialog(true)} className="gap-2 bg-blue-600">
                                <Plus className="h-4 w-4" /> Request Payout
                            </Button>
                        </div>

                        {/* Balance Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Card className="p-5 border-l-4 border-l-emerald-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-emerald-100 rounded-lg">
                                        <Wallet className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Available Balance</p>
                                        <p className="text-2xl font-bold text-emerald-600">${totalAvailable.toLocaleString()}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-5 border-l-4 border-l-amber-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-amber-100 rounded-lg">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Pending Payouts</p>
                                        <p className="text-2xl font-bold text-amber-600">${totalPending.toLocaleString()}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-5 border-l-4 border-l-blue-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <CheckCircle className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Completed</p>
                                        <p className="text-2xl font-bold text-blue-600">{completedPayouts}</p>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-5 border-l-4 border-l-purple-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Active Schedules</p>
                                        <p className="text-2xl font-bold text-purple-600">{schedules.filter(s => s.status === 'active').length}</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Tabs defaultValue="balance" className="space-y-4">
                            <TabsList>
                                <TabsTrigger value="balance">Balance</TabsTrigger>
                                <TabsTrigger value="schedules">Payout Schedules</TabsTrigger>
                                <TabsTrigger value="history">Payout History</TabsTrigger>
                                <TabsTrigger value="routes">Payout Routes</TabsTrigger>
                            </TabsList>

                            <TabsContent value="balance">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Balance by Currency</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {balances.length === 0 ? (
                                                <div className="text-center py-8 text-slate-500">
                                                    <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                                    <p>No balance data available</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {balances.map(balance => (
                                                        <div key={balance.id} className="p-4 bg-slate-50 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <Badge variant="outline">{balance.currency}</Badge>
                                                                <span className="text-xs text-slate-500">MID: {balance.mid}</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm text-slate-600">Available:</span>
                                                                    <span className="font-semibold text-emerald-600">${balance.available_balance?.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm text-slate-600">Pending:</span>
                                                                    <span className="font-semibold text-amber-600">${balance.pending_balance?.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Quick Payout</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <p className="text-sm text-slate-600">Request an immediate payout from your available balance</p>
                                                <Button 
                                                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                                                    onClick={() => setShowPayoutDialog(true)}
                                                >
                                                    <Zap className="h-4 w-4" /> Initiate Payout
                                                </Button>
                                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-xs text-blue-700">
                                                        <strong>Note:</strong> Payout speed and fees depend on the selected route and destination country.
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="schedules">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Automated Payout Schedules</CardTitle>
                                        <Button size="sm" onClick={() => setShowScheduleDialog(true)}>
                                            <Plus className="h-4 w-4 mr-2" /> Add Schedule
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        {schedules.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                                <p className="font-medium">No payout schedules configured</p>
                                                <p className="text-sm mt-2">Set up automated payouts to receive funds on a regular basis</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {schedules.map(schedule => (
                                                    <div key={schedule.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <p className="font-medium">{schedule.schedule_name}</p>
                                                                <p className="text-sm text-slate-500">Every {schedule.frequency}</p>
                                                            </div>
                                                            <Badge className={schedule.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>
                                                                {schedule.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-slate-500">Min Balance:</span>
                                                                <p className="font-medium">${schedule.min_balance?.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Reserve:</span>
                                                                <p className="font-medium">${schedule.reserve_amount?.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-slate-500">Next Run:</span>
                                                                <p className="font-medium">
                                                                    {schedule.next_run ? format(new Date(schedule.next_run), 'MMM dd, HH:mm') : 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Payout History</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50">
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Channel</TableHead>
                                                    <TableHead>Provider</TableHead>
                                                    <TableHead>Beneficiary</TableHead>
                                                    <TableHead>Cost</TableHead>
                                                    <TableHead>Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payouts.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                            No payout history
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    payouts.map(payout => (
                                                        <TableRow key={payout.id}>
                                                            <TableCell className="text-sm">
                                                                {format(new Date(payout.created_date), 'MMM dd, yyyy HH:mm')}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                ${payout.amount?.toLocaleString()} {payout.currency}
                                                            </TableCell>
                                                            <TableCell className="text-sm">
                                                                {payout.channel_type?.replace(/_/g, ' ')}
                                                            </TableCell>
                                                            <TableCell className="text-sm">{payout.provider}</TableCell>
                                                            <TableCell className="text-sm">{payout.beneficiary_name}</TableCell>
                                                            <TableCell className="text-sm text-slate-600">
                                                                ${payout.estimated_cost?.toFixed(2)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={
                                                                    payout.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                                    payout.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                    payout.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                                }>
                                                                    {payout.status}
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

                            <TabsContent value="routes">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Available Payout Routes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {allRoutes.map(route => (
                                                <div key={route.id} className="p-4 border rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-medium">{route.route_name}</p>
                                                            <p className="text-sm text-slate-500">{route.provider}</p>
                                                        </div>
                                                        <Badge variant="outline">{route.speed?.replace(/_/g, ' ')}</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                        <div>
                                                            <span className="text-slate-500">Cost:</span>
                                                            <p className="font-medium">{route.cost_percentage}% + ${route.cost_fixed}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Channel:</span>
                                                            <p className="font-medium">{route.channel_type?.replace(/_/g, ' ')}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Currencies:</span>
                                                            <p className="font-medium">{route.supported_currencies?.length || 0} supported</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>
            </div>

            {/* Create Schedule Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create Payout Schedule</DialogTitle>
                        <DialogDescription>Set up automated payouts on a recurring basis</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Schedule Name *</Label>
                            <Input 
                                value={scheduleForm.schedule_name} 
                                onChange={(e) => setScheduleForm({...scheduleForm, schedule_name: e.target.value})}
                                placeholder="e.g., Weekly Payout"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Frequency</Label>
                                <Select value={scheduleForm.frequency} onValueChange={(val) => setScheduleForm({...scheduleForm, frequency: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Minimum Balance</Label>
                                <Input 
                                    type="number" 
                                    value={scheduleForm.min_balance} 
                                    onChange={(e) => setScheduleForm({...scheduleForm, min_balance: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reserve Amount</Label>
                            <Input 
                                type="number" 
                                value={scheduleForm.reserve_amount} 
                                onChange={(e) => setScheduleForm({...scheduleForm, reserve_amount: parseFloat(e.target.value)})}
                                placeholder="Amount to keep in account"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                checked={scheduleForm.auto_reconcile}
                                onCheckedChange={(checked) => setScheduleForm({...scheduleForm, auto_reconcile: checked})}
                            />
                            <Label>Auto-reconcile payouts</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
                        <Button onClick={() => createScheduleMutation.mutate(scheduleForm)}>Create Schedule</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Initiate Payout Dialog */}
            <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Request Payout</DialogTitle>
                        <DialogDescription>Withdraw funds to your bank account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Amount *</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={payoutForm.amount} 
                                    onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                                    onBlur={calculateRoutes}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={payoutForm.currency} onValueChange={(val) => {
                                    setPayoutForm({...payoutForm, currency: val});
                                }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Select value={payoutForm.country} onValueChange={(val) => {
                                    setPayoutForm({...payoutForm, country: val});
                                }}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="US">United States</SelectItem>
                                        <SelectItem value="GB">United Kingdom</SelectItem>
                                        <SelectItem value="DE">Germany</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {availableRoutes.length > 0 && (
                            <div className="space-y-2">
                                <Label>Select Payout Route</Label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {availableRoutes.map(route => (
                                        <div 
                                            key={route.id} 
                                            className={cn(
                                                "p-3 border-2 rounded-lg cursor-pointer transition-all",
                                                selectedRoute?.id === route.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                                            )}
                                            onClick={() => setSelectedRoute(route)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">{route.route_name}</p>
                                                    <p className="text-xs text-slate-500">{route.provider} • {route.speed?.replace(/_/g, ' ')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-slate-900">${route.estimated_cost?.toFixed(2)} fee</p>
                                                    <p className="text-xs text-emerald-600">Net: ${route.estimated_net?.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={calculateRoutes} className="w-full gap-2">
                                    <RefreshCw className="h-3 w-3" /> Refresh Routes
                                </Button>
                            </div>
                        )}

                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                            <h4 className="font-medium text-sm">Beneficiary Details</h4>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>Account Holder Name *</Label>
                                    <Input 
                                        value={payoutForm.beneficiary_name} 
                                        onChange={(e) => setPayoutForm({...payoutForm, beneficiary_name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number / IBAN *</Label>
                                    <Input 
                                        value={payoutForm.beneficiary_account} 
                                        onChange={(e) => setPayoutForm({...payoutForm, beneficiary_account: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bank Name</Label>
                                    <Input 
                                        value={payoutForm.beneficiary_bank} 
                                        onChange={(e) => setPayoutForm({...payoutForm, beneficiary_bank: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={() => initiatePayoutMutation.mutate(payoutForm)}
                            disabled={!payoutForm.amount || !payoutForm.beneficiary_name || !payoutForm.beneficiary_account}
                        >
                            {initiatePayoutMutation.isPending ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Initiate Payout
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}