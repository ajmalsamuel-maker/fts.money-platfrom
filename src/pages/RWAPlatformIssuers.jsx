import React, { useState } from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Mail, Edit } from 'lucide-react';

export default function RWAPlatformIssuers() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [editingIssuer, setEditingIssuer] = useState(null);

    const { data: issuers = [] } = useQuery({
        queryKey: ['all-issuers'],
        queryFn: () => base44.entities.AssetIssuer.list('-created_date')
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await base44.entities.AssetIssuer.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['all-issuers']);
            setEditingIssuer(null);
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="RWAPlatformIssuers" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Asset Issuers</h2>
                        <p className="text-xs text-slate-600">View all asset issuers across RWA providers</p>
                    </div>
                </header>

                <div className="p-6">
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
                                                       <span className="text-xs text-slate-500">Provider: {issuer.provider_code}</span>
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
                                               <Button size="sm" variant="outline" onClick={() => setEditingIssuer(issuer)}>
                                                   <Edit className="h-3 w-3" />
                                               </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {issuers.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No asset issuers yet</p>
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
                                            value={editingIssuer.lei || ''}
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
                                        onClick={() => updateMutation.mutate({ id: editingIssuer.id, data: editingIssuer })}
                                        className="w-full"
                                        disabled={updateMutation.isPending}
                                    >
                                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </div>
    );
}