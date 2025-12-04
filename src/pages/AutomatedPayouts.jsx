import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
    DollarSign, Send, Clock, CheckCircle, XCircle, AlertTriangle, Search, 
    MoreHorizontal, Eye, Download, Calculator, FileText, Wallet, TrendingUp, Building
} from 'lucide-react';

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    processing: { label: 'Processing', color: 'bg-amber-100 text-amber-700', icon: Clock },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
    on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
};

export default function AutomatedPayouts() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCalculateDialog, setShowCalculateDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [calculateData, setCalculateData] = useState({
        merchant_id: '', period_start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), period_end: format(new Date(), 'yyyy-MM-dd')
    });

    const queryClient = useQueryClient();

    const { data: payouts = [], isLoading } = useQuery({
        queryKey: ['payouts'],
        queryFn: () => base44.entities.Payout.list('-created_date'),
    });

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list(),
    });

    const { data: pricing = [] } = useQuery({
        queryKey: ['merchant-pricing'],
        queryFn: () => base44.entities.MerchantPricing.list(),
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 500),
    });

    const createPayoutMutation = useMutation({
        mutationFn: (data) => base44.entities.Payout.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payouts'] });
            setShowCalculateDialog(false);
        },
    });

    const updatePayoutMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Payout.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payouts'] });
            setShowApproveDialog(false);
            setShowDetailsDialog(false);
        },
    });

    const calculatePayout = () => {
        const merchant = merchants.find(m => m.id === calculateData.merchant_id);
        if (!merchant) return;

        // Get merchant's pricing
        const merchantPricing = pricing.filter(p => p.merchant_id === calculateData.merchant_id && p.status === 'active');
        const avgMdr = merchantPricing.length > 0 
            ? merchantPricing.reduce((acc, p) => acc + (p.sell_percentage_rate || 0), 0) / merchantPricing.length 
            : 2.5;
        const avgFixedFee = merchantPricing.length > 0
            ? merchantPricing.reduce((acc, p) => acc + (p.sell_fixed_fee || 0), 0) / merchantPricing.length
            : 0.25;

        // Get merchant's transactions in period
        const merchantTxns = transactions.filter(t => 
            t.merchant_id === calculateData.merchant_id && 
            t.status === 'approved' &&
            t.type === 'sale'
        );

        const grossAmount = merchantTxns.reduce((acc, t) => acc + (t.amount || 0), 0);
        const txnCount = merchantTxns.length;
        const mdrFees = grossAmount * (avgMdr / 100);
        const fixedFees = txnCount * avgFixedFee;
        const refunds = merchantTxns.filter(t => t.type === 'refund').reduce((acc, t) => acc + (t.amount || 0), 0);
        const chargebacks = Math.abs(refunds * 0.1); // Simulated
        const netAmount = grossAmount - mdrFees - fixedFees - refunds - chargebacks;

        const payoutData = {
            payout_id: `PO-${Date.now()}`,
            merchant_id: calculateData.merchant_id,
            merchant_name: merchant.business_name,
            period_start: calculateData.period_start,
            period_end: calculateData.period_end,
            gross_amount: grossAmount,
            mdr_fees: mdrFees,
            fixed_fees: fixedFees,
            chargebacks,
            refunds: Math.abs(refunds),
            net_amount: Math.max(0, netAmount),
            currency: merchant.currency || 'USD',
            transaction_count: txnCount,
            status: 'pending',
            payment_method: 'bank_transfer',
            scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        };

        createPayoutMutation.mutate(payoutData);
    };

    const handleApprove = (payout) => {
        updatePayoutMutation.mutate({
            id: payout.id,
            data: { status: 'approved', approved_by: 'Current User' }
        });
    };

    const handleProcess = (payout) => {
        updatePayoutMutation.mutate({
            id: payout.id,
            data: { status: 'processing' }
        });
    };

    const handleComplete = (payout, bankReference) => {
        updatePayoutMutation.mutate({
            id: payout.id,
            data: { status: 'completed', bank_reference: bankReference, executed_date: format(new Date(), 'yyyy-MM-dd') }
        });
    };

    const filteredPayouts = payouts.filter(p => {
        const matchesSearch = !searchQuery || 
            p.payout_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = useMemo(() => ({
        totalPending: payouts.filter(p => p.status === 'pending').reduce((acc, p) => acc + (p.net_amount || 0), 0),
        totalProcessing: payouts.filter(p => p.status === 'processing').reduce((acc, p) => acc + (p.net_amount || 0), 0),
        totalCompleted: payouts.filter(p => p.status === 'completed').reduce((acc, p) => acc + (p.net_amount || 0), 0),
        totalFees: payouts.reduce((acc, p) => acc + (p.mdr_fees || 0) + (p.fixed_fees || 0), 0),
    }), [payouts]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="AutomatedPayouts" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Automated Payouts</h1>
                            <p className="text-slate-500">Calculate and process merchant payouts with fee deductions</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2"><Download className="h-4 w-4" /> Export Batch</Button>
                            <Button onClick={() => setShowCalculateDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Calculator className="h-4 w-4" /> Calculate Payout
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Pending</p>
                                    <p className="text-xl font-bold">${stats.totalPending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Send className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Processing</p>
                                    <p className="text-xl font-bold">${stats.totalProcessing.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Completed (MTD)</p>
                                    <p className="text-xl font-bold">${stats.totalCompleted.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Fees Collected</p>
                                    <p className="text-xl font-bold">${stats.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input placeholder="Search payouts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {Object.entries(statusConfig).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payouts Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">Payout Queue <Badge variant="secondary" className="ml-2">{filteredPayouts.length}</Badge></CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Payout ID</TableHead>
                                        <TableHead>Merchant</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead className="text-right">Gross</TableHead>
                                        <TableHead className="text-right">Fees</TableHead>
                                        <TableHead className="text-right">Net Payout</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPayouts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                {isLoading ? 'Loading...' : 'No payouts found'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPayouts.map((payout) => (
                                            <TableRow key={payout.id}>
                                                <TableCell className="font-mono text-sm">{payout.payout_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-slate-400" />
                                                        {payout.merchant_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {payout.period_start && payout.period_end ? 
                                                        `${format(new Date(payout.period_start), 'MMM d')} - ${format(new Date(payout.period_end), 'MMM d')}` : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">{payout.currency} {payout.gross_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right text-red-600">-{payout.currency} {((payout.mdr_fees || 0) + (payout.fixed_fees || 0) + (payout.chargebacks || 0) + (payout.refunds || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right font-bold text-emerald-600">{payout.currency} {payout.net_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell><Badge className={statusConfig[payout.status]?.color}>{statusConfig[payout.status]?.label}</Badge></TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => { setSelectedPayout(payout); setShowDetailsDialog(true); }}><Eye className="h-4 w-4 mr-2" />View Details</DropdownMenuItem>
                                                            {payout.status === 'pending' && (
                                                                <DropdownMenuItem onClick={() => { setSelectedPayout(payout); setShowApproveDialog(true); }}><CheckCircle className="h-4 w-4 mr-2" />Approve</DropdownMenuItem>
                                                            )}
                                                            {payout.status === 'approved' && (
                                                                <DropdownMenuItem onClick={() => handleProcess(payout)}><Send className="h-4 w-4 mr-2" />Process</DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Download</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Calculate Payout Dialog */}
            <Dialog open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Calculate Payout</DialogTitle>
                        <DialogDescription>Generate a payout calculation for a merchant</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Merchant *</Label>
                            <Select value={calculateData.merchant_id} onValueChange={(val) => setCalculateData({...calculateData, merchant_id: val})}>
                                <SelectTrigger><SelectValue placeholder="Select merchant" /></SelectTrigger>
                                <SelectContent>
                                    {merchants.map(m => <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Period Start</Label>
                                <Input type="date" value={calculateData.period_start} onChange={(e) => setCalculateData({...calculateData, period_start: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Period End</Label>
                                <Input type="date" value={calculateData.period_end} onChange={(e) => setCalculateData({...calculateData, period_end: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCalculateDialog(false)}>Cancel</Button>
                        <Button onClick={calculatePayout} disabled={!calculateData.merchant_id}>Calculate & Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payout Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Payout Details</DialogTitle>
                    </DialogHeader>
                    {selectedPayout && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-slate-500">Payout ID:</span><p className="font-mono">{selectedPayout.payout_id}</p></div>
                                <div><span className="text-slate-500">Merchant:</span><p className="font-medium">{selectedPayout.merchant_name}</p></div>
                                <div><span className="text-slate-500">Period:</span><p>{selectedPayout.period_start} to {selectedPayout.period_end}</p></div>
                                <div><span className="text-slate-500">Transactions:</span><p>{selectedPayout.transaction_count}</p></div>
                            </div>
                            <div className="border-t pt-4">
                                <table className="w-full text-sm">
                                    <tbody>
                                        <tr className="border-b"><td className="py-2">Gross Amount</td><td className="text-right font-medium">{selectedPayout.currency} {selectedPayout.gross_amount?.toFixed(2)}</td></tr>
                                        <tr className="border-b text-red-600"><td className="py-2">MDR Fees</td><td className="text-right">-{selectedPayout.currency} {selectedPayout.mdr_fees?.toFixed(2)}</td></tr>
                                        <tr className="border-b text-red-600"><td className="py-2">Fixed Fees</td><td className="text-right">-{selectedPayout.currency} {selectedPayout.fixed_fees?.toFixed(2)}</td></tr>
                                        <tr className="border-b text-red-600"><td className="py-2">Refunds</td><td className="text-right">-{selectedPayout.currency} {selectedPayout.refunds?.toFixed(2)}</td></tr>
                                        <tr className="border-b text-red-600"><td className="py-2">Chargebacks</td><td className="text-right">-{selectedPayout.currency} {selectedPayout.chargebacks?.toFixed(2)}</td></tr>
                                        <tr className="font-bold text-emerald-600"><td className="py-2">Net Payout</td><td className="text-right">{selectedPayout.currency} {selectedPayout.net_amount?.toFixed(2)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            {selectedPayout.status === 'processing' && (
                                <div className="space-y-2">
                                    <Label>Bank Reference (for completion)</Label>
                                    <Input id="bankRef" placeholder="Enter bank reference..." />
                                    <Button className="w-full" onClick={() => handleComplete(selectedPayout, document.getElementById('bankRef').value)}>Mark as Completed</Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Payout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Approve payout of {selectedPayout?.currency} {selectedPayout?.net_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} to {selectedPayout?.merchant_name}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleApprove(selectedPayout)}>Approve</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}