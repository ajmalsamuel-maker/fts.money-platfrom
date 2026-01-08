import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { Leaf, TrendingDown, Award, Calendar, ExternalLink } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CarbonDashboard() {
    const { platformUser, loading } = usePlatformAuth();

    const { data: offsets = [] } = useQuery({
        queryKey: ['carbon-offsets'],
        queryFn: () => base44.entities.CarbonOffset.list('-created_date')
    });

    const totalCO2Offset = offsets.reduce((sum, o) => sum + (o.co2_kg || 0), 0);
    const totalSpent = offsets.reduce((sum, o) => sum + (o.cost_usd || 0), 0);
    const totalOffsets = offsets.length;

    // Group by month for chart
    const monthlyData = offsets.reduce((acc, offset) => {
        const month = new Date(offset.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        if (!acc[month]) {
            acc[month] = { month, co2: 0, cost: 0, count: 0 };
        }
        acc[month].co2 += offset.co2_kg;
        acc[month].cost += offset.cost_usd;
        acc[month].count += 1;
        return acc;
    }, {});

    const chartData = Object.values(monthlyData).slice(-6);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="CarbonDashboard"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Carbon Impact Dashboard</h1>
                        <p className="text-slate-600">Track and offset your platform's carbon footprint</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total CO₂ Offset</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-green-600">{totalCO2Offset.toFixed(1)}</span>
                                    <span className="text-slate-600">kg</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    = {(totalCO2Offset / 21).toFixed(1)} tree-years
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Climate Investment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-blue-600">${totalSpent.toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Supporting carbon removal
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Total Offsets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-purple-600">{totalOffsets}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Transactions offset
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">Avg per Offset</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-orange-600">
                                        {totalOffsets > 0 ? (totalCO2Offset / totalOffsets).toFixed(2) : '0.00'}
                                    </span>
                                    <span className="text-slate-600">kg</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Average footprint
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="history">Offset History</TabsTrigger>
                            <TabsTrigger value="integration">API Integration</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Monthly CO₂ Offset</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="co2" stroke="#16a34a" fill="#86efac" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Climate Investment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line type="monotone" dataKey="cost" stroke="#2563eb" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Offsets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {offsets.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Leaf className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-600">No carbon offsets yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {offsets.slice(0, 20).map((offset) => (
                                                <div key={offset.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Leaf className="h-5 w-5 text-green-600" />
                                                        <div>
                                                            <p className="font-medium text-slate-900">
                                                                {offset.co2_kg.toFixed(2)} kg CO₂
                                                            </p>
                                                            <p className="text-xs text-slate-600">
                                                                {new Date(offset.created_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-slate-900">${offset.cost_usd.toFixed(2)}</p>
                                                        <Badge variant="outline" className="text-xs">
                                                            {offset.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="integration">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Phase 1 Integration Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-2">Mastercard Carbon Calculator</h3>
                                        <p className="text-sm text-blue-800 mb-3">
                                            Calculate transaction-level carbon footprints
                                        </p>
                                        <Badge variant={Deno.env.get('MASTERCARD_CARBON_API_KEY') ? 'default' : 'outline'}>
                                            {Deno.env.get('MASTERCARD_CARBON_API_KEY') ? 'Connected' : 'Demo Mode'}
                                        </Badge>
                                        <a 
                                            href="https://developer.mastercard.com/carbon-calculator" 
                                            target="_blank"
                                            className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-2"
                                        >
                                            Get API Key <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-purple-900 mb-2">Stripe Climate</h3>
                                        <p className="text-sm text-purple-800 mb-3">
                                            Purchase verified carbon removal credits
                                        </p>
                                        <Badge variant={Deno.env.get('STRIPE_SECRET_KEY') ? 'default' : 'outline'}>
                                            {Deno.env.get('STRIPE_SECRET_KEY') ? 'Connected' : 'Demo Mode'}
                                        </Badge>
                                        <a 
                                            href="https://stripe.com/climate" 
                                            target="_blank"
                                            className="text-sm text-purple-600 hover:underline flex items-center gap-1 mt-2"
                                        >
                                            Learn More <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-slate-900 mb-2">Usage Example</h3>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
{`import CarbonFootprintWidget from '@/components/carbon/CarbonFootprintWidget';

<CarbonFootprintWidget 
  transactionAmount={100.00}
  merchantCategory="5411"
  onOffsetComplete={(data) => console.log('Offset:', data)}
/>`}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}