import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { Users, TrendingUp, DollarSign, Award } from 'lucide-react';

export default function AssetIssuerInvestors() {
    const { issuer, loading } = useAssetIssuerAuth();

    const { data: myAssets = [] } = useQuery({
        queryKey: ['my-assets', issuer?.issuer_id],
        queryFn: async () => {
            const issuers = await base44.entities.AssetIssuer.filter({ id: issuer.issuer_id });
            if (issuers.length === 0) return [];
            return base44.entities.RWAAsset.filter({ issuer_lei: issuers[0].lei });
        },
        enabled: !!issuer
    });

    const { data: allInvestors = [] } = useQuery({
        queryKey: ['all-investors'],
        queryFn: () => base44.entities.RWAInvestor.list(),
        enabled: !!issuer
    });

    const { data: holdings = [] } = useQuery({
        queryKey: ['holdings'],
        queryFn: () => base44.entities.RWAHolding.list(),
        enabled: !!issuer
    });

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    const myAssetIds = myAssets.map(a => a.asset_id);
    const myInvestors = holdings
        .filter(h => myAssetIds.includes(h.asset_id))
        .map(h => {
            const investor = allInvestors.find(inv => inv.id === h.investor_id);
            const asset = myAssets.find(a => a.asset_id === h.asset_id);
            return { ...h, investor, asset };
        })
        .filter(h => h.investor);

    const uniqueInvestors = Array.from(new Set(myInvestors.map(h => h.investor_id)))
        .map(id => {
            const investor = allInvestors.find(inv => inv.id === id);
            const investorHoldings = myInvestors.filter(h => h.investor_id === id);
            const totalValue = investorHoldings.reduce((sum, h) => sum + (h.current_value || 0), 0);
            return { investor, holdings: investorHoldings, totalValue };
        });

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerInvestors"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Investors</h1>
                        <p className="text-slate-600">Manage your investor base</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Total Investors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">{uniqueInvestors.length}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" />
                                    Total Investment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    ${uniqueInvestors.reduce((sum, i) => sum + i.totalValue, 0).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                                    <Award className="h-4 w-4" />
                                    Accredited
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold">
                                    {uniqueInvestors.filter(i => i.investor?.accreditation_status === 'verified').length}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Investor List</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {uniqueInvestors.length === 0 ? (
                                <div className="text-center py-12">
                                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">No investors yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {uniqueInvestors.map(({ investor, holdings, totalValue }) => (
                                        <div key={investor.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{investor.full_name || investor.entity_name}</h3>
                                                    <p className="text-sm text-slate-600">{investor.email}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="outline">{investor.investor_type}</Badge>
                                                        {investor.accreditation_status === 'verified' && (
                                                            <Badge className="bg-green-100 text-green-700">Accredited</Badge>
                                                        )}
                                                        <Badge variant="secondary">{holdings.length} holdings</Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold">${totalValue.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-500">Total Investment</p>
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