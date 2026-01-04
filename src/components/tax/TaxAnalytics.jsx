import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertCircle, TrendingUp, DollarSign, Globe } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function TaxAnalytics() {
    const { data: logs = [] } = useQuery({
        queryKey: ['tax-calculation-logs'],
        queryFn: async () => {
            const result = await base44.entities.TaxCalculationLog.list('-calculation_timestamp', 1000);
            return result || [];
        }
    });

    // Calculate stats
    const totalCalculations = logs.length;
    const totalTaxCollected = logs.reduce((sum, log) => sum + (log.tax_amount || 0), 0);
    const uniqueJurisdictions = new Set(logs.map(log => log.final_jurisdiction)).size;
    const reverseChargeCount = logs.filter(log => log.reverse_charge_applied).length;

    // Jurisdiction breakdown
    const jurisdictionData = Object.entries(
        logs.reduce((acc, log) => {
            const j = log.final_jurisdiction || 'Unknown';
            acc[j] = (acc[j] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, count]) => ({ name, count })).slice(0, 10);

    // Tax by category
    const categoryData = Object.entries(
        logs.reduce((acc, log) => {
            const c = log.tax_category || 'Uncategorized';
            acc[c] = (acc[c] || 0) + (log.tax_amount || 0);
            return acc;
        }, {})
    ).map(([name, amount]) => ({ name, amount }));

    // Last 30 days trend
    const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        const dayLogs = logs.filter(log => 
            log.calculation_timestamp?.startsWith(dateStr)
        );
        
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            calculations: dayLogs.length,
            tax_collected: dayLogs.reduce((sum, log) => sum + (log.tax_amount || 0), 0)
        };
    });

    return (
        <div className="space-y-6">
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Tax analytics based on the last 1,000 calculations. Real-time monitoring of VAT collection and compliance.
                </AlertDescription>
            </Alert>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Calculations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalCalculations.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Tax Collected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            ${totalTaxCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Jurisdictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{uniqueJurisdictions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">B2B Reverse Charge</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{reverseChargeCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>30-Day Calculation Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={last30Days}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="calculations" stroke="#3b82f6" name="Calculations" />
                                <Line type="monotone" dataKey="tax_collected" stroke="#10b981" name="Tax Collected ($)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Jurisdictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={jurisdictionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Tax Collection by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="amount"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={(entry) => `${entry.name}: $${entry.amount.toFixed(2)}`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}