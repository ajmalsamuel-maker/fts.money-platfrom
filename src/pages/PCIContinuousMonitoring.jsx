import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertTriangle, XCircle, Play, RefreshCw, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIContinuousMonitoring() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [selectedChecks, setSelectedChecks] = useState([]);

    const { data: checks } = useQuery({
        queryKey: ['monitoring-checks'],
        queryFn: () => base44.entities.PCIMonitoringCheck.list(),
        enabled: !loading
    });

    const { data: integrations } = useQuery({
        queryKey: ['integrations'],
        queryFn: () => base44.entities.PCIIntegration.list(),
        enabled: !loading
    });

    const runChecksMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('continuousMonitoring', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['monitoring-checks']);
            toast.success('Monitoring checks completed');
            setSelectedChecks([]);
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const passingChecks = checks?.filter(c => c.status === 'passing').length || 0;
    const warningChecks = checks?.filter(c => c.status === 'warning').length || 0;
    const failingChecks = checks?.filter(c => c.status === 'failing').length || 0;
    const activeIntegrations = integrations?.filter(i => i.status === 'active').length || 0;

    const statusConfig = {
        passing: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
        warning: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
        failing: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
        not_run: { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIContinuousMonitoring"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Continuous Monitoring</h1>
                        </div>
                        <p className="text-slate-600">Real-time compliance monitoring and automated security checks</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Passing Checks</CardDescription>
                                <CardTitle className="text-2xl text-green-600">{passingChecks}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Warnings</CardDescription>
                                <CardTitle className="text-2xl text-yellow-600">{warningChecks}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Failing</CardDescription>
                                <CardTitle className="text-2xl text-red-600">{failingChecks}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Active Integrations</CardDescription>
                                <CardTitle className="text-2xl text-blue-600">{activeIntegrations}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button 
                            onClick={() => runChecksMutation.mutate({ run_all: true })}
                            disabled={runChecksMutation.isPending}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Run All Checks
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => runChecksMutation.mutate({ check_ids: selectedChecks })}
                            disabled={selectedChecks.length === 0 || runChecksMutation.isPending}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Run Selected ({selectedChecks.length})
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => queryClient.invalidateQueries(['monitoring-checks'])}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    {/* Checks List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Automated Security Checks</CardTitle>
                            <CardDescription>
                                Select checks to run or view their current status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {checks?.map((check) => {
                                    const config = statusConfig[check.status];
                                    const Icon = config.icon;
                                    
                                    return (
                                        <div 
                                            key={check.id}
                                            className={`flex items-center gap-4 p-4 rounded-lg border ${config.border} ${config.bg}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedChecks.includes(check.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedChecks([...selectedChecks, check.id]);
                                                    } else {
                                                        setSelectedChecks(selectedChecks.filter(id => id !== check.id));
                                                    }
                                                }}
                                                className="rounded"
                                            />
                                            <Icon className={`h-5 w-5 ${config.color}`} />
                                            <div className="flex-1">
                                                <p className="font-semibold">{check.check_name}</p>
                                                <p className="text-sm text-slate-600">
                                                    Requirement {check.requirement_number} • {check.check_type}
                                                </p>
                                                {check.last_run && (
                                                    <p className="text-xs text-slate-500">
                                                        Last run: {new Date(check.last_run).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline">{check.status}</Badge>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Runs {check.frequency}
                                                </p>
                                            </div>
                                            {check.result_data && Object.keys(check.result_data).length > 0 && (
                                                <div className="ml-4 pl-4 border-l">
                                                    {Object.entries(check.result_data).slice(0, 3).map(([key, value]) => (
                                                        <p key={key} className="text-xs text-slate-600">
                                                            {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Integrations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Integrations</CardTitle>
                            <CardDescription>
                                Security tools integrated for automated monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {integrations?.map((integration) => (
                                    <div key={integration.id} className="p-3 border rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-semibold">{integration.integration_name}</p>
                                            <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                                                {integration.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-600">{integration.integration_type}</p>
                                        {integration.last_sync && (
                                            <p className="text-xs text-slate-500 mt-1">
                                                Last sync: {new Date(integration.last_sync).toLocaleString()}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-500">
                                            Evidence collected: {integration.evidence_collected || 0}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}