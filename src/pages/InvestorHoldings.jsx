import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { Briefcase, TrendingUp, Lock, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function InvestorHoldings() {
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

    const holdingsWithAssets = holdings.map(h => {
        const asset = assets.find(a => a.asset_id === h.asset_id);
        const returnPercent = h.total_invested > 0 ? ((h.unrealized_gain_loss / h.total_invested) * 100).toFixed(2) : 0;
        return { ...h, asset, returnPercent };
    });

    const totalValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.total_invested || 0), 0);
    const totalReturn = totalValue - totalInvested;

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorHoldings"
                investorName={session?.full_name}
                investorEmail={session?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">My Holdings</h1>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Value</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Invested</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">${totalInvested.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Return</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    {totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(2) : 0}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-4">
                        {holdingsWithAssets.map(holding => (
                            <Card key={holding.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle>{holding.asset?.name || 'Asset'}</CardTitle>
                                                <Badge>{holding.asset?.symbol}</Badge>
                                                {holding.is_locked && (
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Lock className="h-3 w-3" />
                                                        Locked
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                {holding.asset?.asset_type?.replace('_', ' ')} • {holding.asset?.jurisdiction}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">${holding.current_value?.toLocaleString()}</p>
                                            <p className={`text-sm font-medium ${holding.unrealized_gain_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {holding.unrealized_gain_loss >= 0 ? '+' : ''}${holding.unrealized_gain_loss?.toLocaleString()} ({holding.returnPercent}%)
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-500">Tokens Held</p>
                                            <p className="font-medium">{holding.token_balance?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Purchase Price</p>
                                            <p className="font-medium">${holding.purchase_price}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Total Invested</p>
                                            <p className="font-medium">${holding.total_invested?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Dividends Earned</p>
                                            <p className="font-medium text-green-600">${holding.dividends_received?.toLocaleString() || 0}</p>
                                        </div>
                                    </div>

                                    {holding.is_locked && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Lock className="h-4 w-4 text-amber-600" />
                                                <span className="text-sm font-medium text-amber-900">Lock-up Period</span>
                                            </div>
                                            <p className="text-xs text-amber-700">
                                                Tokens locked until: {new Date(holding.lockup_end_date).toLocaleDateString()}
                                            </p>
                                            <Progress 
                                                value={((new Date() - new Date(holding.purchase_date)) / (new Date(holding.lockup_end_date) - new Date(holding.purchase_date))) * 100} 
                                                className="mt-2 h-1"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <p className="text-xs text-slate-500">
                                            Acquired: {new Date(holding.purchase_date).toLocaleDateString()}
                                        </p>
                                        {holding.contract_address && (
                                            <Button variant="outline" size="sm" asChild>
                                                <a 
                                                    href={`https://polygonscan.com/token/${holding.contract_address}?a=${holding.wallet_address}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1"
                                                >
                                                    View on Chain
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {holdings.length === 0 && (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="text-center">
                                        <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">No holdings yet</p>
                                        <p className="text-sm text-slate-400 mt-1">Visit the Marketplace to start investing</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}