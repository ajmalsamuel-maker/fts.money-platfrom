import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InvestorSidebar from '@/components/rwa/InvestorSidebar';
import { ShoppingBag, TrendingUp } from 'lucide-react';

export default function InvestorMarketplace() {
    const [investor, setInvestor] = React.useState(null);

    React.useEffect(() => {
        const session = localStorage.getItem('investor_session');
        if (session) setInvestor(JSON.parse(session));
    }, []);

    const { data: availableAssets = [] } = useQuery({
        queryKey: ['marketplace-assets'],
        queryFn: () => base44.entities.RWAAsset.filter({ status: 'active' })
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <InvestorSidebar 
                currentPage="InvestorMarketplace"
                investorName={investor?.full_name}
                investorEmail={investor?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Asset Marketplace</h1>
                        <p className="text-slate-600">Browse and invest in tokenized real-world assets</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableAssets.map(asset => {
                            const pricePerToken = asset.total_value / asset.total_supply;
                            const tokensAvailable = asset.total_supply - (asset.tokens_issued || 0);
                            
                            return (
                                <Card key={asset.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{asset.name}</CardTitle>
                                                <p className="text-sm text-slate-600 mt-1">{asset.symbol}</p>
                                            </div>
                                            <Badge variant="outline">{asset.asset_type}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Price per Token:</span>
                                                <span className="font-medium">${pricePerToken.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Available:</span>
                                                <span className="font-medium">{tokensAvailable.toLocaleString()} tokens</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Min Investment:</span>
                                                <span className="font-medium">${(asset.min_investment || 1000).toLocaleString()}</span>
                                            </div>
                                            {asset.expected_return && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-600">Expected Yield:</span>
                                                    <span className="font-medium text-green-600 flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        {(asset.expected_return / 100).toFixed(2)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <Button className="w-full">
                                            <ShoppingBag className="h-4 w-4 mr-2" />
                                            Invest
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {availableAssets.length === 0 && (
                        <Card>
                            <CardContent className="text-center py-12">
                                <p className="text-slate-600">No assets available for investment at this time.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}