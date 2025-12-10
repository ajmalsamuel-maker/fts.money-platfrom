import React, { useState } from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Search, Download, Filter, CheckCircle2, XCircle, Clock, AlertCircle, Eye, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function MerchantTransactionList() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const itemsPerPage = 20;

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

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions', user?.merchant_id, selectedMID],
        queryFn: async () => {
            const query = { merchant_id: user.merchant_id };
            if (selectedMID && selectedMID !== 'all') {
                query.terminal_id = selectedMID;
            }
            return await base44.entities.Transaction.filter(query);
        },
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) {
            setSelectedMID(mids[0].mid);
        }
    }, [mids, selectedMID]);

    const getStatusConfig = (status) => {
        const configs = {
            approved: { label: 'Approved', icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
            settled: { label: 'Settled', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
            declined: { label: 'Declined', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
            failed: { label: 'Failed', icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
        };
        return configs[status] || configs.pending;
    };

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = !searchQuery || 
                t.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.card_last_four?.includes(searchQuery);
            
            const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }, [transactions, searchQuery, statusFilter]);

    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    if (loading || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar 
                selectedMID={selectedMID}
                mids={mids}
                onMIDChange={setSelectedMID}
                currentPage="MerchantTransactionList"
                user={user}
                merchant={merchant}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} selectedMID={selectedMID} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1400px] mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Transaction List</h1>
                                <p className="text-slate-500">{filteredTransactions.length} transactions found</p>
                            </div>
                            <Button variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search by transaction ID, email, or card..."
                                            className="pl-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-40">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="approved">Approved</SelectItem>
                                            <SelectItem value="settled">Settled</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="declined">Declined</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={selectedMID || 'all'} onValueChange={setSelectedMID}>
                                        <SelectTrigger className="w-full sm:w-56">
                                            <SelectValue placeholder="Select MID" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All MIDs ({mids.length})</SelectItem>
                                            {mids.map(mid => (
                                                <SelectItem key={mid.id} value={mid.mid}>
                                                    {mid.mid} - {mid.account_type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Transaction ID</TableHead>
                                            <TableHead>Date & Time</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Card</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedTransactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                                    No transactions found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedTransactions.map((txn) => {
                                                const statusConfig = getStatusConfig(txn.status);
                                                const StatusIcon = statusConfig.icon;
                                                return (
                                                    <TableRow key={txn.id}>
                                                        <TableCell className="font-mono text-sm">
                                                            {txn.transaction_id?.slice(-12) || txn.id.slice(-12)}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {new Date(txn.created_date).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            ${txn.amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm">
                                                            {txn.card_brand} •••• {txn.card_last_four}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div>{txn.customer_name || 'N/A'}</div>
                                                                <div className="text-slate-500 text-xs">{txn.customer_email}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={statusConfig.className}>
                                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => setSelectedTransaction(txn)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-slate-500">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* Transaction Details Dialog */}
            <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-slate-500">Transaction ID</Label>
                                    <p className="font-mono text-sm">{selectedTransaction.transaction_id || selectedTransaction.id}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={getStatusConfig(selectedTransaction.status).className}>
                                            {selectedTransaction.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Amount</Label>
                                    <p className="text-lg font-bold">${selectedTransaction.amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Currency</Label>
                                    <p className="text-sm">{selectedTransaction.currency || 'USD'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Date & Time</Label>
                                    <p className="text-sm">{new Date(selectedTransaction.created_date).toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500">Type</Label>
                                    <p className="text-sm">{selectedTransaction.type}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Payment Method</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-slate-500">Card Brand</Label>
                                        <p className="text-sm">{selectedTransaction.card_brand || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">Last 4 Digits</Label>
                                        <p className="text-sm font-mono">•••• {selectedTransaction.card_last_four}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">Payment Method</Label>
                                        <p className="text-sm">{selectedTransaction.payment_method}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">3DS</Label>
                                        <p className="text-sm">{selectedTransaction.is_3ds ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-slate-500">Name</Label>
                                        <p className="text-sm">{selectedTransaction.customer_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">Email</Label>
                                        <p className="text-sm">{selectedTransaction.customer_email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">Country</Label>
                                        <p className="text-sm">{selectedTransaction.customer_country || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">IP Address</Label>
                                        <p className="text-sm font-mono">{selectedTransaction.ip_address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Transaction Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-slate-500">Auth Code</Label>
                                        <p className="text-sm font-mono">{selectedTransaction.auth_code || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">Response Code</Label>
                                        <p className="text-sm font-mono">{selectedTransaction.response_code || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-xs text-slate-500">Response Message</Label>
                                        <p className="text-sm">{selectedTransaction.response_message || 'N/A'}</p>
                                    </div>
                                    {selectedTransaction.description && (
                                        <div className="col-span-2">
                                            <Label className="text-xs text-slate-500">Description</Label>
                                            <p className="text-sm">{selectedTransaction.description}</p>
                                        </div>
                                    )}
                                    {selectedTransaction.risk_score && (
                                        <div>
                                            <Label className="text-xs text-slate-500">Risk Score</Label>
                                            <p className="text-sm">{selectedTransaction.risk_score}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}