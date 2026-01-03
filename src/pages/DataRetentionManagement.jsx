import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { 
    Database, 
    Play, 
    Archive, 
    AlertTriangle,
    CheckCircle2,
    Clock,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function DataRetentionManagement() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [showDryRun, setShowDryRun] = useState(true);

    const { data: policies = [], isLoading: policiesLoading } = useQuery({
        queryKey: ['retention-policies'],
        queryFn: () => base44.entities.DataRetentionPolicy.list('-created_date', 100)
    });

    const { data: executionHistory = [], isLoading: historyLoading } = useQuery({
        queryKey: ['retention-history'],
        queryFn: async () => {
            const response = await base44.functions.invoke('dataRetentionScheduler', {
                action: 'get_execution_history'
            });
            return response.data.history || [];
        }
    });

    const enforceRetentionMutation = useMutation({
        mutationFn: async (dryRun) => {
            const response = await base44.functions.invoke('dataRetentionScheduler', {
                action: 'enforce_retention_policies',
                dry_run: dryRun
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.execution_log.dry_run) {
                toast.success(`Dry run completed: Would delete ${data.execution_log.total_records_deleted} records`);
            } else {
                toast.success(`Retention enforced: Deleted ${data.execution_log.total_records_deleted} records`);
            }
            queryClient.invalidateQueries(['retention-history']);
        },
        onError: (error) => {
            toast.error('Failed to enforce retention: ' + error.message);
        }
    });

    const activePolicies = policies.filter(p => p.status === 'active');
    const inactivePolicies = policies.filter(p => p.status !== 'active');

    if (loading) return <div>Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSSettings" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('platform:subMenuItems.dataRetention')}</h1>
                        <p className="text-slate-600">{t('platform:subMenuItems.dataRetentionDesc')}</p>
                    </div>

                    {/* Control Panel */}
                    <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Play className="h-5 w-5 text-blue-600" />
                                Retention Enforcement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-900">Dry Run Mode</p>
                                        <p className="text-sm text-slate-600">Preview changes without deleting data</p>
                                    </div>
                                    <Switch checked={showDryRun} onCheckedChange={setShowDryRun} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => enforceRetentionMutation.mutate(showDryRun)}
                                        disabled={enforceRetentionMutation.isPending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        {showDryRun ? 'Run Dry Run' : 'Enforce Now'}
                                    </Button>
                                    {showDryRun && (
                                        <p className="text-sm text-slate-600">
                                            <AlertTriangle className="h-4 w-4 inline mr-1 text-amber-600" />
                                            No data will be deleted in dry run mode
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Policies */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Active Retention Policies ({activePolicies.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activePolicies.map((policy) => (
                                    <div key={policy.id} className="bg-slate-50 p-4 rounded-lg border">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">{policy.policy_name}</h3>
                                                <p className="text-sm text-slate-600">{policy.legal_basis}</p>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700">
                                                {policy.retention_period_days} days
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Trash2 className="h-4 w-4 text-slate-400" />
                                                <span className={policy.auto_delete_enabled ? 'text-emerald-600' : 'text-slate-400'}>
                                                    Auto-delete: {policy.auto_delete_enabled ? 'On' : 'Off'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Archive className="h-4 w-4 text-slate-400" />
                                                <span className={policy.archive_before_delete ? 'text-blue-600' : 'text-slate-400'}>
                                                    Archive: {policy.archive_before_delete ? 'On' : 'Off'}
                                                </span>
                                            </div>
                                            <div className="text-slate-600">
                                                Jurisdiction: {policy.jurisdiction}
                                            </div>
                                        </div>
                                        {policy.applies_to_entities && policy.applies_to_entities.length > 0 && (
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-xs text-slate-500 mb-1">Applies to:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {policy.applies_to_entities.map((entity, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {entity}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Execution History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Execution History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {executionHistory.length === 0 ? (
                                <p className="text-sm text-slate-600 py-8 text-center">
                                    No retention enforcement history yet
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="text-left py-3 px-4 font-semibold">Date</th>
                                                <th className="text-left py-3 px-4 font-semibold">Action</th>
                                                <th className="text-left py-3 px-4 font-semibold">Entity</th>
                                                <th className="text-left py-3 px-4 font-semibold">Records Affected</th>
                                                <th className="text-left py-3 px-4 font-semibold">User</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {executionHistory.slice(0, 20).map((log) => (
                                                <tr key={log.id} className="border-t hover:bg-slate-50">
                                                    <td className="py-3 px-4 text-xs">
                                                        {format(new Date(log.created_date), 'MMM dd, yyyy HH:mm')}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline">{log.action}</Badge>
                                                    </td>
                                                    <td className="py-3 px-4">{log.field_changed}</td>
                                                    <td className="py-3 px-4">{log.old_value}</td>
                                                    <td className="py-3 px-4 text-xs">{log.user_email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}