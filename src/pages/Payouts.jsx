import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { 
    CreditCard, Send, Clock, CheckCircle, XCircle, AlertTriangle, Search, Filter, Download, Plus, Loader2, DollarSign, Bitcoin, ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';

const payoutStatuses = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700', icon: Clock },
    processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700', icon: Loader2 },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function Payouts() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const queryClient = useQueryClient();

    const [newPayout, setNewPayout] = useState({ merchant_id: '', amount: '', currency: 'USD', method: 'bank_transfer', priority: 'standard' });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const payouts = [
        { id: 'PAY001', merchant: 'TechCorp Solutions', merchant_id: 'm1', amount: 125000, currency: 'USD', method: 'bank_transfer', status: 'completed', initiated: new Date(Date.now() - 86400000), completed: new Date() },
        { id: 'PAY002', merchant: 'Global Retail Inc', merchant_id: 'm2', amount: 85000, currency: 'USD', method: 'bank_transfer', status: 'processing', initiated: new Date(), completed: null },
        { id: 'PAY003', merchant: 'GameZone Entertainment', merchant_id: 'm3', amount: 45000, currency: 'EUR', method: 'sepa', status: 'pending', initiated: new Date(), completed: null },
        { id: 'PAY004', merchant: 'Fashion Forward', merchant_id: 'm4', amount: 32000, currency: 'GBP', method: 'faster_payments', status: 'completed', initiated: new Date(Date.now() - 172800000), completed: new Date(Date.now() - 86400000) },
        { id: 'PAY005', merchant: 'Crypto Exchange Co', merchant_id: 'm5', amount: 50000, currency: 'USDT', method: 'crypto', status: 'completed', initiated: new Date(Date.now() - 3600000), completed: new Date() },
        { id: 'PAY006', merchant: 'Digital Services Ltd', merchant_id: 'm6', amount: 28000, currency: 'USDC', method: 'crypto', status: 'processing', initiated: new Date(), completed: null },
    ];

    const stats = {
        totalPending: payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
        totalProcessing: payouts.filter(p => p.status === 'processing').reduce((s, p) => s + p.amount, 0),
        completedToday: payouts.filter(p => p.status === 'completed' && p.completed && format(p.completed, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).reduce((s, p) => s + p.amount, 0),
        totalCompleted: payouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    };

    const filteredPayouts = payouts.filter(p => {
        const matchesSearch = p.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const createPayout = useMutation({
        mutationFn: async (data) => {
            // In real implementation, this would create a payout
            return data;
        },
        onSuccess: () => { setShowCreateDialog(false); setNewPayout({ merchant_id: '', amount: '', currency: 'USD', method: 'bank_transfer', priority: 'standard' }); }
    });

    const getCurrencySymbol = (currency) => {
        const symbols = { USD: '$', EUR: '€', GBP: '£', USDT: '$', USDC: '$', BTC: '₿', ETH: 'Ξ' };
        return symbols[currency] || currency;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Payouts" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold">Payouts</h1><p className="text-slate-500">Manage merchant settlements and payouts</p></div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
                            <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Create Payout</Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-600" /></div>
                                <div><p className="text-2xl font-bold">${(stats.totalPending / 1000).toFixed(0)}K</p><p className="text-sm text-slate-500">Pending</p></div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Loader2 className="h-5 w-5 text-blue-600" /></div>
                                <div><p className="text-2xl font-bold">${(stats.totalProcessing / 1000).toFixed(0)}K</p><p className="text-sm text-slate-500">Processing</p></div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-emerald-600" /></div>
                                <div><p className="text-2xl font-bold">${(stats.completedToday / 1000).toFixed(0)}K</p><p className="text-sm text-slate-500">Completed Today</p></div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><ArrowUpRight className="h-5 w-5 text-purple-600" /></div>
                                <div><p className="text-2xl font-bold">${(stats.totalCompleted / 1000).toFixed(0)}K</p><p className="text-sm text-slate-500">Total Completed</p></div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6"><CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search payouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent></Card>

                    {/* Payouts Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Payout ID</TableHead><TableHead>Merchant</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Initiated</TableHead><TableHead></TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayouts.map((payout) => {
                                        const StatusIcon = payoutStatuses[payout.status]?.icon || Clock;
                                        return (
                                            <TableRow key={payout.id}>
                                                <TableCell className="font-mono text-sm">{payout.id}</TableCell>
                                                <TableCell className="font-medium">{payout.merchant}</TableCell>
                                                <TableCell className="font-semibold">
                                                    <div className="flex items-center gap-1">
                                                        {payout.currency === 'USDT' || payout.currency === 'USDC' ? <Bitcoin className="h-3 w-3" /> : null}
                                                        {getCurrencySymbol(payout.currency)}{payout.amount.toLocaleString()}
                                                        <span className="text-xs text-slate-500 ml-1">{payout.currency}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="capitalize">{payout.method.replace('_', ' ')}</TableCell>
                                                <TableCell>
                                                    <Badge className={cn("gap-1", payoutStatuses[payout.status]?.className)}>
                                                        <StatusIcon className={cn("h-3 w-3", payout.status === 'processing' && "animate-spin")} />
                                                        {payoutStatuses[payout.status]?.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-500">{format(payout.initiated, 'MMM d, HH:mm')}</TableCell>
                                                <TableCell><Button variant="ghost" size="sm">View</Button></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Create Payout Dialog */}
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Manual Payout</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Merchant</Label>
                                    <Select value={newPayout.merchant_id} onValueChange={(v) => setNewPayout(p => ({ ...p, merchant_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                        <SelectContent>{merchants.filter(m => m.status === 'active').map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Amount</Label><Input type="number" value={newPayout.amount} onChange={(e) => setNewPayout(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" /></div>
                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Select value={newPayout.currency} onValueChange={(v) => setNewPayout(p => ({ ...p, currency: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="USDT">USDT (Tether)</SelectItem>
                                                <SelectItem value="USDC">USDC</SelectItem>
                                                <SelectItem value="BTC">BTC</SelectItem>
                                                <SelectItem value="ETH">ETH</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payout Method</Label>
                                    <Select value={newPayout.method} onValueChange={(v) => setNewPayout(p => ({ ...p, method: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer (ACH/Wire)</SelectItem>
                                            <SelectItem value="sepa">SEPA Transfer</SelectItem>
                                            <SelectItem value="faster_payments">UK Faster Payments</SelectItem>
                                            <SelectItem value="crypto">Crypto Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={newPayout.priority} onValueChange={(v) => setNewPayout(p => ({ ...p, priority: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">Standard (1-3 days)</SelectItem>
                                            <SelectItem value="express">Express (Same day)</SelectItem>
                                            <SelectItem value="instant">Instant</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                <Button onClick={() => createPayout.mutate(newPayout)} disabled={!newPayout.merchant_id || !newPayout.amount} className="gap-2"><Send className="h-4 w-4" />Create Payout</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}