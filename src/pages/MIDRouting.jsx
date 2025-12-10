import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Edit, Trash2, ArrowRight, TrendingUp, ArrowUpDown, CreditCard, Shield, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { ISO4217_CURRENCIES } from '@/components/utils/iso4217';
import { getAllCountries } from '@/components/utils/countries';
import { Checkbox } from "@/components/ui/checkbox";

export default function MIDRouting() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [formData, setFormData] = useState({
        merchant_mid_id: '',
        priority: 1,
        bank_mid_id: '',
        routing_conditions: {},
        failover_enabled: true,
        retry_attempts: 3,
        status: 'active'
    });

    const queryClient = useQueryClient();

    const { data: routingRules = [] } = useQuery({
        queryKey: ['routingRules'],
        queryFn: () => base44.entities.MIDRoutingRule.list('priority'),
    });

    const { data: merchantMIDs = [] } = useQuery({
        queryKey: ['merchantMIDs'],
        queryFn: () => base44.entities.MerchantMID.list(),
    });

    const { data: bankMIDs = [] } = useQuery({
        queryKey: ['bankMIDs'],
        queryFn: () => base44.entities.BankMID.list(),
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            const merchantMID = merchantMIDs.find(m => m.id === data.merchant_mid_id);
            const bankMID = bankMIDs.find(b => b.id === data.bank_mid_id);
            return base44.entities.MIDRoutingRule.create({
                ...data,
                merchant_name: merchantMID?.merchant_name,
                bank_mid_name: bankMID?.bank_mid_name
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
            setShowDialog(false);
            resetForm();
            toast.success('Routing rule created successfully');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.MIDRoutingRule.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
            setShowDialog(false);
            resetForm();
            toast.success('Routing rule updated successfully');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.MIDRoutingRule.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routingRules'] });
            toast.success('Routing rule deleted successfully');
        },
    });

    const resetForm = () => {
        setFormData({
            merchant_mid_id: '',
            priority: 1,
            bank_mid_id: '',
            routing_conditions: {},
            failover_enabled: true,
            retry_attempts: 3,
            status: 'active'
        });
        setEditingRule(null);
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setFormData(rule);
        setShowDialog(true);
    };

    const handleSubmit = () => {
        if (editingRule) {
            updateMutation.mutate({ id: editingRule.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const filteredRules = routingRules.filter(r => {
        if (!searchQuery) return true;
        return r.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               r.bank_mid_name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="MIDRouting" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">MID Routing Rules</h1>
                            <p className="text-slate-500">Configure merchant to bank MID routing</p>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Add Routing Rule
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <ArrowUpDown className="h-8 w-8 text-blue-600" />
                                <div>
                                    <p className="text-sm text-slate-500">Total Rules</p>
                                    <p className="text-2xl font-bold text-slate-900">{routingRules.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-emerald-600" />
                                <div>
                                    <p className="text-sm text-slate-500">Active Rules</p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {routingRules.filter(r => r.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <ArrowRight className="h-8 w-8 text-purple-600" />
                                <div>
                                    <p className="text-sm text-slate-500">Success Rate</p>
                                    <p className="text-2xl font-bold text-purple-600">99.2%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search routing rules..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">
                                Routing Configuration
                                <Badge variant="secondary" className="ml-2">{filteredRules.length} rules</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Priority</TableHead>
                                            <TableHead className="font-semibold">Merchant MID</TableHead>
                                            <TableHead className="font-semibold">Routes To</TableHead>
                                            <TableHead className="font-semibold">Bank MID</TableHead>
                                            <TableHead className="font-semibold">Failover</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRules.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                    No routing rules found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredRules.map((rule) => (
                                                <TableRow key={rule.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <Badge className="bg-blue-100 text-blue-700">
                                                            Priority {rule.priority}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{rule.merchant_name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <ArrowRight className="h-4 w-4 text-slate-400" />
                                                    </TableCell>
                                                    <TableCell className="font-medium">{rule.bank_mid_name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={rule.failover_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}>
                                                            {rule.failover_enabled ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={rule.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                            {rule.status}
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
                                                                <DropdownMenuItem onClick={() => handleEdit(rule)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => deleteMutation.mutate(rule.id)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRule ? 'Edit' : 'Add'} Routing Rule</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Merchant MID *</Label>
                            <Select value={formData.merchant_mid_id} onValueChange={(val) => setFormData({...formData, merchant_mid_id: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Merchant MID" />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchantMIDs.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.merchant_name} - {m.mid}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Bank MID *</Label>
                            <Select value={formData.bank_mid_id} onValueChange={(val) => setFormData({...formData, bank_mid_id: val})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Bank MID" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankMIDs.map(b => (
                                        <SelectItem key={b.id} value={b.id}>{b.bank_mid_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <Input
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                                min="1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Retry Attempts</Label>
                            <Input
                                type="number"
                                value={formData.retry_attempts}
                                onChange={(e) => setFormData({...formData, retry_attempts: parseInt(e.target.value)})}
                                min="1"
                                max="10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Routing Conditions</Label>
                            <div className="space-y-3 p-4 border rounded-lg bg-slate-50">
                                <div>
                                    <Label className="text-xs">Card Networks / APMs</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        {['visa', 'mastercard', 'amex', 'discover', 'unionpay', 'jcb', 'alipay', 'wechat'].map(network => (
                                            <label key={network} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.routing_conditions?.card_types?.includes(network) || false}
                                                    onChange={(e) => {
                                                        const current = formData.routing_conditions?.card_types || [];
                                                        const updated = e.target.checked
                                                            ? [...current, network]
                                                            : current.filter(n => n !== network);
                                                        setFormData({
                                                            ...formData,
                                                            routing_conditions: {
                                                                ...formData.routing_conditions,
                                                                card_types: updated
                                                            }
                                                        });
                                                    }}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{network}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs">Countries (ISO 3166-1)</Label>
                                        <Select 
                                            onValueChange={(val) => {
                                                const current = formData.routing_conditions?.countries || [];
                                                if (!current.includes(val)) {
                                                    setFormData({
                                                        ...formData,
                                                        routing_conditions: {
                                                            ...formData.routing_conditions,
                                                            countries: [...current, val]
                                                        }
                                                    });
                                                }
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Add country" /></SelectTrigger>
                                            <SelectContent>
                                                {getAllCountries().slice(0, 50).map(c => (
                                                    <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {formData.routing_conditions?.countries?.map(c => (
                                                <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-xs">Currencies (ISO 4217)</Label>
                                        <Select 
                                            onValueChange={(val) => {
                                                const current = formData.routing_conditions?.currencies || [];
                                                if (!current.includes(val)) {
                                                    setFormData({
                                                        ...formData,
                                                        routing_conditions: {
                                                            ...formData.routing_conditions,
                                                            currencies: [...current, val]
                                                        }
                                                    });
                                                }
                                            }}
                                        >
                                            <SelectTrigger><SelectValue placeholder="Add currency" /></SelectTrigger>
                                            <SelectContent>
                                                {ISO4217_CURRENCIES.slice(0, 30).map(c => (
                                                    <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {formData.routing_conditions?.currencies?.map(c => (
                                                <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs">Min Amount</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.routing_conditions?.min_amount || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                routing_conditions: {
                                                    ...formData.routing_conditions,
                                                    min_amount: parseFloat(e.target.value) || undefined
                                                }
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Max Amount</Label>
                                        <Input
                                            type="number"
                                            placeholder="999999"
                                            value={formData.routing_conditions?.max_amount || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                routing_conditions: {
                                                    ...formData.routing_conditions,
                                                    max_amount: parseFloat(e.target.value) || undefined
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                ISO Compliance Options
                            </Label>
                            <div className="space-y-2 p-3 border rounded-lg">
                                <label className="flex items-center gap-2">
                                    <Checkbox 
                                        checked={formData.iso_compliance_required || false}
                                        onCheckedChange={(checked) => setFormData({...formData, iso_compliance_required: checked})}
                                    />
                                    <span className="text-sm">Require ISO compliance validation</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.failover_enabled}
                                onChange={(e) => setFormData({...formData, failover_enabled: e.target.checked})}
                                className="rounded"
                            />
                            <Label>Enable Failover</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={!formData.merchant_mid_id || !formData.bank_mid_id}
                        >
                            {editingRule ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}