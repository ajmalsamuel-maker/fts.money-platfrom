import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Leaf, Award, Download, Calendar } from 'lucide-react';

export default function ESGReportingDashboard() {
    const { platformUser } = usePlatformAuth();

    const { data: reports = [] } = useQuery({
        queryKey: ['esgReports'],
        queryFn: () => base44.entities.ESGReport.list(),
    });

    const { data: greenMerchants = [] } = useQuery({
        queryKey: ['greenMerchants'],
        queryFn: () => base44.entities.GreenMerchant.list(),
    });

    const { data: taskCompletions = [] } = useQuery({
        queryKey: ['taskCompletions'],
        queryFn: () => base44.entities.TaskCompletion.list(),
    });

    const totalCO2Offset = greenMerchants.reduce((sum, m) => sum + (m.total_co2_offset || 0), 0);
    const totalNanoIssued = greenMerchants.reduce((sum, m) => sum + (m.total_nano_rewards_issued || 0), 0);
    const verifiedMerchants = greenMerchants.filter(m => m.green_badge_status === 'verified').length;

    const monthlyData = [
        { month: 'Jan', co2: 1200, tasks: 450 },
        { month: 'Feb', co2: 1800, tasks: 680 },
        { month: 'Mar', co2: 2400, tasks: 920 },
        { month: 'Apr', co2: 3200, tasks: 1250 },
        { month: 'May', co2: 4100, tasks: 1600 },
        { month: 'Jun', co2: 5200, tasks: 2100 },
    ];

    const merchantDistribution = [
        { name: 'Verified', value: verifiedMerchants },
        { name: 'Pending', value: greenMerchants.filter(m => m.green_badge_status === 'pending').length },
        { name: 'Premium', value: greenMerchants.filter(m => m.green_badge_status === 'premium').length },
    ];

    const COLORS = ['#10b981', '#f59e0b', '#8b5cf6'];

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ESGReportingDashboard"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-y-auto">
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">ESG Reporting Dashboard</h1>
                            <p className="text-slate-600">Environmental, Social & Governance Analytics</p>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Leaf className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Total CO₂ Offset</p>
                                        <p className="text-2xl font-bold">{totalCO2Offset.toFixed(1)} kg</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Award className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Green Merchants</p>
                                        <p className="text-2xl font-bold">{greenMerchants.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">Tasks Completed</p>
                                        <p className="text-2xl font-bold">{taskCompletions.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Calendar className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-600">NANO Issued</p>
                                        <p className="text-2xl font-bold">{totalNanoIssued}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>CO₂ Offset Over Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <LineChart width={500} height={300} data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="co2" stroke="#10b981" strokeWidth={2} name="CO₂ Offset (kg)" />
                                </LineChart>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Merchant Badge Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={merchantDistribution}
                                        cx={200}
                                        cy={150}
                                        labelLine={false}
                                        label={(entry) => entry.name}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {merchantDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Reports List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Reports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {reports.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <p>No reports generated yet</p>
                                    </div>
                                ) : (
                                    reports.slice(0, 10).map((report) => (
                                        <div key={report.id} className="flex justify-between items-center p-4 border rounded-lg">
                                            <div>
                                                <h4 className="font-semibold">{report.entity_name} - {report.report_period}</h4>
                                                <p className="text-sm text-slate-600">
                                                    {report.period_start} to {report.period_end}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={report.csrd_compliant ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                                    {report.csrd_compliant ? 'CSRD Compliant' : 'Pending'}
                                                </Badge>
                                                <Button size="sm" variant="outline">
                                                    <Download className="h-3 w-3 mr-1" />
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}