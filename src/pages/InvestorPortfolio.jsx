import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { TrendingUp, DollarSign, Briefcase, Award } from 'lucide-react';

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

    const portfolioValue = holdings.reduce((sum, h) => sum + (h.current_value || 0), 0);
    const totalInvested = holdings.reduce((sum, h) => sum + (h.acquisition_value || 0), 0);
    const totalReturn = portfolioValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

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

                    <Card>
                        <CardHeader>
                            <CardTitle>Holdings Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {holdings.length === 0 ? (
                                <div className="text-center py-12">
                                    <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">No holdings yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {holdings.map((holding) => {
                                        const asset = assets.find(a => a.asset_id === holding.asset_id);
                                        const holdingReturn = (holding.current_value || 0) - (holding.acquisition_value || 0);
                                        return (
                                            <div key={holding.id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold">{asset?.name || 'Unknown Asset'}</h3>
                                                        <p className="text-sm text-slate-600">{holding.token_amount} tokens</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold">${(holding.current_value || 0).toLocaleString()}</p>
                                                        <p className={`text-sm ${holdingReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {holdingReturn >= 0 ? '+' : ''}{holdingReturn.toLocaleString()}
                                                        </p>
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