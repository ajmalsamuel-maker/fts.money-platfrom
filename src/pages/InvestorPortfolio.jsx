import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { DollarSign, TrendingUp, Briefcase, Coins, PieChart, TrendingDown, Calendar } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

export default function InvestorPortfolio() {
    const [investor, setInvestor] = React.useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('investor_session');
        if (session) setInvestor(JSON.parse(session));
    }, []);

    const { data: investorData } = useQuery({
        queryKey: ['investor', investor?.email],
        queryFn: () => base44.entities.RWAInvestor.filter({ email: investor.email }),
        enabled: !!investor,
        select: (data) => data[0]
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['holdings', investorData?.id],
        queryFn: () => base44.entities.RWAHolding.filter({ investor_id: investorData.id }),
        enabled: !!investorData
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['assets'],
        queryFn: () => base44.entities.RWAAsset.list(),
        enabled: !!investorData
    });

    const { data: dividends = [] } = useQuery({
        queryKey: ['dividends', investorData?.id],
        queryFn: async () => {
            if (!holdings.length) return [];
            const assetIds = [...new Set(holdings.map(h => h.asset_id))];
            const allDividends = await base44.entities.RWADividend.list('-payment_date', 100);
            return allDividends.filter(d => assetIds.includes(d.asset_id));
        },
        enabled: !!investorData && holdings.length > 0
    });

    const totalInvested = holdings.reduce((sum, h) => sum + (h.total_invested || 0), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalReturn = currentValue - totalInvested;
    const returnPercent = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : 0;
    const totalDividends = holdings.reduce((sum, h) => sum + (h.dividends_received || 0), 0);

    const holdingsWithDetails = holdings.map(holding => {
        const asset = assets.find(a => a.asset_id === holding.asset_id);
        return { ...holding, asset };
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorPortfolio"
                investorName={investor?.full_name}
                investorEmail={investor?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Portfolio Overview</h1>

                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Total Invested
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${totalInvested.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Current Value
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${currentValue.toLocaleString()}</p>
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
                                    {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{returnPercent}%</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Coins className="h-4 w-4" />
                                    Holdings
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{holdings.length}</p>
                                <p className="text-xs text-slate-500 mt-1">assets</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Dividends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${totalDividends.toLocaleString()}</p>
                                <p className="text-xs text-slate-500 mt-1">total earned</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Chart */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Portfolio Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={[
                                        { month: 'Jan', value: totalInvested * 0.95 },
                                        { month: 'Feb', value: totalInvested * 0.98 },
                                        { month: 'Mar', value: totalInvested * 1.02 },
                                        { month: 'Apr', value: currentValue }
                                    ]}>
                                        <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} />
                                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                    </LineChart>
                                </ResponsiveContainer>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <span className="text-sm text-slate-600">Total Return</span>
                                    <span className={`text-lg font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {totalReturn >= 0 ? '+' : ''}{returnPercent}%
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    Asset Allocation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={holdingsWithDetails.map(h => ({
                                        name: h.asset?.symbol || 'N/A',
                                        value: h.current_value
                                    }))}>
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                        <Bar dataKey="value">
                                            {holdingsWithDetails.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Holdings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>My Holdings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {holdings.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No holdings yet. Visit the Marketplace to invest.</p>
                            ) : (
                                <div className="space-y-3">
                                    {holdingsWithDetails.map(holding => (
                                        <div key={holding.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">{holding.asset?.name || 'Asset'}</h3>
                                                        <Badge className="text-xs">{holding.asset?.symbol}</Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        {holding.token_balance?.toLocaleString()} tokens @ ${holding.purchase_price}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div>
                                                            <p className="text-xs text-slate-500">Invested</p>
                                                            <p className="text-sm font-medium">${(holding.total_invested || 0).toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-slate-500">Dividends</p>
                                                            <p className="text-sm font-medium text-green-600">${(holding.dividends_received || 0).toLocaleString()}</p>
                                                        </div>
                                                        {holding.is_locked && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Locked until {new Date(holding.lockup_end_date).toLocaleDateString()}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-lg">${(holding.current_value || 0).toLocaleString()}</p>
                                                    <p className={`text-sm font-medium ${(holding.unrealized_gain_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {(holding.unrealized_gain_loss || 0) >= 0 ? '+' : ''}${(holding.unrealized_gain_loss || 0).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {holding.total_invested > 0 ? ((holding.unrealized_gain_loss / holding.total_invested) * 100).toFixed(2) : 0}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Dividends */}
                    {dividends.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Recent Dividend Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {dividends.slice(0, 5).map(div => {
                                        const asset = assets.find(a => a.asset_id === div.asset_id);
                                        const holding = holdings.find(h => h.asset_id === div.asset_id);
                                        const myShare = holding ? (holding.token_balance / asset?.total_supply) * div.total_amount : 0;
                                        
                                        return (
                                            <div key={div.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{asset?.name}</p>
                                                    <p className="text-xs text-slate-600">
                                                        {div.payment_type} - {new Date(div.payment_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-green-600">+${myShare.toFixed(2)}</p>
                                                    <Badge className={
                                                        div.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }>
                                                        {div.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}