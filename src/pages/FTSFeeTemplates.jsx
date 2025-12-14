import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, DollarSign, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const tierTemplates = {
    starter: {
        name: 'Starter Tier',
        base_percentage: 2.9,
        base_fixed: 0.30,
        volume_tiers: [
            { min: 0, max: 100000, discount: 0 },
            { min: 100000, max: 1000000, discount: 0.1 },
            { min: 1000000, max: null, discount: 0.2 }
        ],
        currency_fees: {
            USD: { percentage: 2.9, fixed: 0.30 },
            EUR: { percentage: 2.9, fixed: 0.30 },
            GBP: { percentage: 2.9, fixed: 0.30 }
        },
        additional_fees: {
            chargeback: { enabled: true, amount: 15 },
            refund: { enabled: true, amount: 0.50 },
            monthly_minimum: { enabled: true, amount: 25 }
        }
    },
    professional: {
        name: 'Professional Tier',
        base_percentage: 2.5,
        base_fixed: 0.25,
        volume_tiers: [
            { min: 0, max: 500000, discount: 0 },
            { min: 500000, max: 5000000, discount: 0.2 },
            { min: 5000000, max: null, discount: 0.4 }
        ],
        currency_fees: {
            USD: { percentage: 2.5, fixed: 0.25 },
            EUR: { percentage: 2.5, fixed: 0.25 },
            GBP: { percentage: 2.5, fixed: 0.25 },
            SGD: { percentage: 2.5, fixed: 0.30 },
            HKD: { percentage: 2.5, fixed: 2.00 }
        },
        additional_fees: {
            chargeback: { enabled: true, amount: 12 },
            refund: { enabled: false, amount: 0 },
            monthly_minimum: { enabled: false, amount: 0 }
        }
    },
    enterprise: {
        name: 'Enterprise Tier',
        base_percentage: 2.0,
        base_fixed: 0.20,
        volume_tiers: [
            { min: 0, max: 1000000, discount: 0 },
            { min: 1000000, max: 10000000, discount: 0.3 },
            { min: 10000000, max: null, discount: 0.6 }
        ],
        currency_fees: {
            USD: { percentage: 2.0, fixed: 0.20 },
            EUR: { percentage: 2.0, fixed: 0.20 },
            GBP: { percentage: 2.0, fixed: 0.20 },
            SGD: { percentage: 2.0, fixed: 0.25 },
            HKD: { percentage: 2.0, fixed: 1.50 },
            JPY: { percentage: 2.0, fixed: 25 }
        },
        additional_fees: {
            chargeback: { enabled: true, amount: 10 },
            refund: { enabled: false, amount: 0 },
            monthly_minimum: { enabled: false, amount: 0 }
        }
    }
};

export default function FTSFeeTemplates() {
    const { platformUser, loading } = usePlatformAuth();
    const [selectedTier, setSelectedTier] = useState('professional');
    const template = tierTemplates[selectedTier];

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSFeeTemplates" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Fee Structure Templates</h2>
                        <p className="text-xs text-slate-600">Tier-based automated fee configuration for PSP instances</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-600">Logged in as</p>
                        <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                        <Badge className="mt-1 bg-blue-600 text-white text-xs">
                            {getRoleLabel(platformUser?.platform_role)}
                        </Badge>
                    </div>
                </header>

                <div className="p-6">
                    {/* Tier Selection */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Select Service Tier</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs value={selectedTier} onValueChange={setSelectedTier}>
                                <TabsList className="grid grid-cols-3">
                                    <TabsTrigger value="starter">Starter</TabsTrigger>
                                    <TabsTrigger value="professional">Professional</TabsTrigger>
                                    <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Base Fees */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Base Fee Structure - {template.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-900 font-medium">Base Percentage</p>
                                    <p className="text-3xl font-bold text-blue-700">{template.base_percentage}%</p>
                                </div>
                                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <p className="text-sm text-emerald-900 font-medium">Base Fixed Fee</p>
                                    <p className="text-3xl font-bold text-emerald-700">${template.base_fixed}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Volume Tiers */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Volume-Based Discount Tiers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {template.volume_tiers.map((tier, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <div>
                                            <p className="font-medium">
                                                ${(tier.min / 1000).toFixed(0)}K - {tier.max ? `$${(tier.max / 1000).toFixed(0)}K` : '∞'}
                                            </p>
                                            <p className="text-xs text-slate-600">Monthly transaction volume</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={tier.discount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                {tier.discount > 0 ? `-${tier.discount}%` : 'Base Rate'}
                                            </Badge>
                                            {tier.discount > 0 && (
                                                <p className="text-xs text-slate-600 mt-1">
                                                    Effective: {(template.base_percentage - tier.discount).toFixed(2)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Currency-Specific Fees */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Currency-Specific Fee Overrides</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Object.entries(template.currency_fees).map(([currency, fees]) => (
                                    <div key={currency} className="grid grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg items-center">
                                        <Badge variant="outline" className="font-mono text-sm">{currency}</Badge>
                                        <div>
                                            <p className="text-xs text-slate-600">Percentage</p>
                                            <p className="font-semibold">{fees.percentage}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600">Fixed Fee</p>
                                            <p className="font-semibold">${fees.fixed}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="text-xs">Applied</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Fee Types */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Fee Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(template.additional_fees).map(([feeType, config]) => (
                                    <div key={feeType} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                config.enabled ? "bg-emerald-500" : "bg-slate-300"
                                            )} />
                                            <div>
                                                <p className="font-medium capitalize">{feeType.replace('_', ' ')} Fee</p>
                                                <p className="text-xs text-slate-600">
                                                    {feeType === 'chargeback' && 'Charged when chargeback occurs'}
                                                    {feeType === 'refund' && 'Fee for processing refunds'}
                                                    {feeType === 'monthly_minimum' && 'Minimum monthly platform fee'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-semibold">${config.amount}</p>
                                            <Badge className={config.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                {config.enabled ? 'Enabled' : 'Disabled'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}