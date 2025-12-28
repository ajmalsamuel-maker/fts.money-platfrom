import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import AssetIssuerOnboardingWizard from '@/components/rwa/onboarding/AssetIssuerOnboardingWizard';
import IssuerAuditTrail from '@/components/rwa/IssuerAuditTrail';
import { Plus, Building2, Mail, Edit, Key, History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RWAProviderIssuers() {
    const { provider } = useRWAProviderAuth();
    const queryClient = useQueryClient();
    const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
    const [editingIssuer, setEditingIssuer] = useState(null);
    const [credentialsDialog, setCredentialsDialog] = useState(null);
    const [viewingAuditTrail, setViewingAuditTrail] = useState(null);

    const createAuditLog = async (issuerId, issuerCode, actionType, description, oldValues = null, newValues = null, severity = 'info') => {
        try {
            await base44.entities.IssuerAuditLog.create({
                issuer_id: issuerId,
                issuer_code: issuerCode,
                provider_code: provider.provider_code,
                action_type: actionType,
                action_description: description,
                performed_by: provider.email,
                performed_by_name: provider.company_name,
                old_values: oldValues,
                new_values: newValues,
                severity: severity,
                metadata: {
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    };

    const { data: issuers = [] } = useQuery({
        queryKey: ['issuers', provider?.provider_code],
        queryFn: () => base44.entities.AssetIssuer.filter({ provider_code: provider.provider_code }),
        enabled: !!provider
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data, originalData }) => {
            const updated = await base44.entities.AssetIssuer.update(id, data);
            
            // Create audit logs for changes
            const changes = {};
            const oldValues = {};
            const newValues = {};
            
            Object.keys(data).forEach(key => {
                if (originalData[key] !== data[key]) {
                    oldValues[key] = originalData[key];
                    newValues[key] = data[key];
                }
            });

            if (Object.keys(newValues).length > 0) {
                let actionType = 'issuer_updated';
                let description = 'Issuer details updated';
                let severity = 'info';

                if (newValues.status) {
                    actionType = newValues.status === 'suspended' ? 'suspension' : 
                                 newValues.status === 'terminated' ? 'termination' : 
                                 newValues.status === 'active' ? 'reactivation' : 'status_changed';
                    description = `Status changed from ${oldValues.status} to ${newValues.status}`;
                    severity = newValues.status === 'terminated' ? 'critical' : 
                               newValues.status === 'suspended' ? 'warning' : 'info';
                }
                
                if (newValues.kyb_status) {
                    actionType = 'kyb_status_changed';
                    description = `KYB status changed from ${oldValues.kyb_status} to ${newValues.kyb_status}`;
                    severity = newValues.kyb_status === 'rejected' ? 'warning' : 'info';
                }

                await createAuditLog(
                    id,
                    originalData.issuer_code,
                    actionType,
                    description,
                    oldValues,
                    newValues,
                    severity
                );
            }

            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['issuers']);
            queryClient.invalidateQueries(['issuer-audit']);
            setEditingIssuer(null);
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (issuer) => {
            const newPassword = Math.random().toString(36).slice(-8) + 'A1!';
            await base44.entities.AssetIssuer.update(issuer.id, { password_hash: newPassword });
            
            await createAuditLog(
                issuer.id,
                issuer.issuer_code,
                'password_reset',
                `Password reset for issuer ${issuer.company_name}`,
                null,
                { reset_by: provider.email },
                'warning'
            );
            
            await base44.integrations.Core.SendEmail({
                to: issuer.email,
                subject: `${provider.company_name} - Password Reset`,
                body: `Your password has been reset.\n\n=== NEW LOGIN CREDENTIALS ===\nIssuer Code: ${issuer.issuer_code}\nNew Password: ${newPassword}\n\nLogin URL: ${provider.portal_url || window.location.origin}/AssetIssuerLogin`
            });

            return { issuer, newPassword };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['issuer-audit']);
            setCredentialsDialog({ ...data.issuer, tempPassword: data.newPassword });
        }
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <RWAProviderSidebar 
                currentPage="RWAProviderIssuers"
                providerName={provider?.company_name}
                providerEmail={provider?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Asset Issuers</h1>
                            <p className="text-slate-600">Companies tokenizing assets through your platform</p>
                        </div>
                        <Button className="gap-2" onClick={() => setShowOnboardingWizard(true)}>
                            <Plus className="h-4 w-4" />
                            Onboard Issuer
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {issuers.map(issuer => (
                                    <div key={issuer.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{issuer.company_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs text-slate-600">{issuer.email}</span>
                                                    </div>
                                                    <div className="flex flex-col gap-1 mt-1">
                                                       <div className="flex items-center gap-2">
                                                           <span className="text-xs font-medium text-slate-700">Issuer Code:</span>
                                                           <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{issuer.issuer_code}</code>
                                                       </div>
                                                       <span className="text-xs text-slate-500">LEI: {issuer.lei || 'Grace Period'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2">
                                               <div className="text-right mr-2">
                                                   <div className="flex flex-col gap-1 items-end mb-2">
                                                       <Badge className={
                                                           issuer.status === 'active' ? 'bg-green-100 text-green-700' :
                                                           'bg-yellow-100 text-yellow-700'
                                                       }>
                                                           {issuer.status}
                                                       </Badge>
                                                       <Badge className={
                                                           issuer.kyb_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                           issuer.kyb_status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                           issuer.kyb_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                           'bg-orange-100 text-orange-700'
                                                       }>
                                                           KYB: {issuer.kyb_status}
                                                       </Badge>
                                                   </div>
                                                   <p className="text-xs text-slate-500">Assets: {issuer.total_assets_tokenized || 0}</p>
                                                   <p className="text-xs text-slate-500">Value: ${((issuer.total_value || 0) / 1000000).toFixed(1)}M</p>
                                               </div>
                                               <div className="flex flex-col gap-1">
                                                   <Button size="sm" variant="outline" onClick={() => setEditingIssuer(issuer)}>
                                                       <Edit className="h-3 w-3" />
                                                   </Button>
                                                   <Button size="sm" variant="outline" onClick={() => resetPasswordMutation.mutate(issuer)}>
                                                       <Key className="h-3 w-3" />
                                                   </Button>
                                                   <Button size="sm" variant="outline" onClick={() => setViewingAuditTrail(issuer)}>
                                                       <History className="h-3 w-3" />
                                                   </Button>
                                               </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {issuers.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No asset issuers yet. Click "Onboard Issuer" to start.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Dialog */}
                    {editingIssuer && (
                        <Dialog open={!!editingIssuer} onOpenChange={() => setEditingIssuer(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Issuer: {editingIssuer.company_name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 border rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-slate-700">Issuer Code:</span>
                                            <code className="text-sm bg-slate-200 px-2 py-1 rounded">{editingIssuer.issuer_code}</code>
                                        </div>
                                        <p className="text-xs text-slate-500">This code is used for login and cannot be changed</p>
                                    </div>
                                    <div>
                                        <Label>Company Name</Label>
                                        <Input
                                            value={editingIssuer.company_name}
                                            onChange={(e) => setEditingIssuer({...editingIssuer, company_name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>LEI</Label>
                                        <Input
                                            value={editingIssuer.lei}
                                            onChange={(e) => setEditingIssuer({...editingIssuer, lei: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            value={editingIssuer.email}
                                            onChange={(e) => setEditingIssuer({...editingIssuer, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select
                                            value={editingIssuer.status}
                                            onValueChange={(value) => {
                                                const updates = { status: value };
                                                if (value === 'active' && editingIssuer.kyb_status === 'pending') {
                                                    updates.kyb_status = 'approved';
                                                }
                                                setEditingIssuer({...editingIssuer, ...updates});
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending_kyb">Pending KYB</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="terminated">Terminated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>KYB Status</Label>
                                        <Select
                                            value={editingIssuer.kyb_status}
                                            onValueChange={(value) => setEditingIssuer({...editingIssuer, kyb_status: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {editingIssuer.kyb_status === 'approved' ? '✓ KYB verification complete' : 'KYB verification required before issuer can tokenize assets'}
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => {
                                            const { id, ...originalData } = editingIssuer;
                                            updateMutation.mutate({ 
                                                id: editingIssuer.id, 
                                                data: editingIssuer,
                                                originalData: originalData
                                            });
                                        }}
                                        className="w-full"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Credentials Dialog */}
                    {credentialsDialog && (
                        <Dialog open={!!credentialsDialog} onOpenChange={() => setCredentialsDialog(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-green-600" />
                                        Login Credentials Created
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-sm font-medium text-green-900 mb-3">
                                            Account created for: {credentialsDialog.company_name}
                                        </p>
                                        <div className="space-y-3">
                                            <div>
                                                <Label className="text-xs text-green-700">Issuer Code (Username)</Label>
                                                <code className="block bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono">
                                                    {credentialsDialog.issuer_code}
                                                </code>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-green-700">Temporary Password</Label>
                                                <code className="block bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono">
                                                    {credentialsDialog.tempPassword}
                                                </code>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-green-700">Login URL</Label>
                                                <code className="block bg-white border border-green-300 rounded px-3 py-2 text-xs">
                                                    {provider.portal_url || window.location.origin}/AssetIssuerLogin
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs text-blue-900">
                                            ✓ Credentials have been emailed to: <strong>{credentialsDialog.email}</strong>
                                        </p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            The issuer must complete KYB verification before tokenizing assets.
                                        </p>
                                    </div>
                                    <Button onClick={() => setCredentialsDialog(null)} className="w-full">
                                        Close
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Audit Trail Dialog */}
                    {viewingAuditTrail && (
                        <Dialog open={!!viewingAuditTrail} onOpenChange={() => setViewingAuditTrail(null)}>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>Audit Trail: {viewingAuditTrail.company_name}</DialogTitle>
                                </DialogHeader>
                                <div className="flex-1 overflow-hidden">
                                    <IssuerAuditTrail 
                                        issuerId={viewingAuditTrail.id} 
                                        issuerCode={viewingAuditTrail.issuer_code}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Onboarding Wizard */}
                    <AssetIssuerOnboardingWizard
                        open={showOnboardingWizard}
                        onClose={() => setShowOnboardingWizard(false)}
                        providerCode={provider?.provider_code}
                        providerEmail={provider?.email}
                        providerName={provider?.company_name}
                        onSuccess={async (issuerData) => {
                            queryClient.invalidateQueries(['issuers']);
                            
                            // Create initial audit log for issuer creation
                            if (issuerData.id) {
                                await createAuditLog(
                                    issuerData.id,
                                    issuerData.issuer_code,
                                    'issuer_created',
                                    `Asset issuer ${issuerData.company_name} onboarded to the platform`,
                                    null,
                                    {
                                        company_name: issuerData.company_name,
                                        status: issuerData.status,
                                        kyb_status: issuerData.kyb_status,
                                        lei: issuerData.lei || 'Grace Period'
                                    },
                                    'info'
                                );
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}