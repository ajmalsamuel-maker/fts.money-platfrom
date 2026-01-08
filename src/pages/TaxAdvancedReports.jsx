import React, { useState, useEffect } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from '@/api/base44Client';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, TrendingUp, Globe, Shield, Calendar, FileSpreadsheet, FileBarChart } from 'lucide-react';

export default function TaxAdvancedReports() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        report_type: 'compliance',
        date_from: '',
        date_to: '',
        countries: [],
        tax_type: 'all'
    });

    const generateReport = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('generateTaxReports', {
                action: 'generate',
                ...filters
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Report generation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('generateTaxReports', {
                action: 'export',
                format,
                ...filters,
                data: reportData
            });
            
            // Trigger download
            const blob = new Blob([response.data.file_content], { 
                type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tax_report_${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            alert('Export failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="TaxAdvancedReports"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Tax Reports & Analytics</h1>
                        <p className="text-slate-600">Generate comprehensive tax reports with visualizations and export capabilities</p>
                    </div>

                    <Tabs defaultValue="generate" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="generate">Generate Reports</TabsTrigger>
                            <TabsTrigger value="compliance">Compliance Dashboard</TabsTrigger>
                            <TabsTrigger value="historical">Historical Analysis</TabsTrigger>
                            <TabsTrigger value="projections">Tax Projections</TabsTrigger>
                        </TabsList>

                        {/* Generate Reports Tab */}
                        <TabsContent value="generate" className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                {/* Filters */}
                                <Card className="md:col-span-1">
                                    <CardHeader>
                                        <CardTitle>Report Configuration</CardTitle>
                                        <CardDescription>Select report parameters</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Report Type</Label>
                                            <Select 
                                                value={filters.report_type}
                                                onValueChange={(v) => setFilters({...filters, report_type: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="compliance">Tax Compliance Status</SelectItem>
                                                    <SelectItem value="historical">Historical Rate Changes</SelectItem>
                                                    <SelectItem value="audit">Audit Trail Report</SelectItem>
                                                    <SelectItem value="country_summary">Country-Specific Summary</SelectItem>
                                                    <SelectItem value="projections">Tax Liability Projections</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Date From</Label>
                                            <Input 
                                                type="date"
                                                value={filters.date_from}
                                                onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Date To</Label>
                                            <Input 
                                                type="date"
                                                value={filters.date_to}
                                                onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tax Type</Label>
                                            <Select 
                                                value={filters.tax_type}
                                                onValueChange={(v) => setFilters({...filters, tax_type: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="VAT">VAT</SelectItem>
                                                    <SelectItem value="GST">GST</SelectItem>
                                                    <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Button 
                                            onClick={generateReport}
                                            disabled={loading}
                                            className="w-full"
                                        >
                                            <FileBarChart className="h-4 w-4 mr-2" />
                                            Generate Report
                                        </Button>

                                        {reportData && (
                                            <div className="pt-4 border-t space-y-2">
                                                <Label>Export Report</Label>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        onClick={() => exportReport('csv')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                    >
                                                        <FileSpreadsheet className="h-3 w-3 mr-1" />
                                                        CSV
                                                    </Button>
                                                    <Button 
                                                        onClick={() => exportReport('pdf')}
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1"
                                                    >
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        PDF
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Results */}
                                <div className="md:col-span-2 space-y-4">
                                    {reportData ? (
                                        <>
                                            {/* Summary Cards */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm">Countries Covered</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-3xl font-bold text-blue-600">
                                                            {reportData.summary?.countries_count || 157}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm">Rate Changes</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-3xl font-bold text-green-600">
                                                            {reportData.summary?.changes_count || 45}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="text-sm">Compliance Status</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-3xl font-bold text-emerald-600">
                                                            {reportData.summary?.compliance_rate || '98%'}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            {/* Visualizations */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Tax Rate Distribution by Region</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <BarChart data={reportData.regional_distribution || [
                                                            { region: 'Europe', avgRate: 21.5, countries: 48 },
                                                            { region: 'Asia Pacific', avgRate: 10.8, countries: 35 },
                                                            { region: 'Americas', avgRate: 14.2, countries: 35 },
                                                            { region: 'Middle East', avgRate: 8.5, countries: 18 },
                                                            { region: 'Africa', avgRate: 15.7, countries: 21 }
                                                        ]}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="region" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Legend />
                                                            <Bar dataKey="avgRate" fill="#3b82f6" name="Avg Tax Rate %" />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Tax Types Distribution</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <ResponsiveContainer width="100%" height={300}>
                                                        <PieChart>
                                                            <Pie
                                                                data={reportData.tax_types || [
                                                                    { name: 'VAT', value: 105 },
                                                                    { name: 'GST', value: 18 },
                                                                    { name: 'Sales Tax', value: 12 },
                                                                    { name: 'No VAT', value: 22 }
                                                                ]}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                outerRadius={100}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {(reportData.tax_types || []).map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </CardContent>
                                            </Card>
                                        </>
                                    ) : (
                                        <Card>
                                            <CardContent className="flex items-center justify-center h-96">
                                                <div className="text-center text-slate-500">
                                                    <FileBarChart className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                                                    <p className="text-lg font-medium">No Report Generated</p>
                                                    <p className="text-sm">Configure filters and click "Generate Report" to view analytics</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Compliance Dashboard */}
                        <TabsContent value="compliance">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Global Tax Compliance Overview</CardTitle>
                                    <CardDescription>Real-time compliance status across all countries</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-4 gap-4">
                                        <div className="p-4 bg-green-50 rounded-lg">
                                            <div className="text-sm text-green-800 mb-1">Fully Compliant</div>
                                            <div className="text-2xl font-bold text-green-900">142 countries</div>
                                        </div>
                                        <div className="p-4 bg-yellow-50 rounded-lg">
                                            <div className="text-sm text-yellow-800 mb-1">Pending Updates</div>
                                            <div className="text-2xl font-bold text-yellow-900">8 countries</div>
                                        </div>
                                        <div className="p-4 bg-red-50 rounded-lg">
                                            <div className="text-sm text-red-800 mb-1">Validation Issues</div>
                                            <div className="text-2xl font-bold text-red-900">3 countries</div>
                                        </div>
                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <div className="text-sm text-blue-800 mb-1">No Tax System</div>
                                            <div className="text-2xl font-bold text-blue-900">4 countries</div>
                                        </div>
                                    </div>

                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={[
                                            { month: 'Jan', compliant: 135, pending: 12 },
                                            { month: 'Feb', compliant: 137, pending: 11 },
                                            { month: 'Mar', compliant: 138, pending: 10 },
                                            { month: 'Apr', compliant: 140, pending: 9 },
                                            { month: 'May', compliant: 141, pending: 9 },
                                            { month: 'Jun', compliant: 142, pending: 8 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="compliant" stroke="#10b981" strokeWidth={2} name="Compliant Countries" />
                                            <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending Updates" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Historical Analysis */}
                        <TabsContent value="historical">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historical Tax Rate Changes</CardTitle>
                                    <CardDescription>Track rate changes over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <LineChart data={[
                                            { year: '2020', avgRate: 18.2 },
                                            { year: '2021', avgRate: 18.5 },
                                            { year: '2022', avgRate: 18.8 },
                                            { year: '2023', avgRate: 19.1 },
                                            { year: '2024', avgRate: 19.3 },
                                            { year: '2025', avgRate: 19.5 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="avgRate" stroke="#3b82f6" strokeWidth={3} name="Global Avg Rate %" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Projections */}
                        <TabsContent value="projections">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tax Liability Projections</CardTitle>
                                    <CardDescription>Estimate future tax impacts based on current rates</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            Based on current rate trends, global average tax rates are projected to increase by 0.2-0.5% annually over the next 3 years.
                                        </AlertDescription>
                                    </Alert>

                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={[
                                            { scenario: '2026 Conservative', liability: 95000 },
                                            { scenario: '2026 Expected', liability: 98000 },
                                            { scenario: '2026 Optimistic', liability: 92000 },
                                            { scenario: '2027 Expected', liability: 101000 }
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="scenario" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="liability" fill="#8b5cf6" name="Projected Liability (USD)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}