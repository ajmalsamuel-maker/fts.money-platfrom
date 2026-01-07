import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssetIssuerAuth } from '@/components/auth/useRWAProviderAuth';
import AssetIssuerSidebar from '@/components/rwa/AssetIssuerSidebar';
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function AssetIssuerCompliance() {
    const { issuer, loading } = useAssetIssuerAuth();

    const complianceChecks = [
        { name: 'LEI Verification', status: 'completed', icon: CheckCircle, color: 'text-green-600' },
        { name: 'KYB Documents', status: 'completed', icon: CheckCircle, color: 'text-green-600' },
        { name: 'Securities License', status: 'pending', icon: Clock, color: 'text-yellow-600' },
        { name: 'AML Screening', status: 'completed', icon: CheckCircle, color: 'text-green-600' },
        { name: 'Annual Audit', status: 'required', icon: AlertCircle, color: 'text-red-600' }
    ];

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <AssetIssuerSidebar 
                currentPage="AssetIssuerCompliance"
                issuerName={issuer?.company_name}
                issuerEmail={issuer?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900">Compliance Dashboard</h1>
                        <p className="text-slate-600">Monitor regulatory requirements</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Compliance Score</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">85%</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">LEI Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className="bg-blue-100 text-blue-700">Verified</Badge>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Compliance Checklist
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {complianceChecks.map((check) => {
                                    const Icon = check.icon;
                                    return (
                                        <div key={check.name} className="flex items-center justify-between border rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <Icon className={`h-5 w-5 ${check.color}`} />
                                                <span className="font-medium">{check.name}</span>
                                            </div>
                                            <Badge className={
                                                check.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                check.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }>
                                                {check.status}
                                            </Badge>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}