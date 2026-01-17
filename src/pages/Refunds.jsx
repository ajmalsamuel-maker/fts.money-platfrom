import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Search, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Refunds() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [merchantFilter, setMerchantFilter] = useState('all');
    const [showDialog, setShowDialog] = useState(false);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        merchant_id: '',
        merchant_name: '',
        transaction_id: '',
        amount: '',
        original_amount: '',
        reason: 'requested_by_customer',
        notes: ''
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list()
    });

    const { data: refunds = [] } = useQuery({
        queryKey: ['refunds', merchantFilter],
        queryFn: async () => {
            if (merchantFilter === 'all') return await base44.entities.Refund.list('-created_date');
            return await base44.entities.Refund.filter({ merchant_id: merchantFilter }, '-created_date');
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            return base44.entities.Refund.create({
                ...data,
                refund_id: `rfnd_${Date.now()}`,
                status: 'pending'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['refunds']);
            setShowDialog(false);
            resetForm();
            toast.success('Refund initiated');
        }
    });

    const handleSubmit = () => {
        createMutation.mutate({
            ...formData,
            amount: parseFloat(formData.amount),
            original_amount: parseFloat(formData.original_amount)
        });
    };

    const resetForm = () => {
        setFormData({
            merchant_id: '',
            merchant_name: '',
            transaction_id: '',
            amount: '',
            original_amount: '',
            reason: 'requested_by_customer',
            notes: ''
        });
    };

    const filteredRefunds = refunds.filter(r =>
        !searchQuery ||
        r.refund_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalRefunded = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);
    const successfulRefunds = refunds.filter(r => r.status === 'succeeded').length;
    const successRate = refunds.length > 0 ? ((successfulRefunds / refunds.length) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-slate-50">
                <Sidebar collapsed={sidebarCollapsed} currentPage="Refunds" />
                <div className={cn(
                    "transition-all duration-300",
                    "lg:ml-64",
                    sidebarCollapsed && "ml-0"
                )}>
                    <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />

                    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                     <RotateCcw className="h-5 w-5 text-white" />
                                 </div>
                                 <div>
                                     <h1 className="text-xl sm:text-2xl font-bold">Refunds</h1>
                                     <p className="text-sm sm:text-base text-slate-500">Manage payment refunds and reversals</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowDialog(true)} className="gap-2 bg-orange-600 hover:bg-orange-700">
                            <RotateCcw className="h-4 w-4" /> Process Refund
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-orange-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Total Refunded</p>
                                        <p className="text-xl font-bold">${totalRefunded.toFixed(2)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <RotateCcw className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Total Refunds</p>
                                        <p className="text-xl font-bold">{refunds.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign className="h-8 w-8 text-emerald-600" />
                                    <div>
                                        <p className="text-xs text-slate-500">Success Rate</p>
                                        <p className="text-xl font-bold">{successRate}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="mb-6">
                         <CardContent className="p-4">
                             <div className="flex flex-col sm:flex-row gap-4">
                                 <div className="relative flex-1">
                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                     <Input 
                                         placeholder="Search by refund or transaction ID..." 
                                         value={searchQuery} 
                                         onChange={(e) => setSearchQuery(e.target.value)} 
                                         className="pl-10" 
                                     />
                                 </div>
                                 <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                                     <SelectTrigger className="w-full sm:w-64">
                                        <SelectValue placeholder="Filter by merchant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Merchants</SelectItem>
                                        {merchants.map(m => (
                                            <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Refund List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Refund ID</TableHead>
                                        <TableHead>Transaction ID</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRefunds.map(refund => (
                                        <TableRow key={refund.id}>
                                            <TableCell className="font-mono text-sm">{refund.refund_id}</TableCell>
                                            <TableCell className="font-mono text-sm">{refund.transaction_id}</TableCell>
                                            <TableCell>{refund.merchant_name}</TableCell>
                                            <TableCell className="font-mono">${refund.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{refund.reason.replace(/_/g, ' ')}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={
                                                    refund.status === 'succeeded' ? 'bg-emerald-100 text-emerald-700' :
                                                    refund.status === 'failed' ? 'bg-red-100 text-red-700' :
                                                    refund.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }>
                                                    {refund.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(refund.created_date).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Process Refund</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Merchant *</Label>
                            <Select value={formData.merchant_id} onValueChange={(id) => {
                                const merchant = merchants.find(m => m.id === id);
                                setFormData({...formData, merchant_id: id, merchant_name: merchant?.business_name || ''});
                            }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select merchant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => (
                                        <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Transaction ID *</Label>
                            <Input 
                                value={formData.transaction_id} 
                                onChange={(e) => setFormData({...formData, transaction_id: e.target.value})} 
                                placeholder="txn_..." 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Refund Amount *</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.amount} 
                                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                                    placeholder="100.00" 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Original Amount</Label>
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    value={formData.original_amount} 
                                    onChange={(e) => setFormData({...formData, original_amount: e.target.value})} 
                                    placeholder="100.00" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason *</Label>
                            <Select value={formData.reason} onValueChange={(val) => setFormData({...formData, reason: val})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
                                    <SelectItem value="duplicate">Duplicate payment</SelectItem>
                                    <SelectItem value="fraudulent">Fraudulent</SelectItem>
                                    <SelectItem value="product_not_received">Product not received</SelectItem>
                                    <SelectItem value="product_defective">Product defective</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea 
                                value={formData.notes} 
                                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                                placeholder="Optional notes..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={!formData.merchant_id || !formData.transaction_id || !formData.amount}
                        >
                            Process Refund
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}