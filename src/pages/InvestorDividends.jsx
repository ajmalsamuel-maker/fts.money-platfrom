import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { DollarSign, Calendar, TrendingUp, Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InvestorDividends() {
    const [session, setSession] = React.useState(null);

    React.useEffect(() => {
        const savedSession = localStorage.getItem('investor_session');
        if (savedSession) setSession(JSON.parse(savedSession));
    }, []);

    const { data: investorData } = useQuery({
        queryKey: ['investor', session?.email],
        queryFn: async () => {
            const investors = await base44.entities.RWAInvestor.filter({ email: session.email });
            return investors[0];
        },
        enabled: !!session
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['holdings', investorData?.id],
        queryFn: () => base44.entities.RWAHolding.filter({ investor_id: investorData.id }),
        enabled: !!investorData
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['assets'],
        queryFn: () => base44.entities.RWAAsset.list()
    });

    const { data: allDividends = [] } = useQuery({
        queryKey: ['dividends'],
        queryFn: () => base44.entities.RWADividend.list('-payment_date', 200),
        enabled: !!investorData
    });

    const assetIds = holdings.map(h => h.asset_id);
    const myDividends = allDividends.filter(d => assetIds.includes(d.asset_id));

    const totalDividends = holdings.reduce((sum, h) => sum + (h.dividends_received || 0), 0);
    const thisYear = new Date().getFullYear();
    const thisYearDividends = myDividends
        .filter(d => new Date(d.payment_date).getFullYear() === thisYear)
        .reduce((sum, d) => {
            const holding = holdings.find(h => h.asset_id === d.asset_id);
            const asset = assets.find(a => a.asset_id === d.asset_id);
            if (!holding || !asset) return sum;
            const myShare = (holding.token_balance / asset.total_supply) * d.total_amount;
            return sum + myShare;
        }, 0);

    const upcomingDividends = myDividends.filter(d => 
        new Date(d.payment_date) > new Date() && d.status !== 'completed'
    );

    const dividendsWithDetails = myDividends.map(div => {
        const asset = assets.find(a => a.asset_id === div.asset_id);
        const holding = holdings.find(h => h.asset_id === div.asset_id);
        const myShare = holding && asset ? (holding.token_balance / asset.total_supply) * div.total_amount : 0;

        return {
            ...div,
            asset,
            myShare
        };
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorDividends"
                investorName={session?.full_name}
                investorEmail={session?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Dividend Tracker</h1>
                            <p className="text-slate-600">Track your dividend income from tokenized assets</p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Report
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Total Dividends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">${totalDividends.toLocaleString()}</p>
                                <p className="text-xs text-slate-500 mt-1">all time</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    This Year
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${thisYearDividends.toLocaleString()}</p>
                                <p className="text-xs text-slate-500 mt-1">{thisYear}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Upcoming
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-blue-600">{upcomingDividends.length}</p>
                                <p className="text-xs text-slate-500 mt-1">scheduled</p>
                            </CardContent>
                        </Card>
                    </div>

                    {upcomingDividends.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Upcoming Payments
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {dividendsWithDetails
                                        .filter(d => upcomingDividends.find(up => up.id === d.id))
                                        .map(div => (
                                            <div key={div.id} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{div.asset?.name || 'Asset'}</p>
                                                    <p className="text-sm text-slate-600">
                                                        {div.payment_type} payment scheduled
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Payment Date: {new Date(div.payment_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        ${div.myShare.toFixed(2)}
                                                    </p>
                                                    <Badge className="bg-blue-100 text-blue-700 mt-1">
                                                        {div.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myDividends.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No dividend history yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {dividendsWithDetails.map(div => (
                                        <div key={div.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">{div.asset?.name || 'Asset'}</p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {div.asset?.symbol}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 mt-1">
                                                    {div.payment_type} • {new Date(div.payment_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">+${div.myShare.toFixed(2)}</p>
                                                <Badge className={
                                                    div.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    div.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }>
                                                    {div.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}