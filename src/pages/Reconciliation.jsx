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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
    Upload, FileText, CheckCircle, XCircle, AlertTriangle, Search, 
    MoreHorizontal, Eye, Link2, RefreshCw, Download, ArrowUpDown
} from 'lucide-react';

const statusConfig = {
    matched: { label: 'Matched', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    unmatched: { label: 'Unmatched', color: 'bg-red-100 text-red-700', icon: XCircle },
    discrepancy: { label: 'Discrepancy', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
    manually_matched: { label: 'Manual Match', color: 'bg-blue-100 text-blue-700', icon: Link2 },
    ignored: { label: 'Ignored', color: 'bg-slate-100 text-slate-700', icon: XCircle },
};

const batchStatusConfig = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700' },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

export default function Reconciliation() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showItemsDialog, setShowItemsDialog] = useState(false);
    const [showMatchDialog, setShowMatchDialog] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [uploadData, setUploadData] = useState({
        source_type: 'bank_statement', source_name: '', period_start: '', period_end: '', currency: 'USD', notes: ''
    });
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const queryClient = useQueryClient();

    const { data: batches = [], isLoading } = useQuery({
        queryKey: ['reconciliation-batches'],
        queryFn: () => base44.entities.ReconciliationBatch.list('-created_date'),
    });

    const { data: items = [] } = useQuery({
        queryKey: ['reconciliation-items', selectedBatch?.id],
        queryFn: () => selectedBatch ? base44.entities.ReconciliationItem.filter({ batch_id: selectedBatch.id }) : [],
        enabled: !!selectedBatch,
    });

    const { data: transactions = [] } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => base44.entities.Transaction.list('-created_date', 100),
    });

    const createBatchMutation = useMutation({
        mutationFn: async (data) => {
            const batch = await base44.entities.ReconciliationBatch.create(data);
            // Simulate processing - in real scenario this would parse the file
            await simulateReconciliation(batch.id);
            return batch;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliation-batches'] });
            setShowUploadDialog(false);
            setUploadData({ source_type: 'bank_statement', source_name: '', period_start: '', period_end: '', currency: 'USD', notes: '' });
            setUploadedFile(null);
        },
    });

    const updateItemMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ReconciliationItem.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reconciliation-items'] });
            queryClient.invalidateQueries({ queryKey: ['reconciliation-batches'] });
            setShowMatchDialog(false);
        },
    });

    const simulateReconciliation = async (batchId) => {
        // Create sample reconciliation items
        const sampleItems = [
            { batch_id: batchId, external_ref: 'BANK-001', external_amount: 1500.00, external_date: '2024-01-15', merchant_name: 'TechCorp', match_status: 'matched', discrepancy_type: 'none' },
            { batch_id: batchId, external_ref: 'BANK-002', external_amount: 2340.50, external_date: '2024-01-15', merchant_name: 'ShopMart', match_status: 'matched', discrepancy_type: 'none' },
            { batch_id: batchId, external_ref: 'BANK-003', external_amount: 890.00, external_date: '2024-01-16', merchant_name: 'FoodHub', match_status: 'discrepancy', discrepancy_type: 'amount_mismatch', psp_amount: 895.00, discrepancy_amount: -5.00 },
            { batch_id: batchId, external_ref: 'BANK-004', external_amount: 1200.00, external_date: '2024-01-16', merchant_name: 'Unknown', match_status: 'unmatched', discrepancy_type: 'missing_in_psp' },
            { batch_id: batchId, external_ref: 'BANK-005', external_amount: 3500.00, external_date: '2024-01-17', merchant_name: 'BigRetail', match_status: 'matched', discrepancy_type: 'none' },
        ];
        await base44.entities.ReconciliationItem.bulkCreate(sampleItems);
        await base44.entities.ReconciliationBatch.update(batchId, {
            status: 'completed', total_records: 5, matched_count: 3, unmatched_count: 1, discrepancy_count: 1,
            total_amount: 9430.50, matched_amount: 7340.50, discrepancy_amount: 5.00
        });
    };

    const handleFileUpload = async () => {
        if (!uploadedFile || !uploadData.source_name) return;
        setIsUploading(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadedFile });
            await createBatchMutation.mutateAsync({
                ...uploadData,
                file_url,
                file_name: uploadedFile.name,
                batch_id: `REC-${Date.now()}`,
                status: 'processing'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleManualMatch = (item, transactionId) => {
        const txn = transactions.find(t => t.id === transactionId);
        updateItemMutation.mutate({
            id: item.id,
            data: {
                transaction_id: transactionId,
                psp_amount: txn?.amount,
                match_status: 'manually_matched',
                discrepancy_type: 'none',
                resolved_date: new Date().toISOString()
            }
        });
    };

    const handleIgnoreItem = (item) => {
        updateItemMutation.mutate({
            id: item.id,
            data: { match_status: 'ignored', resolved_date: new Date().toISOString() }
        });
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = !searchQuery || 
            item.external_ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.match_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getMatchRate = (batch) => {
        if (!batch.total_records) return 0;
        return Math.round((batch.matched_count / batch.total_records) * 100);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Reconciliation" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Transaction Reconciliation</h1>
                            <p className="text-slate-500">Match PSP transactions against bank and provider statements</p>
                        </div>
                        <Button onClick={() => setShowUploadDialog(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Upload className="h-4 w-4" /> Upload Statement
                        </Button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total Batches</p>
                                    <p className="text-xl font-bold">{batches.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Matched Items</p>
                                    <p className="text-xl font-bold">{batches.reduce((acc, b) => acc + (b.matched_count || 0), 0)}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Discrepancies</p>
                                    <p className="text-xl font-bold">{batches.reduce((acc, b) => acc + (b.discrepancy_count || 0), 0)}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Unmatched</p>
                                    <p className="text-xl font-bold">{batches.reduce((acc, b) => acc + (b.unmatched_count || 0), 0)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Batches Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">Reconciliation Batches</CardTitle>
                            <CardDescription>Uploaded statements and their matching status</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Batch ID</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead className="text-center">Records</TableHead>
                                        <TableHead className="text-center">Match Rate</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                {isLoading ? 'Loading...' : 'No reconciliation batches. Upload a statement to begin.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        batches.map((batch) => (
                                            <TableRow key={batch.id} className="cursor-pointer hover:bg-slate-50" onClick={() => { setSelectedBatch(batch); setShowItemsDialog(true); }}>
                                                <TableCell className="font-mono text-sm">{batch.batch_id}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{batch.source_name}</p>
                                                        <p className="text-xs text-slate-500 capitalize">{batch.source_type?.replace('_', ' ')}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {batch.period_start && batch.period_end ? 
                                                        `${format(new Date(batch.period_start), 'MMM d')} - ${format(new Date(batch.period_end), 'MMM d, yyyy')}` : 
                                                        format(new Date(batch.created_date), 'MMM d, yyyy')}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-emerald-600">{batch.matched_count}</span>
                                                        <span className="text-slate-400">/</span>
                                                        <span>{batch.total_records}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={getMatchRate(batch)} className="h-2 w-20" />
                                                        <span className="text-sm font-medium">{getMatchRate(batch)}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {batch.currency} {batch.total_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={batchStatusConfig[batch.status]?.color}>{batchStatusConfig[batch.status]?.label}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedBatch(batch); setShowItemsDialog(true); }}><Eye className="h-4 w-4 mr-2" />View Items</DropdownMenuItem>
                                                            <DropdownMenuItem><Download className="h-4 w-4 mr-2" />Export Report</DropdownMenuItem>
                                                            <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" />Re-process</DropdownMenuItem>
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

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Upload Statement</DialogTitle>
                        <DialogDescription>Upload a bank statement or provider report for reconciliation</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Source Type *</Label>
                                <Select value={uploadData.source_type} onValueChange={(val) => setUploadData({...uploadData, source_type: val})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank_statement">Bank Statement</SelectItem>
                                        <SelectItem value="provider_report">Provider Report</SelectItem>
                                        <SelectItem value="acquirer_file">Acquirer File</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Source Name *</Label>
                                <Input value={uploadData.source_name} onChange={(e) => setUploadData({...uploadData, source_name: e.target.value})} placeholder="e.g., Chase Bank, Stripe" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Period Start</Label>
                                <Input type="date" value={uploadData.period_start} onChange={(e) => setUploadData({...uploadData, period_start: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label>Period End</Label>
                                <Input type="date" value={uploadData.period_end} onChange={(e) => setUploadData({...uploadData, period_end: e.target.value})} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Upload File *</Label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <input type="file" accept=".csv,.xlsx,.xls,.pdf" onChange={(e) => setUploadedFile(e.target.files?.[0])} className="hidden" id="file-upload" />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600">{uploadedFile ? uploadedFile.name : 'Click to upload CSV, Excel, or PDF'}</p>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input value={uploadData.notes} onChange={(e) => setUploadData({...uploadData, notes: e.target.value})} placeholder="Optional notes..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                        <Button onClick={handleFileUpload} disabled={!uploadedFile || !uploadData.source_name || isUploading}>
                            {isUploading ? 'Processing...' : 'Upload & Process'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Items Dialog */}
            <Dialog open={showItemsDialog} onOpenChange={setShowItemsDialog}>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Reconciliation Items - {selectedBatch?.source_name}</DialogTitle>
                        <DialogDescription>Review and resolve unmatched or discrepant items</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="matched">Matched</SelectItem>
                                    <SelectItem value="unmatched">Unmatched</SelectItem>
                                    <SelectItem value="discrepancy">Discrepancy</SelectItem>
                                    <SelectItem value="manually_matched">Manual Match</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>External Ref</TableHead>
                                    <TableHead>Merchant</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">External Amt</TableHead>
                                    <TableHead className="text-right">PSP Amt</TableHead>
                                    <TableHead className="text-right">Diff</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-sm">{item.external_ref}</TableCell>
                                        <TableCell>{item.merchant_name}</TableCell>
                                        <TableCell>{item.external_date ? format(new Date(item.external_date), 'MMM d, yyyy') : '-'}</TableCell>
                                        <TableCell className="text-right">{item.currency} {item.external_amount?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{item.psp_amount ? `${item.currency} ${item.psp_amount.toFixed(2)}` : '-'}</TableCell>
                                        <TableCell className={cn("text-right font-medium", item.discrepancy_amount > 0 ? "text-emerald-600" : item.discrepancy_amount < 0 ? "text-red-600" : "")}>
                                            {item.discrepancy_amount ? `${item.discrepancy_amount > 0 ? '+' : ''}${item.discrepancy_amount.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell><Badge className={statusConfig[item.match_status]?.color}>{statusConfig[item.match_status]?.label}</Badge></TableCell>
                                        <TableCell>
                                            {(item.match_status === 'unmatched' || item.match_status === 'discrepancy') && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedItem(item); setShowMatchDialog(true); }}><Link2 className="h-4 w-4 mr-2" />Manual Match</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleIgnoreItem(item)}><XCircle className="h-4 w-4 mr-2" />Ignore</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manual Match Dialog */}
            <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Manual Match</DialogTitle>
                        <DialogDescription>Select a PSP transaction to match with external reference: {selectedItem?.external_ref}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Card className="bg-amber-50 border-amber-200 p-4">
                            <p className="text-sm text-amber-800"><strong>External Item:</strong> {selectedItem?.external_ref} - {selectedItem?.currency} {selectedItem?.external_amount?.toFixed(2)}</p>
                        </Card>
                        <Label>Select Transaction to Match</Label>
                        <div className="max-h-60 overflow-y-auto border rounded-lg">
                            {transactions.slice(0, 20).map((txn) => (
                                <div key={txn.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50 cursor-pointer" onClick={() => handleManualMatch(selectedItem, txn.id)}>
                                    <div>
                                        <p className="font-mono text-sm">{txn.transaction_id}</p>
                                        <p className="text-xs text-slate-500">{txn.merchant_name} - {txn.created_date ? format(new Date(txn.created_date), 'MMM d, yyyy') : ''}</p>
                                    </div>
                                    <p className="font-medium">{txn.currency} {txn.amount?.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}