import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays } from 'date-fns';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
    Search, 
    Filter,
    MoreHorizontal, 
    Eye, 
    Upload,
    FileText,
    Clock,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ArrowRight,
    Download,
    Calendar,
    CreditCard
} from 'lucide-react';

// Visa/Mastercard Reason Codes
const reasonCodes = {
    visa: [
        { code: '10.1', category: 'fraud', description: 'EMV Liability Shift Counterfeit Fraud' },
        { code: '10.2', category: 'fraud', description: 'EMV Liability Shift Non-Counterfeit Fraud' },
        { code: '10.3', category: 'fraud', description: 'Other Fraud - Card Present' },
        { code: '10.4', category: 'fraud', description: 'Other Fraud - Card Absent' },
        { code: '10.5', category: 'fraud', description: 'Visa Fraud Monitoring Program' },
        { code: '11.1', category: 'authorization', description: 'Card Recovery Bulletin' },
        { code: '11.2', category: 'authorization', description: 'Declined Authorization' },
        { code: '11.3', category: 'authorization', description: 'No Authorization' },
        { code: '12.1', category: 'processing_error', description: 'Late Presentment' },
        { code: '12.2', category: 'processing_error', description: 'Incorrect Transaction Code' },
        { code: '12.3', category: 'processing_error', description: 'Incorrect Currency' },
        { code: '12.4', category: 'processing_error', description: 'Incorrect Account Number' },
        { code: '12.5', category: 'processing_error', description: 'Incorrect Amount' },
        { code: '12.6', category: 'duplicate', description: 'Duplicate Processing' },
        { code: '12.7', category: 'processing_error', description: 'Invalid Data' },
        { code: '13.1', category: 'not_received', description: 'Merchandise/Services Not Received' },
        { code: '13.2', category: 'cancelled', description: 'Cancelled Recurring Transaction' },
        { code: '13.3', category: 'not_as_described', description: 'Not as Described or Defective' },
        { code: '13.4', category: 'not_as_described', description: 'Counterfeit Merchandise' },
        { code: '13.5', category: 'not_as_described', description: 'Misrepresentation' },
        { code: '13.6', category: 'credit_not_processed', description: 'Credit Not Processed' },
        { code: '13.7', category: 'cancelled', description: 'Cancelled Merchandise/Services' },
    ],
    mastercard: [
        { code: '4837', category: 'fraud', description: 'No Cardholder Authorization' },
        { code: '4840', category: 'fraud', description: 'Fraudulent Processing of Transaction' },
        { code: '4863', category: 'fraud', description: 'Cardholder Does Not Recognize' },
        { code: '4870', category: 'fraud', description: 'Chip Liability Shift' },
        { code: '4871', category: 'fraud', description: 'Chip/PIN Liability Shift' },
        { code: '4807', category: 'authorization', description: 'Warning Bulletin File' },
        { code: '4808', category: 'authorization', description: 'Authorization-Related Chargeback' },
        { code: '4812', category: 'processing_error', description: 'Account Number Not On File' },
        { code: '4831', category: 'processing_error', description: 'Transaction Amount Differs' },
        { code: '4834', category: 'duplicate', description: 'Duplicate Transaction' },
        { code: '4842', category: 'processing_error', description: 'Late Presentment' },
        { code: '4853', category: 'consumer_dispute', description: 'Cardholder Dispute' },
        { code: '4855', category: 'not_received', description: 'Goods or Services Not Provided' },
        { code: '4859', category: 'cancelled', description: 'Addendum, No-show, or ATM Dispute' },
        { code: '4860', category: 'credit_not_processed', description: 'Credit Not Processed' },
    ]
};

