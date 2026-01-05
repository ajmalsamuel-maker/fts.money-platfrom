import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, Globe, TrendingUp, CheckCircle } from 'lucide-react';

export default function VATMetricsCard() {
    const { data: taxLogs = [] } = useQuery({
        queryKey: ['tax-calculations-recent'],
        queryFn: async () => {
            const logs = await base44.entities.TaxCalculationLog.list('-created_date', 50);
            return logs || [];
        },
        refetchInterval: 30000
    });

    const totalVatCollected = taxLogs.reduce((sum, log) => sum + (log.vat_amount || 0), 0);
    const uniqueJurisdictions = new Set(taxLogs.map(log => log.jurisdiction_code)).size;
    const reverseChargeCount = taxLogs.filter(log => log.reverse_charge_applied).length;
    const vatEnabledCount = taxLogs.filter(log => log.vat_enabled).length;

    return (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-700">VAT & Tax</CardTitle>
                    <Receipt className="h-5 w-5 text-green-600" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <div className="text-2xl font-bold text-slate-900">
                        ${totalVatCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-slate-600">VAT Collected (30d)</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-green-200">
                    <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-green-600" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{uniqueJurisdictions}</div>
                            <div className="text-xs text-slate-600">Jurisdictions</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{reverseChargeCount}</div>
                            <div className="text-xs text-slate-600">B2B Reverse</div>
                        </div>
                    </div>
                </div>
                <Badge className="w-full justify-center bg-green-100 text-green-800 hover:bg-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {vatEnabledCount} calculations
                </Badge>
            </CardContent>
        </Card>
    );
}