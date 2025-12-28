import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { Coins, ExternalLink } from 'lucide-react';

export default function RWAProviderAssets() {
    const { provider } = useRWAProviderAuth();

    const { data: assets = [] } = useQuery({
        queryKey: ['all-assets', provider?.provider_code],
        queryFn: () => base44.entities.RWAAsset.list('-created_date'),
        enabled: !!provider
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <RWAProviderSidebar 
                currentPage="RWAProviderAssets"
                providerName={provider?.company_name}
                providerEmail={provider?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">All Assets</h1>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map(asset => (
                            <Card key={asset.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{asset.name}</CardTitle>
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
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Type:</span>
                                        <span className="font-medium">{asset.asset_type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Total Value:</span>
                                        <span className="font-medium">${(asset.total_value / 1000000).toFixed(2)}M</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Supply:</span>
                                        <span className="font-medium">{asset.total_supply?.toLocaleString()}</span>
                                    </div>
                                    {asset.contract_address && (
                                        <a 
                                            href={`https://polygonscan.com/address/${asset.contract_address}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                        >
                                            View on Polygonscan
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}