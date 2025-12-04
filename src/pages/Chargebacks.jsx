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
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
    TrendingUp,
    TrendingDown,
    DollarSign,
    CreditCard,
    Calendar,
    Shield,
    RefreshCw,
    Send,
    History,
    Scale
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const statusConfig = {
    received: { label: 'Received', className: 'bg-blue-100 text-blue-700', icon: Clock },
    pending_response: { label: 'Pending Response', className: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
    responded: { label: 'Responded', className: 'bg-purple-100 text-purple-700', icon: Send },
    accepted: { label: 'Accepted', className: 'bg-slate-100 text-slate-700', icon: CheckCircle },
    won: { label: 'Won', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    lost: { label: 'Lost', className: 'bg-red-100 text-red-700', icon: XCircle },
    expired: { label: 'Expired', className: 'bg-red-100 text-red-700', icon: Clock },
    pre_arbitration: { label: 'Pre-Arb', className: 'bg-amber-100 text-amber-700', icon: Scale },
    arbitration: { label: 'Arbitration', className: 'bg-purple-100 text-purple-700', icon: Scale },
};

const lifecycleStages = [
    { id: 'first_chargeback', label: 'First Chargeback', days: 30 },
    { id: 'representment', label: 'Representment', days: 45 },
    { id: 'pre_arbitration', label: 'Pre-Arbitration', days: 30 },
    { id: 'arbitration', label: 'Arbitration', days: 45 },
    { id: 'final', label: 'Final Decision', days: 0 },
];

const visaReasonCodes = [
    { code: '10.1', category: 'fraud', description: 'EMV Liability Shift Counterfeit' },
    { code: '10.4', category: 'fraud', description: 'Other Fraud - Card Absent' },
    { code: '11.3', category: 'authorization', description: 'No Authorization' },
    { code: '12.6', category: 'duplicate', description: 'Duplicate Processing' },
    { code: '13.1', category: 'not_received', description: 'Merchandise Not Received' },
    { code: '13.3', category: 'not_as_described', description: 'Not as Described' },
    { code: '13.6', category: 'credit_not_processed', description: 'Credit Not Processed' },
];

const sampleChargebacks = [
    { id: '1', chargeback_id: 'CB-2024-001', transaction_id: 'TXN-001234', merchant_id: 'MID-001', merchant_name: 'TechCorp Solutions', card_network: 'visa', reason_code: '13.1', reason_category: 'not_received', reason_description: 'Merchandise Not Received', status: 'pending_response', lifecycle_stage: 'first_chargeback', amount: 1250, currency: 'USD', chargeback_date: '2024-01-10', response_due_date: '2024-01-25', days_remaining: 5, cardholder_name: 'John Doe', card_last_four: '4242', is_3ds: true, liability_shift: true },
    { id: '2', chargeback_id: 'CB-2024-002', transaction_id: 'TXN-001235', merchant_id: 'MID-002', merchant_name: 'Global Retail Inc', card_network: 'mastercard', reason_code: '4853', reason_category: 'consumer_dispute', reason_description: 'Cardholder Dispute', status: 'responded', lifecycle_stage: 'representment', amount: 89.99, currency: 'USD', chargeback_date: '2024-01-05', response_due_date: '2024-01-20', days_remaining: 0, cardholder_name: 'Jane Smith', card_last_four: '5555', evidence_submitted: true },
    { id: '3', chargeback_id: 'CB-2024-003', transaction_id: 'TXN-001240', merchant_id: 'MID-003', merchant_name: 'GameZone Entertainment', card_network: 'visa', reason_code: '10.4', reason_category: 'fraud', reason_description: 'Card Absent Fraud', status: 'received', lifecycle_stage: 'first_chargeback', amount: 2500, currency: 'USD', chargeback_date: '2024-01-12', response_due_date: '2024-01-27', days_remaining: 12, cardholder_name: 'Bob Wilson', card_last_four: '0001' },
    { id: '4', chargeback_id: 'CB-2024-004', transaction_id: 'TXN-001239', merchant_id: 'MID-002', merchant_name: 'Global Retail Inc', card_network: 'visa', reason_code: '13.3', reason_category: 'not_as_described', reason_description: 'Not as Described', status: 'won', lifecycle_stage: 'final', amount: 345.50, currency: 'USD', chargeback_date: '2024-01-02', resolution_date: '2024-01-18', outcome: 'merchant_favor', cardholder_name: 'Alice Brown', card_last_four: '8765', evidence_submitted: true },
    { id: '5', chargeback_id: 'CB-2024-005', transaction_id: 'TXN-001250', merchant_id: 'MID-001', merchant_name: 'TechCorp Solutions', card_network: 'amex', reason_code: 'C02', reason_category: 'credit_not_processed', reason_description: 'Credit Not Processed', status: 'pre_arbitration', lifecycle_stage: 'pre_arbitration', amount: 780, currency: 'USD', chargeback_date: '2023-12-20', response_due_date: '2024-01-30', days_remaining: 15, cardholder_name: 'Mike Johnson', card_last_four: '3456' },
];

const reasonCategoryData = [
    { name: 'Fraud', value: 35, color: '#ef4444' },
    { name: 'Not Received', value: 25, color: '#f97316' },
    { name: 'Not as Described', value: 20, color: '#eab308' },
    { name: 'Credit Not Processed', value: 12, color: '#3b82f6' },
    { name: 'Other', value: 8, color: '#64748b' },
];

const monthlyTrendData = [
    { month: 'Aug', chargebacks: 45, won: 28, lost: 12, pending: 5 },
    { month: 'Sep', chargebacks: 52, won: 30, lost: 15, pending: 7 },
    { month: 'Oct', chargebacks: 38, won: 25, lost: 8, pending: 5 },
    { month: 'Nov', chargebacks: 61, won: 35, lost: 18, pending: 8 },
    { month: 'Dec', chargebacks: 48, won: 32, lost: 10, pending: 6 },
    { month: 'Jan', chargebacks: 42, won: 22, lost: 8, pending: 12 },
];

export default function Chargebacks() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [networkFilter, setNetworkFilter] = useState('all');
    const [selectedChargeback, setSelectedChargeback] = useState(null);
    const [showResponseDialog, setShowResponseDialog] = useState(false);
    const [responseData, setResponseData] = useState({ response: '', evidence: [] });

    const queryClient = useQueryClient();

    const { data: chargebacks = sampleChargebacks, isLoading } = useQuery({
        queryKey: ['chargebacks'],
        queryFn: () => base44.entities.Chargeback.list('-created_date'),
        initialData: sampleChargebacks,
    });

    const filteredChargebacks = chargebacks.filter(cb => {
        const matchesSearch = !searchQuery || 
            cb.chargeback_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cb.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || cb.status === statusFilter;
        const matchesNetwork = networkFilter === 'all' || cb.card_network === networkFilter;
        return matchesSearch && matchesStatus && matchesNetwork;
    });

    const stats = {
        total: chargebacks.length,
        pending: chargebacks.filter(cb => ['received', 'pending_response'].includes(cb.status)).length,
        urgent: chargebacks.filter(cb => cb.days_remaining && cb.days_remaining <= 5 && !['won', 'lost', 'accepted', 'expired'].includes(cb.status)).length,
        totalAmount: chargebacks.reduce((sum, cb) => sum + (cb.amount || 0), 0),
        winRate: (chargebacks.filter(cb => cb.status === 'won').length / (chargebacks.filter(cb => ['won', 'lost'].includes(cb.status)).length || 1) * 100).toFixed(1),
        chargebackRate: 0.45,
    };

    const getStageProgress = (stage) => {
        const stageIndex = lifecycleStages.findIndex(s => s.id === stage);
        return ((stageIndex + 1) / lifecycleStages.length) * 100;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Chargebacks" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Chargeback Management</h1>
                            <p className="text-slate-500">Monitor, respond, and track chargebacks across all networks</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <RefreshCw className="h-4 w-4" />
                                Sync Cases
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Cases</p>
                                    <p className="text-xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Pending</p>
                                    <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-red-200 bg-red-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-600">Urgent</p>
                                    <p className="text-xl font-bold text-red-600">{stats.urgent}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Win Rate</p>
                                    <p className="text-xl font-bold text-emerald-600">{stats.winRate}%</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Amount</p>
                                    <p className="text-xl font-bold">${stats.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">CB Rate</p>
                                    <p className="text-xl font-bold">{stats.chargebackRate}%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="all">All Cases</TabsTrigger>
                            <TabsTrigger value="action">Action Required</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="lifecycle">Lifecycle View</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            {/* Filters */}
                            <Card className="mb-6">
                                <CardContent className="p-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="relative flex-1 min-w-[250px]">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input placeholder="Search chargebacks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="received">Received</SelectItem>
                                                <SelectItem value="pending_response">Pending Response</SelectItem>
                                                <SelectItem value="responded">Responded</SelectItem>
                                                <SelectItem value="won">Won</SelectItem>
                                                <SelectItem value="lost">Lost</SelectItem>
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

                            {/* Table */}
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Case ID</TableHead>
                                                <TableHead>Merchant</TableHead>
                                                <TableHead>Network</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Stage</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead className="w-12"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredChargebacks.map((cb) => {
                                                const StatusIcon = statusConfig[cb.status]?.icon || Clock;
                                                const isUrgent = cb.days_remaining && cb.days_remaining <= 5;
                                                return (
                                                    <TableRow key={cb.id} className={cn("hover:bg-slate-50/50", isUrgent && !['won', 'lost'].includes(cb.status) && "bg-red-50/50")}>
                                                        <TableCell>
                                                            <span className="font-mono text-sm text-blue-600">{cb.chargeback_id}</span>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{cb.merchant_name}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="capitalize">{cb.card_network}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="text-sm font-medium">{cb.reason_code}</p>
                                                                <p className="text-xs text-slate-500 truncate max-w-[150px]">{cb.reason_description}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-semibold">${cb.amount?.toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            <div className="w-24">
                                                                <p className="text-xs text-slate-500 mb-1 capitalize">{cb.lifecycle_stage?.replace('_', ' ')}</p>
                                                                <Progress value={getStageProgress(cb.lifecycle_stage)} className="h-1" />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={cn("gap-1", statusConfig[cb.status]?.className)}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {statusConfig[cb.status]?.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {cb.response_due_date && !['won', 'lost'].includes(cb.status) ? (
                                                                <div className={cn("text-sm", isUrgent && "text-red-600 font-medium")}>
                                                                    {format(new Date(cb.response_due_date), 'MMM dd')}
                                                                    {cb.days_remaining !== undefined && (
                                                                        <p className="text-xs">{cb.days_remaining} days</p>
                                                                    )}
                                                                </div>
                                                            ) : cb.resolution_date ? (
                                                                <span className="text-sm text-slate-500">Resolved</span>
                                                            ) : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => setSelectedChargeback(cb)}>
                                                                        <Eye className="h-4 w-4 mr-2" />View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => { setSelectedChargeback(cb); setShowResponseDialog(true); }}>
                                                                        <Send className="h-4 w-4 mr-2" />Submit Response
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Upload className="h-4 w-4 mr-2" />Upload Evidence
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem>
                                                                        <History className="h-4 w-4 mr-2" />View Timeline
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="action">
                            <div className="space-y-4">
                                {chargebacks.filter(cb => ['received', 'pending_response'].includes(cb.status)).map((cb) => (
                                    <Card key={cb.id} className={cn("p-4", cb.days_remaining <= 5 && "border-red-200 bg-red-50")}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", cb.days_remaining <= 5 ? "bg-red-100" : "bg-amber-100")}>
                                                    <AlertTriangle className={cn("h-6 w-6", cb.days_remaining <= 5 ? "text-red-600" : "text-amber-600")} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm text-blue-600">{cb.chargeback_id}</span>
                                                        <Badge variant="outline" className="capitalize">{cb.card_network}</Badge>
                                                    </div>
                                                    <p className="font-medium">{cb.merchant_name} - ${cb.amount?.toLocaleString()}</p>
                                                    <p className="text-sm text-slate-500">{cb.reason_code}: {cb.reason_description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn("font-semibold", cb.days_remaining <= 5 ? "text-red-600" : "text-amber-600")}>
                                                    {cb.days_remaining} days remaining
                                                </p>
                                                <p className="text-sm text-slate-500">Due: {format(new Date(cb.response_due_date), 'MMM dd, yyyy')}</p>
                                                <Button size="sm" className="mt-2 gap-1" onClick={() => { setSelectedChargeback(cb); setShowResponseDialog(true); }}>
                                                    <Send className="h-3 w-3" />Respond
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <div className="grid lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Chargebacks by Reason</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie data={reasonCategoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                                        {reasonCategoryData.map((entry, idx) => (
                                                            <Cell key={idx} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Monthly Trend</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={monthlyTrendData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="won" stackId="a" fill="#10b981" name="Won" />
                                                    <Bar dataKey="lost" stackId="a" fill="#ef4444" name="Lost" />
                                                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Network Thresholds</CardTitle>
                                        <CardDescription>Visa VFMP & Mastercard ECP monitoring</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {[
                                                { network: 'Visa VFMP', threshold: 0.9, current: 0.45, status: 'safe' },
                                                { network: 'Visa VDMP', threshold: 0.9, current: 0.12, status: 'safe' },
                                                { network: 'Mastercard ECP', threshold: 1.0, current: 0.38, status: 'safe' },
                                                { network: 'Mastercard ECM', threshold: 1.5, current: 0.52, status: 'safe' },
                                            ].map((item, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{item.network}</span>
                                                        <span className={item.current < item.threshold * 0.7 ? "text-emerald-600" : item.current < item.threshold ? "text-amber-600" : "text-red-600"}>
                                                            {item.current}% / {item.threshold}%
                                                        </span>
                                                    </div>
                                                    <Progress value={(item.current / item.threshold) * 100} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="lifecycle">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Chargeback Lifecycle Stages</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {lifecycleStages.map((stage, idx) => {
                                            const casesInStage = chargebacks.filter(cb => cb.lifecycle_stage === stage.id);
                                            return (
                                                <div key={stage.id} className="flex items-center gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium">{stage.label}</p>
                                                                <p className="text-sm text-slate-500">{stage.days > 0 ? `${stage.days} days response window` : 'Final decision'}</p>
                                                            </div>
                                                            <Badge variant="outline">{casesInStage.length} cases</Badge>
                                                        </div>
                                                    </div>
                                                    {idx < lifecycleStages.length - 1 && (
                                                        <ArrowRight className="h-4 w-4 text-slate-300" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Response Dialog */}
                    <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Submit Chargeback Response</DialogTitle>
                                <DialogDescription>Provide evidence for case {selectedChargeback?.chargeback_id}</DialogDescription>
                            </DialogHeader>
                            {selectedChargeback && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                        <div><p className="text-sm text-slate-500">Reason Code</p><p className="font-medium">{selectedChargeback.reason_code}</p></div>
                                        <div><p className="text-sm text-slate-500">Amount</p><p className="font-medium">${selectedChargeback.amount?.toLocaleString()}</p></div>
                                        <div className="col-span-2"><p className="text-sm text-slate-500">Reason</p><p className="font-medium">{selectedChargeback.reason_description}</p></div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Rebuttal Letter</Label>
                                        <Textarea value={responseData.response} onChange={(e) => setResponseData({...responseData, response: e.target.value})} placeholder="Explain why this chargeback should be reversed..." rows={5} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Compelling Evidence</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Signed receipt', 'Delivery confirmation', 'Customer correspondence', 'Terms of service', 'AVS/CVV proof', '3D Secure proof'].map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm">
                                                    <FileText className="h-4 w-4 text-slate-400" />{item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Cancel</Button>
                                <Button className="bg-blue-600">Submit Response</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}