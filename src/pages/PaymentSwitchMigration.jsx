import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import PlatformLayout from '@/components/platform/PlatformLayout';
import { 
    AlertTriangle, CheckCircle2, Database, FileText, 
    PlayCircle, RotateCcw, Shield, TrendingUp 
} from 'lucide-react';

export default function PaymentSwitchMigration() {
    usePlatformAuth(['MIGRATION_EXECUTE']);
    const queryClient = useQueryClient();
    const [dryRun, setDryRun] = useState(true);
    const [selectedBackup, setSelectedBackup] = useState(null);

    // Fetch migration logs
    const { data: migrationLogs = [] } = useQuery({
        queryKey: ['migrationLogs'],
        queryFn: () => base44.entities.MigrationLog.list('-created_date', 20)
    });

    // Fetch backups
    const { data: backups = [] } = useQuery({
        queryKey: ['migrationBackups'],
        queryFn: () => base44.entities.MigrationBackup.list('-created_date', 20)
    });

    // Run assessment
    const assessmentMutation = useMutation({
        mutationFn: () => base44.functions.invoke('assessPaymentSwitchMigration', {}),
        onSuccess: () => {
            queryClient.invalidateQueries(['migrationLogs']);
        }
    });

    // Create backups
    const backupMutation = useMutation({
        mutationFn: () => base44.functions.invoke('createMigrationBackups', {}),
        onSuccess: () => {
            queryClient.invalidateQueries(['migrationBackups']);
        }
    });

    // Execute migration
    const migrationMutation = useMutation({
        mutationFn: () => base44.functions.invoke('executePaymentSwitchMigration', { dry_run: dryRun }),
        onSuccess: () => {
            queryClient.invalidateQueries(['migrationLogs']);
        }
    });

    // Rollback migration
    const rollbackMutation = useMutation({
        mutationFn: (backup_timestamp) => base44.functions.invoke('rollbackPaymentSwitchMigration', { 
            backup_timestamp 
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['migrationLogs']);
            queryClient.invalidateQueries(['migrationBackups']);
        }
    });

    const latestMigration = migrationLogs.find(log => log.migration_type === 'payment_switch');
    const latestBackup = backups[0];

    const statusConfig = {
        'pending': { icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50', label: 'Pending' },
        'in_progress': { icon: TrendingUp, color: 'text-blue-600 bg-blue-50', label: 'In Progress' },
        'completed': { icon: CheckCircle2, color: 'text-green-600 bg-green-50', label: 'Completed' },
        'completed_with_errors': { icon: AlertTriangle, color: 'text-orange-600 bg-orange-50', label: 'Completed with Errors' },
        'failed': { icon: AlertTriangle, color: 'text-red-600 bg-red-50', label: 'Failed' }
    };

    return (
        <PlatformLayout>
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Payment Switch Migration</h1>
                    <p className="text-gray-600">Migrate from legacy entities to unified connector management</p>
                </div>

                {/* Migration Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Migration Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {latestMigration ? (
                                <div className="flex items-center gap-2">
                                    {React.createElement(statusConfig[latestMigration.status]?.icon || AlertTriangle, {
                                        className: "w-5 h-5 " + statusConfig[latestMigration.status]?.color.split(' ')[0]
                                    })}
                                    <span className="font-semibold">{statusConfig[latestMigration.status]?.label}</span>
                                </div>
                            ) : (
                                <span className="text-gray-500">Not Started</span>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Records Migrated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{latestMigration?.records_migrated || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Failed Records</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{latestMigration?.records_failed || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-gray-600">Backups Available</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backups.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Tabs */}
                <Tabs defaultValue="execute" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="execute">Execute Migration</TabsTrigger>
                        <TabsTrigger value="assessment">Assessment</TabsTrigger>
                        <TabsTrigger value="backups">Backups</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    {/* Execute Tab */}
                    <TabsContent value="execute" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Migration Execution</CardTitle>
                                <CardDescription>Run the migration process to consolidate payment entities</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Step 1: Assessment */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <FileText className="w-5 h-5" />
                                                Step 1: Run Assessment
                                            </h3>
                                            <p className="text-sm text-gray-600">Analyze dependencies and generate compatibility report</p>
                                        </div>
                                        <Button 
                                            onClick={() => assessmentMutation.mutate()}
                                            disabled={assessmentMutation.isPending}
                                        >
                                            {assessmentMutation.isPending ? 'Running...' : 'Run Assessment'}
                                        </Button>
                                    </div>
                                    {assessmentMutation.data && (
                                        <Alert>
                                            <AlertDescription>
                                                <pre className="text-xs overflow-auto max-h-64">
                                                    {JSON.stringify(assessmentMutation.data, null, 2)}
                                                </pre>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Step 2: Create Backups */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <Database className="w-5 h-5" />
                                                Step 2: Create Backups
                                            </h3>
                                            <p className="text-sm text-gray-600">Snapshot all entities before migration</p>
                                        </div>
                                        <Button 
                                            onClick={() => backupMutation.mutate()}
                                            disabled={backupMutation.isPending}
                                            variant="outline"
                                        >
                                            {backupMutation.isPending ? 'Creating...' : 'Create Backups'}
                                        </Button>
                                    </div>
                                    {backupMutation.data && (
                                        <Alert>
                                            <CheckCircle2 className="w-4 h-4" />
                                            <AlertDescription>
                                                {backupMutation.data.backups_created?.length || 0} entities backed up successfully
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>

                                {/* Step 3: Execute Migration */}
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">
                                                <PlayCircle className="w-5 h-5" />
                                                Step 3: Execute Migration
                                            </h3>
                                            <p className="text-sm text-gray-600">Migrate data to new entity structure</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={dryRun} 
                                                    onCheckedChange={setDryRun}
                                                    id="dry-run"
                                                />
                                                <Label htmlFor="dry-run">Dry Run</Label>
                                            </div>
                                            <Button 
                                                onClick={() => migrationMutation.mutate()}
                                                disabled={migrationMutation.isPending}
                                            >
                                                {migrationMutation.isPending ? 'Migrating...' : dryRun ? 'Test Migration' : 'Execute Migration'}
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {dryRun && (
                                        <Alert>
                                            <Shield className="w-4 h-4" />
                                            <AlertDescription>
                                                Dry run mode enabled - no data will be modified
                                            </AlertDescription>
                                        </Alert>
                                    )}

                                    {migrationMutation.data && (
                                        <div className="space-y-2">
                                            <Alert>
                                                <AlertDescription>
                                                    <div className="font-semibold mb-2">Migration {dryRun ? 'Test' : 'Results'}</div>
                                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Total Migrated:</span>
                                                            <div className="text-lg font-bold">{migrationMutation.data.summary?.total_migrated}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Failed:</span>
                                                            <div className="text-lg font-bold text-red-600">{migrationMutation.data.summary?.total_failed}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Duration:</span>
                                                            <div className="text-lg font-bold">{migrationMutation.data.summary?.duration_ms}ms</div>
                                                        </div>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                            
                                            {migrationMutation.data.details && (
                                                <div className="border rounded p-3 space-y-2">
                                                    <div className="font-medium text-sm">Entity Breakdown:</div>
                                                    {Object.entries(migrationMutation.data.details).map(([entity, stats]) => (
                                                        <div key={entity} className="flex justify-between text-sm">
                                                            <span>{entity}:</span>
                                                            <span>{stats.migrated} migrated, {stats.failed} failed</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Step 4: Rollback */}
                                {latestBackup && (
                                    <div className="border rounded-lg p-4 space-y-3 border-red-200 bg-red-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold flex items-center gap-2 text-red-700">
                                                    <RotateCcw className="w-5 h-5" />
                                                    Emergency Rollback
                                                </h3>
                                                <p className="text-sm text-red-600">Restore from latest backup if migration fails</p>
                                            </div>
                                            <Button 
                                                onClick={() => rollbackMutation.mutate(latestBackup.backup_timestamp)}
                                                disabled={rollbackMutation.isPending}
                                                variant="destructive"
                                            >
                                                {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback Migration'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Assessment Tab */}
                    <TabsContent value="assessment">
                        <Card>
                            <CardHeader>
                                <CardTitle>Migration Assessment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {assessmentMutation.data ? (
                                    <pre className="text-xs overflow-auto bg-gray-50 p-4 rounded">
                                        {JSON.stringify(assessmentMutation.data, null, 2)}
                                    </pre>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No assessment run yet. Click "Run Assessment" to generate report.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Backups Tab */}
                    <TabsContent value="backups">
                        <Card>
                            <CardHeader>
                                <CardTitle>Backup History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {backups.map(backup => (
                                        <div key={backup.id} className="border rounded p-3 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{backup.entity_name}</div>
                                                <div className="text-sm text-gray-600">
                                                    {backup.record_count} records • {new Date(backup.backup_timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                            <Badge variant={backup.is_billing_critical ? 'destructive' : 'secondary'}>
                                                {backup.is_billing_critical ? 'Billing Critical' : 'Standard'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle>Migration History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {migrationLogs.map(log => {
                                        const StatusIcon = statusConfig[log.status]?.icon || AlertTriangle;
                                        return (
                                            <div key={log.id} className="border rounded p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon className={`w-4 h-4 ${statusConfig[log.status]?.color.split(' ')[0]}`} />
                                                        <span className="font-medium">{log.migration_type}</span>
                                                    </div>
                                                    <Badge className={statusConfig[log.status]?.color}>
                                                        {statusConfig[log.status]?.label}
                                                    </Badge>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                                    <div>Migrated: {log.records_migrated}</div>
                                                    <div>Failed: {log.records_failed}</div>
                                                    <div>{new Date(log.created_date).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformLayout>
    );
}