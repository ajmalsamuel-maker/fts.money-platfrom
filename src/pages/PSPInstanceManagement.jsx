import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
    ArrowLeft, 
    MoreVertical,
    Power,
    PowerOff,
    RotateCw,
    Database,
    FileText,
    Settings,
    AlertCircle,
    CheckCircle2,
    Clock,
    Activity
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { hasPlatformPermission, PLATFORM_PERMISSIONS } from '@/components/platform/PlatformRBAC';

export default function PSPInstanceManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const pspId = urlParams.get('id');
    const [activeTab, setActiveTab] = useState('overview');

    const { data: psp, isLoading: pspLoading } = useQuery({
        queryKey: ['psp-instance', pspId],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.list();
            return psps.find(p => p.id === pspId);
        },
        enabled: !!pspId
    });

    const { data: logs = [], isLoading: logsLoading } = useQuery({
        queryKey: ['psp-logs', pspId],
        queryFn: () => base44.entities.PSPInstanceLog.filter({ psp_id: pspId }, '-created_date', 50),
        enabled: !!pspId && !!psp
    });

    const { data: auditTrail = [], isLoading: auditLoading } = useQuery({
        queryKey: ['psp-audit', pspId],
        queryFn: () => base44.entities.PSPAuditTrail.filter({ psp_id: pspId }, '-created_date', 100),
        enabled: !!pspId && !!psp
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, action }) => {
            await base44.entities.ProvisionedPSP.update(pspId, { status });
            await base44.entities.PSPInstanceLog.create({
                psp_id: pspId,
                psp_code: psp.psp_code,
                log_type: action,
                severity: 'medium',
                message: `PSP instance ${action}`,
                source: 'admin'
            });
            await base44.entities.PSPAuditTrail.create({
                psp_id: pspId,
                psp_code: psp.psp_code,
                action: action,
                field_changed: 'status',
                old_value: psp.status,
                new_value: status,
                user_email: 'admin@fts.money'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['psp-instance']);
            queryClient.invalidateQueries(['psp-logs']);
            queryClient.invalidateQueries(['psp-audit']);
        }
    });

    const handleRestart = () => {
        base44.entities.PSPInstanceLog.create({
            psp_id: pspId,
            psp_code: psp.psp_code,
            log_type: 'restart',
            severity: 'high',
            message: 'PSP instance restart initiated',
            source: 'admin'
        });
        queryClient.invalidateQueries(['psp-logs']);
    };

    const handleBackup = () => {
        base44.entities.PSPInstanceLog.create({
            psp_id: pspId,
            psp_code: psp.psp_code,
            log_type: 'backup',
            severity: 'medium',
            message: 'Database backup initiated',
            source: 'admin'
        });
        queryClient.invalidateQueries(['psp-logs']);
    };

    if (pspLoading) return <div className="flex items-center justify-center h-screen">Loading PSP...</div>;
    if (!psp) return <div className="flex items-center justify-center h-screen">PSP not found</div>;

    const logTypeIcons = {
        info: <CheckCircle2 className="h-4 w-4 text-blue-600" />,
        warning: <AlertCircle className="h-4 w-4 text-amber-600" />,
        error: <AlertCircle className="h-4 w-4 text-red-600" />,
        critical: <AlertCircle className="h-4 w-4 text-red-700" />,
        deployment: <Activity className="h-4 w-4 text-purple-600" />,
        configuration: <Settings className="h-4 w-4 text-slate-600" />,
        restart: <RotateCw className="h-4 w-4 text-blue-600" />,
        backup: <Database className="h-4 w-4 text-emerald-600" />
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="mb-3"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Platform
                    </Button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div 
                                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                            >
                                {psp.psp_code?.substring(0, 2)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-slate-900">{psp.psp_name}</h1>
                                    <Badge className={cn(
                                        psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                        psp.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                    )}>
                                        {psp.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-600 font-mono">{psp.psp_code}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline"
                                onClick={() => navigate(createPageUrl('PSPInstanceConfig', `?id=${pspId}`))}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {psp.status === 'active' ? (
                                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ status: 'suspended', action: 'disabled' })}>
                                            <PowerOff className="h-4 w-4 mr-2 text-amber-600" />
                                            Disable PSP
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ status: 'active', action: 'enabled' })}>
                                            <Power className="h-4 w-4 mr-2 text-emerald-600" />
                                            Enable PSP
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleRestart}>
                                        <RotateCw className="h-4 w-4 mr-2" />
                                        Restart Instance
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleBackup}>
                                        <Database className="h-4 w-4 mr-2" />
                                        Backup Database
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="logs">Instance Logs</TabsTrigger>
                        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview">
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-slate-600 mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            psp.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                                        )} />
                                        <p className="text-lg font-semibold">{psp.status}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-slate-600 mb-1">Merchants</p>
                                    <p className="text-2xl font-bold">{psp.total_merchants || 0}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-slate-600 mb-1">Monthly Volume</p>
                                    <p className="text-2xl font-bold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm text-slate-600 mb-1">Uptime</p>
                                    <p className="text-2xl font-bold text-emerald-600">99.9%</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Instance Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <dt className="text-slate-600">Domain</dt>
                                        <dd className="font-medium">{psp.domain || `${psp.subdomain}.fts.money`}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-600">Tier</dt>
                                        <dd className="font-medium">{psp.tier}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-600">Currency</dt>
                                        <dd className="font-medium">{psp.currency}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-600">Timezone</dt>
                                        <dd className="font-medium">{psp.timezone}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-600">Created</dt>
                                        <dd className="font-medium">{new Date(psp.created_date).toLocaleDateString()}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-600">License Type</dt>
                                        <dd className="font-medium">{psp.license_type}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Logs Tab */}
                    <TabsContent value="logs">
                        <Card>
                            <CardHeader>
                                <CardTitle>Instance Logs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {logs.map((log) => (
                                        <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            {logTypeIcons[log.log_type] || <FileText className="h-4 w-4 text-slate-600" />}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium text-sm">{log.message}</p>
                                                    <Badge variant="outline" className="text-xs">{log.log_type}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-600">
                                                    {new Date(log.created_date).toLocaleString()} • {log.source}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {logs.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">
                                            <FileText className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                            <p>No logs available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audit Trail Tab */}
                    <TabsContent value="audit">
                        <Card>
                            <CardHeader>
                                <CardTitle>Audit Trail</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {auditTrail.map((audit) => (
                                        <div key={audit.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <Badge variant="outline" className="mb-2">{audit.action}</Badge>
                                                    {audit.field_changed && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">{audit.field_changed}</span>
                                                            {audit.old_value && audit.new_value && (
                                                                <>
                                                                    {' '}changed from{' '}
                                                                    <span className="text-red-600">{audit.old_value}</span>
                                                                    {' '}to{' '}
                                                                    <span className="text-emerald-600">{audit.new_value}</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500">{new Date(audit.created_date).toLocaleString()}</p>
                                            </div>
                                            <div className="text-xs text-slate-600">
                                                By: {audit.user_email} ({audit.user_role})
                                            </div>
                                        </div>
                                    ))}
                                    {auditTrail.length === 0 && (
                                        <div className="text-center py-8 text-slate-500">
                                            <Clock className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                                            <p>No audit records available</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}