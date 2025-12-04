import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
    Send, Clock, CheckCircle, XCircle, Search, Download, Plus, Loader2, ChevronDown, ChevronRight, Building2, Store, Bitcoin
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
    const [expandedPSPs, setExpandedPSPs] = useState({});
    const [activeView, setActiveView] = useState('psp');

    const [newPayout, setNewPayout] = useState({ psp_id: '', merchant_id: '', amount: '', currency: 'USD', method: 'bank_transfer' });

    const { data: merchants = [] } = useQuery({ queryKey: ['merchants'], queryFn: () => base44.entities.Merchant.list() });
    const { data: processors = [] } = useQuery({ queryKey: ['payment-processors'], queryFn: () => base44.entities.PaymentProcessor.list() });

    // Mock PSP-level payouts with merchant breakdown
    const pspPayouts = [
        {
            psp_id: 'psp_stripe', psp_name: 'Stripe', currency: 'USD',
            total_amount: 285000, total_pending: 45000, total_completed: 240000,
            merchants: [
                { merchant_id: 'm1', name: 'TechCorp Solutions', amount: 95000, status: 'completed', method: 'bank_transfer', date: new Date(Date.now() - 86400000), settlement_terms: 'T+1' },
                { merchant_id: 'm2', name: 'Global Retail Inc', amount: 78000, status: 'processing', method: 'bank_transfer', date: new Date(), settlement_terms: 'T+2' },
                { merchant_id: 'm3', name: 'GameZone Entertainment', amount: 112000, status: 'completed', method: 'bank_transfer', date: new Date(Date.now() - 172800000), settlement_terms: 'T+1' },
            ]
        },
        {
            psp_id: 'psp_adyen', psp_name: 'Adyen', currency: 'USD',
            total_amount: 198000, total_pending: 32000, total_completed: 166000,
            merchants: [
                { merchant_id: 'm1', name: 'TechCorp Solutions', amount: 65000, status: 'completed', method: 'sepa', date: new Date(Date.now() - 86400000), settlement_terms: 'T+1' },
                { merchant_id: 'm4', name: 'Fashion Forward', amount: 72000, status: 'pending', method: 'bank_transfer', date: new Date(), settlement_terms: 'T+3' },
                { merchant_id: 'm5', name: 'Digital Services Ltd', amount: 61000, status: 'completed', method: 'bank_transfer', date: new Date(Date.now() - 259200000), settlement_terms: 'T+2' },
            ]
        },
        {
            psp_id: 'psp_crypto', psp_name: 'CryptoPayments', currency: 'USDT',
            total_amount: 125000, total_pending: 25000, total_completed: 100000,
            merchants: [
                { merchant_id: 'm7', name: 'Crypto Exchange Co', amount: 75000, status: 'completed', method: 'crypto', date: new Date(Date.now() - 3600000), settlement_terms: 'T+0' },
                { merchant_id: 'm8', name: 'Web3 Services', amount: 50000, status: 'pending', method: 'crypto', date: new Date(), settlement_terms: 'T+0' },
            ]
        },
    ];

    const togglePSP = (pspId) => setExpandedPSPs(prev => ({ ...prev, [pspId]: !prev[pspId] }));

    const totalAmount = pspPayouts.reduce((s, p) => s + p.total_amount, 0);
    const totalPending = pspPayouts.reduce((s, p) => s + p.total_pending, 0);
    const totalCompleted = pspPayouts.reduce((s, p) => s + p.total_completed, 0);

    const getCurrencySymbol = (currency) => ({ USD: '$', EUR: '€', GBP: '£', USDT: '$', USDC: '$' }[currency] || currency);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Payouts" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold">Payouts</h1><p className="text-slate-500">PSP and merchant-level settlement management</p></div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
                            <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Create Payout</Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <p className="text-sm opacity-80">Total Payouts</p>
                            <p className="text-3xl font-bold">${(totalAmount / 1000).toFixed(0)}K</p>
                            <p className="text-xs opacity-70 mt-1">Across {pspPayouts.length} PSPs</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Pending</p>
                            <p className="text-2xl font-bold text-amber-600">${(totalPending / 1000).toFixed(0)}K</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Completed</p>
                            <p className="text-2xl font-bold text-emerald-600">${(totalCompleted / 1000).toFixed(0)}K</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Active PSPs</p>
                            <p className="text-2xl font-bold">{pspPayouts.length}</p>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6"><CardContent className="p-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search payouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
                        </div>
                    </CardContent></Card>

                    {/* PSP & Merchant Breakdown */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Payout Hierarchy</CardTitle>
                                <Tabs value={activeView} onValueChange={setActiveView}>
                                    <TabsList><TabsTrigger value="psp">By PSP</TabsTrigger><TabsTrigger value="merchant">By Merchant</TabsTrigger></TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {activeView === 'psp' ? (
                                <div className="divide-y">
                                    {pspPayouts.map((psp) => (
                                        <Collapsible key={psp.psp_id} open={expandedPSPs[psp.psp_id]} onOpenChange={() => togglePSP(psp.psp_id)}>
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center justify-between p-4 hover:bg-slate-50">
                                                    <div className="flex items-center gap-3">
                                                        {expandedPSPs[psp.psp_id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-600" /></div>
                                                        <div className="text-left">
                                                            <p className="font-semibold">{psp.psp_name}</p>
                                                            <p className="text-xs text-slate-500">{psp.merchants.length} merchants · {psp.currency}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-right">
                                                        <div><p className="text-xs text-slate-500">Total</p><p className="font-semibold">{getCurrencySymbol(psp.currency)}{psp.total_amount.toLocaleString()}</p></div>
                                                        <div><p className="text-xs text-slate-500">Pending</p><p className="font-semibold text-amber-600">{getCurrencySymbol(psp.currency)}{psp.total_pending.toLocaleString()}</p></div>
                                                        <div><p className="text-xs text-slate-500">Completed</p><p className="font-semibold text-emerald-600">{getCurrencySymbol(psp.currency)}{psp.total_completed.toLocaleString()}</p></div>
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="bg-slate-50 border-t">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-slate-100"><TableHead>Merchant</TableHead><TableHead className="text-right">Amount</TableHead><TableHead>Method</TableHead><TableHead>Terms</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {psp.merchants.map((m) => {
                                                                const StatusIcon = payoutStatuses[m.status]?.icon || Clock;
                                                                return (
                                                                    <TableRow key={m.merchant_id}>
                                                                        <TableCell><div className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /><span className="font-medium">{m.name}</span></div></TableCell>
                                                                        <TableCell className="text-right font-semibold">{getCurrencySymbol(psp.currency)}{m.amount.toLocaleString()}</TableCell>
                                                                        <TableCell className="capitalize">{m.method.replace('_', ' ')}</TableCell>
                                                                        <TableCell><Badge variant="outline">{m.settlement_terms}</Badge></TableCell>
                                                                        <TableCell><Badge className={cn("gap-1", payoutStatuses[m.status]?.className)}><StatusIcon className={cn("h-3 w-3", m.status === 'processing' && "animate-spin")} />{payoutStatuses[m.status]?.label}</Badge></TableCell>
                                                                        <TableCell className="text-slate-500">{format(m.date, 'MMM d, HH:mm')}</TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>Merchant</TableHead><TableHead>PSPs</TableHead><TableHead className="text-right">Total Amount</TableHead><TableHead>Settlement Terms</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {[...new Set(pspPayouts.flatMap(p => p.merchants.map(m => m.name)))].map((merchantName) => {
                                            const merchantData = pspPayouts.flatMap(p => p.merchants.filter(m => m.name === merchantName).map(m => ({ ...m, psp: p.psp_name, currency: p.currency })));
                                            const terms = [...new Set(merchantData.map(m => m.settlement_terms))];
                                            return (
                                                <TableRow key={merchantName}>
                                                    <TableCell><div className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /><span className="font-medium">{merchantName}</span></div></TableCell>
                                                    <TableCell><div className="flex gap-1">{merchantData.map(m => <Badge key={m.psp} variant="outline" className="text-xs">{m.psp}</Badge>)}</div></TableCell>
                                                    <TableCell className="text-right font-semibold">${merchantData.reduce((s, m) => s + m.amount, 0).toLocaleString()}</TableCell>
                                                    <TableCell><div className="flex gap-1">{terms.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}</div></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Create Payout Dialog */}
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create Manual Payout</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>PSP</Label>
                                    <Select value={newPayout.psp_id} onValueChange={(v) => setNewPayout(p => ({ ...p, psp_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select PSP" /></SelectTrigger>
                                        <SelectContent>{processors.map(p => <SelectItem key={p.id} value={p.processor_id}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
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
                                                <SelectItem value="USDT">USDT</SelectItem>
                                                <SelectItem value="USDC">USDC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payout Method</Label>
                                    <Select value={newPayout.method} onValueChange={(v) => setNewPayout(p => ({ ...p, method: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="sepa">SEPA</SelectItem>
                                            <SelectItem value="faster_payments">UK Faster Payments</SelectItem>
                                            <SelectItem value="crypto">Crypto Wallet</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                <Button disabled={!newPayout.psp_id || !newPayout.merchant_id || !newPayout.amount} className="gap-2"><Send className="h-4 w-4" />Create Payout</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}