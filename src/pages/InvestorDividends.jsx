import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { DollarSign, Calendar, TrendingUp } from 'lucide-react';

export default function InvestorDividends() {
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

    const { data: dividends = [] } = useQuery({
        queryKey: ['all-dividends'],
        queryFn: () => base44.entities.RWADividend.list('-payment_date'),
        enabled: !!investor
    });

    const { data: assets = [] } = useQuery({
        queryKey: ['assets'],
        queryFn: () => base44.entities.RWAAsset.list()
    });

    const myAssetIds = holdings.map(h => h.asset_id);
    const myDividends = dividends.filter(d => myAssetIds.includes(d.asset_id));

    const totalEarned = myDividends.reduce((sum, d) => {
        const holding = holdings.find(h => h.asset_id === d.asset_id);
        return sum + (holding ? holding.token_amount * (d.per_token_amount || 0) : 0);
    }, 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorDividends"
                investorName={investor?.full_name}
                investorEmail={investor?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Dividends</h1>
                        <p className="text-slate-600">Track your dividend earnings</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Earned</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">${totalEarned.toLocaleString()}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Payments Received</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{myDividends.length}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Last Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">
                                    {myDividends[0] ? new Date(myDividends[0].payment_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {myDividends.length === 0 ? (
                                <div className="text-center py-12">
                                    <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">No dividends received yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {myDividends.map((dividend) => {
                                        const asset = assets.find(a => a.asset_id === dividend.asset_id);
                                        const holding = holdings.find(h => h.asset_id === dividend.asset_id);
                                        const myAmount = holding ? holding.token_amount * (dividend.per_token_amount || 0) : 0;

                                        return (
                                            <div key={dividend.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold">{asset?.name || 'Unknown Asset'}</h3>
                                                        <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(dividend.payment_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-green-600">+${myAmount.toLocaleString()}</p>
                                                        <p className="text-xs text-slate-500">${dividend.per_token_amount?.toFixed(4)} per token</p>
                                                        <Badge className="bg-green-100 text-green-700 mt-1">
                                                            {dividend.dividend_type}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}