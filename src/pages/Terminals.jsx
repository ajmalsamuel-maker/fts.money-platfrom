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
    Plus, 
    MoreHorizontal, 
    Eye, 
    Edit,
    Power,
    Terminal as TerminalIcon,
    Smartphone,
    Monitor,
    Globe
} from 'lucide-react';

const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-700 border-slate-200' },
    maintenance: { label: 'Maintenance', className: 'bg-amber-100 text-amber-700 border-amber-200' },
    decommissioned: { label: 'Decommissioned', className: 'bg-red-100 text-red-700 border-red-200' },
};

const typeIcons = {
    pos: TerminalIcon,
    mpos: Smartphone,
    virtual: Monitor,
    ecommerce: Globe,
    unattended: TerminalIcon,
};

export default function Terminals() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: terminals = [], isLoading } = useQuery({
        queryKey: ['terminals'],
        queryFn: () => base44.entities.Terminal.list('-created_date'),
    });

    const filteredTerminals = terminals.filter(t => {
        const matchesSearch = !searchQuery || 
            t.terminal_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.merchant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.location?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="Terminals"
            />
            
            <div className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "ml-20" : "ml-64"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Terminals</h1>
                            <p className="text-slate-500">Manage payment terminals and devices</p>
                        </div>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" />
                            Add Terminal
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Total Terminals</p>
                            <p className="text-2xl font-bold text-slate-900">{terminals.length}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Active</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {terminals.filter(t => t.status === 'active').length}
                            </p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">Maintenance</p>
                            <p className="text-2xl font-bold text-amber-600">
                                {terminals.filter(t => t.status === 'maintenance').length}
                            </p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-sm text-slate-500">POS Devices</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {terminals.filter(t => t.type === 'pos' || t.type === 'mpos').length}
                            </p>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative flex-1 min-w-[250px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search terminals..."
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
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terminals Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg">
                                Terminal Inventory
                                <Badge variant="secondary" className="ml-2">
                                    {filteredTerminals.length} terminals
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Terminal ID</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Merchant</TableHead>
                                            <TableHead className="font-semibold">Location</TableHead>
                                            <TableHead className="font-semibold">Model</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Last Active</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTerminals.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading terminals...' : 'No terminals found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTerminals.map((terminal) => {
                                                const TypeIcon = typeIcons[terminal.type] || TerminalIcon;
                                                return (
                                                    <TableRow key={terminal.id} className="hover:bg-slate-50/50">
                                                        <TableCell>
                                                            <span className="font-mono text-sm text-blue-600">
                                                                {terminal.terminal_id || `TID-${terminal.id?.slice(0, 8)}`}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <TypeIcon className="h-4 w-4 text-slate-400" />
                                                                <span className="capitalize">{terminal.type}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-slate-900">
                                                            {terminal.merchant_name || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {terminal.location || 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-slate-600">
                                                            {terminal.model || 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge 
                                                                variant="outline" 
                                                                className={cn("text-xs", statusConfig[terminal.status]?.className)}
                                                            >
                                                                {statusConfig[terminal.status]?.label || terminal.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600 text-sm">
                                                            {terminal.last_transaction_date 
                                                                ? format(new Date(terminal.last_transaction_date), 'MMM dd, HH:mm')
                                                                : 'Never'
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
                                                                        <Edit className="h-4 w-4 mr-2" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Power className="h-4 w-4 mr-2" />
                                                                        Toggle Status
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
                </main>
            </div>
        </div>
    );
}