import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

export default function PCIWorkflowManager() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();

    const { data: workflows } = useQuery({
        queryKey: ['workflows'],
        queryFn: () => base44.entities.PCIWorkflow.list('-created_date', 100),
        enabled: !loading
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const activeWorkflows = workflows?.filter(w => w.status === 'active').length || 0;
    const onTrack = workflows?.filter(w => w.sla_status === 'on_track').length || 0;
    const atRisk = workflows?.filter(w => w.sla_status === 'at_risk').length || 0;
    const breached = workflows?.filter(w => w.sla_status === 'breached').length || 0;

    const statusConfig = {
        active: { color: 'text-blue-600', bg: 'bg-blue-50' },
        paused: { color: 'text-yellow-600', bg: 'bg-yellow-50' },
        completed: { color: 'text-green-600', bg: 'bg-green-50' },
        cancelled: { color: 'text-slate-600', bg: 'bg-slate-50' }
    };

    const slaConfig = {
        on_track: { icon: CheckCircle2, color: 'text-green-600', text: 'On Track' },
        at_risk: { icon: AlertCircle, color: 'text-yellow-600', text: 'At Risk' },
        breached: { icon: AlertCircle, color: 'text-red-600', text: 'Breached' }
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIWorkflowManager"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <GitBranch className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">Workflow Automation</h1>
                        </div>
                        <p className="text-slate-600">Automated remediation, approval, and compliance workflows</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Active Workflows</CardDescription>
                                <CardTitle className="text-2xl">{activeWorkflows}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>On Track</CardDescription>
                                <CardTitle className="text-2xl text-green-600">{onTrack}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>At Risk</CardDescription>
                                <CardTitle className="text-2xl text-yellow-600">{atRisk}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>SLA Breached</CardDescription>
                                <CardTitle className="text-2xl text-red-600">{breached}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Workflows</CardTitle>
                            <CardDescription>Automated compliance and remediation workflows</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {workflows?.map((workflow) => {
                                    const statusConf = statusConfig[workflow.status];
                                    const slaConf = slaConfig[workflow.sla_status];
                                    const SLAIcon = slaConf?.icon || Clock;
                                    
                                    return (
                                        <div key={workflow.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-lg">{workflow.workflow_name}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {workflow.workflow_type.replace(/_/g, ' ')} • 
                                                        Step {workflow.current_step} of {workflow.steps?.length || 0}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className={statusConf?.bg}>{workflow.status}</Badge>
                                                    <Badge variant="outline">{workflow.priority}</Badge>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <SLAIcon className={`h-4 w-4 ${slaConf?.color}`} />
                                                    <span className={slaConf?.color}>{slaConf?.text}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-slate-400" />
                                                    <span>Due: {new Date(workflow.due_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-slate-600">
                                                    Assigned: {workflow.assigned_to}
                                                </div>
                                            </div>

                                            {workflow.steps && workflow.steps.length > 0 && (
                                                <div className="mt-4 pt-4 border-t">
                                                    <p className="text-sm font-medium mb-2">Workflow Steps:</p>
                                                    <div className="space-y-2">
                                                        {workflow.steps.slice(0, 3).map((step, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                    idx + 1 < workflow.current_step ? 'bg-green-100 text-green-600' :
                                                                    idx + 1 === workflow.current_step ? 'bg-blue-100 text-blue-600' :
                                                                    'bg-slate-100 text-slate-400'
                                                                }`}>
                                                                    {idx + 1}
                                                                </div>
                                                                <span className={idx + 1 === workflow.current_step ? 'font-medium' : ''}>
                                                                    {step.action}
                                                                </span>
                                                                <span className="text-slate-500">→ {step.assignee}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}