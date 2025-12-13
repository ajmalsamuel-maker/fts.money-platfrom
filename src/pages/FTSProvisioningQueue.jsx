import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
    Server, CheckCircle2, Loader2, AlertCircle, Database, 
    Key, Globe, Shield, Play, XCircle 
} from 'lucide-react';

const provisioningSteps = [
    { id: 'database', name: 'Database Instance', icon: Database, weight: 25 },
    { id: 'api_keys', name: 'API Keys Generation', icon: Key, weight: 15 },
    { id: 'domain', name: 'Domain & SSL Setup', icon: Globe, weight: 20 },
    { id: 'security', name: 'Security Config', icon: Shield, weight: 20 },
    { id: 'initialization', name: 'Platform Init', icon: Server, weight: 20 }
];

export default function FTSProvisioningQueue() {
    const queryClient = useQueryClient();
    const [selectedPSP, setSelectedPSP] = useState(null);

    const { data: provisioningPSPs = [] } = useQuery({
        queryKey: ['provisioning-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ status: 'provisioning' }, '-created_date'),
        refetchInterval: 5000
    });

    const { data: activePSPs = [] } = useQuery({
        queryKey: ['active-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ status: 'active' }, '-created_date', 10)
    });

    const executeStepMutation = useMutation({
        mutationFn: async ({ pspId, step }) => {
            // Simulate provisioning step execution
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { pspId, step, success: true };
        },
        onSuccess: ({ pspId, step }) => {
            // Update progress
            const psp = provisioningPSPs.find(p => p.id === pspId);
            const completedSteps = (psp.provisioning_steps_completed || []);
            if (!completedSteps.includes(step)) {
                completedSteps.push(step);
                const progress = completedSteps.reduce((sum, stepId) => {
                    const stepConfig = provisioningSteps.find(s => s.id === stepId);
                    return sum + (stepConfig?.weight || 0);
                }, 0);

                updatePSPMutation.mutate({
                    pspId,
                    data: {
                        provisioning_steps_completed: completedSteps,
                        provisioning_progress: progress
                    }
                });
            }
        }
    });

    const updatePSPMutation = useMutation({
        mutationFn: async ({ pspId, data }) => {
            return await base44.entities.ProvisionedPSP.update(pspId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['provisioning-psps'] });
            queryClient.invalidateQueries({ queryKey: ['active-psps'] });
        }
    });

    const completeProvisioningMutation = useMutation({
        mutationFn: async (pspId) => {
            const psp = provisioningPSPs.find(p => p.id === pspId);
            
            // Generate technical config
            const technicalConfig = {
                api_key: `fts_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                webhook_secret: `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                database_instance: `${psp.psp_code.toLowerCase()}_prod_${Date.now()}`,
                cdn_endpoint: `https://cdn.fts.money/${psp.psp_code.toLowerCase()}`
            };

            return await base44.entities.ProvisionedPSP.update(pspId, {
                status: 'active',
                provisioning_progress: 100,
                technical_config: technicalConfig,
                go_live_date: new Date().toISOString().split('T')[0]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['provisioning-psps'] });
            queryClient.invalidateQueries({ queryKey: ['active-psps'] });
            setSelectedPSP(null);
        }
    });

    const cancelProvisioningMutation = useMutation({
        mutationFn: async ({ pspId, reason }) => {
            return await base44.entities.ProvisionedPSP.update(pspId, {
                status: 'suspended',
                rejection_reason: reason
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['provisioning-psps'] });
        }
    });

    const handleExecuteStep = async (pspId, stepId) => {
        await executeStepMutation.mutateAsync({ pspId, step: stepId });
    };

    const handleAutoProvision = async (pspId) => {
        const psp = provisioningPSPs.find(p => p.id === pspId);
        const completedSteps = psp.provisioning_steps_completed || [];
        
        // Execute remaining steps sequentially
        for (const step of provisioningSteps) {
            if (!completedSteps.includes(step.id)) {
                await handleExecuteStep(pspId, step.id);
            }
        }
        
        // Mark as complete
        await completeProvisioningMutation.mutateAsync(pspId);
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="FTSProvisioningQueue" />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">PSP Provisioning Queue</h2>
                        <p className="text-xs text-slate-600">Manage infrastructure deployment</p>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {provisioningPSPs.length} Pending
                    </Badge>
                </header>

                <div className="p-6 space-y-6">
                    <Tabs defaultValue="queue">
                        <TabsList>
                            <TabsTrigger value="queue">
                                Provisioning Queue ({provisioningPSPs.length})
                            </TabsTrigger>
                            <TabsTrigger value="recent">
                                Recently Activated ({activePSPs.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="queue" className="space-y-4">
                            {provisioningPSPs.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                                        <p className="text-slate-600">No PSPs pending provisioning</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                provisioningPSPs.map((psp) => {
                                    const completedSteps = psp.provisioning_steps_completed || [];
                                    const progress = psp.provisioning_progress || 0;

                                    return (
                                        <Card key={psp.id} className="border-l-4 border-l-blue-500">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>{psp.psp_name}</CardTitle>
                                                        <p className="text-sm text-slate-600 font-mono">{psp.psp_code}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            {psp.tier}
                                                        </Badge>
                                                        <Button
                                                            onClick={() => handleAutoProvision(psp.id)}
                                                            disabled={completeProvisioningMutation.isPending}
                                                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                                                        >
                                                            {completeProvisioningMutation.isPending ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Provisioning...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Play className="h-4 w-4 mr-2" />
                                                                    Auto Provision
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm text-slate-600">Overall Progress</span>
                                                        <span className="text-sm font-semibold">{progress}%</span>
                                                    </div>
                                                    <Progress value={progress} className="h-2" />
                                                </div>

                                                <div className="grid gap-3">
                                                    {provisioningSteps.map((step) => {
                                                        const Icon = step.icon;
                                                        const isCompleted = completedSteps.includes(step.id);
                                                        const isExecuting = executeStepMutation.isPending;

                                                        return (
                                                            <div
                                                                key={step.id}
                                                                className={cn(
                                                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                                                    isCompleted 
                                                                        ? "bg-emerald-50 border-emerald-200" 
                                                                        : "bg-white border-slate-200"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                                                        isCompleted 
                                                                            ? "bg-emerald-100 text-emerald-600" 
                                                                            : "bg-slate-100 text-slate-400"
                                                                    )}>
                                                                        {isCompleted ? (
                                                                            <CheckCircle2 className="h-5 w-5" />
                                                                        ) : (
                                                                            <Icon className="h-5 w-5" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-sm">{step.name}</p>
                                                                        <p className="text-xs text-slate-500">{step.weight}% of total</p>
                                                                    </div>
                                                                </div>
                                                                {!isCompleted && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleExecuteStep(psp.id, step.id)}
                                                                        disabled={isExecuting}
                                                                    >
                                                                        {isExecuting ? (
                                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                                        ) : (
                                                                            'Execute'
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {progress === 100 && (
                                                    <Alert className="bg-emerald-50 border-emerald-200">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        <AlertDescription className="text-emerald-900">
                                                            All provisioning steps completed. Ready to activate.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}

                                                <div className="flex items-center gap-2 pt-4 border-t">
                                                    <Button
                                                        onClick={() => completeProvisioningMutation.mutate(psp.id)}
                                                        disabled={progress < 100 || completeProvisioningMutation.isPending}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Activate PSP
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => cancelProvisioningMutation.mutate({ 
                                                            pspId: psp.id, 
                                                            reason: 'Manual cancellation by admin' 
                                                        })}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </TabsContent>

                        <TabsContent value="recent" className="space-y-4">
                            {activePSPs.map((psp) => (
                                <Card key={psp.id} className="border-l-4 border-l-emerald-500">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg">{psp.psp_name}</h3>
                                                <p className="text-sm text-slate-600 font-mono">{psp.psp_code}</p>
                                                <p className="text-sm text-slate-500">
                                                    Activated: {new Date(psp.go_live_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}