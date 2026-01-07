import React from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel, PLATFORM_ROLES } from '@/components/auth/usePlatformAuth';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';

export default function RWAPlatformAssets() {
    const { platformUser, loading } = usePlatformAuth();

    const { data: assets = [] } = useQuery({
        queryKey: ['all-rwa-assets'],
        queryFn: () => base44.entities.RWAAsset.list('-created_date')
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="RWAPlatformAssets" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Tokenized Assets</h2>
                        <p className="text-xs text-slate-600">View all tokenized assets across the RWA platform</p>
                    </div>
                </header>

                <div className="p-6">
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
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Issuer LEI:</span>
                                        <span className="font-mono text-xs">{asset.issuer_lei || 'N/A'}</span>
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
                        {assets.length === 0 && (
                            <div className="col-span-full text-center py-12 text-slate-500">
                                No tokenized assets yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}