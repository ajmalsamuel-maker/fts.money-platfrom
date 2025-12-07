import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
    Search, 
    Filter, 
    Download, 
    MoreHorizontal, 
    Eye, 
    RefreshCw, 
    Ban,
    Calendar,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { usePermissions } from '@/components/auth/usePermissions';
import { PermissionGate } from '@/components/auth/PermissionGate';

const statusConfig = {
    approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    declined: { label: 'Declined', className: 'bg-red-100 text-red-700 border-red-200' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200' },
    settled: { label: 'Settled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    reversed: { label: 'Reversed', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const typeConfig = {
    sale: { label: 'Sale', className: 'bg-emerald-50 text-emerald-700' },
    refund: { label: 'Refund', className: 'bg-orange-50 text-orange-700' },
    void: { label: 'Void', className: 'bg-slate-50 text-slate-700' },
    chargeback: { label: 'Chargeback', className: 'bg-red-50 text-red-700' },
    payout: { label: 'Payout', className: 'bg-blue-50 text-blue-700' },
    transfer: { label: 'Transfer', className: 'bg-purple-50 text-purple-700' },
    recurring: { label: 'Recurring', className: 'bg-purple-50 text-purple-700' },
};

export default function Transactions() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [voidDialogOpen, setVoidDialogOpen] = useState(false);
    const { can } = usePermissions();
    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ['all-transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 50),
    });

    const { data: aiDecisions = [] } = useQuery({
        queryKey: ['ai-decisions-txn'],
        queryFn: () => base44.entities.AIPaymentDecision.list('-created_date', 100),
    });

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = !searchQuery || 
            txn.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
        const matchesType = typeFilter === 'all' || txn.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const refundMutation = useMutation({
        mutationFn: (txn) => base44.entities.Transaction.create({
            transaction_id: `REF-${Date.now()}`,
            merchant_id: txn.merchant_id,
            merchant_name: txn.merchant_name,
            type: 'refund',
            status: 'approved',
            amount: txn.amount,
            currency: txn.currency,
            payment_method: txn.payment_method,
            customer_email: txn.customer_email,
            customer_name: txn.customer_name,
            description: `Refund for ${txn.transaction_id}`,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
            toast.success('Transaction refunded successfully');
            setRefundDialogOpen(false);
            setSelectedTransaction(null);
        },
        onError: () => {
            toast.error('Failed to refund transaction');
        }
    });

    const voidMutation = useMutation({
        mutationFn: (txn) => base44.entities.Transaction.update(txn.id, {
            status: 'reversed',
            type: 'void'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-transactions'] });
            toast.success('Transaction voided successfully');
            setVoidDialogOpen(false);
            setSelectedTransaction(null);
        },
        onError: () => {
            toast.error('Failed to void transaction');
        }
    });

    const handleViewDetails = (txn) => {
        setSelectedTransaction(txn);
        setViewDetailsOpen(true);
    };

    const handleRefund = (txn) => {
        setSelectedTransaction(txn);
        setRefundDialogOpen(true);
    };

    const handleVoid = (txn) => {
        setSelectedTransaction(txn);
        setVoidDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="Transactions"
            />
            
            <div className={cn(
                "transition-all duration-300",
                "lg:ml-20",
                sidebarCollapsed && "ml-0"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
                            <p className="text-slate-500">View and manage all payment transactions</p>
                        </div>
                        <PermissionGate permission="EXPORT_REPORTS">
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </PermissionGate>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by ID, merchant, email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="declined">Declined</SelectItem>
                                        <SelectItem value="settled">Settled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="sale">Sale</SelectItem>
                                        <SelectItem value="refund">Refund</SelectItem>
                                        <SelectItem value="chargeback">Chargeback</SelectItem>
                                        <SelectItem value="payout">Payout</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date Range
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    More Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transactions Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    All Transactions
                                    <Badge variant="secondary" className="ml-2">
                                        {filteredTransactions.length} results
                                    </Badge>
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Transaction ID</TableHead>
                                            <TableHead className="font-semibold">Date & Time</TableHead>
                                            <TableHead className="font-semibold">Merchant</TableHead>
                                            <TableHead className="font-semibold">Customer</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                            <TableHead className="font-semibold">Method</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">AI</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading transactions...' : 'No transactions found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTransactions.map((txn) => {
                                                const aiDecision = aiDecisions.find(d => d.transaction_id === txn.transaction_id);
                                                return (
                                                <TableRow key={txn.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <span className="font-mono text-sm text-blue-600">
                                                            {txn.transaction_id || `TXN-${txn.id?.slice(0, 8)}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {txn.created_date ? format(new Date(txn.created_date), 'MMM dd, yyyy HH:mm') : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="font-medium text-slate-900">{txn.merchant_name || 'N/A'}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm text-slate-600">{txn.customer_email || 'N/A'}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={cn("text-xs", typeConfig[txn.type]?.className)}>
                                                            {typeConfig[txn.type]?.label || txn.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={cn(
                                                            "font-semibold",
                                                            txn.type === 'refund' || txn.type === 'chargeback' ? "text-red-600" : "text-slate-900"
                                                        )}>
                                                            {txn.type === 'refund' || txn.type === 'chargeback' ? '-' : ''}
                                                            {txn.currency || 'USD'} {txn.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 text-sm">
                                                        {txn.payment_method}
                                                        {txn.card_last_four && ` •••• ${txn.card_last_four}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={cn("text-xs", statusConfig[txn.status]?.className)}
                                                        >
                                                            {statusConfig[txn.status]?.label || txn.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {aiDecision && (
                                                            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700" title={`AI: ${aiDecision.decision_type} (${(aiDecision.confidence_score * 100).toFixed(0)}%)`}>
                                                                AI {(aiDecision.confidence_score * 100).toFixed(0)}%
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleViewDetails(txn)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <PermissionGate permission="REFUND_TRANSACTIONS">
                                                                    <DropdownMenuItem onClick={() => handleRefund(txn)} disabled={txn.type === 'refund' || txn.status === 'reversed'}>
                                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                                        Refund
                                                                    </DropdownMenuItem>
                                                                </PermissionGate>
                                                                <PermissionGate permission="VOID_TRANSACTIONS">
                                                                    <DropdownMenuItem onClick={() => handleVoid(txn)} className="text-red-600" disabled={txn.status === 'reversed'}>
                                                                        <Ban className="h-4 w-4 mr-2" />
                                                                        Void
                                                                    </DropdownMenuItem>
                                                                </PermissionGate>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );})
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <p className="text-sm text-slate-500">
                                    Showing {filteredTransactions.length} of {transactions.length} transactions
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" disabled={page === 1}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-slate-600">Page {page}</span>
                                    <Button variant="outline" size="sm">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* View Details Dialog */}
            <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>
                            {selectedTransaction?.transaction_id || `TXN-${selectedTransaction?.id?.slice(0, 8)}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Status</p>
                                    <Badge className={cn("mt-1", statusConfig[selectedTransaction.status]?.className)}>
                                        {statusConfig[selectedTransaction.status]?.label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Type</p>
                                    <Badge className={cn("mt-1", typeConfig[selectedTransaction.type]?.className)}>
                                        {typeConfig[selectedTransaction.type]?.label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Amount</p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                        {selectedTransaction.currency} {selectedTransaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Date</p>
                                    <p className="text-slate-900 mt-1">
                                        {selectedTransaction.created_date ? format(new Date(selectedTransaction.created_date), 'MMM dd, yyyy HH:mm:ss') : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Merchant</p>
                                    <p className="text-slate-900 mt-1">{selectedTransaction.merchant_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Customer</p>
                                    <p className="text-slate-900 mt-1">{selectedTransaction.customer_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Payment Method</p>
                                    <p className="text-slate-900 mt-1">
                                        {selectedTransaction.payment_method}
                                        {selectedTransaction.card_last_four && ` •••• ${selectedTransaction.card_last_four}`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Auth Code</p>
                                    <p className="text-slate-900 mt-1">{selectedTransaction.auth_code || '-'}</p>
                                </div>
                            </div>
                            {selectedTransaction.description && (
                                <div>
                                    <p className="text-sm text-slate-500">Description</p>
                                    <p className="text-slate-900 mt-1">{selectedTransaction.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Refund Transaction</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to refund this transaction?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Transaction ID:</span>
                                <span className="font-mono">{selectedTransaction.transaction_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Amount:</span>
                                <span className="font-semibold">{selectedTransaction.currency} {selectedTransaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={() => refundMutation.mutate(selectedTransaction)}
                            disabled={refundMutation.isPending}
                        >
                            {refundMutation.isPending ? 'Processing...' : 'Confirm Refund'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Void Dialog */}
            <Dialog open={voidDialogOpen} onOpenChange={setVoidDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Void Transaction</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to void this transaction? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Transaction ID:</span>
                                <span className="font-mono">{selectedTransaction.transaction_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Amount:</span>
                                <span className="font-semibold">{selectedTransaction.currency} {selectedTransaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVoidDialogOpen(false)}>Cancel</Button>
                        <Button 
                            variant="destructive"
                            onClick={() => voidMutation.mutate(selectedTransaction)}
                            disabled={voidMutation.isPending}
                        >
                            {voidMutation.isPending ? 'Processing...' : 'Confirm Void'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}