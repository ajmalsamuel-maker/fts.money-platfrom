import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, FileText, CheckCircle2, AlertTriangle, Download, LogOut, MessageSquare, Upload, Calendar, Send, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function QSAPortalDashboard() {
    const [qsaSession, setQsaSession] = useState(null);
    const [messageDialog, setMessageDialog] = useState(false);
    const [uploadDialog, setUploadDialog] = useState(false);
    const [taskDialog, setTaskDialog] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        const session = localStorage.getItem('qsa_session');
        if (!session) {
            window.location.href = createPageUrl('QSAPortalLogin');
            return;
        }
        setQsaSession(JSON.parse(session));
    }, []);

    const { data: requirements } = useQuery({
        queryKey: ['pci-requirements'],
        queryFn: () => base44.entities.PCIRequirement.list(),
        enabled: !!qsaSession
    });

    const { data: evidence } = useQuery({
        queryKey: ['pci-evidence'],
        queryFn: () => base44.entities.PCIEvidence.list('-created_date', 200),
        enabled: !!qsaSession
    });

    const { data: findings } = useQuery({
        queryKey: ['pci-findings'],
        queryFn: () => base44.entities.PCIFinding.list(),
        enabled: !!qsaSession
    });

    const { data: controls } = useQuery({
        queryKey: ['pci-controls'],
        queryFn: () => base44.entities.PCIControl.list(),
        enabled: !!qsaSession
    });

    const { data: policies } = useQuery({
        queryKey: ['pci-policies'],
        queryFn: () => base44.entities.PCIPolicy.list(),
        enabled: !!qsaSession
    });

    const { data: messages } = useQuery({
        queryKey: ['qsa-messages'],
        queryFn: () => base44.entities.QSAMessage.list('-created_date', 100),
        enabled: !!qsaSession
    });

    const { data: tasks } = useQuery({
        queryKey: ['qsa-tasks'],
        queryFn: () => base44.entities.QSAAuditTask.list(),
        enabled: !!qsaSession
    });

    const { data: reports } = useQuery({
        queryKey: ['qsa-reports'],
        queryFn: () => base44.entities.QSAUploadedReport.list('-created_date', 50),
        enabled: !!qsaSession
    });

    const createMessageMutation = useMutation({
        mutationFn: (data) => base44.entities.QSAMessage.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['qsa-messages']);
            setMessageDialog(false);
            toast.success('Message sent successfully');
        }
    });

    const createTaskMutation = useMutation({
        mutationFn: (data) => base44.entities.QSAAuditTask.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['qsa-tasks']);
            setTaskDialog(false);
            toast.success('Task created successfully');
        }
    });

    const createReportMutation = useMutation({
        mutationFn: (data) => base44.entities.QSAUploadedReport.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['qsa-reports']);
            setUploadDialog(false);
            toast.success('Report uploaded successfully');
        }
    });

    const handleLogout = () => {
        localStorage.removeItem('qsa_session');
        window.location.href = createPageUrl('QSAPortalLogin');
    };

    const handleExport = async () => {
        try {
            const response = await base44.functions.invoke('exportPCIPackage', {});
            if (response.data?.download_url) {
                window.open(response.data.download_url, '_blank');
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (!qsaSession) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const totalRequirements = requirements?.length || 0;
    const completedRequirements = requirements?.filter(r => r.compliance_status === 'completed').length || 0;
    const overallCompliance = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

    const openFindings = findings?.filter(f => f.status === 'open') || [];
    const criticalFindings = openFindings.filter(f => f.severity === 'critical').length;

    const myTasks = tasks?.filter(t => t.assigned_type === 'qsa') || [];
    const pendingMessages = messages?.filter(m => m.status === 'pending_response' && m.sender_type === 'internal') || [];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">QSA Workspace</h1>
                                <p className="text-sm text-slate-600">Collaborative Compliance Assessment Portal</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">{qsaSession.email}</p>
                                <p className="text-xs text-slate-500">QSA Assessor</p>
                            </div>
                            <Button variant="outline" onClick={handleExport}>
                                <Download className="h-4 w-4 mr-2" />
                                Export All
                            </Button>
                            <Button variant="ghost" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Compliance</CardDescription>
                            <CardTitle className="text-2xl">{overallCompliance}%</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Evidence</CardDescription>
                            <CardTitle className="text-2xl">{evidence?.length || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Open Findings</CardDescription>
                            <CardTitle className="text-2xl text-red-600">{openFindings.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>My Tasks</CardDescription>
                            <CardTitle className="text-2xl">{myTasks.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Messages</CardDescription>
                            <CardTitle className="text-2xl">{pendingMessages.length}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Main Workspace */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="messages">
                            Messages {pendingMessages.length > 0 && <Badge className="ml-2">{pendingMessages.length}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="reports">My Reports</TabsTrigger>
                        <TabsTrigger value="generate">AI Report Generator</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks & Timeline</TabsTrigger>
                        <TabsTrigger value="evidence">Evidence Review</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Requirements Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {requirements?.slice(0, 12).map((req) => (
                                            <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm">{req.requirement_number}</p>
                                                    <p className="text-xs text-slate-600 truncate">{req.requirement_title}</p>
                                                </div>
                                                <Badge variant={req.compliance_status === 'completed' ? 'default' : 'secondary'}>
                                                    {req.compliance_status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Critical Findings</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {findings?.filter(f => f.severity === 'critical' || f.severity === 'high').slice(0, 10).map((finding) => (
                                            <div key={finding.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                                <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                                                    finding.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                                                }`} />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{finding.finding_title}</p>
                                                    <p className="text-xs text-slate-500">Req {finding.requirement_number}</p>
                                                </div>
                                                <Badge>{finding.severity}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Messages Tab */}
                    <TabsContent value="messages">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Communications</CardTitle>
                                    <NewMessageDialog 
                                        open={messageDialog}
                                        onOpenChange={setMessageDialog}
                                        qsaEmail={qsaSession.email}
                                        onSubmit={(data) => createMessageMutation.mutate(data)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {messages?.map((msg) => (
                                        <div key={msg.id} className={`p-4 rounded-lg border ${
                                            msg.sender_type === 'qsa' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                                        }`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-semibold text-sm">{msg.subject}</p>
                                                    <p className="text-xs text-slate-500">
                                                        From: {msg.sender_email} ({msg.sender_type})
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge>{msg.priority}</Badge>
                                                    <Badge variant="outline">{msg.status}</Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700">{msg.message}</p>
                                            {msg.requirement_number && (
                                                <p className="text-xs text-slate-500 mt-2">Related: Req {msg.requirement_number}</p>
                                            )}
                                        </div>
                                    ))}
                                    {messages?.length === 0 && (
                                        <p className="text-center text-slate-500 py-8">No messages yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Uploaded Reports</CardTitle>
                                    <UploadReportDialog
                                        open={uploadDialog}
                                        onOpenChange={setUploadDialog}
                                        qsaEmail={qsaSession.email}
                                        onSubmit={(data) => createReportMutation.mutate(data)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {reports?.map((report) => (
                                        <div key={report.id} className="p-4 bg-slate-50 rounded-lg border">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold">{report.report_title}</p>
                                                    <p className="text-sm text-slate-600">{report.description}</p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Type: {report.report_type} • Uploaded: {new Date(report.created_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge>{report.status}</Badge>
                                                    {report.file_url && (
                                                        <Button size="sm" variant="ghost" onClick={() => window.open(report.file_url, '_blank')}>
                                                            <Download className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {reports?.length === 0 && (
                                        <p className="text-center text-slate-500 py-8">No reports uploaded yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tasks Tab */}
                    <TabsContent value="tasks">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Audit Tasks & Timeline</CardTitle>
                                    <NewTaskDialog
                                        open={taskDialog}
                                        onOpenChange={setTaskDialog}
                                        onSubmit={(data) => createTaskMutation.mutate(data)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {tasks?.map((task) => (
                                        <div key={task.id} className="p-4 bg-slate-50 rounded-lg border">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold">{task.task_title}</p>
                                                    <p className="text-sm text-slate-600">{task.task_description}</p>
                                                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                                        <span>Assigned: {task.assigned_to} ({task.assigned_type})</span>
                                                        {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                                                        {task.status}
                                                    </Badge>
                                                    <Badge>{task.priority}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {tasks?.length === 0 && (
                                        <p className="text-center text-slate-500 py-8">No tasks yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Report Generator Tab */}
                    <TabsContent value="generate">
                        <AIReportGenerator 
                            qsaEmail={qsaSession.email}
                            requirements={requirements}
                            findings={findings}
                            reports={reports}
                        />
                    </TabsContent>

                    {/* Evidence Tab */}
                    <TabsContent value="evidence">
                        <Card>
                            <CardHeader>
                                <CardTitle>Evidence Documents ({evidence?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {evidence?.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{item.title}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>Req {item.requirement_number}</span>
                                                    <span>•</span>
                                                    <span>{item.evidence_type}</span>
                                                    <span>•</span>
                                                    <Badge variant="outline">{item.status}</Badge>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => window.open(item.file_url, '_blank')}
                                            >
                                                <Download className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

// New Message Dialog Component
function NewMessageDialog({ open, onOpenChange, qsaEmail, onSubmit }) {
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        requirement_number: '',
        priority: 'medium'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            sender_email: qsaEmail,
            sender_type: 'qsa',
            status: 'open'
        });
        setFormData({ subject: '', message: '', requirement_number: '', priority: 'medium' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Send className="h-4 w-4 mr-2" />
                    New Message
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Send Message to Internal Team</DialogTitle>
                    <DialogDescription>Ask questions or request clarification on findings/evidence</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Subject</label>
                        <Input
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                            rows={5}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Related Requirement (Optional)</label>
                            <Input
                                value={formData.requirement_number}
                                onChange={(e) => setFormData({...formData, requirement_number: e.target.value})}
                                placeholder="e.g., 1.2.3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Send Message</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Upload Report Dialog Component
function UploadReportDialog({ open, onOpenChange, qsaEmail, onSubmit }) {
    const [formData, setFormData] = useState({
        report_title: '',
        report_type: 'preliminary_findings',
        description: '',
        file_url: ''
    });
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const result = await base44.integrations.Core.UploadFile({ file });
            setFormData({...formData, file_url: result.file_url});
            toast.success('File uploaded');
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            uploaded_by_qsa: qsaEmail,
            upload_date: new Date().toISOString(),
            status: 'submitted'
        });
        setFormData({ report_title: '', report_type: 'preliminary_findings', description: '', file_url: '' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Report
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Upload Audit Report</DialogTitle>
                    <DialogDescription>Submit findings, assessments, or documentation</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Report Title</label>
                        <Input
                            value={formData.report_title}
                            onChange={(e) => setFormData({...formData, report_title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Report Type</label>
                        <Select value={formData.report_type} onValueChange={(v) => setFormData({...formData, report_type: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="preliminary_findings">Preliminary Findings</SelectItem>
                                <SelectItem value="final_audit_report">Final Audit Report</SelectItem>
                                <SelectItem value="gap_analysis">Gap Analysis</SelectItem>
                                <SelectItem value="remediation_plan">Remediation Plan</SelectItem>
                                <SelectItem value="aoc">Attestation of Compliance</SelectItem>
                                <SelectItem value="technical_assessment">Technical Assessment</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Upload File</label>
                        <Input type="file" onChange={handleFileUpload} disabled={uploading} />
                        {formData.file_url && (
                            <p className="text-xs text-green-600 mt-1">✓ File uploaded successfully</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={!formData.file_url}>Submit Report</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// New Task Dialog Component
function NewTaskDialog({ open, onOpenChange, onSubmit }) {
    const [formData, setFormData] = useState({
        task_title: '',
        task_description: '',
        assigned_to: '',
        assigned_type: 'internal',
        due_date: '',
        priority: 'medium',
        requirement_number: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            status: 'pending'
        });
        setFormData({ 
            task_title: '', 
            task_description: '', 
            assigned_to: '', 
            assigned_type: 'internal',
            due_date: '', 
            priority: 'medium',
            requirement_number: ''
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    New Task
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Audit Task</DialogTitle>
                    <DialogDescription>Assign tasks to track audit timeline</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Task Title</label>
                        <Input
                            value={formData.task_title}
                            onChange={(e) => setFormData({...formData, task_title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            value={formData.task_description}
                            onChange={(e) => setFormData({...formData, task_description: e.target.value})}
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Assign To (Email)</label>
                            <Input
                                type="email"
                                value={formData.assigned_to}
                                onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Assigned Type</label>
                            <Select value={formData.assigned_type} onValueChange={(v) => setFormData({...formData, assigned_type: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="internal">Internal Team</SelectItem>
                                    <SelectItem value="qsa">QSA Team</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium">Due Date</label>
                            <Input
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Requirement</label>
                            <Input
                                value={formData.requirement_number}
                                onChange={(e) => setFormData({...formData, requirement_number: e.target.value})}
                                placeholder="e.g., 1.2.3"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Create Task</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}