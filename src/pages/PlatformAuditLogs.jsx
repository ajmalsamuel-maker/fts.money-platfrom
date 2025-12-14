import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, User, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';

export default function PlatformAuditLogs() {
    const { platformUser, loading } = usePlatformAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    
    const { data: auditLogs = [] } = useQuery({
        queryKey: ['audit-logs'],
        queryFn: () => base44.entities.PSPAuditTrail.list('-created_date', 100)
    });

    const { data: users = [] } = useQuery({
        queryKey: ['platform-users'],
        queryFn: async () => {
            const allUsers = await base44.asServiceRole.entities.AuthUser.list();
            return allUsers.filter(u => u.account_type === 'platform_admin');
        }
    });

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = searchTerm === '' || 
            log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.psp_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        
        return matchesSearch && matchesAction;
    });

    if (loading) {
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
                        <p className="text-xs text-slate-600">Track all platform actions and changes</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-600">Logged in as</p>
                        <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                        <Badge className="mt-1 bg-blue-600 text-white text-xs">
                            {getRoleLabel(platformUser?.platform_role)}
                        </Badge>
                    </div>
                </header>

                <div className="p-6">
                    <Card className="bg-white border-slate-200 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search by user, PSP code, or action..."
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={actionFilter} onValueChange={setActionFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by action" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        <SelectItem value="created">Created</SelectItem>
                                        <SelectItem value="updated">Updated</SelectItem>
                                        <SelectItem value="deleted">Deleted</SelectItem>
                                        <SelectItem value="enabled">Enabled</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                        <SelectItem value="configuration_changed">Configuration Changed</SelectItem>
                                        <SelectItem value="provider_added">Provider Added</SelectItem>
                                        <SelectItem value="provider_removed">Provider Removed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Activity Log ({filteredLogs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredLogs.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Activity className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                        <p>No audit logs found</p>
                                    </div>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Activity className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge className={
                                                                log.action === 'created' ? 'bg-green-100 text-green-700' :
                                                                log.action === 'deleted' ? 'bg-red-100 text-red-700' :
                                                                log.action === 'updated' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-slate-100 text-slate-700'
                                                            }>
                                                                {log.action}
                                                            </Badge>
                                                            {log.psp_code && (
                                                                <Badge variant="outline" className="font-mono">
                                                                    {log.psp_code}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {log.field_changed && (
                                                            <p className="text-sm text-slate-900 mb-1">
                                                                Changed <span className="font-medium">{log.field_changed}</span>
                                                                {log.old_value && <> from <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">{log.old_value}</span></>}
                                                                {log.new_value && <> to <span className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">{log.new_value}</span></>}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 text-xs text-slate-600">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {log.user_email}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {log.user_role}
                                                                </Badge>
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {format(new Date(log.created_date), 'MMM dd, yyyy HH:mm:ss')}
                                                            </span>
                                                            {log.ip_address && (
                                                                <span className="font-mono">IP: {log.ip_address}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}