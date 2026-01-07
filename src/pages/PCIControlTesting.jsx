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
import { CheckCircle2, XCircle, Clock, Plus, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIControlTesting() {
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });
    const queryClient = useQueryClient();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [testData, setTestData] = useState({
        requirement_number: '',
        control_name: '',
        control_description: '',
        test_type: 'internal_audit',
        test_date: new Date().toISOString().split('T')[0],
        test_result: 'not_tested'
    });

    const { data: controls, isLoading } = useQuery({
        queryKey: ['pci-controls'],
        queryFn: () => base44.entities.PCIControl.list('-test_date', 100),
        enabled: !loading
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PCIControl.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-controls'] });
            toast.success('Control test recorded');
            setShowAddDialog(false);
            setTestData({
                requirement_number: '',
                control_name: '',
                control_description: '',
                test_type: 'internal_audit',
                test_date: new Date().toISOString().split('T')[0],
                test_result: 'not_tested'
            });
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const testTypes = [
        { value: 'asv_scan', label: 'ASV Scan' },
        { value: 'penetration_test', label: 'Penetration Test' },
        { value: 'internal_audit', label: 'Internal Audit' },
        { value: 'vulnerability_scan', label: 'Vulnerability Scan' },
        { value: 'code_review', label: 'Code Review' },
        { value: 'configuration_review', label: 'Configuration Review' },
        { value: 'access_review', label: 'Access Review' },
        { value: 'log_review', label: 'Log Review' }
    ];

    const resultConfig = {
        passed: { label: 'Passed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        passed_with_exceptions: { label: 'Passed (Exceptions)', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: XCircle },
        not_tested: { label: 'Not Tested', color: 'bg-slate-100 text-slate-700', icon: Clock }
    };

    const handleSubmit = () => {
        if (!testData.requirement_number || !testData.control_name) {
            toast.error('Please fill in required fields');
            return;
        }

        createMutation.mutate({
            ...testData,
            tester_name: user?.email
        });
    };

    // Group by requirement
    const groupedControls = controls?.reduce((acc, control) => {
        const req = control.requirement_number;
        if (!acc[req]) acc[req] = [];
        acc[req].push(control);
        return acc;
    }, {}) || {};

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIControlTesting"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Control Testing</h1>
                            <p className="text-slate-600">Test and validate security controls</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Record Test
                        </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Total Tests</CardDescription>
                                <CardTitle className="text-2xl">{controls?.length || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Passed</CardDescription>
                                <CardTitle className="text-2xl text-green-600">
                                    {controls?.filter(c => c.test_result === 'passed').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Failed</CardDescription>
                                <CardTitle className="text-2xl text-red-600">
                                    {controls?.filter(c => c.test_result === 'failed').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Exceptions</CardDescription>
                                <CardTitle className="text-2xl text-yellow-600">
                                    {controls?.filter(c => c.test_result === 'passed_with_exceptions').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Control Tests by Requirement */}
                    {isLoading ? (
                        <div className="text-center py-12">Loading control tests...</div>
                    ) : Object.keys(groupedControls).length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-slate-500">
                                No control tests recorded yet. Start testing!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(groupedControls).map(([req, tests]) => (
                                <Card key={req}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Requirement {req}</CardTitle>
                                        <CardDescription>{tests.length} control tests</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {tests.map((test) => {
                                                const ResultIcon = resultConfig[test.test_result]?.icon || Clock;
                                                return (
                                                    <div key={test.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <ResultIcon className="h-5 w-5" />
                                                                <h4 className="font-semibold">{test.control_name}</h4>
                                                                <Badge className={resultConfig[test.test_result]?.color}>
                                                                    {resultConfig[test.test_result]?.label}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                                                <span>Type: {test.test_type.replace('_', ' ')}</span>
                                                                <span>•</span>
                                                                <span>Tested: {new Date(test.test_date).toLocaleDateString()}</span>
                                                                {test.findings_count > 0 && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-red-600">
                                                                            {test.findings_count} findings
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Add Test Dialog */}
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Record Control Test</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">PCI Requirement *</label>
                                    <Input 
                                        placeholder="e.g., 1.1.1, 2.3, 12.1"
                                        value={testData.requirement_number}
                                        onChange={(e) => setTestData({...testData, requirement_number: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Control Name *</label>
                                    <Input 
                                        placeholder="Name of the control being tested"
                                        value={testData.control_name}
                                        onChange={(e) => setTestData({...testData, control_name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea 
                                        placeholder="Describe the control"
                                        value={testData.control_description}
                                        onChange={(e) => setTestData({...testData, control_description: e.target.value})}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Test Type *</label>
                                        <Select 
                                            value={testData.test_type}
                                            onValueChange={(value) => setTestData({...testData, test_type: value})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {testTypes.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Test Date *</label>
                                        <Input 
                                            type="date"
                                            value={testData.test_date}
                                            onChange={(e) => setTestData({...testData, test_date: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Test Result *</label>
                                    <Select 
                                        value={testData.test_result}
                                        onValueChange={(value) => setTestData({...testData, test_result: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="passed">Passed</SelectItem>
                                            <SelectItem value="passed_with_exceptions">Passed with Exceptions</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                            <SelectItem value="not_tested">Not Tested</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Saving...' : 'Save Test'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}