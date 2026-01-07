import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, CheckCircle2, Clock, AlertCircle, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIRequirementsTracker() {
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });
    const queryClient = useQueryClient();
    const [selectedRequirement, setSelectedRequirement] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);

    const { data: requirements, isLoading } = useQuery({
        queryKey: ['pci-requirements'],
        queryFn: () => base44.entities.PCIRequirement.list(),
        enabled: !loading
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.PCIRequirement.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-requirements'] });
            toast.success('Requirement updated');
            setSelectedRequirement(null);
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const mainRequirements = requirements?.filter(r => !r.parent_requirement) || [];
    const getSubRequirements = (parentNumber) => 
        requirements?.filter(r => r.parent_requirement === parentNumber) || [];

    const statusConfig = {
        not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-700', icon: AlertCircle },
        in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Clock },
        completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        not_applicable: { label: 'N/A', color: 'bg-slate-100 text-slate-500', icon: AlertCircle }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIRequirementsTracker"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">PCI DSS Requirements Tracker</h1>
                            <p className="text-slate-600">Track compliance across all 12 PCI DSS requirements</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Requirement
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">Loading requirements...</div>
                    ) : (
                        <div className="space-y-4">
                            {mainRequirements.map((req) => {
                                const subReqs = getSubRequirements(req.requirement_number);
                                const StatusIcon = statusConfig[req.compliance_status]?.icon || AlertCircle;
                                
                                return (
                                    <Card key={req.id}>
                                        <CardHeader className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRequirement(req)}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Shield className="h-5 w-5 text-blue-600" />
                                                        <CardTitle className="text-lg">
                                                            Requirement {req.requirement_number}: {req.requirement_title}
                                                        </CardTitle>
                                                        <Badge className={statusConfig[req.compliance_status]?.color}>
                                                            {statusConfig[req.compliance_status]?.label}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="line-clamp-2">{req.requirement_text}</CardDescription>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-400" />
                                            </div>
                                            <div className="mt-4">
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-slate-600">Progress</span>
                                                    <span className="font-medium">{req.completion_percentage || 0}%</span>
                                                </div>
                                                <Progress value={req.completion_percentage || 0} className="h-2" />
                                            </div>
                                        </CardHeader>
                                        
                                        {subReqs.length > 0 && (
                                            <CardContent>
                                                <div className="space-y-2">
                                                    {subReqs.map((sub) => (
                                                        <div 
                                                            key={sub.id}
                                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                                            onClick={() => setSelectedRequirement(sub)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <StatusIcon className="h-4 w-4 text-slate-500" />
                                                                <span className="text-sm font-medium">{sub.requirement_number}</span>
                                                                <span className="text-sm text-slate-700">{sub.requirement_title}</span>
                                                            </div>
                                                            <Badge variant="outline" className={statusConfig[sub.compliance_status]?.color}>
                                                                {statusConfig[sub.compliance_status]?.label}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Requirement Detail Dialog */}
                    <Dialog open={!!selectedRequirement} onOpenChange={() => setSelectedRequirement(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    Requirement {selectedRequirement?.requirement_number}
                                </DialogTitle>
                            </DialogHeader>
                            {selectedRequirement && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Select 
                                            value={selectedRequirement.compliance_status}
                                            onValueChange={(value) => {
                                                updateMutation.mutate({
                                                    id: selectedRequirement.id,
                                                    data: { compliance_status: value }
                                                });
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="not_started">Not Started</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="not_applicable">Not Applicable</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium">Completion %</label>
                                        <Input 
                                            type="number" 
                                            min="0" 
                                            max="100"
                                            value={selectedRequirement.completion_percentage || 0}
                                            onChange={(e) => {
                                                updateMutation.mutate({
                                                    id: selectedRequirement.id,
                                                    data: { completion_percentage: parseInt(e.target.value) }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Responsible Party</label>
                                        <Input 
                                            value={selectedRequirement.responsible_party || ''}
                                            onChange={(e) => {
                                                updateMutation.mutate({
                                                    id: selectedRequirement.id,
                                                    data: { responsible_party: e.target.value }
                                                });
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Notes</label>
                                        <Textarea 
                                            value={selectedRequirement.notes || ''}
                                            onChange={(e) => {
                                                updateMutation.mutate({
                                                    id: selectedRequirement.id,
                                                    data: { notes: e.target.value }
                                                });
                                            }}
                                            rows={4}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Last Tested</label>
                                            <Input 
                                                type="date" 
                                                value={selectedRequirement.last_tested_date || ''}
                                                onChange={(e) => {
                                                    updateMutation.mutate({
                                                        id: selectedRequirement.id,
                                                        data: { last_tested_date: e.target.value }
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Next Test Due</label>
                                            <Input 
                                                type="date" 
                                                value={selectedRequirement.next_test_due || ''}
                                                onChange={(e) => {
                                                    updateMutation.mutate({
                                                        id: selectedRequirement.id,
                                                        data: { next_test_due: e.target.value }
                                                    });
                                                }}
                                            />
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