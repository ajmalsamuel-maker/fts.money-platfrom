import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Shield, Globe, AlertCircle, CheckCircle, TrendingUp, 
    FileText, Activity, Bell, Calendar, ChevronRight 
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createPageUrl } from '@/utils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function BusinessEInvoiceComplianceDashboard() {
    const [businessSession, setBusinessSession] = useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('business_einvoice_session');
        if (!session) {
            window.location.href = createPageUrl('BusinessEInvoiceLogin');
            return;
        }
        setBusinessSession(JSON.parse(session));
    }, []);

    // Mock data - in production this would come from actual invoice submissions
    const standardAdoption = [
        { standard: 'PEPPOL', count: 145, percentage: 35 },
        { standard: 'ZATCA', count: 98, percentage: 24 },
        { standard: 'CFDI', count: 87, percentage: 21 },
        { standard: 'XRechnung', count: 52, percentage: 13 },
        { standard: 'FatturaPA', count: 28, percentage: 7 }
    ];

    const commonErrors = [
        { error: 'Missing VAT Number', count: 24, severity: 'critical' },
        { error: 'Incorrect Tax Calculation', count: 18, severity: 'critical' },
        { error: 'Invalid Date Format', count: 15, severity: 'warning' },
        { error: 'Missing Line Item Tax Code', count: 12, severity: 'warning' },
        { error: 'Incorrect Currency Code', count: 8, severity: 'info' }
    ];

    const submissionRates = [
        { country: 'Germany', success: 98, failed: 2, total: 152 },
        { country: 'France', success: 96, failed: 4, total: 128 },
        { country: 'Saudi Arabia', success: 94, failed: 6, total: 98 },
        { country: 'Mexico', success: 92, failed: 8, total: 87 },
        { country: 'Italy', success: 89, failed: 11, total: 64 }
    ];

    const monthlyTrend = [
        { month: 'Aug', submitted: 245, successful: 232, failed: 13 },
        { month: 'Sep', submitted: 298, successful: 285, failed: 13 },
        { month: 'Oct', submitted: 342, successful: 331, failed: 11 },
        { month: 'Nov', submitted: 389, successful: 378, failed: 11 },
        { month: 'Dec', submitted: 410, successful: 402, failed: 8 },
        { month: 'Jan', submitted: 156, successful: 152, failed: 4 }
    ];

    const upcomingChanges = [
        { 
            title: 'EU ViDA Directive - Mandatory PEPPOL', 
            date: '2026-07-01', 
            impact: 'critical',
            description: 'All B2B invoices in EU must use PEPPOL network',
            countries: ['All EU Member States']
        },
        { 
            title: 'Malaysia E-Invoice Mandate Phase 2', 
            date: '2026-01-31', 
            impact: 'high',
            description: 'Threshold lowered to RM 25 million annual revenue',
            countries: ['Malaysia']
        },
        { 
            title: 'Poland KSeF Update v2.0', 
            date: '2026-03-01', 
            impact: 'medium',
            description: 'New XML schema version with enhanced validations',
            countries: ['Poland']
        }
    ];

    const overallScore = Math.round(
        (submissionRates.reduce((sum, r) => sum + r.success, 0) / 
        submissionRates.reduce((sum, r) => sum + r.total, 0)) * 100
    );

    if (!businessSession) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => window.location.href = createPageUrl('BusinessEInvoicePortal')}
                            className="text-slate-600 hover:text-blue-600"
                        >
                            ← Back
                        </button>
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Compliance Dashboard</h1>
                            <p className="text-sm text-slate-600">{businessSession?.company_name}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Overall Compliance Score */}
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 mb-1">Overall Compliance Score</h2>
                                <p className="text-sm text-slate-600">Based on submission success rates across all countries</p>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl font-bold text-blue-600">{overallScore}%</div>
                                <Badge className="bg-green-100 text-green-700 mt-2">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Excellent
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <FileText className="h-8 w-8 text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-slate-900">410</div>
                            <div className="text-sm text-slate-600">Total Submissions (Jan)</div>
                            <div className="text-xs text-green-600 mt-1">+5.4% vs Dec</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                            <div className="text-2xl font-bold text-green-600">402</div>
                            <div className="text-sm text-slate-600">Successful Submissions</div>
                            <div className="text-xs text-slate-500 mt-1">98.0% success rate</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <AlertCircle className="h-8 w-8 text-red-600 mb-2" />
                            <div className="text-2xl font-bold text-red-600">8</div>
                            <div className="text-sm text-slate-600">Failed Submissions</div>
                            <div className="text-xs text-green-600 mt-1">-33% vs Dec</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <Globe className="h-8 w-8 text-purple-600 mb-2" />
                            <div className="text-2xl font-bold text-slate-900">5</div>
                            <div className="text-sm text-slate-600">Active Countries</div>
                            <div className="text-xs text-slate-500 mt-1">Multi-jurisdiction</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="standards" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="standards">Standard Adoption</TabsTrigger>
                        <TabsTrigger value="errors">Common Errors</TabsTrigger>
                        <TabsTrigger value="countries">Country Performance</TabsTrigger>
                        <TabsTrigger value="alerts">Regulatory Alerts</TabsTrigger>
                    </TabsList>

                    {/* Standard Adoption */}
                    <TabsContent value="standards">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>E-Invoicing Standard Distribution</CardTitle>
                                    <CardDescription>Active standards across your submissions</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={standardAdoption}
                                                dataKey="count"
                                                nameKey="standard"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={(entry) => `${entry.standard} (${entry.percentage}%)`}
                                            >
                                                {standardAdoption.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Standard Usage Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {standardAdoption.map((std, idx) => (
                                            <div key={std.standard} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-4 h-4 rounded"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    <div>
                                                        <div className="font-medium text-slate-900">{std.standard}</div>
                                                        <div className="text-xs text-slate-500">{std.count} invoices</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-slate-900">{std.percentage}%</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Common Errors */}
                    <TabsContent value="errors">
                        <Card>
                            <CardHeader>
                                <CardTitle>Most Common Validation Errors</CardTitle>
                                <CardDescription>Issues detected during invoice validation</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {commonErrors.map((err, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Badge className={
                                                    err.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                    err.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }>
                                                    {err.severity}
                                                </Badge>
                                                <div>
                                                    <div className="font-medium text-slate-900">{err.error}</div>
                                                    <div className="text-sm text-slate-600">Occurred {err.count} times this month</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-slate-900">{err.count}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Country Performance */}
                    <TabsContent value="countries">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Submission Success Rate by Country</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={submissionRates}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="country" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="success" fill="#10B981" name="Successful" />
                                            <Bar dataKey="failed" fill="#EF4444" name="Failed" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Country Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {submissionRates.map((country) => {
                                            const successRate = ((country.success / country.total) * 100).toFixed(1);
                                            return (
                                                <div key={country.country} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{country.country}</div>
                                                        <div className="text-sm text-slate-600">{country.total} total submissions</div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <div className="text-sm font-semibold text-green-600">{country.success} successful</div>
                                                            <div className="text-xs text-red-600">{country.failed} failed</div>
                                                        </div>
                                                        <Badge className={
                                                            parseFloat(successRate) >= 95 ? 'bg-green-100 text-green-700' :
                                                            parseFloat(successRate) >= 90 ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }>
                                                            {successRate}%
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Submission Trend (Last 6 Months)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={monthlyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="submitted" stroke="#3B82F6" strokeWidth={2} name="Total Submitted" />
                                            <Line type="monotone" dataKey="successful" stroke="#10B981" strokeWidth={2} name="Successful" />
                                            <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} name="Failed" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Regulatory Alerts */}
                    <TabsContent value="alerts">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-blue-600" />
                                    Upcoming Regulatory Changes
                                </CardTitle>
                                <CardDescription>Stay ahead of e-invoicing mandate updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {upcomingChanges.map((change, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`p-4 rounded-lg border-2 ${
                                                change.impact === 'critical' ? 'border-red-200 bg-red-50' :
                                                change.impact === 'high' ? 'border-yellow-200 bg-yellow-50' :
                                                'border-blue-200 bg-blue-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">{change.title}</h3>
                                                    <p className="text-sm text-slate-600 mt-1">{change.description}</p>
                                                </div>
                                                <Badge className={
                                                    change.impact === 'critical' ? 'bg-red-100 text-red-700' :
                                                    change.impact === 'high' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }>
                                                    {change.impact}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Calendar className="h-4 w-4" />
                                                    Effective: {new Date(change.date).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric' 
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Globe className="h-4 w-4" />
                                                    {change.countries.join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Recommended Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div>
                                            <div className="font-medium text-slate-900">Review EU ViDA Requirements</div>
                                            <div className="text-sm text-slate-600">Ensure all EU invoices are PEPPOL-ready by July 2026</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                        <div>
                                            <div className="font-medium text-slate-900">Update Malaysia Configuration</div>
                                            <div className="text-sm text-slate-600">New threshold applies Jan 31 - verify your setup</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}