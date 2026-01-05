import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Users, TrendingUp, Coins } from 'lucide-react';

export default function RWAMetricsCard() {
    const { data: assets = [] } = useQuery({
        queryKey: ['rwa-assets-dashboard'],
        queryFn: async () => {
            const result = await base44.entities.RWAAsset.list('-created_date', 50);
            return result || [];
        },
        refetchInterval: 30000
    });

    const { data: investors = [] } = useQuery({
        queryKey: ['rwa-investors-dashboard'],
        queryFn: async () => {
            const result = await base44.entities.RWAInvestor.list('-created_date', 100);
            return result || [];
        },
        refetchInterval: 30000
    });

    const totalValue = assets.reduce((sum, asset) => sum + (asset.total_value || 0), 0);
    const activeAssets = assets.filter(a => a.status === 'active').length;
    const accreditedInvestors = investors.filter(i => i.accreditation_status === 'approved').length;

    return (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-700">RWA Platform</CardTitle>
                    <Building className="h-5 w-5 text-purple-600" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <div className="text-2xl font-bold text-slate-900">
                        ${(totalValue / 1000000).toFixed(2)}M
                    </div>
                    <p className="text-xs text-slate-600">Total Asset Value</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-200">
                    <div className="flex items-center gap-2">
                        <Coins className="h-3 w-3 text-purple-600" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{activeAssets}</div>
                            <div className="text-xs text-slate-600">Active Assets</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-purple-600" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{accreditedInvestors}</div>
                            <div className="text-xs text-slate-600">Investors</div>
                        </div>
                    </div>
                </div>
                <Badge className="w-full justify-center bg-purple-100 text-purple-800 hover:bg-purple-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Tokenization Active
                </Badge>
            </CardContent>
        </Card>
    );
}