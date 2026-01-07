import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { TrendingUp, DollarSign, Briefcase, Award, ArrowUpRight, Calendar, Activity, ShoppingCart, Eye, Settings } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function InvestorPortfolio() {
    const { data: investor } = useQuery({
        queryKey: ['current-investor'],
        queryFn: async () => {
            const session = localStorage.getItem('rwa_investor_session');
            if (!session) return null;
            return JSON.parse(session);
        }
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['my-holdings', investor?.investor_id],
        queryFn: () => base44.entities.RWAHolding.filter({ investor_id: investor.investor_id }),
        enabled: !!investor
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['assets'],
        queryFn: () => base44.entities.RWAAsset.list(),
        enabled: !!investor
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['my-orders', investor?.investor_id],
        queryFn: () => base44.entities.RWAOrder.filter({ investor_id: investor.investor_id }, '-created_date', 5),
        enabled: !!investor
    });

    const { data: dividends = [] } = useQuery({
        queryKey: ['my-dividends', investor?.investor_id],
        queryFn: () => base44.entities.RWADividend.filter({ investor_id: investor.investor_id }, '-payment_date', 5),
        enabled: !!investor
    });

    const portfolioValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.acquisition_value || 0), 0);
    const totalReturn = portfolioValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Generate growth chart data (mock historical data)
    const growthData = Array.from({ length: 12 }, (_, i) => {
        const monthAgo = 11 - i;
        const growth = Math.pow(1 + returnPercentage / 100 / 12, monthAgo);
        return {
            month: new Date(Date.now() - monthAgo * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
            value: Math.round(totalInvested * growth)
        };
    });

    // Asset allocation data
    const allocationData = holdings.map(h => {
        const asset = assets.find(a => a.asset_id === h.asset_id);
        return {
            name: asset?.name || 'Unknown',
            value: h.current_value || 0
        };
    });

    const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorPortfolio"
                investorName={investor?.full_name}
                investorEmail={investor?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Portfolio Overview</h1>
                        <p className="text-slate-600">Track your investment performance</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Portfolio Value
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${portfolioValue.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Holdings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{holdings.length}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Total Return
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${Math.abs(totalReturn).toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">{returnPercentage.toFixed(2)}%</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className="bg-green-100 text-green-700">
                                    {investor?.accreditation_status || 'Active'}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-6">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Portfolio Growth
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {totalInvested === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                        <p>Start investing to see your portfolio growth</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={growthData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                            <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Asset Allocation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {holdings.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm">No holdings yet</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={allocationData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${((entry.value / portfolioValue) * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {allocationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Recent Transactions
                                    </CardTitle>
                                    <Link to={createPageUrl('InvestorHoldings')}>
                                        <Button variant="ghost" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {orders.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <Activity className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm">No transactions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map((order) => {
                                            const asset = assets.find(a => a.asset_id === order.asset_id);
                                            return (
                                                <div key={order.id} className="flex items-center justify-between border-b pb-3">
                                                    <div>
                                                        <p className="font-medium text-sm">{asset?.name || 'Unknown Asset'}</p>
                                                        <p className="text-xs text-slate-600">
                                                            {new Date(order.created_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className={
                                                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-slate-100 text-slate-700'
                                                        }>
                                                            {order.status}
                                                        </Badge>
                                                        <p className="text-sm font-semibold mt-1">${order.total_value?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Upcoming Events
                                    </CardTitle>
                                    <Link to={createPageUrl('InvestorDividends')}>
                                        <Button variant="ghost" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {dividends.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-sm">No upcoming dividend payments</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dividends.map((dividend) => {
                                            const asset = assets.find(a => a.asset_id === dividend.asset_id);
                                            return (
                                                <div key={dividend.id} className="flex items-center justify-between border-b pb-3">
                                                    <div>
                                                        <p className="font-medium text-sm">{asset?.name || 'Unknown Asset'}</p>
                                                        <p className="text-xs text-slate-600">
                                                            {dividend.payment_date ? new Date(dividend.payment_date).toLocaleDateString() : 'Pending'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-semibold text-green-600">+${dividend.amount?.toLocaleString()}</p>
                                                        <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">
                                                            Dividend
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <Link to={createPageUrl('InvestorMarketplace')} className="block">
                                        <Button className="w-full h-24 flex flex-col items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                            <ShoppingCart className="h-6 w-6" />
                                            <span>Browse Assets</span>
                                        </Button>
                                    </Link>
                                    <Link to={createPageUrl('InvestorHoldings')} className="block">
                                        <Button variant="outline" className="w-full h-24 flex flex-col items-center gap-2">
                                            <Eye className="h-6 w-6" />
                                            <span>View Holdings</span>
                                        </Button>
                                    </Link>
                                    <Link to={createPageUrl('InvestorDividends')} className="block">
                                        <Button variant="outline" className="w-full h-24 flex flex-col items-center gap-2">
                                            <DollarSign className="h-6 w-6" />
                                            <span>Dividend History</span>
                                        </Button>
                                    </Link>
                                    <Link to={createPageUrl('InvestorSettings')} className="block">
                                        <Button variant="outline" className="w-full h-24 flex flex-col items-center gap-2">
                                            <Settings className="h-6 w-6" />
                                            <span>Account Settings</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}