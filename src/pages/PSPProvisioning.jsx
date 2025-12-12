import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
    Building2, 
    Plus, 
    TrendingUp, 
    Users, 
    DollarSign, 
    Activity,
    ArrowRight,
    Sparkles,
    Zap,
    Shield
} from 'lucide-react';

export default function PSPProvisioning() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const totalVolume = psps.reduce((sum, p) => sum + (p.monthly_volume || 0), 0);
    const totalRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const totalMerchants = psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0);
    const activePSPs = psps.filter(p => p.status === 'active').length;

    const tierInfo = {
        starter: { color: 'bg-blue-500', label: 'Starter', price: '$2k/mo' },
        professional: { color: 'bg-purple-500', label: 'Professional', price: '$5k/mo' },
        enterprise: { color: 'bg-amber-500', label: 'Enterprise', price: '$10k/mo' },
        custom: { color: 'bg-emerald-500', label: 'Custom', price: 'Contact' }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">FTS.Money</h1>
                                <p className="text-slate-400">White-Label PSP Infrastructure Platform</p>
                            </div>
                        </div>
                        <Button 
                            size="lg" 
                            onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))}
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-purple-500/30"
                        >
                            <Plus className="h-5 w-5" />
                            Provision New PSP
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Total PSPs</p>
                                    <p className="text-3xl font-bold text-white mt-1">{psps.length}</p>
                                    <p className="text-xs text-emerald-400 mt-1">{activePSPs} active</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <Building2 className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Total Merchants</p>
                                    <p className="text-3xl font-bold text-white mt-1">{totalMerchants.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">Across all PSPs</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Monthly Volume</p>
                                    <p className="text-3xl font-bold text-white mt-1">${(totalVolume / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-emerald-400 mt-1">+12.5% vs last month</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-emerald-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-400">Monthly Revenue</p>
                                    <p className="text-3xl font-bold text-white mt-1">${(totalRevenue / 1000).toFixed(0)}k</p>
                                    <p className="text-xs text-slate-500 mt-1">FTS.Money earnings</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-amber-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* PSP Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {psps.map((psp) => {
                        const tier = tierInfo[psp.tier] || tierInfo.starter;
                        return (
                            <Card 
                                key={psp.id} 
                                className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer group backdrop-blur-sm"
                                onClick={() => navigate(createPageUrl('PSPDetails', `?id=${psp.id}`))}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {psp.branding?.logo_url ? (
                                                <img src={psp.branding.logo_url} alt={psp.psp_name} className="w-12 h-12 rounded-lg object-cover" />
                                            ) : (
                                                <div 
                                                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                                    style={{ background: psp.branding?.primary_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                                                >
                                                    {psp.psp_code?.substring(0, 2)}
                                                </div>
                                            )}
                                            <div>
                                                <CardTitle className="text-lg text-white">{psp.psp_name}</CardTitle>
                                                <p className="text-xs text-slate-500 font-mono">{psp.psp_code}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            psp.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                            psp.status === 'provisioning' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                            psp.status === 'suspended' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                            'bg-red-500/20 text-red-400 border-red-500/30'
                                        )}>
                                            {psp.status}
                                        </Badge>
                                    </div>
                                    {psp.status === 'provisioning' && (
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                                <span>Provisioning...</span>
                                                <span>{psp.provisioning_progress || 0}%</span>
                                            </div>
                                            <Progress value={psp.provisioning_progress || 0} className="h-1" />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", tier.color)} />
                                        <span className="text-sm text-slate-400">{tier.label} Plan</span>
                                        <span className="text-xs text-slate-500 ml-auto">{tier.price}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Users className="h-3 w-3 text-slate-500" />
                                                <p className="text-xs text-slate-500">Merchants</p>
                                            </div>
                                            <p className="text-lg font-bold text-white">{psp.total_merchants || 0}</p>
                                            <p className="text-xs text-emerald-400">{psp.active_merchants || 0} active</p>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Activity className="h-3 w-3 text-slate-500" />
                                                <p className="text-xs text-slate-500">Volume</p>
                                            </div>
                                            <p className="text-lg font-bold text-white">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                            <p className="text-xs text-slate-500">This month</p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-2 border-t border-slate-700 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Revenue Share</span>
                                            <span className="font-semibold text-white">{psp.revenue_share_percentage}%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">FTS Revenue (MTD)</span>
                                            <span className="font-semibold text-emerald-400">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}k</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center gap-2">
                                        {psp.advanced_features?.smart_routing && (
                                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                                                <Zap className="h-3 w-3 mr-1" />
                                                AI
                                            </Badge>
                                        )}
                                        {psp.advanced_features?.crypto_payments && (
                                            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                                Crypto
                                            </Badge>
                                        )}
                                        {psp.compliance_features?.pci_dss && (
                                            <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                                                <Shield className="h-3 w-3 mr-1" />
                                                PCI
                                            </Badge>
                                        )}
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        className="w-full group-hover:bg-slate-700 border-slate-600 text-slate-300"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(createPageUrl('PSPDetails', `?id=${psp.id}`));
                                        }}
                                    >
                                        Manage
                                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {psps.length === 0 && (
                        <div className="col-span-3 text-center py-20">
                            <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 mb-2 text-lg">No PSPs provisioned yet</p>
                            <p className="text-sm text-slate-500 mb-6">Start by provisioning your first white-label PSP instance</p>
                            <Button 
                                size="lg"
                                onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                            >
                                <Plus className="h-5 w-5" />
                                Provision Your First PSP
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}