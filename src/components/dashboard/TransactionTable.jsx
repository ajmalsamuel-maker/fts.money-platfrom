import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, RefreshCw, Ban, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import CardBrandLogo from '../transaction/CardBrandLogo';
import TransactionDetailsDialog from '../transaction/TransactionDetailsDialog';
import ISOComplianceBadge from '../transaction/ISOComplianceBadge';

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
};

const cardIcons = {
    visa: '💳 Visa',
    mastercard: '💳 MC',
    amex: '💳 Amex',
    discover: '💳 Disc',
    bank_transfer: '🏦 Bank',
    wallet: '👛 Wallet',
    crypto: '₿ Crypto',
};

export default function TransactionTable({ transactions, title = "Recent Transactions", showViewAll = true }) {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDialog, setShowDialog] = useState(false);

    const handleViewDetails = (txn) => {
        setSelectedTransaction(txn);
        setShowDialog(true);
    };

    return (
        <>
            {selectedTransaction && (
                <TransactionDetailsDialog
                    transaction={selectedTransaction}
                    open={showDialog}
                    onClose={() => {
                        setShowDialog(false);
                        setSelectedTransaction(null);
                    }}
                />
            )}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                {showViewAll && (
                    <Button variant="ghost" size="sm" className="text-blue-600">
                        View All
                        <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="font-semibold">Transaction ID</TableHead>
                                <TableHead className="font-semibold">Date & Time</TableHead>
                                <TableHead className="font-semibold">Merchant</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">Amount</TableHead>
                                <TableHead className="font-semibold">Method</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">ISO</TableHead>
                                <TableHead className="font-semibold w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((txn) => (
                                <TableRow key={txn.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleViewDetails(txn)}>
                                    <TableCell>
                                        <span className="font-mono text-sm text-blue-600">
                                            {txn.transaction_id || `TXN-${txn.id?.slice(0, 8)}`}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {txn.created_date ? format(new Date(txn.created_date), 'MMM dd, HH:mm') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">{txn.merchant_name || 'N/A'}</p>
                                            <p className="text-xs text-slate-500">{txn.merchant_id}</p>
                                        </div>
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
                                    <TableCell>
                                        {txn.card_brand ? (
                                            <div className="flex items-center gap-2">
                                                <CardBrandLogo brand={txn.card_brand} size="sm" />
                                                {txn.card_last_four && (
                                                    <span className="text-xs text-slate-500">•••• {txn.card_last_four}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-sm">
                                                {cardIcons[txn.payment_method] || txn.payment_method}
                                            </span>
                                        )}
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
                                        <ISOComplianceBadge transaction={txn} size="sm" />
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
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Refund
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                                                    <Ban className="h-4 w-4 mr-2" />
                                                    Void
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        </>
    );
}