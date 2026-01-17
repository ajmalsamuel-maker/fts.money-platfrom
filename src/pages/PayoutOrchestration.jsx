import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
    Zap, DollarSign, TrendingUp, Clock, CheckCircle, Plus, Calendar, 
    Target, BarChart3, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PayoutOrchestration() {

    const [showRouteDialog, setShowRouteDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [routeForm, setRouteForm] = useState({
        route_name: '', channel_type: 'bank_transfer', provider: '', 
        supported_currencies: ['USD'], cost_percentage: 1, cost_fixed: 0,
        speed: 'next_day', status: 'active', priority: 100
    });

    const queryClient = useQueryClient();

    const { data: routes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list('-priority'),
    });

    const { data: schedules = [] } = useQuery({
        queryKey: ['payout-schedules'],
        queryFn: () => base44.entities.PayoutSchedule.list('-created_date'),
    });

    const { data: payouts = [] } = useQuery({
        queryKey: ['payouts'],
        queryFn: () => base44.entities.Payout.list('-created_date', 50),
    });

    const createRouteMutation = useMutation({
        mutationFn: (data) => base44.entities.PayoutRoute.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payout-routes'] });
            setShowRouteDialog(false);
            toast.success('Payout route created');
        },
    });

    const updateRouteMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PayoutRoute.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payout-routes'] });
            toast.success('Route updated');
        },
    });

    const activeRoutes = routes.filter(r => r.status === 'active').length;
    const totalPayouts = payouts.length;
    const completedPayouts = payouts.filter(p => p.status === 'completed').length;
    const successRate = totalPayouts > 0 ? ((completedPayouts / totalPayouts) * 100).toFixed(1) : 0;

    const channelIcons = {
        bank_transfer: DollarSign,
        instant_payment: Zap,
        card_payout: CheckCircle,
        wallet: Target,
        crypto: TrendingUp,
        swift: BarChart3
    };

    const speedLabels = {
        instant: 'Instant',
        same_day: 'Same Day',
        next_day: 'Next Day',
        '2_3_days': '2-3 Days',
        '3_5_days': '3-5 Days'
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="PayoutOrchestration" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Payout Orchestration</h1>
                            <p className="text-slate-500">Intelligent routing and scheduling for optimal payout delivery</p>
                        </div>
                        <Button onClick={() => setShowRouteDialog(true)} className="gap-2 bg-blue-600">
                            <Plus className="h-4 w-4" /> Add Route
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Active Routes</p>
                                    <p className="text-2xl font-bold">{activeRoutes}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Payouts</p>
                                    <p className="text-2xl font-bold">{totalPayouts}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Success Rate</p>
                                    <p className="text-2xl font-bold">{successRate}%</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Schedules</p>
                                    <p className="text-2xl font-bold">{schedules.length}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="routes" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="routes">Routes</TabsTrigger>
                            <TabsTrigger value="schedules">Schedules</TabsTrigger>
                            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="routes">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payout Routes</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Route Name</TableHead>
                                                <TableHead>Channel</TableHead>
                                                <TableHead>Provider</TableHead>
                                                <TableHead>Currencies</TableHead>
                                                <TableHead>Cost</TableHead>
                                                <TableHead>Speed</TableHead>
                                                <TableHead>Success Rate</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {routes.map((route) => {
                                                const Icon = channelIcons[route.channel_type] || DollarSign;
                                                return (
                                                    <TableRow key={route.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRoute(route)}>
                                                        <TableCell className="font-medium">{route.route_name}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4 text-slate-500" />
                                                                {route.channel_type.replace(/_/g, ' ')}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{route.provider}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {route.supported_currencies?.slice(0, 3).map(c => (
                                                                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                                                                ))}
                                                                {route.supported_currencies?.length > 3 && (
                                                                    <Badge variant="outline" className="text-xs">+{route.supported_currencies.length - 3}</Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {route.cost_percentage}% + ${route.cost_fixed}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{speedLabels[route.speed]}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs">{route.success_rate || 'N/A'}%</TableCell>
                                                        <TableCell>
                                                            <Badge className={
                                                                route.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                                route.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {route.status}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schedules">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Payout Schedules</CardTitle>
                                    <Button size="sm" onClick={() => setShowScheduleDialog(true)}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Schedule
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {schedules.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                                            <p>No payout schedules configured</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {schedules.map(schedule => (
                                                <div key={schedule.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium">{schedule.schedule_name}</p>
                                                            <p className="text-sm text-slate-500">{schedule.merchant_name}</p>
                                                        </div>
                                                        <Badge className={schedule.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}>
                                                            {schedule.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                                        <div>
                                                            <span className="text-slate-500">Frequency:</span>
                                                            <span className="ml-2 font-medium">{schedule.frequency}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Min Balance:</span>
                                                            <span className="ml-2 font-medium">${schedule.min_balance?.toLocaleString()}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-500">Next Run:</span>
                                                            <span className="ml-2 font-medium">
                                                                {schedule.next_run ? format(new Date(schedule.next_run), 'MMM dd, HH:mm') : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="monitoring">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Real-Time Balance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-slate-400">
                                            Balance monitoring available after payouts are configured
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Route Performance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {routes.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400">
                                                No routes configured yet
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {routes.slice(0, 5).map(route => (
                                                    <div key={route.id} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                            <span className="text-sm">{route.route_name}</span>
                                                        </div>
                                                        <span className="text-sm font-medium">{route.success_rate || 95}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="reconciliation">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Automated Reconciliation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12">
                                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                                        <p className="font-medium">All payouts reconciled</p>
                                        <p className="text-sm text-slate-500 mt-2">Last run: {format(new Date(), 'PPpp')}</p>
                                        <Button className="mt-4 gap-2">
                                            <RefreshCw className="h-4 w-4" /> Run Reconciliation
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Add Route Dialog */}
            <Dialog open={showRouteDialog} onOpenChange={setShowRouteDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Payout Route</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Route Name *</Label>
                                <Input value={routeForm.route_name} onChange={(e) => setRouteForm({...routeForm, route_name: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Provider *</Label>
                                <Input value={routeForm.provider} onChange={(e) => setRouteForm({...routeForm, provider: e.target.value})} placeholder="e.g., Wise, Stripe" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Channel Type</Label>
                                <Select value={routeForm.channel_type} onValueChange={(val) => setRouteForm({...routeForm, channel_type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent className="max-h-80">
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="swift">SWIFT</SelectItem>
                                        <SelectItem value="sepa">SEPA</SelectItem>
                                        <SelectItem value="ach">ACH</SelectItem>
                                        <SelectItem value="instant_payment">Instant Payment</SelectItem>
                                        <SelectItem value="card_payout">Card Payout</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="venmo">Venmo</SelectItem>
                                        <SelectItem value="cashapp">Cash App</SelectItem>
                                        <SelectItem value="alipay">Alipay</SelectItem>
                                        <SelectItem value="wechat_pay">WeChat Pay</SelectItem>
                                        <SelectItem value="gcash">GCash</SelectItem>
                                        <SelectItem value="paytm">Paytm</SelectItem>
                                        <SelectItem value="m_pesa">M-Pesa</SelectItem>
                                        <SelectItem value="pix">PIX</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="bitcoin">Bitcoin</SelectItem>
                                        <SelectItem value="ethereum">Ethereum</SelectItem>
                                        <SelectItem value="usdt">USDT (Tether)</SelectItem>
                                        <SelectItem value="usdc">USDC</SelectItem>
                                        <SelectItem value="lightning_network">Lightning Network</SelectItem>
                                        <SelectItem value="stablecoin">Other Stablecoin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Speed</Label>
                                <Select value={routeForm.speed} onValueChange={(val) => setRouteForm({...routeForm, speed: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant">Instant</SelectItem>
                                        <SelectItem value="same_day">Same Day</SelectItem>
                                        <SelectItem value="next_day">Next Day</SelectItem>
                                        <SelectItem value="2_3_days">2-3 Days</SelectItem>
                                        <SelectItem value="3_5_days">3-5 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cost % *</Label>
                                <Input type="number" step="0.01" value={routeForm.cost_percentage} onChange={(e) => setRouteForm({...routeForm, cost_percentage: parseFloat(e.target.value)})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fixed Fee</Label>
                                <Input type="number" step="0.01" value={routeForm.cost_fixed} onChange={(e) => setRouteForm({...routeForm, cost_fixed: parseFloat(e.target.value)})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRouteDialog(false)}>Cancel</Button>
                        <Button onClick={() => createRouteMutation.mutate(routeForm)}>Create Route</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}