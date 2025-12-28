import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { DollarSign, TrendingUp, Briefcase, Coins } from 'lucide-react';

export default function InvestorPortfolio() {
    const [investor, setInvestor] = React.useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('investor_session');
        if (session) setInvestor(JSON.parse(session));
    }, []);

    const { data: holdings = [] } = useQuery({
        queryKey: ['holdings', investor?.email],
        queryFn: async () => {
            const investors = await base44.entities.RWAInvestor.filter({ email: investor.email });
            if (investors.length === 0) return [];
            return base44.entities.RWAHolding.filter({ investor_id: investors[0].id });
        },
        enabled: !!investor
    });

    const totalInvested = holdings.reduce((sum, h) => sum + (h.total_invested || 0), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalReturn = currentValue - totalInvested;
    const returnPercent = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : 0;

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
                    <div className="grid grid-cols-4 gap-4 mb-6">
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
                                    {holdings.map(holding => (
                                        <div key={holding.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold">Asset #{holding.asset_id?.slice(0, 8)}</h3>
                                                    <p className="text-sm text-slate-600">
                                                        {holding.token_balance} tokens @ ${holding.purchase_price}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">${(holding.current_value || 0).toLocaleString()}</p>
                                                    <p className={`text-xs ${(holding.unrealized_gain_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {(holding.unrealized_gain_loss || 0) >= 0 ? '+' : ''}${(holding.unrealized_gain_loss || 0).toLocaleString()}
                                                    </p>
                                                </div>
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