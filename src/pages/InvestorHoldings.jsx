import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { Briefcase, ExternalLink } from 'lucide-react';

export default function InvestorHoldings() {
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
        queryFn: () => base44.entities.RWAAsset.list()
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorHoldings"
                investorName={investor?.full_name}
                investorEmail={investor?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">My Holdings</h1>
                        <p className="text-slate-600">Detailed view of all your asset holdings</p>
                    </div>

                    {holdings.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600">No holdings yet. Visit the marketplace to invest.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {holdings.map((holding) => {
                                const asset = assets.find(a => a.asset_id === holding.asset_id);
                                return (
                                    <Card key={holding.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle>{asset?.name || 'Unknown Asset'}</CardTitle>
                                                    <p className="text-sm text-slate-600">{asset?.symbol}</p>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-700">
                                                    {asset?.asset_type?.replace('_', ' ') || 'Asset'}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-600">Token Amount</p>
                                                    <p className="font-semibold text-lg">{holding.token_amount.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Current Value</p>
                                                    <p className="font-semibold text-lg">${(holding.current_value || 0).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Acquisition Value</p>
                                                    <p className="font-semibold text-lg">${(holding.acquisition_value || 0).toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-600">Gain/Loss</p>
                                                    <p className={`font-semibold text-lg ${
                                                        (holding.current_value || 0) >= (holding.acquisition_value || 0) 
                                                            ? 'text-green-600' 
                                                            : 'text-red-600'
                                                    }`}>
                                                        {((holding.current_value || 0) - (holding.acquisition_value || 0)).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {asset?.contract_address && (
                                                <a
                                                    href={`https://polygonscan.com/address/${asset.contract_address}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-4"
                                                >
                                                    View on Polygonscan <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}