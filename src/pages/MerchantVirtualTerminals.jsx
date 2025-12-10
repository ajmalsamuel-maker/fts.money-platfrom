import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
    Monitor, Plus, Search, Settings, Key, Copy, Check, ExternalLink, Loader2, Trash2
} from 'lucide-react';

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD'];

export default function MerchantVirtualTerminals() {
    const { user, loading, isAuthenticated, logout } = useMerchantAuth();
    const navigate = useNavigate();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [selectedTerminal, setSelectedTerminal] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedKey, setCopiedKey] = useState(null);
    const [selectedMID, setSelectedMID] = useState('');
    const queryClient = useQueryClient();

    const [newTerminal, setNewTerminal] = useState({
        name: '', terminal_type: 'web', allowed_currencies: ['USD'], 
        daily_limit: 10000, per_transaction_limit: 1000,
        requires_cvv: true, requires_avs: true, enable_3ds: true
    });

    React.useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate(createPageUrl('MerchantLogin'));
        }
    }, [loading, isAuthenticated, navigate]);

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id });
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const { data: terminals = [] } = useQuery({
        queryKey: ['virtual-terminals', user?.merchant_id],
        queryFn: async () => {
            return await base44.entities.VirtualTerminal.filter({ 
                merchant_id: user.merchant_id 
            });
        },
        enabled: !!user?.merchant_id
    });

    const createTerminal = useMutation({
        mutationFn: async (data) => {
            const terminalId = `VT-${Date.now()}`;
            
            const terminal = await base44.entities.VirtualTerminal.create({
                ...data,
                merchant_id: user.merchant_id,
                terminal_id: terminalId,
                merchant_name: merchant?.business_name,
                api_key: `vt_${btoa(user.merchant_id + Date.now()).slice(0, 24)}`,
                status: 'active'
            });

            const tempPassword = Math.random().toString(36).slice(-8);
            const userEmail = `vt.${terminalId.toLowerCase()}@terminal.local`;
            
            await base44.entities.VirtualTerminalUser.create({
                terminal_id: terminalId,
                merchant_id: user.merchant_id,
                email: userEmail,
                full_name: `${data.name} Operator`,
                role: 'operator',
                status: 'active',
                temp_password: tempPassword,
                must_change_password: true,
                permissions: ['process_payment', 'view_transactions']
            });

            return { terminal, userEmail, tempPassword };
        },
        onSuccess: (data) => { 
            queryClient.invalidateQueries({ queryKey: ['virtual-terminals'] }); 
            alert(`Terminal created!\n\nLogin URL: ${window.location.origin}/VirtualTerminalLogin\nEmail: ${data.userEmail}\nPassword: ${data.tempPassword}\n\nPlease save these credentials!`);
            setShowCreateDialog(false);
            setNewTerminal({
                name: '', terminal_type: 'web', allowed_currencies: ['USD'], 
                daily_limit: 10000, per_transaction_limit: 1000,
                requires_cvv: true, requires_avs: true, enable_3ds: true
            });
        }
    });

    const updateTerminal = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.VirtualTerminal.update(data.id, data);
        },
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['virtual-terminals'] }); 
            setShowConfigDialog(false);
            setSelectedTerminal(null);
        }
    });

    const deleteTerminal = useMutation({
        mutationFn: async (id) => {
            return await base44.entities.VirtualTerminal.delete(id);
        },
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['virtual-terminals'] }); 
            setShowConfigDialog(false);
            setSelectedTerminal(null);
        }
    });

    const copyKey = (key) => { 
        navigator.clipboard.writeText(key); 
        setCopiedKey(key); 
        setTimeout(() => setCopiedKey(null), 2000); 
    };

    const openConfig = (terminal) => {
        setSelectedTerminal({...terminal});
        setShowConfigDialog(true);
    };

    const filteredTerminals = terminals.filter(t => 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantVirtualTerminals"
                user={user}
                merchant={merchant}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Virtual Terminals</h1>
                                <p className="text-slate-500">Create and manage virtual payment terminals</p>
                            </div>
                            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                                <Plus className="h-4 w-4" />Create Terminal
                            </Button>
                        </div>

                        <Card>
                            <CardContent className="p-4">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        placeholder="Search terminals..." 
                                        value={searchQuery} 
                                        onChange={(e) => setSearchQuery(e.target.value)} 
                                        className="pl-10" 
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTerminals.map((terminal) => (
                                <Card key={terminal.id} className="overflow-hidden">
                                    <div className={terminal.status === 'active' ? "h-1 bg-emerald-500" : "h-1 bg-slate-300"} />
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold">{terminal.name}</p>
                                                <p className="text-sm text-slate-500">{terminal.terminal_id}</p>
                                            </div>
                                            <Badge variant="outline" className={terminal.status === 'active' ? 'bg-emerald-50 text-emerald-700' : ''}>
                                                {terminal.status}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-1 mb-3">
                                            <p>Type: {terminal.terminal_type}</p>
                                            <p>Daily Limit: ${terminal.daily_limit?.toLocaleString()}</p>
                                            <p>3DS: {terminal.enable_3ds ? 'Enabled' : 'Disabled'}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="flex-1 gap-1" 
                                                onClick={() => copyKey(terminal.api_key)}
                                            >
                                                {copiedKey === terminal.api_key ? <Check className="h-3 w-3" /> : <Key className="h-3 w-3" />}
                                                API Key
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => openConfig(terminal)}
                                            >
                                                <Settings className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Create Dialog */}
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Create Virtual Terminal</DialogTitle></DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Terminal Name *</Label>
                                        <Input 
                                            value={newTerminal.name} 
                                            onChange={(e) => setNewTerminal(p => ({ ...p, name: e.target.value }))} 
                                            placeholder="e.g., Web Checkout" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Terminal Type</Label>
                                        <Select 
                                            value={newTerminal.terminal_type} 
                                            onValueChange={(v) => setNewTerminal(p => ({ ...p, terminal_type: v }))}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="web">Web</SelectItem>
                                                <SelectItem value="mobile">Mobile</SelectItem>
                                                <SelectItem value="api">API</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Daily Limit ($)</Label>
                                            <Input 
                                                type="number" 
                                                value={newTerminal.daily_limit} 
                                                onChange={(e) => setNewTerminal(p => ({ ...p, daily_limit: parseInt(e.target.value) }))} 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Per Transaction Limit ($)</Label>
                                            <Input 
                                                type="number" 
                                                value={newTerminal.per_transaction_limit} 
                                                onChange={(e) => setNewTerminal(p => ({ ...p, per_transaction_limit: parseInt(e.target.value) }))} 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Require CVV</span>
                                            <Switch 
                                                checked={newTerminal.requires_cvv} 
                                                onCheckedChange={(c) => setNewTerminal(p => ({ ...p, requires_cvv: c }))} 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Require AVS</span>
                                            <Switch 
                                                checked={newTerminal.requires_avs} 
                                                onCheckedChange={(c) => setNewTerminal(p => ({ ...p, requires_avs: c }))} 
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Enable 3D Secure</span>
                                            <Switch 
                                                checked={newTerminal.enable_3ds} 
                                                onCheckedChange={(c) => setNewTerminal(p => ({ ...p, enable_3ds: c }))} 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
                                    <Button 
                                        onClick={() => createTerminal.mutate(newTerminal)} 
                                        disabled={!newTerminal.name || createTerminal.isPending}
                                    >
                                        {createTerminal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Create Terminal
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Config Dialog */}
                        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
                            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Terminal Configuration</DialogTitle></DialogHeader>
                                {selectedTerminal && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Terminal Name</Label>
                                            <Input 
                                                value={selectedTerminal.name} 
                                                onChange={(e) => setSelectedTerminal(p => ({ ...p, name: e.target.value }))} 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select 
                                                value={selectedTerminal.status} 
                                                onValueChange={(v) => setSelectedTerminal(p => ({ ...p, status: v }))}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="inactive">Inactive</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Daily Limit ($)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={selectedTerminal.daily_limit} 
                                                    onChange={(e) => setSelectedTerminal(p => ({ ...p, daily_limit: parseInt(e.target.value) }))} 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Per Transaction Limit ($)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={selectedTerminal.per_transaction_limit} 
                                                    onChange={(e) => setSelectedTerminal(p => ({ ...p, per_transaction_limit: parseInt(e.target.value) }))} 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Require CVV</span>
                                                <Switch 
                                                    checked={selectedTerminal.requires_cvv} 
                                                    onCheckedChange={(c) => setSelectedTerminal(p => ({ ...p, requires_cvv: c }))} 
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Require AVS</span>
                                                <Switch 
                                                    checked={selectedTerminal.requires_avs} 
                                                    onCheckedChange={(c) => setSelectedTerminal(p => ({ ...p, requires_avs: c }))} 
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Enable 3D Secure</span>
                                                <Switch 
                                                    checked={selectedTerminal.enable_3ds} 
                                                    onCheckedChange={(c) => setSelectedTerminal(p => ({ ...p, enable_3ds: c }))} 
                                                />
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t">
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this terminal?')) {
                                                        deleteTerminal.mutate(selectedTerminal.id);
                                                    }
                                                }}
                                                className="gap-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete Terminal
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowConfigDialog(false)}>Cancel</Button>
                                    <Button 
                                        onClick={() => updateTerminal.mutate(selectedTerminal)} 
                                        disabled={updateTerminal.isPending}
                                    >
                                        {updateTerminal.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </main>
            </div>
        </div>
    );
}