const statusConfig = {
    open: { label: 'Open', className: 'bg-blue-100 text-blue-700', icon: Clock },
    under_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-700', icon: Eye },
    pending_response: { label: 'Pending Response', className: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    merchant_won: { label: 'Won', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    merchant_lost: { label: 'Lost', className: 'bg-red-100 text-red-700', icon: XCircle },
    accepted: { label: 'Accepted', className: 'bg-slate-100 text-slate-700', icon: CheckCircle },
    expired: { label: 'Expired', className: 'bg-red-100 text-red-700', icon: XCircle },
    escalated: { label: 'Escalated', className: 'bg-purple-100 text-purple-700', icon: ArrowRight },
};

const stageConfig = {
    first_chargeback: { label: 'First Chargeback', step: 1 },
    second_presentment: { label: 'Representment', step: 2 },
    pre_arbitration: { label: 'Pre-Arbitration', step: 3 },
    arbitration: { label: 'Arbitration', step: 4 },
    final: { label: 'Final', step: 5 },
};

export default function Disputes() {

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [networkFilter, setNetworkFilter] = useState('all');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [showResponseDialog, setShowResponseDialog] = useState(false);
    const [responseData, setResponseData] = useState({ response: '', evidence: [] });

    const queryClient = useQueryClient();

    const { data: disputes = [], isLoading } = useQuery({
        queryKey: ['disputes'],
        queryFn: () => base44.entities.Dispute.list('-created_date'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Dispute.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['disputes'] });
            setShowResponseDialog(false);
        }
    });

    const filteredDisputes = disputes.filter(d => {
        const matchesSearch = !searchQuery || 
            d.dispute_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        const matchesNetwork = networkFilter === 'all' || d.card_network === networkFilter;
        return matchesSearch && matchesStatus && matchesNetwork;
    });

    const openDisputes = disputes.filter(d => ['open', 'under_review', 'pending_response'].includes(d.status));
    const urgentDisputes = disputes.filter(d => d.days_to_respond && d.days_to_respond <= 5 && !['merchant_won', 'merchant_lost', 'accepted', 'expired'].includes(d.status));

    const stats = {
        total: disputes.length,
        open: openDisputes.length,
        urgent: urgentDisputes.length,
        winRate: disputes.filter(d => d.status === 'merchant_won').length / (disputes.filter(d => ['merchant_won', 'merchant_lost'].includes(d.status)).length || 1) * 100,
        totalAmount: disputes.reduce((sum, d) => sum + (d.amount || 0), 0),
    };

    const handleSubmitResponse = () => {
        if (selectedDispute) {
            updateMutation.mutate({
                id: selectedDispute.id,
                data: {
                    merchant_response: responseData.response,
                    evidence_submitted: true,
                    status: 'under_review'
                }
            });
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dispute Management</h1>
                    <p className="text-slate-500">Handle chargebacks per Visa/Mastercard network rules</p>
                </div>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Download className="h-4 w-4" />
                    Export Report
                </Button>
            </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Total Disputes</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Open Cases</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
                        </Card>
                        <Card className="p-4 border-red-200 bg-red-50">
                            <p className="text-sm text-red-600">Urgent (≤5 days)</p>
                            <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Win Rate</p>
                            <p className="text-2xl font-bold text-emerald-600">{stats.winRate.toFixed(1)}%</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Total Amount</p>
                            <p className="text-2xl font-bold text-slate-900">${stats.totalAmount.toLocaleString()}</p>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search disputes..."
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
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="pending_response">Pending Response</SelectItem>
                                        <SelectItem value="under_review">Under Review</SelectItem>
                                        <SelectItem value="merchant_won">Won</SelectItem>
                                        <SelectItem value="merchant_lost">Lost</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={networkFilter} onValueChange={setNetworkFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Network" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Networks</SelectItem>
                                        <SelectItem value="visa">Visa</SelectItem>
                                        <SelectItem value="mastercard">Mastercard</SelectItem>
                                        <SelectItem value="amex">Amex</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disputes Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">
                                Dispute Cases
                                <Badge variant="secondary" className="ml-2">{filteredDisputes.length}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Dispute ID</TableHead>
                                            <TableHead className="font-semibold">Merchant</TableHead>
                                            <TableHead className="font-semibold">Network</TableHead>
                                            <TableHead className="font-semibold">Reason</TableHead>
                                            <TableHead className="font-semibold">Amount</TableHead>
                                            <TableHead className="font-semibold">Stage</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Due Date</TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDisputes.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading disputes...' : 'No disputes found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredDisputes.map((dispute) => {
                                                const StatusIcon = statusConfig[dispute.status]?.icon || Clock;
                                                const isUrgent = dispute.days_to_respond && dispute.days_to_respond <= 5;
                                                return (
                                                    <TableRow key={dispute.id} className={cn("hover:bg-slate-50/50", isUrgent && "bg-red-50/50")}>
                                                        <TableCell>
                                                            <span className="font-mono text-sm text-blue-600">
                                                                {dispute.dispute_id}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{dispute.merchant_name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">
                                                                {dispute.card_network}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="text-sm font-medium">{dispute.reason_code}</p>
                                                                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                                                    {dispute.reason_description}
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">
                                                            ${dispute.amount?.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs">
                                                                {stageConfig[dispute.stage]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={cn("text-xs gap-1", statusConfig[dispute.status]?.className)}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {statusConfig[dispute.status]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {dispute.response_due_date && (
                                                                <div className={cn("text-sm", isUrgent && "text-red-600 font-medium")}>
                                                                    {format(new Date(dispute.response_due_date), 'MMM dd')}
                                                                    {dispute.days_to_respond && (
                                                                        <p className="text-xs">{dispute.days_to_respond} days left</p>
                                                                    )}
                                                                </div>
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
                                                                    <DropdownMenuItem onClick={() => setSelectedDispute(dispute)}>
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => { setSelectedDispute(dispute); setShowResponseDialog(true); }}>
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Submit Response
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem>
                                                                        <Upload className="h-4 w-4 mr-2" />
                                                                        Upload Evidence
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Response Dialog */}
                    <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Submit Dispute Response</DialogTitle>
                                <DialogDescription>
                                    Provide evidence and response for dispute {selectedDispute?.dispute_id}
                                </DialogDescription>
                            </DialogHeader>
                            {selectedDispute && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="text-sm text-slate-500">Reason Code</p>
                                            <p className="font-medium">{selectedDispute.reason_code}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Amount</p>
                                            <p className="font-medium">${selectedDispute.amount?.toLocaleString()}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-slate-500">Reason</p>
                                            <p className="font-medium">{selectedDispute.reason_description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Response / Rebuttal Letter</Label>
                                        <Textarea 
                                            value={responseData.response}
                                            onChange={(e) => setResponseData({...responseData, response: e.target.value})}
                                            placeholder="Explain why this dispute should be reversed..."
                                            rows={5}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Recommended Evidence</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                'Signed receipt/invoice',
                                                'Delivery confirmation',
                                                'Customer correspondence',
                                                'Terms of service',
                                                'AVS/CVV match proof',
                                                '3D Secure authentication',
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm">
                                                    <FileText className="h-4 w-4 text-slate-400" />
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Cancel</Button>
                                <Button onClick={handleSubmitResponse} className="bg-blue-600">Submit Response</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

    );
}