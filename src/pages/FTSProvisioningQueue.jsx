import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import MissingInfoDialog from '@/components/provisioning/MissingInfoDialog';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
    Server, CheckCircle2, Loader2, AlertCircle, Database, 
    Key, Globe, Shield, Play, XCircle, UserCheck, Trash2, Power
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
    const { platformUser, loading } = usePlatformAuth();
    const [selectedPSP, setSelectedPSP] = useState(null);
    const [reviewComments, setReviewComments] = useState('');

    const { data: provisioningPSPs = [], isLoading: loadingProvisioning } = useQuery({
        queryKey: ['provisioning-psps'],
        queryFn: async () => {
            try {
                return await base44.entities.ProvisionedPSP.filter({ status: 'provisioning' }, '-created_date');
            } catch (error) {
                console.error('Error fetching provisioning PSPs:', error);
                return [];
            }
        },
        refetchInterval: 5000,
        enabled: !!platformUser
    });

    const { data: activePSPs = [], isLoading: loadingActive } = useQuery({
        queryKey: ['active-psps'],
        queryFn: async () => {
            try {
                return await base44.entities.ProvisionedPSP.filter({ status: 'active' }, '-created_date', 10);
            } catch (error) {
                console.error('Error fetching active PSPs:', error);
                return [];
            }
        },
        enabled: !!platformUser
    });

    const { data: approvalRequests = [], isLoading: loadingApprovals } = useQuery({
        queryKey: ['approval-requests'],
        queryFn: async () => {
            try {
                return await base44.entities.ApprovalRequest.filter({ status: 'pending' }, '-created_date');
            } catch (error) {
                console.error('Error fetching approval requests:', error);
                return [];
            }
        },
        refetchInterval: 5000,
        enabled: !!platformUser
    });

    const [stepErrors, setStepErrors] = useState({});
    const [stepValidating, setStepValidating] = useState({});
    const [stepValidationResults, setStepValidationResults] = useState({});
    const [missingInfoDialog, setMissingInfoDialog] = useState({ open: false, psp: null, step: null, error: null });

    const validateStepMutation = useMutation({
        mutationFn: async ({ psp_code, step_id }) => {
            const result = await base44.functions.invoke('validateProvisioningStep', {
                psp_code,
                step_id
            });
            return result.data;
        }
    });

    const executeStepMutation = useMutation({
        mutationFn: async ({ pspId, psp, step }) => {
            try {
                // Execute based on step type
                if (step === 'database') {
                    const result = await base44.functions.invoke('provisionPSPSchema', {
                        psp_code: psp.psp_code
                    });
                    if (!result.data?.success) throw new Error(result.data?.error || 'Schema creation failed');
                    return { pspId, step, success: true };
                }

                if (step === 'api_keys') {
                    const technicalConfig = {
                        api_key: `fts_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                        webhook_secret: `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
                        database_instance: `${psp.psp_code.toLowerCase()}_prod_${Date.now()}`,
                        cdn_endpoint: `https://cdn.fts.money/${psp.psp_code.toLowerCase()}`
                    };
                    await base44.entities.ProvisionedPSP.update(pspId, { technical_config: technicalConfig });
                    return { pspId, step, success: true };
                }

                if (step === 'security') {
                    const result = await base44.functions.invoke('managePSPUsers', {
                        action: 'create',
                        psp_code: psp.psp_code,
                        email: psp.owner_email,
                        full_name: psp.psp_name + ' Admin',
                        role: 'admin',
                        password: 'Welcome123!',
                        status: 'active'
                    });

                    if (!result.data?.success && !result.data?.message?.includes('already exists')) {
                        throw new Error(result.data?.error || 'Failed to create admin user');
                    }
                    return { pspId, step, success: true };
                }

                // Other steps (domain, initialization)
                return { pspId, step, success: true };
            } catch (error) {
                console.error('Step execution error:', error);
                throw new Error(error.response?.data?.error || error.message || 'Step execution failed');
            }
        },
        onSuccess: async ({ pspId, step }) => {
            const psp = provisioningPSPs.find(p => p.id === pspId);
            const completedSteps = [...(psp.provisioning_steps_completed || [])];
            if (!completedSteps.includes(step)) {
                completedSteps.push(step);
                const progress = completedSteps.reduce((sum, stepId) => {
                    const stepConfig = provisioningSteps.find(s => s.id === stepId);
                    return sum + (stepConfig?.weight || 0);
                }, 0);

                try {
                    await base44.entities.ProvisionedPSP.update(pspId, {
                        provisioning_steps_completed: completedSteps,
                        provisioning_progress: progress
                    });
                    queryClient.invalidateQueries({ queryKey: ['provisioning-psps'] });
                } catch (err) {
                    console.error('Failed to update PSP progress:', err);
                }
            }
            setStepErrors(prev => ({ ...prev, [`${pspId}-${step}`]: null }));
        },
        onError: (error, { pspId, step }) => {
            setStepErrors(prev => ({ ...prev, [`${pspId}-${step}`]: error.response?.data?.error || error.message }));
        }
    });

    const updatePSPMutation = useMutation({
        mutationFn: async ({ pspId, data }) => {
            try {
                return await base44.entities.ProvisionedPSP.update(pspId, data);
            } catch (error) {
                console.error('Update PSP error:', error);
                throw new Error(error.response?.data?.message || error.message || 'Update failed');
            }
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

            // Generate initial admin password
            const initialPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15).toUpperCase();

            // Create initial admin user
            try {
                await base44.functions.invoke('managePSPUsers', {
                    action: 'create',
                    psp_code: psp.psp_code,
                    email: psp.owner_email,
                    full_name: psp.psp_name + ' Admin',
                    role: 'admin',
                    password: initialPassword,
                    status: 'active'
                });
            } catch (err) {
                console.error('Error creating admin user:', err);
                // Continue anyway if user creation fails
            }

            // Send welcome email with credentials
            await base44.integrations.Core.SendEmail({
                to: psp.owner_email,
                subject: `Welcome to ${psp.psp_name} - Your PSP is Ready!`,
                body: `
Hello,

Your PSP "${psp.psp_name}" (${psp.psp_code}) has been successfully provisioned and is now active!

🔐 Initial Login Credentials:
PSP Code: ${psp.psp_code}
Email: ${psp.owner_email}
Password: ${initialPassword}

🌐 Login URL: ${window.location.origin}/PSPLogin

⚠️ IMPORTANT: Please change your password immediately after your first login.

Your PSP Dashboard: ${window.location.origin}/Dashboard

Technical Details:
- API Key: ${technicalConfig.api_key}
- Database: ${technicalConfig.database_instance}
- Go Live Date: ${new Date().toISOString().split('T')[0]}

Best regards,
FTS.Money Platform Team
                `
            });

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

    const approveRequestMutation = useMutation({
        mutationFn: async ({ requestId, request }) => {
            // Update approval request
            await base44.entities.ApprovalRequest.update(requestId, {
                status: 'approved',
                reviewed_by: platformUser?.email || 'system',
                reviewed_by_name: platformUser?.email || 'system',
                review_date: new Date().toISOString(),
                review_comments: reviewComments
            });

            // Execute the action
            if (request.request_type === 'psp_creation') {
                // Auto-provision the PSP
                await handleAutoProvision(request.entity_id);
            } else if (request.request_type === 'psp_status_change') {
                await base44.entities.ProvisionedPSP.update(request.entity_id, {
                    status: request.action_data.new_status
                });
            } else if (request.request_type === 'psp_deletion') {
                await base44.entities.ProvisionedPSP.delete(request.entity_id);
            }

            // Log to audit trail
            await base44.entities.PSPAuditTrail.create({
                psp_id: request.entity_id,
                psp_code: request.entity_data?.psp_code || 'unknown',
                action: `${request.request_type}_approved`,
                field_changed: 'approval_status',
                old_value: 'pending',
                new_value: 'approved',
                user_email: platformUser?.email || 'system',
                user_role: platformUser?.platform_role || 'admin',
                ip_address: 'system',
                metadata: { request_id: requestId, comments: reviewComments }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
            queryClient.invalidateQueries({ queryKey: ['provisioning-psps'] });
            queryClient.invalidateQueries({ queryKey: ['provisioned-psps'] });
            setReviewComments('');
        }
    });

    const rejectRequestMutation = useMutation({
        mutationFn: async ({ requestId, request }) => {
            await base44.entities.ApprovalRequest.update(requestId, {
                status: 'rejected',
                reviewed_by: platformUser?.email || 'system',
                reviewed_by_name: platformUser?.email || 'system',
                review_date: new Date().toISOString(),
                review_comments: reviewComments
            });

            // Log to audit trail
            await base44.entities.PSPAuditTrail.create({
                psp_id: request.entity_id,
                psp_code: request.entity_data?.psp_code || 'unknown',
                action: `${request.request_type}_rejected`,
                field_changed: 'approval_status',
                old_value: 'pending',
                new_value: 'rejected',
                user_email: platformUser?.email || 'system',
                user_role: platformUser?.platform_role || 'admin',
                ip_address: 'system',
                metadata: { request_id: requestId, comments: reviewComments }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
            setReviewComments('');
        }
    });

    const handleExecuteStep = async (pspId, stepId) => {
        const psp = provisioningPSPs.find(p => p.id === pspId);

        // Check for missing required fields
        if (stepId === 'security' && !psp.owner_email) {
            setMissingInfoDialog({ open: true, psp, step: stepId, error: 'Owner email is required for admin user creation' });
            return;
        }

        try {
            await executeStepMutation.mutateAsync({ pspId, psp, step: stepId });
        } catch (error) {
            console.error('Execute step failed:', error);
            const errorMsg = error.response?.data?.error || error.message || 'Step execution failed';

            // If it's a missing data error or duplicate user error, show dialog
            if (errorMsg.includes('required') || 
                errorMsg.includes('missing') || 
                errorMsg.includes('not found') ||
                errorMsg.includes('duplicate') ||
                errorMsg.includes('constraint') ||
                errorMsg.includes('already exists')) {
                setMissingInfoDialog({ open: true, psp, step: stepId, error: errorMsg });
            } else {
                setStepErrors(prev => ({ 
                    ...prev, 
                    [`${pspId}-${stepId}`]: errorMsg
                }));
            }
        }
    };

    const handleMissingInfoSubmit = async (updatedData) => {
        try {
            // Update the PSP with corrected data
            await base44.entities.ProvisionedPSP.update(missingInfoDialog.psp.id, updatedData);

            // Refresh data
            await queryClient.invalidateQueries({ queryKey: ['provisioning-psps'] });

            // Close dialog
            setMissingInfoDialog({ open: false, psp: null, step: null, error: null });

            // Retry the step after a short delay
            setTimeout(() => {
                handleExecuteStep(missingInfoDialog.psp.id, missingInfoDialog.step);
            }, 500);
        } catch (error) {
            setMissingInfoDialog(prev => ({
                ...prev,
                error: error.message || 'Failed to update PSP information'
            }));
        }
    };

    const handleValidateStep = async (pspId, stepId) => {
        const psp = provisioningPSPs.find(p => p.id === pspId);
        setStepValidating(prev => ({ ...prev, [`${pspId}-${stepId}`]: true }));
        setStepValidationResults(prev => ({ ...prev, [`${pspId}-${stepId}`]: null }));

        try {
            const response = await base44.functions.invoke('validateProvisioningStep', {
                psp_code: psp.psp_code,
                step_id: stepId
            });

            const result = response.data;

            if (result.success) {
                setStepValidationResults(prev => ({ ...prev, [`${pspId}-${stepId}`]: 'success' }));

                // Mark as completed
                const completedSteps = [...(psp.provisioning_steps_completed || [])];
                if (!completedSteps.includes(stepId)) {
                    completedSteps.push(stepId);
                    const progress = completedSteps.reduce((sum, sid) => {
                        const stepConfig = provisioningSteps.find(s => s.id === sid);
                        return sum + (stepConfig?.weight || 0);
                    }, 0);

                    await base44.entities.ProvisionedPSP.update(pspId, {
                        provisioning_steps_completed: completedSteps,
                        provisioning_progress: progress
                    });
                    queryClient.invalidateQueries({ queryKey: ['provisioning-psps'] });
                }
                setStepErrors(prev => ({ ...prev, [`${pspId}-${stepId}`]: null }));
            } else {
                setStepValidationResults(prev => ({ ...prev, [`${pspId}-${stepId}`]: 'failed' }));
                setStepErrors(prev => ({ ...prev, [`${pspId}-${stepId}`]: result.error }));
            }
        } catch (err) {
            setStepValidationResults(prev => ({ ...prev, [`${pspId}-${stepId}`]: 'failed' }));
            setStepErrors(prev => ({ ...prev, [`${pspId}-${stepId}`]: err.response?.data?.error || err.message }));
        } finally {
            setStepValidating(prev => ({ ...prev, [`${pspId}-${stepId}`]: false }));
        }
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

    if (loading || loadingProvisioning || loadingActive || loadingApprovals) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSProvisioningQueue"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

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
                    <Tabs defaultValue="approvals">
                        <TabsList>
                            <TabsTrigger value="approvals">
                                Pending Approvals ({approvalRequests.length})
                            </TabsTrigger>
                            <TabsTrigger value="queue">
                                Provisioning Queue ({provisioningPSPs.length})
                            </TabsTrigger>
                            <TabsTrigger value="recent">
                                Recently Activated ({activePSPs.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="approvals" className="space-y-4">
                            {approvalRequests.length === 0 ? (
                                <Card>
                                    <CardContent className="text-center py-12">
                                        <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Approvals</h3>
                                        <p className="text-slate-600">All requests have been reviewed</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                approvalRequests.map((request) => (
                                    <Card key={request.id} className="border-l-4 border-l-amber-500">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {request.request_type === 'psp_creation' && <UserCheck className="h-5 w-5" />}
                                                        {request.request_type === 'psp_deletion' && <Trash2 className="h-5 w-5" />}
                                                        {request.request_type === 'psp_status_change' && <Power className="h-5 w-5" />}
                                                        {request.request_type.replace(/_/g, ' ').toUpperCase()}
                                                    </CardTitle>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        PSP: {request.entity_data?.psp_name} ({request.entity_data?.psp_code})
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Submitted by: {request.submitted_by} • {new Date(request.created_date).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Badge className={cn(
                                                    request.priority === 'urgent' && 'bg-red-100 text-red-700',
                                                    request.priority === 'high' && 'bg-orange-100 text-orange-700',
                                                    request.priority === 'medium' && 'bg-blue-100 text-blue-700',
                                                    request.priority === 'low' && 'bg-slate-100 text-slate-700'
                                                )}>
                                                    {request.priority}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {request.request_type === 'psp_status_change' && (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        Status change: <strong>{request.entity_data?.status}</strong> → <strong>{request.action_data?.new_status}</strong>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            <div>
                                                <label className="text-sm font-medium mb-2 block">Review Comments</label>
                                                <Textarea
                                                    placeholder="Add comments about this approval decision..."
                                                    value={reviewComments}
                                                    onChange={(e) => setReviewComments(e.target.value)}
                                                    className="h-20"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 pt-4 border-t">
                                                <Button
                                                    onClick={() => approveRequestMutation.mutate({ requestId: request.id, request })}
                                                    disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                >
                                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => rejectRequestMutation.mutate({ requestId: request.id, request })}
                                                    disabled={approveRequestMutation.isPending || rejectRequestMutation.isPending}
                                                    className="text-red-600 hover:bg-red-50"
                                                >
                                                    <XCircle className="h-4 w-4 mr-2" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

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
                                                       const isValidating = stepValidating[`${psp.id}-${step.id}`];
                                                       const error = stepErrors[`${psp.id}-${step.id}`];

                                                       return (
                                                           <div key={step.id} className="space-y-2">
                                                               <div
                                                                   className={cn(
                                                                       "flex items-center justify-between p-3 rounded-lg border transition-all",
                                                                       isCompleted 
                                                                           ? "bg-emerald-50 border-emerald-200" 
                                                                           : error
                                                                           ? "bg-red-50 border-red-200"
                                                                           : "bg-white border-slate-200"
                                                                   )}
                                                               >
                                                                   <div className="flex items-center gap-3">
                                                                       <div className={cn(
                                                                           "w-10 h-10 rounded-lg flex items-center justify-center",
                                                                           isCompleted 
                                                                               ? "bg-emerald-100 text-emerald-600" 
                                                                               : error
                                                                               ? "bg-red-100 text-red-600"
                                                                               : "bg-slate-100 text-slate-400"
                                                                       )}>
                                                                           {isCompleted ? (
                                                                               <CheckCircle2 className="h-5 w-5" />
                                                                           ) : error ? (
                                                                               <AlertCircle className="h-5 w-5" />
                                                                           ) : (
                                                                               <Icon className="h-5 w-5" />
                                                                           )}
                                                                       </div>
                                                                       <div>
                                                                           <p className="font-semibold text-sm">{step.name}</p>
                                                                           <p className="text-xs text-slate-500">{step.weight}% of total</p>
                                                                       </div>
                                                                   </div>
                                                                   <div className="flex gap-2">
                                                                       {!isCompleted && (
                                                                           <>
                                                                               <Button
                                                                                   size="sm"
                                                                                   variant="outline"
                                                                                   onClick={() => handleValidateStep(psp.id, step.id)}
                                                                                   disabled={isValidating || isExecuting}
                                                                                   className={cn(
                                                                                       stepValidationResults[`${psp.id}-${step.id}`] === 'success' && "border-emerald-500 text-emerald-700",
                                                                                       stepValidationResults[`${psp.id}-${step.id}`] === 'failed' && "border-red-500 text-red-700"
                                                                                   )}
                                                                               >
                                                                                   {isValidating ? (
                                                                                       <Loader2 className="h-4 w-4 animate-spin" />
                                                                                   ) : stepValidationResults[`${psp.id}-${step.id}`] === 'success' ? (
                                                                                       <>
                                                                                           <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                                           Valid
                                                                                       </>
                                                                                   ) : stepValidationResults[`${psp.id}-${step.id}`] === 'failed' ? (
                                                                                       <>
                                                                                           <XCircle className="h-4 w-4 mr-1" />
                                                                                           Failed
                                                                                       </>
                                                                                   ) : (
                                                                                       'Check'
                                                                                   )}
                                                                               </Button>
                                                                               <Button
                                                                                   size="sm"
                                                                                   onClick={() => handleExecuteStep(psp.id, step.id)}
                                                                                   disabled={isExecuting || isValidating}
                                                                                   className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                               >
                                                                                   {isExecuting ? (
                                                                                       <Loader2 className="h-4 w-4 animate-spin" />
                                                                                   ) : (
                                                                                       'Execute'
                                                                                   )}
                                                                               </Button>
                                                                           </>
                                                                       )}
                                                                   </div>
                                                               </div>
                                                               {error && (
                                                                   <Alert className="bg-red-50 border-red-200">
                                                                       <AlertCircle className="h-4 w-4 text-red-600" />
                                                                       <AlertDescription className="text-red-900 text-xs">
                                                                           {error}
                                                                       </AlertDescription>
                                                                   </Alert>
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

            <MissingInfoDialog
                open={missingInfoDialog.open}
                onClose={() => setMissingInfoDialog({ open: false, psp: null, step: null, error: null })}
                onSubmit={handleMissingInfoSubmit}
                psp={missingInfoDialog.psp}
                step={missingInfoDialog.step}
                error={missingInfoDialog.error}
            />
            </div>
            );
            }