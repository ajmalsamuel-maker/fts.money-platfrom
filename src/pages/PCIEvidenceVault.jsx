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
import { Upload, FileText, Download, CheckCircle2, Clock, XCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function PCIEvidenceVault() {
    const { user, loading } = usePlatformAuth({ requiredPermissions: ['PSP:MANAGE'] });
    const queryClient = useQueryClient();
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [uploadData, setUploadData] = useState({
        requirement_number: '',
        evidence_type: 'document',
        title: '',
        description: '',
        validity_start: '',
        validity_end: ''
    });

    const { data: evidence, isLoading } = useQuery({
        queryKey: ['pci-evidence'],
        queryFn: () => base44.entities.PCIEvidence.list('-created_date', 200),
        enabled: !loading
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.PCIEvidence.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pci-evidence'] });
            toast.success('Evidence uploaded successfully');
            setShowUploadDialog(false);
            setUploadData({
                requirement_number: '',
                evidence_type: 'document',
                title: '',
                description: '',
                validity_start: '',
                validity_end: ''
            });
        }
    });

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        toast.loading('Uploading file...');
        
        try {
            const result = await base44.integrations.Core.UploadFile({ file });
            setUploadData(prev => ({
                ...prev,
                file_url: result.file_url,
                file_name: file.name,
                file_type: file.type
            }));
            toast.success('File uploaded');
        } catch (error) {
            toast.error('Upload failed');
        }
    };

    const handleSubmit = () => {
        if (!uploadData.requirement_number || !uploadData.title || !uploadData.file_url) {
            toast.error('Please fill in required fields and upload a file');
            return;
        }

        createMutation.mutate({
            ...uploadData,
            uploaded_by: user?.email,
            status: 'valid'
        });
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    // Filter evidence
    const filteredEvidence = evidence?.filter(e => {
        const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            e.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || e.evidence_type === filterType;
        const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    }) || [];

    const evidenceTypes = [
        { value: 'document', label: 'Document' },
        { value: 'screenshot', label: 'Screenshot' },
        { value: 'scan_report', label: 'Scan Report' },
        { value: 'log_file', label: 'Log File' },
        { value: 'configuration', label: 'Configuration' },
        { value: 'policy', label: 'Policy' },
        { value: 'procedure', label: 'Procedure' },
        { value: 'test_result', label: 'Test Result' },
        { value: 'certificate', label: 'Certificate' }
    ];

    const statusConfig = {
        valid: { label: 'Valid', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
        expiring_soon: { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
        expired: { label: 'Expired', color: 'bg-red-100 text-red-700', icon: XCircle },
        pending_review: { label: 'Pending Review', color: 'bg-blue-100 text-blue-700', icon: Clock }
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIEvidenceVault"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Evidence Vault</h1>
                            <p className="text-slate-600">Manage compliance evidence and documentation</p>
                        </div>
                        <Button onClick={() => setShowUploadDialog(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Evidence
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input 
                                        placeholder="Search evidence..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {evidenceTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="valid">Valid</SelectItem>
                                        <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="pending_review">Pending Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Evidence List */}
                    {isLoading ? (
                        <div className="text-center py-12">Loading evidence...</div>
                    ) : filteredEvidence.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-slate-500">
                                No evidence found. Upload your first document.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredEvidence.map((item) => {
                                const StatusIcon = statusConfig[item.status]?.icon || FileText;
                                return (
                                    <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between mb-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                <Badge className={statusConfig[item.status]?.color}>
                                                    {statusConfig[item.status]?.label}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base">{item.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Requirement:</span>
                                                    <Badge variant="outline">{item.requirement_number}</Badge>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Type:</span>
                                                    <span className="font-medium">{item.evidence_type.replace('_', ' ')}</span>
                                                </div>
                                                {item.validity_end && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Valid Until:</span>
                                                        <span className="font-medium">
                                                            {new Date(item.validity_end).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full mt-3"
                                                    onClick={() => window.open(item.file_url, '_blank')}
                                                >
                                                    <Download className="h-3 w-3 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Upload Dialog */}
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Upload Evidence</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">PCI Requirement *</label>
                                    <Input 
                                        placeholder="e.g., 1.1.1, 2.3, 12.1"
                                        value={uploadData.requirement_number}
                                        onChange={(e) => setUploadData({...uploadData, requirement_number: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Evidence Type *</label>
                                    <Select 
                                        value={uploadData.evidence_type}
                                        onValueChange={(value) => setUploadData({...uploadData, evidence_type: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {evidenceTypes.map(type => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Title *</label>
                                    <Input 
                                        placeholder="Brief title for this evidence"
                                        value={uploadData.title}
                                        onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea 
                                        placeholder="Describe this evidence"
                                        value={uploadData.description}
                                        onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Valid From</label>
                                        <Input 
                                            type="date"
                                            value={uploadData.validity_start}
                                            onChange={(e) => setUploadData({...uploadData, validity_start: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Valid Until</label>
                                        <Input 
                                            type="date"
                                            value={uploadData.validity_end}
                                            onChange={(e) => setUploadData({...uploadData, validity_end: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Upload File *</label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                                        <input
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            id="evidence-file"
                                        />
                                        <label htmlFor="evidence-file" className="cursor-pointer">
                                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600">
                                                {uploadData.file_name || 'Click to upload file'}
                                            </p>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                                        {createMutation.isPending ? 'Uploading...' : 'Upload Evidence'}
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