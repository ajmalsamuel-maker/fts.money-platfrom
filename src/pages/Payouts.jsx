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

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPSPs, setExpandedPSPs] = useState({});
    const [activeView, setActiveView] = useState('psp');

    const [newPayout, setNewPayout] = useState({ psp_id: '', merchant_id: '', amount: '', currency: 'USD', method: 'bank_transfer' });

    const { data: merchants = [] } = useQuery({ queryKey: ['merchants'], queryFn: () => base44.entities.Merchant.list() });
    const { data: processors = [] } = useQuery({ queryKey: ['payment-processors'], queryFn: () => base44.entities.PaymentProcessor.list() });

    const pspPayouts = [];

    const togglePSP = (pspId) => setExpandedPSPs(prev => ({ ...prev, [pspId]: !prev[pspId] }));

    const totalAmount = pspPayouts.reduce((s, p) => s + p.total_amount, 0);
    const totalPending = pspPayouts.reduce((s, p) => s + p.total_pending, 0);
    const totalCompleted = pspPayouts.reduce((s, p) => s + p.total_completed, 0);

    const getCurrencySymbol = (currency) => ({ USD: '$', EUR: '€', GBP: '£', USDT: '$', USDC: '$' }[currency] || currency);

    return (
        <>
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                             <div><h1 className="text-xl sm:text-2xl font-bold">Payouts</h1><p className="text-sm sm:text-base text-slate-500">PSP and merchant-level settlement management</p></div>
                             <div className="flex flex-col sm:flex-row gap-2">
                             <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
                             <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Create Payout</Button>
                         </div>
                     </div>

                     {/* Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                         <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                             <p className="text-sm opacity-80">Total Payouts</p>
                             <p className="text-3xl font-bold">$0</p>
                             <p className="text-xs opacity-70 mt-1">No payouts yet</p>
                         </Card>
                         <Card className="p-4">
                             <p className="text-sm text-slate-500">Pending</p>
                             <p className="text-2xl font-bold text-amber-600">$0</p>
                         </Card>
                         <Card className="p-4">
                             <p className="text-sm text-slate-500">Completed</p>
                             <p className="text-2xl font-bold text-emerald-600">$0</p>
                         </Card>
                         <Card className="p-4">
                             <p className="text-sm text-slate-500">Active PSPs</p>
                             <p className="text-2xl font-bold">0</p>
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
                         <CardContent>
                             <div className="py-12 text-center text-slate-400">
                                 No payout data - process transactions and settlements to see payouts
                             </div>
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
        </>
    );
}