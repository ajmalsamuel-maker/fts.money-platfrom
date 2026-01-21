import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import PlatformLayout from "@/components/platform/PlatformLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
    RefreshCw, 
    ArrowRightLeft, 
    CheckCircle2, 
    AlertTriangle, 
    Play, 
    RotateCcw,
    Database,
    FileJson,
    Server,
    Loader2
} from "lucide-react";
import { toast } from "sonner";

export default function MigrationDashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        legacyProcessors: 0,
        newProviders: 0,
        legacyRules: 0,
        newRules: 0,
        legacyConfigs: 0,
        newAssignments: 0
    });
    const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, assessing, running, completed, error
    const [logs, setLogs] = useState([]);
    const [assessmentData, setAssessmentData] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                await fetchStats();
            } catch (error) {
                console.error("Auth error:", error);
            }
        };
        init();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch counts
            const processors = await base44.entities.PaymentProcessor.list('created_date', 1000);
            const providers = await base44.entities.PaymentProvider.list('created_date', 1000);
            const rules = await base44.entities.OrchestrationRule.list('created_date', 1000);
            const newRules = await base44.entities.RoutingRule.list('created_date', 1000);
            const configs = await base44.entities.ProcessorConnectorConfig.list('created_date', 1000);
            const assignments = await base44.entities.PSPConnectorAssignment.list('created_date', 1000);

            setStats({
                legacyProcessors: processors.length,
                newProviders: providers.length,
                legacyRules: rules.length,
                newRules: newRules.length,
                legacyConfigs: configs.length,
                newAssignments: assignments.length
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Failed to load entity statistics");
        }
    };

    const addLog = (message, type = 'info') => {
        setLogs(prev => [{
            timestamp: new Date().toISOString(),
            message,
            type
        }, ...prev]);
    };

    const handleAssess = async () => {
        setIsLoading(true);
        setMigrationStatus('assessing');
        addLog("Starting pre-migration assessment...", 'info');

        try {
            const result = await base44.functions.invoke('assessPaymentSwitchMigration');
            if (result.data) {
                setAssessmentData(result.data);
                addLog(`Assessment complete. Readiness Score: ${result.data.readinessScore}/100`, 'success');
                if (result.data.recommendations?.length > 0) {
                    result.data.recommendations.forEach(rec => addLog(`Recommendation: ${rec}`, 'warning'));
                }
            }
        } catch (error) {
            addLog(`Assessment failed: ${error.message}`, 'error');
            toast.error("Assessment failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunMigration = async (dryRun = true) => {
        setIsLoading(true);
        setMigrationStatus('running');
        addLog(`Starting ${dryRun ? 'Dry Run' : 'Full'} Migration...`, 'info');

        try {
            const result = await base44.functions.invoke('executePaymentSwitchMigration', { dryRun });
            
            if (result.data.success) {
                addLog(`Migration ${dryRun ? 'Dry Run' : 'Execution'} completed successfully`, 'success');
                addLog(`Processed: ${JSON.stringify(result.data.results)}`, 'info');
                if (!dryRun) {
                    await fetchStats();
                    toast.success("Migration completed successfully");
                } else {
                    toast.success("Dry run completed successfully");
                }
            } else {
                addLog(`Migration failed: ${result.data.error || 'Unknown error'}`, 'error');
                toast.error("Migration failed");
            }
        } catch (error) {
            addLog(`Execution error: ${error.message}`, 'error');
            toast.error("Execution error");
        } finally {
            setIsLoading(false);
            setMigrationStatus(dryRun ? 'assessed' : 'completed');
        }
    };

    const handleRollback = async () => {
        if (!confirm("Are you sure you want to rollback? This will revert recent changes.")) return;

        setIsLoading(true);
        addLog("Initiating rollback sequence...", 'warning');

        try {
            const result = await base44.functions.invoke('rollbackPaymentSwitchMigration');
            if (result.data.success) {
                addLog("Rollback completed successfully", 'success');
                addLog(`Restored: ${JSON.stringify(result.data.restored)}`, 'info');
                await fetchStats();
                toast.success("Rollback successful");
            } else {
                addLog(`Rollback failed: ${result.data.error}`, 'error');
                toast.error("Rollback failed");
            }
        } catch (error) {
            addLog(`Rollback error: ${error.message}`, 'error');
            toast.error("Rollback error");
        } finally {
            setIsLoading(false);
        }
    };

    const getProgressValue = () => {
        const totalLegacy = stats.legacyProcessors + stats.legacyRules + stats.legacyConfigs;
        const totalNew = stats.newProviders + stats.newRules + stats.newAssignments;
        if (totalLegacy === 0) return 0;
        return Math.min(100, (totalNew / totalLegacy) * 100); // Rough approximation
    };

    return (
        <PlatformLayout 
            currentPage="MigrationDashboard"
            userRole={user?.role}
            userEmail={user?.email}
            isSuperAdmin={user?.role === 'admin'}
        >
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <ArrowRightLeft className="h-8 w-8 text-blue-600" />
                            Payment Switch Migration
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Manage the transition from Legacy Payment Processor to Unified Payment Provider architecture.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handleAssess} 
                            disabled={isLoading}
                        >
                            <FileJson className="mr-2 h-4 w-4" />
                            Assess Readiness
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleRollback}
                            disabled={isLoading}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Rollback
                        </Button>
                    </div>
                </div>

                {/* Main Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Migration Progress</CardTitle>
                            <CardDescription>Real-time status of entity migration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Overall Completion</span>
                                    <span>{getProgressValue().toFixed(1)}%</span>
                                </div>
                                <Progress value={getProgressValue()} className="h-3" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                                        <Database className="h-4 w-4" /> Processors
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-slate-900">{stats.legacyProcessors}</div>
                                            <div className="text-xs text-slate-500">Legacy</div>
                                        </div>
                                        <div className="text-blue-500 mb-1">→</div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">{stats.newProviders}</div>
                                            <div className="text-xs text-blue-600">New</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                                        <Server className="h-4 w-4" /> Connectors
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-slate-900">{stats.legacyConfigs}</div>
                                            <div className="text-xs text-slate-500">Legacy</div>
                                        </div>
                                        <div className="text-blue-500 mb-1">→</div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">{stats.newAssignments}</div>
                                            <div className="text-xs text-blue-600">New</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500 text-sm font-medium">
                                        <ArrowRightLeft className="h-4 w-4" /> Rules
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-slate-900">{stats.legacyRules}</div>
                                            <div className="text-xs text-slate-500">Legacy</div>
                                        </div>
                                        <div className="text-blue-500 mb-1">→</div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">{stats.newRules}</div>
                                            <div className="text-xs text-blue-600">New</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {assessmentData && (
                                <Alert variant={assessmentData.readinessScore > 80 ? "default" : "destructive"}>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Pre-Migration Assessment</AlertTitle>
                                    <AlertDescription>
                                        Ready Score: {assessmentData.readinessScore}/100. 
                                        {assessmentData.blockingIssues?.length > 0 
                                            ? ` Found ${assessmentData.blockingIssues.length} blocking issues.` 
                                            : " No blocking issues found."}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Execution Control</CardTitle>
                            <CardDescription>Execute migration steps</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 space-y-3">
                                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                                    <TestTube2 className="h-4 w-4" /> Dry Run Mode
                                </h4>
                                <p className="text-xs text-blue-700">
                                    Simulate migration without modifying database. Generates a report of expected changes.
                                </p>
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700" 
                                    onClick={() => handleRunMigration(true)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Run Simulation
                                </Button>
                            </div>

                            <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 space-y-3">
                                <h4 className="font-medium text-amber-900 flex items-center gap-2">
                                    <Database className="h-4 w-4" /> Live Migration
                                </h4>
                                <p className="text-xs text-amber-700">
                                    Execute actual data migration. This will create new entities based on legacy data.
                                </p>
                                <Button 
                                    className="w-full bg-amber-600 hover:bg-amber-700"
                                    onClick={() => handleRunMigration(false)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Start Live Migration
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Console / Logs */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-mono uppercase tracking-wider text-slate-500">Migration Console</CardTitle>
                            <Badge variant="outline" className="font-mono">{logs.length} events</Badge>
                        </div>
                    </CardHeader>
                    <Separator />
                    <ScrollArea className="h-[300px] w-full bg-slate-950 p-4 font-mono text-sm">
                        {logs.length === 0 ? (
                            <div className="text-slate-500 italic text-center mt-10">No logs generated yet. Start an assessment or migration.</div>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log, index) => (
                                    <div key={index} className="flex gap-3">
                                        <span className="text-slate-500 shrink-0">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                                        <span className={
                                            log.type === 'error' ? 'text-red-400' :
                                            log.type === 'warning' ? 'text-amber-400' :
                                            log.type === 'success' ? 'text-emerald-400' :
                                            'text-blue-300'
                                        }>
                                            {log.message}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </Card>
            </div>
        </PlatformLayout>
    );
}

function TestTube2(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 7 6.82 21.18a2.83 2.83 0 0 1-3.99-.01v0a2.83 2.83 0 0 1 0-4L17 3" />
      <path d="m16 2 6 6" />
      <path d="M12 16H4" />
    </svg>
  )
}