import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BusinessInvoiceReports() {
    const [businessSession, setBusinessSession] = useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('business_einvoice_session');
        if (!session) {
            window.location.href = createPageUrl('BusinessEInvoiceLogin');
            return;
        }
        setBusinessSession(JSON.parse(session));
    }, []);

    // Mock data
    const monthlyData = [
        { month: 'Aug', invoices: 42, amount: 125400 },
        { month: 'Sep', invoices: 56, amount: 168200 },
        { month: 'Oct', invoices: 48, amount: 142800 },
        { month: 'Nov', invoices: 61, amount: 189300 },
        { month: 'Dec', invoices: 55, amount: 171500 },
        { month: 'Jan', invoices: 23, amount: 71200 }
    ];

    const standardBreakdown = [
        { standard: 'PEPPOL', count: 145, amount: 425000 },
        { standard: 'ZATCA', count: 98, amount: 285000 },
        { standard: 'CFDI', count: 52, amount: 158000 }
    ];

    const totalInvoices = monthlyData.reduce((sum, m) => sum + m.invoices, 0);
    const totalAmount = monthlyData.reduce((sum, m) => sum + m.amount, 0);

    if (!businessSession) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => window.location.href = createPageUrl('BusinessEInvoicePortal')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
                                <p className="text-sm text-slate-600">{businessSession.company_name}</p>
                            </div>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="pt-6">
                            <FileText className="h-8 w-8 text-blue-600 mb-2" />
                            <div className="text-2xl font-bold text-slate-900">{totalInvoices}</div>
                            <div className="text-sm text-slate-600">Total Invoices (6mo)</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
                            <div className="text-2xl font-bold text-green-600">${(totalAmount / 1000).toFixed(0)}k</div>
                            <div className="text-sm text-slate-600">Total Value</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                            <div className="text-2xl font-bold text-slate-900">${(totalAmount / totalInvoices).toFixed(0)}</div>
                            <div className="text-sm text-slate-600">Avg Invoice Value</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <Calendar className="h-8 w-8 text-amber-600 mb-2" />
                            <div className="text-2xl font-bold text-slate-900">{monthlyData[monthlyData.length - 1].invoices}</div>
                            <div className="text-sm text-slate-600">This Month</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Trend */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Invoice Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="invoices" stroke="#3B82F6" strokeWidth={2} name="Invoice Count" />
                                <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} name="Amount ($)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Standard Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>By E-Invoicing Standard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={standardBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="standard" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#3B82F6" name="Invoice Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}