import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, Download, Sparkles, Calendar, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function PCIReportingDashboard() {
    const { platformUser, loading } = usePlatformAuth();
    const queryClient = useQueryClient();
    const [reportDialog, setReportDialog] = React.useState(false);
    const [reportConfig, setReportConfig] = React.useState({
        title: '',
        type: 'executive_summary',
        stakeholder: 'executive',
        period_start: '',
        period_end: '',
        format: 'pdf'
    });

    const { data: reports } = useQuery({
        queryKey: ['generated-reports'],
        queryFn: () => base44.entities.PCIGeneratedReport.list('-created_date', 50),
        enabled: !loading
    });

    const { data: requirements } = useQuery({
        queryKey: ['requirements'],
        queryFn: () => base44.entities.PCIRequirement.list(),
        enabled: !loading
    });

    const { data: findings } = useQuery({
        queryKey: ['findings'],
        queryFn: () => base44.entities.PCIFinding.list(),
        enabled: !loading
    });

    const generateReportMutation = useMutation({
        mutationFn: (data) => base44.functions.invoke('generateAdvancedReport', data),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['generated-reports']);
            setReportDialog(false);
            toast.success('Report generated successfully');
            
            if (response.data?.download_url) {
                const link = document.createElement('a');
                link.href = response.data.download_url;
                link.download = `${reportConfig.title || 'Report'}.pdf`;
                link.click();
            }
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    // Calculate dashboard metrics
    const complianceScore = requirements ? 
        ((requirements.filter(r => r.compliance_status === 'completed').length / requirements.length) * 100).toFixed(1) : 0;
    
    const trendData = reports?.slice(0, 6).reverse().map(r => ({
        date: new Date(r.created_date).toLocaleDateString(),
        score: parseFloat(r.metrics?.compliance_score || 0)
    })) || [];

    const findingsBySeverity = [
        { name: 'Critical', value: findings?.filter(f => f.severity === 'critical').length || 0, color: '#ef4444' },
        { name: 'High', value: findings?.filter(f => f.severity === 'high').length || 0, color: '#f97316' },
        { name: 'Medium', value: findings?.filter(f => f.severity === 'medium').length || 0, color: '#eab308' },
        { name: 'Low', value: findings?.filter(f => f.severity === 'low').length || 0, color: '#22c55e' }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PCIReportingDashboard"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900">Advanced Reporting</h1>
                            </div>
                            <p className="text-slate-600">Interactive dashboards and AI-powered report generation</p>
                        </div>
                        <Dialog open={reportDialog} onOpenChange={setReportDialog}>
                            <DialogTrigger asChild>
                                <Button size="lg">
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Generate Report
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Generate Custom Report</DialogTitle>
                                    <DialogDescription>Configure report parameters and AI will generate content</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Report Title</label>
                                        <Input
                                            value={reportConfig.title}
                                            onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})}
                                            placeholder="Q4 2025 Compliance Report"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Report Type</label>
                                            <Select value={reportConfig.type} onValueChange={(v) => setReportConfig({...reportConfig, type: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="executive_summary">Executive Summary</SelectItem>
                                                    <SelectItem value="detailed_audit">Detailed Audit</SelectItem>
                                                    <SelectItem value="regulatory_filing">Regulatory Filing</SelectItem>
                                                    <SelectItem value="gap_analysis">Gap Analysis</SelectItem>
                                                    <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                                                    <SelectItem value="board_report">Board Report</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Stakeholder</label>
                                            <Select value={reportConfig.stakeholder} onValueChange={(v) => setReportConfig({...reportConfig, stakeholder: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="executive">Executive</SelectItem>
                                                    <SelectItem value="board">Board of Directors</SelectItem>
                                                    <SelectItem value="qsa">QSA Auditor</SelectItem>
                                                    <SelectItem value="regulatory">Regulatory Body</SelectItem>
                                                    <SelectItem value="technical">Technical Team</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Period Start</label>
                                            <Input
                                                type="date"
                                                value={reportConfig.period_start}
                                                onChange={(e) => setReportConfig({...reportConfig, period_start: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Period End</label>
                                            <Input
                                                type="date"
                                                value={reportConfig.period_end}
                                                onChange={(e) => setReportConfig({...reportConfig, period_end: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Export Format</label>
                                        <Select value={reportConfig.format} onValueChange={(v) => setReportConfig({...reportConfig, format: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pdf">PDF</SelectItem>
                                                <SelectItem value="docx">DOCX</SelectItem>
                                                <SelectItem value="csv">CSV</SelectItem>
                                                <SelectItem value="all">All Formats</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => generateReportMutation.mutate(reportConfig)}
                                        disabled={generateReportMutation.isPending || !reportConfig.title}
                                    >
                                        {generateReportMutation.isPending ? 'Generating... (30-60s)' : 'Generate with AI'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Interactive Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Compliance Score</CardDescription>
                                <CardTitle className="text-3xl text-emerald-600">{complianceScore}%</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Reports Generated</CardDescription>
                                <CardTitle className="text-3xl">{reports?.length || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Open Findings</CardDescription>
                                <CardTitle className="text-3xl text-red-600">
                                    {findings?.filter(f => f.status === 'open').length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Requirements</CardDescription>
                                <CardTitle className="text-3xl">{requirements?.length || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance Trend</CardTitle>
                                <CardDescription>Score over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Findings by Severity</CardTitle>
                                <CardDescription>Current distribution</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={findingsBySeverity}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {findingsBySeverity.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Generated Reports */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Reports</CardTitle>
                            <CardDescription>Previously generated compliance reports</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {reports?.map((report) => (
                                    <div key={report.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-lg">{report.report_title}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge>{report.report_type.replace(/_/g, ' ')}</Badge>
                                                    <Badge variant="outline">{report.status}</Badge>
                                                    {report.generation_method === 'ai_assisted' && (
                                                        <Badge className="bg-purple-100 text-purple-700">
                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                            AI Generated
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-4 mt-2 text-sm text-slate-600">
                                                    <span>Generated: {new Date(report.created_date).toLocaleDateString()}</span>
                                                    {report.metrics?.compliance_score && (
                                                        <span>Score: {report.metrics.compliance_score}%</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {report.pdf_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const link = document.createElement('a');
                                                            link.href = report.pdf_url;
                                                            link.download = `${report.report_title}.pdf`;
                                                            link.click();
                                                        }}
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        PDF
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {reports?.length === 0 && (
                                    <div className="text-center py-12">
                                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600">No reports generated yet</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}