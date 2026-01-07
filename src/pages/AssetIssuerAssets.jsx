import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import ValuationUpdateDialog from '@/components/rwa/ValuationUpdateDialog';
import { createPageUrl } from '@/utils';
import { Coins, Plus, ExternalLink, TrendingUp } from 'lucide-react';

export default function AssetIssuerAssets() {
    const { issuer } = useAssetIssuerAuth();
    const [valuationAsset, setValuationAsset] = useState(null);

    const { data: myAssets = [] } = useQuery({
        queryKey: ['my-assets', issuer?.issuer_id],
        queryFn: async () => {
            const issuers = await base44.entities.AssetIssuer.filter({ id: issuer.issuer_id });
            if (issuers.length === 0) return [];
            return base44.entities.RWAAsset.filter({ issuer_lei: issuers[0].lei });
        },
        enabled: !!issuer
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerAssets"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">My Assets</h1>
                        <Button onClick={() => window.location.href = createPageUrl('AssetIssuerTokenize')} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Tokenize Asset
                        </Button>
                    </div>

                    {myAssets.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Coins className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-600 mb-4">You haven't tokenized any assets yet</p>
                                <Button onClick={() => window.location.href = createPageUrl('AssetIssuerTokenize')}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tokenize Your First Asset
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {myAssets.map(asset => (
                                <Card key={asset.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle>{asset.name}</CardTitle>
                                                <p className="text-sm text-slate-600">{asset.symbol}</p>
                                            </div>
                                            <Badge className={
                                                asset.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }>
                                                {asset.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-600">Type</p>
                                                <p className="font-medium">{asset.asset_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Network</p>
                                                <p className="font-medium capitalize">{asset.network}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Total Value</p>
                                                <p className="font-medium">${(asset.total_value / 1000000).toFixed(2)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-600">Supply</p>
                                                <p className="font-medium">{asset.total_supply?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        {asset.contract_address && (
                                            <a 
                                                href={`https://polygonscan.com/address/${asset.contract_address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                            >
                                                View Contract on Polygonscan
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full mt-2"
                                            onClick={() => setValuationAsset(asset)}
                                        >
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Update Valuation
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ValuationUpdateDialog 
                asset={valuationAsset}
                open={!!valuationAsset}
                onClose={() => setValuationAsset(null)}
            />
        </div>
    );
}