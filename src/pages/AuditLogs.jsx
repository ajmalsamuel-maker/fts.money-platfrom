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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { 
    Search, 
    Shield,
    FileText,
    Download,
    Calendar as CalendarIcon,
    AlertTriangle,
    Info,
    AlertCircle,
    User,
    Settings,
    CreditCard,
    Store,
    Database,
    Lock,
    Eye,
    RefreshCw
} from 'lucide-react';
import { usePermissions } from '@/components/auth/usePermissions';
import { AccessDenied } from '@/components/auth/PermissionGate';

const categoryIcons = {
    authentication: Lock,
    authorization: Shield,
    user_management: User,
    transaction: CreditCard,
    merchant: Store,
    terminal: Settings,
    settlement: FileText,
    chargeback: AlertTriangle,
    configuration: Settings,
    data_access: Database,
    security: AlertCircle,
    system: Settings
};

const severityColors = {
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700'
};

export default function AuditLogs() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ from: null, to: null });
    const [selectedLog, setSelectedLog] = useState(null);
    const [pciOnly, setPciOnly] = useState(false);

    const { can, loading: permLoading } = usePermissions();

    const { data: logs = [], isLoading, refetch } = useQuery({
        queryKey: ['audit-logs', categoryFilter, severityFilter, pciOnly],
        queryFn: async () => {
            const filter = {};
            if (categoryFilter !== 'all') filter.category = categoryFilter;
            if (severityFilter !== 'all') filter.severity = severityFilter;
            if (pciOnly) filter.pci_relevant = true;
            
            return base44.entities.AuditLog.filter(filter, '-created_date', 500);
        },
        enabled: can('VIEW_USERS'),
    });

    const filteredLogs = logs.filter(log => {
        const matchesSearch = !searchQuery || 
            log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesDate = (!dateRange.from || new Date(log.created_date) >= dateRange.from) &&
            (!dateRange.to || new Date(log.created_date) <= dateRange.to);
        
        return matchesSearch && matchesDate;
    });

    const handleExport = () => {
        const csv = [
            ['Timestamp', 'Category', 'Event', 'User', 'Action', 'Description', 'Severity', 'PCI Relevant', 'Status'].join(','),
            ...filteredLogs.map(log => [
                format(new Date(log.created_date), 'yyyy-MM-dd HH:mm:ss'),
                log.category,
                log.event_type,
                log.user_email,
                log.action,
                `"${log.description?.replace(/"/g, '""')}"`,
                log.severity,
                log.pci_relevant ? 'Yes' : 'No',
                log.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
    };

    const stats = {
        total: logs.length,
        critical: logs.filter(l => l.severity === 'critical').length,
        pci: logs.filter(l => l.pci_relevant).length,
        today: logs.filter(l => {
            const logDate = new Date(l.created_date);
            const today = new Date();
            return logDate.toDateString() === today.toDateString();
        }).length
    };

    if (permLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!can('VIEW_USERS')) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar collapsed={sidebarCollapsed} currentPage="AuditLogs" />
                <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                    <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                    <main className="p-6"><AccessDenied /></main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="AuditLogs" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
                            <p className="text-slate-500">PCI DSS Level 1 compliant activity tracking</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <Card className="p-4 border-l-4 border-l-slate-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Events</p>
                                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-blue-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Info className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Today</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-red-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Critical</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 border-l-4 border-l-purple-400">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">PCI Relevant</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.pci}</p>
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
                                        placeholder="Search events, users, actions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="authentication">Authentication</SelectItem>
                                        <SelectItem value="authorization">Authorization</SelectItem>
                                        <SelectItem value="user_management">User Management</SelectItem>
                                        <SelectItem value="transaction">Transaction</SelectItem>
                                        <SelectItem value="merchant">Merchant</SelectItem>
                                        <SelectItem value="configuration">Configuration</SelectItem>
                                        <SelectItem value="security">Security</SelectItem>
                                        <SelectItem value="data_access">Data Access</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button 
                                    variant={pciOnly ? "default" : "outline"}
                                    onClick={() => setPciOnly(!pciOnly)}
                                    className="gap-2"
                                >
                                    <Shield className="h-4 w-4" />
                                    PCI Only
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logs Table */}
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-slate-400" />
                                Activity Log
                                <Badge variant="secondary" className="ml-2">
                                    {filteredLogs.length} events
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-white z-10">
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold w-44">Timestamp</TableHead>
                                            <TableHead className="font-semibold">Category</TableHead>
                                            <TableHead className="font-semibold">Event</TableHead>
                                            <TableHead className="font-semibold">User</TableHead>
                                            <TableHead className="font-semibold">Description</TableHead>
                                            <TableHead className="font-semibold">Severity</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                                    {isLoading ? 'Loading audit logs...' : 'No audit events found'}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredLogs.map((log) => {
                                                const CategoryIcon = categoryIcons[log.category] || FileText;
                                                return (
                                                    <TableRow key={log.id} className="hover:bg-slate-50/50">
                                                        <TableCell className="text-sm text-slate-600">
                                                            {format(new Date(log.created_date), 'MMM dd, HH:mm:ss')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <CategoryIcon className="h-4 w-4 text-slate-400" />
                                                                <span className="text-sm capitalize">{log.category?.replace('_', ' ')}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {log.action}
                                                                </Badge>
                                                                {log.pci_relevant && (
                                                                    <Shield className="h-3 w-3 text-purple-500" />
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-600">
                                                            {log.user_email || 'System'}
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-700 max-w-xs truncate">
                                                            {log.description}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={cn("text-xs", severityColors[log.severity])}>
                                                                {log.severity}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-8 w-8"
                                                                onClick={() => setSelectedLog(log)}
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
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Log Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Audit Event Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Timestamp</p>
                                    <p className="font-medium">{format(new Date(selectedLog.created_date), 'PPpp')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Event Type</p>
                                    <p className="font-medium">{selectedLog.event_type}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Category</p>
                                    <p className="font-medium capitalize">{selectedLog.category?.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Severity</p>
                                    <Badge className={cn("text-xs", severityColors[selectedLog.severity])}>
                                        {selectedLog.severity}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">User</p>
                                    <p className="font-medium">{selectedLog.user_email || 'System'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">User Role</p>
                                    <p className="font-medium">{selectedLog.user_role || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Status</p>
                                    <Badge variant={selectedLog.status === 'success' ? 'default' : 'destructive'}>
                                        {selectedLog.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">PCI Relevant</p>
                                    <p className="font-medium">{selectedLog.pci_relevant ? 'Yes' : 'No'}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm text-slate-500">Description</p>
                                <p className="font-medium">{selectedLog.description}</p>
                            </div>

                            {selectedLog.target_entity && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Target Entity</p>
                                        <p className="font-medium">{selectedLog.target_entity}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Target ID</p>
                                        <p className="font-medium font-mono text-xs">{selectedLog.target_id}</p>
                                    </div>
                                </div>
                            )}

                            {(selectedLog.old_value || selectedLog.new_value) && (
                                <div className="grid grid-cols-2 gap-4">
                                    {selectedLog.old_value && (
                                        <div>
                                            <p className="text-sm text-slate-500">Previous Value</p>
                                            <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-32">
                                                {JSON.stringify(JSON.parse(selectedLog.old_value), null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                    {selectedLog.new_value && (
                                        <div>
                                            <p className="text-sm text-slate-500">New Value</p>
                                            <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto max-h-32">
                                                {JSON.stringify(JSON.parse(selectedLog.new_value), null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-slate-500">Session ID</p>
                                    <p className="font-mono text-xs">{selectedLog.session_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Request ID</p>
                                    <p className="font-mono text-xs">{selectedLog.request_id}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-slate-500">User Agent</p>
                                    <p className="font-mono text-xs truncate">{selectedLog.user_agent}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}