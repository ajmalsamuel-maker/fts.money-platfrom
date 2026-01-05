import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export default function VASPComplianceCard() {
    const { data: screenings = [] } = useQuery({
        queryKey: ['sanctions-dashboard'],
        queryFn: async () => {
            const result = await base44.entities.SanctionsScreening.list('-created_date', 100);
            return result || [];
        },
        refetchInterval: 30000
    });

    const { data: travelRuleData = [] } = useQuery({
        queryKey: ['travel-rule-dashboard'],
        queryFn: async () => {
            const result = await base44.entities.TravelRuleData.list('-created_date', 50);
            return result || [];
        },
        refetchInterval: 30000
    });

    const flagged = screenings.filter(s => s.status === 'flagged').length;
    const cleared = screenings.filter(s => s.status === 'cleared').length;
    const travelRuleCompliant = travelRuleData.filter(t => t.compliance_status === 'compliant').length;

    return (
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-700">VASP Compliance</CardTitle>
                    <Shield className="h-5 w-5 text-orange-600" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <div className="text-2xl font-bold text-slate-900">{screenings.length}</div>
                    <p className="text-xs text-slate-600">AML Screenings (30d)</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-orange-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{cleared}</div>
                            <div className="text-xs text-slate-600">Cleared</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-red-600" />
                        <div>
                            <div className="text-sm font-semibold text-slate-900">{flagged}</div>
                            <div className="text-xs text-slate-600">Flagged</div>
                        </div>
                    </div>
                </div>
                <Badge className="w-full justify-center bg-orange-100 text-orange-800 hover:bg-orange-200">
                    <Activity className="h-3 w-3 mr-1" />
                    {travelRuleCompliant} Travel Rule OK
                </Badge>
            </CardContent>
        </Card>
    );
}