import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { 
    Shield, 
    AlertTriangle, 
    Users, 
    Activity,
    Search,
    RefreshCw,
    Clock,
    MapPin,
    Info,
    AlertCircle,
    XCircle,
    CheckCircle,
    Eye
} from 'lucide-react';
import { format } from 'date-fns';

export default function PlatformAuditLogs() {
    const { platformUser, loading } = usePlatformAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('7days');
    const [selectedLog, setSelectedLog] = useState(null);

    const { data: logs = [], isLoading: logsLoading, refetch } = useQuery({
        queryKey: ['audit-logs', categoryFilter, severityFilter, dateFilter],
        queryFn: async () => {
            const logs = await base44.asServiceRole.entities.AuditLog.list('-created_date', 500);
            
            let filtered = logs;
            
            // Date filter
            if (dateFilter !== 'all') {
                const daysAgo = {
                    '24hours': 1,
                    '7days': 7,
                    '30days': 30
                }[dateFilter] || 7;
                
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - daysAgo);
                filtered = filtered.filter(l => new Date(l.created_date) > cutoff);
            }
            
            // Category filter
            if (categoryFilter !== 'all') {
                filtered = filtered.filter(l => l.category === categoryFilter);
            }
            
            // Severity filter
            if (severityFilter !== 'all') {
                filtered = filtered.filter(l => l.severity === severityFilter);
            }
            
            return filtered;
        },
        enabled: !loading
    });

    const filteredLogs = logs.filter(log => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                log.user_email?.toLowerCase().includes(query) ||
                log.action?.toLowerCase().includes(query) ||
                log.description?.toLowerCase().includes(query) ||
                log.event_type?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Statistics
    const stats = {
        total: filteredLogs.length,
        critical: filteredLogs.filter(l => l.severity === 'critical').length,
        warnings: filteredLogs.filter(l => l.severity === 'warning').length,
        failures: filteredLogs.filter(l => l.status === 'failure').length
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'critical': return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
            default: return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'failure': return <XCircle className="h-4 w-4 text-red-600" />;
            default: return <Clock className="h-4 w-4 text-slate-400" />;
        }
    };

    if (loading || logsLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PlatformAuditLogs" 
                userRole={getRoleLabel(platformUser?.platform_role)}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Audit Logs</h2>
                        <p className="text-xs text-slate-600">Complete audit trail of all platform activities</p>
                    </div>
                    <Button variant="outline" onClick={() => refetch()} size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </header>

                <div className="p-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-4">
                                <Activity className="h-6 w-6 mb-2 opacity-80" />
                                <p className="text-xs text-blue-100 mb-1">Total Events</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                            <CardContent className="p-4">
                                <AlertCircle className="h-6 w-6 mb-2 opacity-80" />
                                <p className="text-xs text-red-100 mb-1">Critical Events</p>
                                <p className="text-2xl font-bold">{stats.critical}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <CardContent className="p-4">
                                <AlertTriangle className="h-6 w-6 mb-2 opacity-80" />
                                <p className="text-xs text-amber-100 mb-1">Warnings</p>
                                <p className="text-2xl font-bold">{stats.warnings}</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white">
                            <CardContent className="p-4">
                                <XCircle className="h-6 w-6 mb-2 opacity-80" />
                                <p className="text-xs text-slate-100 mb-1">Failures</p>
                                <p className="text-2xl font-bold">{stats.failures}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex-1 min-w-[250px]">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                            placeholder="Search by user, action, or description..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-44">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        <SelectItem value="authentication">Authentication</SelectItem>
                                        <SelectItem value="authorization">Authorization</SelectItem>
                                        <SelectItem value="user_management">User Management</SelectItem>
                                        <SelectItem value="configuration">Configuration</SelectItem>
                                        <SelectItem value="data_access">Data Access</SelectItem>
                                        <SelectItem value="security">Security</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                    <SelectTrigger className="w-36">
                                        <SelectValue placeholder="Severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Levels</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="warning">Warning</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Date Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="24hours">Last 24 Hours</SelectItem>
                                        <SelectItem value="7days">Last 7 Days</SelectItem>
                                        <SelectItem value="30days">Last 30 Days</SelectItem>
                                        <SelectItem value="all">All Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Logs Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                                            <th className="text-left py-3 px-4 font-semibold">Event</th>
                                            <th className="text-left py-3 px-4 font-semibold">User</th>
                                            <th className="text-left py-3 px-4 font-semibold">Description</th>
                                            <th className="text-center py-3 px-4 font-semibold">Category</th>
                                            <th className="text-center py-3 px-4 font-semibold">Severity</th>
                                            <th className="text-center py-3 px-4 font-semibold">Status</th>
                                            <th className="text-center py-3 px-4 font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log) => (
                                            <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="py-3 px-4 text-xs font-mono text-slate-600">
                                                    {format(new Date(log.created_date), 'MMM dd, HH:mm:ss')}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge variant="outline" className="text-xs">
                                                        {log.event_type}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-slate-900 text-xs">{log.user_email || 'System'}</p>
                                                        {log.user_role && (
                                                            <p className="text-xs text-slate-500">{log.user_role}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-xs text-slate-700 max-w-md truncate">
                                                    {log.description}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge variant="outline" className="text-xs">
                                                        {log.category}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge className={getSeverityColor(log.severity)}>
                                                        <span className="flex items-center gap-1">
                                                            {getSeverityIcon(log.severity)}
                                                            {log.severity}
                                                        </span>
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="flex items-center justify-center gap-1">
                                                        {getStatusIcon(log.status)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedLog(log)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredLogs.length === 0 && (
                                    <div className="py-12 text-center text-slate-500">
                                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>No audit logs found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Event Type</p>
                                    <Badge variant="outline">{selectedLog.event_type}</Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Timestamp</p>
                                    <p className="text-sm font-mono">
                                        {format(new Date(selectedLog.created_date), 'MMM dd, yyyy HH:mm:ss')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Category</p>
                                    <Badge>{selectedLog.category}</Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Severity</p>
                                    <Badge className={getSeverityColor(selectedLog.severity)}>
                                        {selectedLog.severity}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">User Email</p>
                                    <p className="text-sm">{selectedLog.user_email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">User Role</p>
                                    <p className="text-sm">{selectedLog.user_role || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">IP Address</p>
                                    <p className="text-sm font-mono">{selectedLog.ip_address || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(selectedLog.status)}
                                        <span className="text-sm">{selectedLog.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-600 mb-2">Description</p>
                                <p className="text-sm bg-slate-50 p-3 rounded border">{selectedLog.description}</p>
                            </div>

                            {selectedLog.action && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Action</p>
                                    <Badge variant="outline">{selectedLog.action}</Badge>
                                </div>
                            )}

                            {selectedLog.target_entity && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Target Entity</p>
                                    <p className="text-sm">{selectedLog.target_entity} (ID: {selectedLog.target_id})</p>
                                </div>
                            )}

                            {selectedLog.old_value && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Old Value</p>
                                    <pre className="text-xs bg-slate-50 p-3 rounded border overflow-x-auto">
                                        {JSON.stringify(JSON.parse(selectedLog.old_value), null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.new_value && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">New Value</p>
                                    <pre className="text-xs bg-slate-50 p-3 rounded border overflow-x-auto">
                                        {JSON.stringify(JSON.parse(selectedLog.new_value), null, 2)}
                                    </pre>
                                </div>
                            )}

                            {selectedLog.error_message && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">Error Message</p>
                                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                                        {selectedLog.error_message}
                                    </p>
                                </div>
                            )}

                            {selectedLog.user_agent && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-2">User Agent</p>
                                    <p className="text-xs font-mono bg-slate-50 p-2 rounded border">{selectedLog.user_agent}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span>Retention Period: {selectedLog.retention_period?.replace('_', ' ')}</span>
                                    {selectedLog.pci_relevant && (
                                        <Badge className="bg-purple-100 text-purple-700">PCI Relevant</Badge>
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