import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Calendar, CheckCircle2, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIPolicyLibrary() {
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });
    const queryClient = useQueryClient();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [policyData, setPolicyData] = useState({
        policy_name: '',
        policy_category: 'security_policy',
        status: 'draft',
        summary: '',
        content: ''
    });

    const { data: policies, isLoading } = useQuery({
        queryKey: ['pci-policies'],
        queryFn: () => base44.entities.PCIPolicy.list('-created_date', 100),
        enabled: !loading
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PCIPolicy.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-policies'] });
            toast.success('Policy created');
            setShowAddDialog(false);
            setPolicyData({
                policy_name: '',
                policy_category: 'security_policy',
                status: 'draft',
                summary: '',
                content: ''
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PCIPolicy.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-policies'] });
            toast.success('Policy updated');
            setSelectedPolicy(null);
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const categories = [
        { value: 'security_policy', label: 'Security Policy' },
        { value: 'access_control', label: 'Access Control' },
        { value: 'data_protection', label: 'Data Protection' },
        { value: 'network_security', label: 'Network Security' },
        { value: 'vulnerability_management', label: 'Vulnerability Management' },
        { value: 'monitoring', label: 'Monitoring' },
        { value: 'incident_response', label: 'Incident Response' },
        { value: 'business_continuity', label: 'Business Continuity' },
        { value: 'acceptable_use', label: 'Acceptable Use' }
    ];

    const statusConfig = {
        draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
        under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
        approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
        active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
        archived: { label: 'Archived', color: 'bg-slate-100 text-slate-500' }
    };

    const handleSubmit = () => {
        if (!policyData.policy_name) {
            toast.error('Please enter a policy name');
            return;
        }

        createMutation.mutate({
            ...policyData,
            owner: user?.email,
            version: '1.0',
            effective_date: new Date().toISOString().split('T')[0]
        });
    };

    // Group by category
    const groupedPolicies = policies?.reduce((acc, policy) => {
        const cat = policy.policy_category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(policy);
        return acc;
    }, {}) || {};

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIPolicyLibrary"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Policy Library</h1>
                            <p className="text-slate-600">Manage security policies and procedures</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Policy
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Total Policies</CardDescription>
                                <CardTitle className="text-2xl">{policies?.length || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Active</CardDescription>
                                <CardTitle className="text-2xl text-green-600">
                                    {policies?.filter(p => p.status === 'active').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Under Review</CardDescription>
                                <CardTitle className="text-2xl text-blue-600">
                                    {policies?.filter(p => p.status === 'under_review').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Draft</CardDescription>
                                <CardTitle className="text-2xl text-slate-600">
                                    {policies?.filter(p => p.status === 'draft').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Archived</CardDescription>
                                <CardTitle className="text-2xl text-slate-400">
                                    {policies?.filter(p => p.status === 'archived').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Policies by Category */}
                    {isLoading ? (
                        <div className="text-center py-12">Loading policies...</div>
                    ) : Object.keys(groupedPolicies).length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-slate-500">
                                No policies created yet. Start building your policy library!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedPolicies).map(([category, categoryPolicies]) => (
                                <Card key={category}>
                                    <CardHeader>
                                        <CardTitle className="text-lg capitalize">
                                            {category.replace('_', ' ')}
                                        </CardTitle>
                                        <CardDescription>{categoryPolicies.length} policies</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {categoryPolicies.map((policy) => (
                                                <div 
                                                    key={policy.id} 
                                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                                    onClick={() => setSelectedPolicy(policy)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h4 className="font-semibold">{policy.policy_name}</h4>
                                                                <Badge className={statusConfig[policy.status]?.color}>
                                                                    {statusConfig[policy.status]?.label}
                                                                </Badge>
                                                                {policy.version && (
                                                                    <Badge variant="outline">v{policy.version}</Badge>
                                                                )}
                                                            </div>
                                                            {policy.summary && (
                                                                <p className="text-sm text-slate-600 line-clamp-1">{policy.summary}</p>
                                                            )}
                                                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                                                {policy.owner && <span>Owner: {policy.owner}</span>}
                                                                {policy.effective_date && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>Effective: {new Date(policy.effective_date).toLocaleDateString()}</span>
                                                                    </>
                                                                )}
                                                                {policy.next_review_date && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>Next Review: {new Date(policy.next_review_date).toLocaleDateString()}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Create Policy Dialog */}
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create New Policy</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Policy Name *</label>
                                    <Input 
                                        placeholder="e.g., Information Security Policy"
                                        value={policyData.policy_name}
                                        onChange={(e) => setPolicyData({...policyData, policy_name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Category *</label>
                                    <Select 
                                        value={policyData.policy_category}
                                        onValueChange={(value) => setPolicyData({...policyData, policy_category: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Summary</label>
                                    <Textarea 
                                        placeholder="Brief summary of this policy"
                                        value={policyData.summary}
                                        onChange={(e) => setPolicyData({...policyData, summary: e.target.value})}
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Policy Content</label>
                                    <Textarea 
                                        placeholder="Full policy text and procedures"
                                        value={policyData.content}
                                        onChange={(e) => setPolicyData({...policyData, content: e.target.value})}
                                        rows={8}
                                    />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Creating...' : 'Create Policy'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* View/Edit Policy Dialog */}
                    <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{selectedPolicy?.policy_name}</DialogTitle>
                            </DialogHeader>
                            {selectedPolicy && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Select 
                                            value={selectedPolicy.status}
                                            onValueChange={(value) => {
                                                updateMutation.mutate({
                                                    id: selectedPolicy.id,
                                                    data: { status: value }
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="under_review">Under Review</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedPolicy.summary && (
                                        <div>
                                            <label className="text-sm font-medium">Summary</label>
                                            <p className="text-sm text-slate-700 mt-1">{selectedPolicy.summary}</p>
                                        </div>
                                    )}

                                    {selectedPolicy.content && (
                                        <div>
                                            <label className="text-sm font-medium">Policy Content</label>
                                            <div className="mt-1 p-4 bg-slate-50 rounded-lg">
                                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedPolicy.content}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                        <div>
                                            <label className="text-sm font-medium">Version</label>
                                            <p className="text-sm text-slate-600">{selectedPolicy.version || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Owner</label>
                                            <p className="text-sm text-slate-600">{selectedPolicy.owner || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Effective Date</label>
                                            <p className="text-sm text-slate-600">
                                                {selectedPolicy.effective_date ? new Date(selectedPolicy.effective_date).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Review Frequency</label>
                                            <p className="text-sm text-slate-600 capitalize">
                                                {selectedPolicy.review_frequency?.replace('_', ' ') || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}