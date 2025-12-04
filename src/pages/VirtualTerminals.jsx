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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
    Monitor, Plus, Search, Settings, Key, Copy, Check, ExternalLink, Loader2
} from 'lucide-react';

const paymentMethods = ['visa', 'mastercard', 'amex', 'discover', 'bank_transfer'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'];

export default function VirtualTerminals() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedKey, setCopiedKey] = useState(null);
    const queryClient = useQueryClient();

    const [newTerminal, setNewTerminal] = useState({
        name: '', merchant_id: '', terminal_type: 'web', allowed_payment_methods: ['visa', 'mastercard'],
        allowed_currencies: ['USD'], daily_limit: 10000, per_transaction_limit: 1000,
        requires_cvv: true, requires_avs: true, enable_3ds: true
    });

    const { data: terminals = [] } = useQuery({
        queryKey: ['virtual-terminals'],
        queryFn: () => base44.entities.VirtualTerminal.list('-created_date'),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const createTerminal = useMutation({
        mutationFn: (data) => {
            const merchant = merchants.find(m => m.id === data.merchant_id);
            return base44.entities.VirtualTerminal.create({
                ...data,
                terminal_id: `VT-${Date.now()}`,
                merchant_name: merchant?.business_name,
                api_key: `vt_${btoa(data.merchant_id + Date.now()).slice(0, 24)}`,
                status: 'active'
            });
        },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['virtual-terminals'] }); setShowCreateDialog(false); }
    });

    const copyKey = (key) => { navigator.clipboard.writeText(key); setCopiedKey(key); setTimeout(() => setCopiedKey(null), 2000); };

    const filteredTerminals = terminals.filter(t => t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || t.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="VirtualTerminals" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div><h1 className="text-2xl font-bold">Virtual Terminals</h1><p className="text-slate-500">Create and manage virtual payment terminals for merchants</p></div>
                        <Button onClick={() => setShowCreateDialog(true)} className="gap-2"><Plus className="h-4 w-4" />Create Terminal</Button>
                    </div>

                    <Card className="mb-6"><CardContent className="p-4">
                        <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search terminals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
                    </CardContent></Card>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTerminals.map((terminal) => (
                            <Card key={terminal.id} className="overflow-hidden">
                                <div className={cn("h-1", terminal.status === 'active' ? "bg-emerald-500" : "bg-slate-300")} />
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold">{terminal.name}</p>
                                            <p className="text-sm text-slate-500">{terminal.merchant_name}</p>
                                        </div>
                                        <Badge variant="outline" className={terminal.status === 'active' ? 'bg-emerald-50 text-emerald-700' : ''}>{terminal.status}</Badge>
                                    </div>
                                    <div className="text-xs text-slate-500 space-y-1 mb-3">
                                        <p>Type: {terminal.terminal_type}</p>
                                        <p>Daily Limit: ${terminal.daily_limit?.toLocaleString()}</p>
                                        <p>3DS: {terminal.enable_3ds ? 'Enabled' : 'Disabled'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => copyKey(terminal.api_key)}>
                                            {copiedKey === terminal.api_key ? <Check className="h-3 w-3" /> : <Key className="h-3 w-3" />}API Key
                                        </Button>
                                        <Button variant="outline" size="sm"><Settings className="h-3 w-3" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                            <DialogHeader><DialogTitle>Create Virtual Terminal</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Terminal Name *</Label><Input value={newTerminal.name} onChange={(e) => setNewTerminal(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Web Checkout" /></div>
                                <div className="space-y-2">
                                    <Label>Merchant *</Label>
                                    <Select value={newTerminal.merchant_id} onValueChange={(v) => setNewTerminal(p => ({ ...p, merchant_id: v }))}>
                                        <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                        <SelectContent>{merchants.filter(m => m.status === 'active').map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Terminal Type</Label>
                                    <Select value={newTerminal.terminal_type} onValueChange={(v) => setNewTerminal(p => ({ ...p, terminal_type: v }))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="web">Web</SelectItem><SelectItem value="mobile">Mobile</SelectItem><SelectItem value="api">API</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Daily Limit ($)</Label><Input type="number" value={newTerminal.daily_limit} onChange={(e) => setNewTerminal(p => ({ ...p, daily_limit: parseInt(e.target.value) }))} /></div>
                                    <div className="space-y-2"><Label>Per Transaction Limit ($)</Label><Input type="number" value={newTerminal.per_transaction_limit} onChange={(e) => setNewTerminal(p => ({ ...p, per_transaction_limit: parseInt(e.target.value) }))} /></div>
                                </div>
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between"><span className="text-sm">Require CVV</span><Switch checked={newTerminal.requires_cvv} onCheckedChange={(c) => setNewTerminal(p => ({ ...p, requires_cvv: c }))} /></div>
                                    <div className="flex items-center justify-between"><span className="text-sm">Require AVS</span><Switch checked={newTerminal.requires_avs} onCheckedChange={(c) => setNewTerminal(p => ({ ...p, requires_avs: c }))} /></div>
                                    <div className="flex items-center justify-between"><span className="text-sm">Enable 3D Secure</span><Switch checked={newTerminal.enable_3ds} onCheckedChange={(c) => setNewTerminal(p => ({ ...p, enable_3ds: c }))} /></div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                <Button onClick={() => createTerminal.mutate(newTerminal)} disabled={!newTerminal.name || !newTerminal.merchant_id || createTerminal.isPending}>
                                    {createTerminal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create Terminal
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}