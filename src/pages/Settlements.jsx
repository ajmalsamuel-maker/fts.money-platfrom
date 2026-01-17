import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    Download,
    MoreHorizontal, 
    Eye, 
    FileText,
    Calendar,
    DollarSign,
    TrendingUp,
    Clock
} from 'lucide-react';

const statusConfig = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700 border-red-200' },
};

export default function Settlements() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: settlements = [], isLoading } = useQuery({
        queryKey: ['settlements'],
        queryFn: () => base44.entities.Settlement.list('-created_date'),
    });

    const filteredSettlements = settlements.filter(s => {
        const matchesSearch = !searchQuery || 
            s.settlement_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPending = settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + (s.net_amount || 0), 0);
    const totalCompleted = settlements.filter(s => s.status === 'completed').reduce((sum, s) => sum + (s.net_amount || 0), 0);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="Settlements"
            />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "lg:ml-64 ml-40")}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Settlements</h1>
                            <p className="text-slate-500">Track merchant payouts and settlements</p>
                        </div>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <DollarSign className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Settled</p>
                                    <p className="text-xl font-bold text-slate-900">${totalCompleted.toLocaleString()}</p>
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
                                    <p className="text-xl font-bold text-amber-600">${totalPending.toLocaleString()}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">This Month</p>
                                    <p className="text-xl font-bold text-emerald-600">$1.2M</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Batches</p>
                                    <p className="text-xl font-bold text-purple-600">{settlements.length}</p>
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
                                    <Input
                                        placeholder="Search settlements..."
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
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" className="gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Date Range
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settlements Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">
                                Settlement Batches
                                <Badge variant="secondary" className="ml-2">
                                    {filteredSettlements.length} batches
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Settlement ID</TableHead>
                                            <TableHead className="font-semibold">Merchant</TableHead>
                                            <TableHead className="font-semibold">Period</TableHead>
                                            <TableHead className="font-semibold">Gross Amount</TableHead>
                                            <TableHead className="font-semibold">Fees</TableHead>
                                            <TableHead className="font-semibold">Net Amount</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Payout Date</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSettlements.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading settlements...' : 'No settlements found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredSettlements.map((settlement) => (
                                                <TableRow key={settlement.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <span className="font-mono text-sm text-blue-600">
                                                            {settlement.settlement_id || `SET-${settlement.id?.slice(0, 8)}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-900">
                                                        {settlement.merchant_name || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 text-sm">
                                                        {settlement.period_start && settlement.period_end 
                                                            ? `${format(new Date(settlement.period_start), 'MMM dd')} - ${format(new Date(settlement.period_end), 'MMM dd')}`
                                                            : 'N/A'
                                                        }
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        ${(settlement.gross_amount || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-red-600">
                                                        -${(settlement.fees || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-emerald-600">
                                                        ${(settlement.net_amount || 0).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={cn("text-xs", statusConfig[settlement.status]?.className)}
                                                        >
                                                            {statusConfig[settlement.status]?.label || settlement.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-600 text-sm">
                                                        {settlement.payout_date 
                                                            ? format(new Date(settlement.payout_date), 'MMM dd, yyyy')
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Download className="h-4 w-4 mr-2" />
                                                                    Download Report
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}