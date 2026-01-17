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
import TransactionDetailsDialog from '@/components/transaction/TransactionDetailsDialog';
import ISOComplianceBadge from '@/components/transaction/ISOComplianceBadge';
import { validateCurrency, validateCountry } from '@/components/utils/isoValidator';
import AdvancedSearchPanel from '@/components/transaction/AdvancedSearchPanel';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

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
    const { t } = useI18n();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [voidDialogOpen, setVoidDialogOpen] = useState(false);
    const [userPspCode, setUserPspCode] = useState(null);
    const { can } = usePermissions();
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const session = localStorage.getItem('staff_session');
        if (session) {
            const parsed = JSON.parse(session);
            setUserPspCode(parsed.psp_code);
        }
    }, []);

    const { data: transactions = [], isLoading } = useQuery({
        queryKey: ['all-transactions', userPspCode],
        queryFn: async () => {
            if (!userPspCode) return [];
            // Use service role to see all transactions including those from virtual terminals
            return await base44.asServiceRole.entities.Transaction.filter({ psp_code: userPspCode });
        },
        enabled: !!userPspCode
    });

    const { data: aiDecisions = [] } = useQuery({
        queryKey: ['ai-decisions-txn'],
        queryFn: () => base44.entities.AIPaymentDecision.list('-created_date', 100),
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchant-mids'],
        queryFn: () => base44.entities.MerchantMID.list(),
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

    const handleAdvancedSearch = (searchParams) => {
        console.log('Advanced search params:', searchParams);
        // TODO: Implement advanced search filtering logic
        toast.info('Advanced search executed');
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        toast.info('Export functionality coming soon');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {!sidebarCollapsed && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}
            
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="Transactions"
            />
            
            <div className={cn(
                "transition-all duration-300",
                "lg:ml-64",
                sidebarCollapsed && "ml-0"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />

                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {/* Page Header */}
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                         <div>
                             <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Transactions</h1>
                             <p className="text-sm sm:text-base text-slate-500">View and manage all payment transactions</p>
                        </div>
                        <PermissionGate permission="EXPORT_REPORTS">
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </PermissionGate>
                    </div>

                    {/* Advanced Search Panel */}
                    <AdvancedSearchPanel 
                        mids={mids}
                        onSearch={handleAdvancedSearch}
                        onExport={handleExport}
                    />

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
                                                <TableRow key={txn.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleViewDetails(txn)}>
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
                                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewDetails(txn); }}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <PermissionGate permission="REFUND_TRANSACTIONS">
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRefund(txn); }} disabled={txn.type === 'refund' || txn.status === 'reversed'}>
                                                                        <RefreshCw className="h-4 w-4 mr-2" />
                                                                        Refund
                                                                    </DropdownMenuItem>
                                                                </PermissionGate>
                                                                <PermissionGate permission="VOID_TRANSACTIONS">
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleVoid(txn); }} className="text-red-600" disabled={txn.status === 'reversed'}>
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
            {selectedTransaction && (
                <TransactionDetailsDialog
                    transaction={selectedTransaction}
                    open={viewDetailsOpen}
                    onClose={() => {
                        setViewDetailsOpen(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}

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