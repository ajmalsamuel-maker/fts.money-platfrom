import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from '@/api/base44Client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import {
    Download,
    Mail,
    Calendar,
    TrendingUp,
    FileText,
    Settings,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdvancedReportingDashboard() {
    const [loading, setLoading] = useState(false);
    const [reportConfig, setReportConfig] = useState({
        reportType: 'compliance_summary',
        countries: [],
        regions: [],
        statuses: [],
        dateFrom: '',
        dateTo: '',
        groupBy: 'country',
        includeCharts: true,
        format: 'pdf'
    });
    
    const [scheduleConfig, setScheduleConfig] = useState({
        enabled: false,
        frequency: 'weekly',
        dayOfWeek: 'monday',
        time: '09:00',
        recipients: '',
        reportType: 'compliance_summary'
    });

    const [complianceTrend, setComplianceTrend] = useState([
        { month: 'Jan 2025', compliant: 25, planning: 2, at_risk: 0 },
        { month: 'Feb 2025', compliant: 26, planning: 1, at_risk: 0 },
        { month: 'Mar 2025', compliant: 28, planning: 1, at_risk: 0 },
        { month: 'Apr 2025', compliant: 30, planning: 0, at_risk: 0 },
        { month: 'May 2025', compliant: 31, planning: 0, at_risk: 0 },
        { month: 'Jun 2025', compliant: 33, planning: 0, at_risk: 0 }
    ]);

    const [regionalData, setRegionalData] = useState([
        { name: 'Europe', supported: 11, missing: 0, percentage: 100 },
        { name: 'Asia Pacific', supported: 10, missing: 0, percentage: 100 },
        { name: 'Latin America', supported: 7, missing: 0, percentage: 100 },
        { name: 'Middle East & Africa', supported: 6, missing: 0, percentage: 100 }
    ]);

    const [statusDistribution, setStatusDistribution] = useState([
        { name: 'Mandatory', value: 30, color: '#10b981' },
        { name: 'Active', value: 2, color: '#3b82f6' },
        { name: 'Planning', value: 1, color: '#f59e0b' },
        { name: 'Voluntary', value: 1, color: '#8b5cf6' }
    ]);

    const generateReport = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('generateComplianceReport', {
                ...reportConfig,
                timestamp: new Date().toISOString()
            });
            
            if (reportConfig.format === 'pdf') {
                // Generate actual PDF
                const data = JSON.parse(response.data.content);
                const doc = new jsPDF();
                
                // Title
                doc.setFontSize(20);
                doc.text('E-Invoicing Compliance Report', 14, 20);
                
                // Metadata
                doc.setFontSize(10);
                doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
                doc.text(`Report Type: ${reportConfig.reportType}`, 14, 35);
                
                // Summary
                doc.setFontSize(14);
                doc.text('Summary', 14, 45);
                doc.setFontSize(10);
                doc.text(`Total Standards: ${data.summary?.total_records || 0}`, 14, 52);
                doc.text(`Grouped By: ${reportConfig.groupBy}`, 14, 57);
                
                // Data table
                let yPos = 70;
                doc.setFontSize(12);
                doc.text('Standards', 14, yPos);
                
                const tableData = [];
                Object.entries(data.data || {}).forEach(([group, standards]) => {
                    standards.forEach(std => {
                        tableData.push([
                            std.country,
                            std.name,
                            std.format,
                            std.status
                        ]);
                    });
                });
                
                doc.autoTable({
                    startY: yPos + 5,
                    head: [['Country', 'Standard', 'Format', 'Status']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 }
                });
                
                doc.save(`compliance-report-${new Date().toISOString().split('T')[0]}.pdf`);
            } else if (reportConfig.format === 'csv') {
                // CSV download
                const blob = new Blob([response.data.content], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            } else {
                // JSON/Excel download as JSON
                const blob = new Blob([response.data.content], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compliance-report-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }
            
            alert('Report generated successfully!');
        } catch (error) {
            alert('Error generating report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const scheduleReport = async () => {
        setLoading(true);
        try {
            await base44.functions.invoke('scheduleComplianceReport', scheduleConfig);
            alert('Report scheduled successfully! You will receive reports via email.');
        } catch (error) {
            alert('Error scheduling report: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const exportChart = (chartId) => {
        // Export chart as image
        alert(`Exporting ${chartId} chart...`);
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="generate">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="generate">Generate Report</TabsTrigger>
                    <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule Delivery</TabsTrigger>
                </TabsList>

                {/* Generate Report Tab */}
                <TabsContent value="generate" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Custom Report Generator</CardTitle>
                            <CardDescription>Configure and generate compliance reports with custom filters</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Report Type</Label>
                                    <Select 
                                        value={reportConfig.reportType}
                                        onValueChange={(v) => setReportConfig({...reportConfig, reportType: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="compliance_summary">Compliance Summary</SelectItem>
                                            <SelectItem value="regional_breakdown">Regional Breakdown</SelectItem>
                                            <SelectItem value="mandate_timeline">Mandate Timeline</SelectItem>
                                            <SelectItem value="gap_analysis">Gap Analysis</SelectItem>
                                            <SelectItem value="implementation_status">Implementation Status</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Group By</Label>
                                    <Select 
                                        value={reportConfig.groupBy}
                                        onValueChange={(v) => setReportConfig({...reportConfig, groupBy: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="country">Country</SelectItem>
                                            <SelectItem value="region">Region</SelectItem>
                                            <SelectItem value="status">Status</SelectItem>
                                            <SelectItem value="mandate_date">Mandate Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Date From</Label>
                                    <Input 
                                        type="date"
                                        value={reportConfig.dateFrom}
                                        onChange={(e) => setReportConfig({...reportConfig, dateFrom: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Date To</Label>
                                    <Input 
                                        type="date"
                                        value={reportConfig.dateTo}
                                        onChange={(e) => setReportConfig({...reportConfig, dateTo: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Filter by Status</Label>
                                <div className="flex flex-wrap gap-3">
                                    {['mandatory', 'active', 'planning', 'voluntary'].map(status => (
                                        <div key={status} className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={reportConfig.statuses.includes(status)}
                                                onCheckedChange={(checked) => {
                                                    setReportConfig({
                                                        ...reportConfig,
                                                        statuses: checked 
                                                            ? [...reportConfig.statuses, status]
                                                            : reportConfig.statuses.filter(s => s !== status)
                                                    });
                                                }}
                                            />
                                            <Label className="capitalize">{status}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Filter by Region</Label>
                                <div className="flex flex-wrap gap-3">
                                    {['Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'].map(region => (
                                        <div key={region} className="flex items-center space-x-2">
                                            <Checkbox 
                                                checked={reportConfig.regions.includes(region)}
                                                onCheckedChange={(checked) => {
                                                    setReportConfig({
                                                        ...reportConfig,
                                                        regions: checked 
                                                            ? [...reportConfig.regions, region]
                                                            : reportConfig.regions.filter(r => r !== region)
                                                    });
                                                }}
                                            />
                                            <Label>{region}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        checked={reportConfig.includeCharts}
                                        onCheckedChange={(checked) => setReportConfig({...reportConfig, includeCharts: checked})}
                                    />
                                    <Label>Include Charts & Visualizations</Label>
                                </div>

                                <div className="space-y-2">
                                    <Label>Export Format</Label>
                                    <Select 
                                        value={reportConfig.format}
                                        onValueChange={(v) => setReportConfig({...reportConfig, format: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF</SelectItem>
                                            <SelectItem value="csv">CSV</SelectItem>
                                            <SelectItem value="excel">Excel</SelectItem>
                                            <SelectItem value="json">JSON</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Button 
                                onClick={generateReport}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="lg"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {loading ? 'Generating...' : 'Generate Report'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Visualizations Tab */}
                <TabsContent value="visualizations" className="space-y-4">
                    {/* Compliance Trend */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Compliance Trend Over Time</CardTitle>
                                    <CardDescription>Track compliance status changes month over month</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => exportChart('trend')}>
                                    <Download className="h-3 w-3 mr-1" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={complianceTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="compliant" stackId="1" stroke="#10b981" fill="#10b981" name="Compliant" />
                                    <Area type="monotone" dataKey="planning" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Planning" />
                                    <Area type="monotone" dataKey="at_risk" stackId="1" stroke="#ef4444" fill="#ef4444" name="At Risk" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Regional Coverage */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Regional Coverage</CardTitle>
                                        <CardDescription>Standards supported by region</CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => exportChart('regional')}>
                                        <Download className="h-3 w-3 mr-1" />
                                        Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={regionalData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="supported" fill="#10b981" name="Supported" />
                                        <Bar dataKey="missing" fill="#ef4444" name="Missing" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Status Distribution */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Status Distribution</CardTitle>
                                        <CardDescription>Breakdown by mandate status</CardDescription>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => exportChart('status')}>
                                        <Download className="h-3 w-3 mr-1" />
                                        Export
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Schedule Delivery Tab */}
                <TabsContent value="schedule" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule Report Delivery</CardTitle>
                            <CardDescription>Automate report generation and email delivery</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert className="bg-blue-50 border-blue-200">
                                <Mail className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800">
                                    Scheduled reports will be automatically generated and sent to specified email addresses.
                                </AlertDescription>
                            </Alert>

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    checked={scheduleConfig.enabled}
                                    onCheckedChange={(checked) => setScheduleConfig({...scheduleConfig, enabled: checked})}
                                />
                                <Label>Enable Scheduled Reporting</Label>
                            </div>

                            {scheduleConfig.enabled && (
                                <>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Report Type</Label>
                                            <Select 
                                                value={scheduleConfig.reportType}
                                                onValueChange={(v) => setScheduleConfig({...scheduleConfig, reportType: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="compliance_summary">Compliance Summary</SelectItem>
                                                    <SelectItem value="regional_breakdown">Regional Breakdown</SelectItem>
                                                    <SelectItem value="mandate_timeline">Mandate Timeline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Frequency</Label>
                                            <Select 
                                                value={scheduleConfig.frequency}
                                                onValueChange={(v) => setScheduleConfig({...scheduleConfig, frequency: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {scheduleConfig.frequency === 'weekly' && (
                                            <div className="space-y-2">
                                                <Label>Day of Week</Label>
                                                <Select 
                                                    value={scheduleConfig.dayOfWeek}
                                                    onValueChange={(v) => setScheduleConfig({...scheduleConfig, dayOfWeek: v})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="monday">Monday</SelectItem>
                                                        <SelectItem value="tuesday">Tuesday</SelectItem>
                                                        <SelectItem value="wednesday">Wednesday</SelectItem>
                                                        <SelectItem value="thursday">Thursday</SelectItem>
                                                        <SelectItem value="friday">Friday</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label>Time (24-hour format)</Label>
                                            <Input 
                                                type="time"
                                                value={scheduleConfig.time}
                                                onChange={(e) => setScheduleConfig({...scheduleConfig, time: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Email Recipients (comma-separated)</Label>
                                        <Input 
                                            placeholder="email1@company.com, email2@company.com"
                                            value={scheduleConfig.recipients}
                                            onChange={(e) => setScheduleConfig({...scheduleConfig, recipients: e.target.value})}
                                        />
                                    </div>

                                    <Button 
                                        onClick={scheduleReport}
                                        disabled={loading || !scheduleConfig.recipients}
                                        className="w-full"
                                    >
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {loading ? 'Scheduling...' : 'Save Schedule'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Active Schedules */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Report Schedules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <div>
                                            <div className="font-medium text-sm">Weekly Compliance Summary</div>
                                            <div className="text-xs text-slate-500">Every Monday at 09:00 • 3 recipients</div>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                                </div>
                                <div className="text-center py-6 text-slate-500 text-sm">
                                    No other schedules configured
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}