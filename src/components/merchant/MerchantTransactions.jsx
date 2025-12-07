import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Filter } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function MerchantTransactions({ merchant, transactions, aiDecisions }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTransactions = transactions.filter(txn => {
        const matchesSearch = !searchQuery || 
            txn.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusConfig = {
        approved: 'bg-emerald-100 text-emerald-700',
        declined: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700',
        settled: 'bg-blue-100 text-blue-700',
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Transaction History</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by ID or email..."
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
                            <SelectItem value="declined">Declined</SelectItem>
                            <SelectItem value="settled">Settled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>AI</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTransactions.map((txn) => {
                                const aiDecision = aiDecisions.find(d => d.transaction_id === txn.transaction_id);
                                return (
                                    <TableRow key={txn.id}>
                                        <TableCell className="font-mono text-sm">
                                            {txn.transaction_id?.slice(0, 16)}...
                                        </TableCell>
                                        <TableCell>
                                            {txn.created_date ? format(new Date(txn.created_date), 'MMM dd, HH:mm') : '-'}
                                        </TableCell>
                                        <TableCell>{txn.customer_email || 'N/A'}</TableCell>
                                        <TableCell className="font-semibold">
                                            ${txn.amount?.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn("text-xs", statusConfig[txn.status])}>
                                                {txn.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {aiDecision && (
                                                <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                                                    {(aiDecision.confidence_score * 100).toFixed(0)}%
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}