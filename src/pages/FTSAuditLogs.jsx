import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Search, Shield, User, Settings, Database, Power, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FTSAuditLogs() {
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('all');

    const { data: auditLogs = [] } = useQuery({
        queryKey: ['platform-audit-logs'],
        queryFn: () => base44.entities.PSPAuditTrail.list('-created_date', 100)
    });

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = !search || 
            log.psp_code?.toLowerCase().includes(search.toLowerCase()) ||
            log.user_email?.toLowerCase().includes(search.toLowerCase());
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        return matchesSearch && matchesAction;
    });

    const actionIcons = {
        created: <Plus className="h-4 w-4 text-blue-600" />,
        updated: <Settings className="h-4 w-4 text-amber-600" />,
        deleted: <Trash2 className="h-4 w-4 text-red-600" />,
        enabled: <Power className="h-4 w-4 text-emerald-600" />,
        disabled: <Power className="h-4 w-4 text-slate-600" />,
        restarted: <Database className="h-4 w-4 text-purple-600" />
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="FTSAuditLogs" userRole="Platform Operator" />
            
            <div className="flex-1 overflow-auto">
                <div className="bg-white border-b border-slate-200 px-6 py-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Platform Audit Logs</h1>
                        <p className="text-sm text-slate-600">Complete audit trail of all PSP instance changes</p>
                    </div>
                </div>

                <div className="p-6">
                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by PSP code or user..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={actionFilter} onValueChange={setActionFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        <SelectItem value="created">Created</SelectItem>
                                        <SelectItem value="updated">Updated</SelectItem>
                                        <SelectItem value="deleted">Deleted</SelectItem>
                                        <SelectItem value="enabled">Enabled</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                        <SelectItem value="restarted">Restarted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Log Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail ({filteredLogs.length} records)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>PSP</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Change Details</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-sm text-slate-600">
                                                {new Date(log.created_date).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono">{log.psp_code}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {actionIcons[log.action]}
                                                    <Badge variant="outline" className="capitalize">
                                                        {log.action}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {log.field_changed && (
                                                    <div>
                                                        <span className="font-medium">{log.field_changed}:</span>{' '}
                                                        {log.old_value && <span className="text-red-600">{log.old_value}</span>}
                                                        {log.old_value && log.new_value && ' → '}
                                                        {log.new_value && <span className="text-emerald-600">{log.new_value}</span>}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">{log.user_email}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">{log.user_role || 'admin'}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredLogs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                                No audit logs found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}