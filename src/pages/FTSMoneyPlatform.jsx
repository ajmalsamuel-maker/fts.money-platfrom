import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_PERMISSIONS, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
    Building2, 
    Plus, 
    TrendingUp, 
    Users, 
    DollarSign, 
    Activity,
    Sparkles,
    Settings,
    BarChart3,
    Shield,
    Zap,
    Globe,
    LogOut,
    Menu,
    Database,
    Wallet,
    Trash2,
    Star,
    Package
} from 'lucide-react';

const quickActions = [
    { icon: Building2, label: 'PSP Instances', path: 'PSPProvisioning', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { icon: Package, label: 'Service Catalog', path: 'FTSServiceManager', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { icon: Database, label: 'Provider Pool', path: 'FTSProviderPool', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { icon: Wallet, label: 'Payout Routes', path: 'FTSPayoutRoutes', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { icon: Zap, label: 'Fee Templates', path: 'FTSFeeTemplates', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { icon: BarChart3, label: 'Analytics', path: 'FTSAnalytics', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { icon: DollarSign, label: 'Revenue', path: 'FTSRevenue', color: 'bg-pink-50 text-pink-700 border-pink-200' }
];

export default function FTSMoneyPlatform() {
    const navigate = useNavigate();
    const { platformUser, loading } = usePlatformAuth();

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: routes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list()
    });
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const totalVolume = psps.reduce((sum, p) => sum + (Number(p.monthly_volume) || 0), 0);
    const totalRevenue = psps.reduce((sum, p) => sum + (Number(p.monthly_revenue) || 0), 0);
    const totalMerchants = psps.reduce((sum, p) => sum + (Number(p.total_merchants) || 0), 0);
    const activePSPs = psps.filter(p => p.status === 'active').length;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSMoneyPlatform" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-slate-50">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Control Panel Dashboard</h2>
                        <p className="text-xs text-slate-600">Unified management for all PSP instances and global configurations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                        </div>
                        <Button 
                            onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            Provision New PSP
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    {/* Quick Actions */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-7 gap-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.path}
                                        onClick={() => navigate(createPageUrl(action.path))}
                                        className={cn(
                                            "p-4 rounded-lg border-2 hover:shadow-md transition-all text-left",
                                            action.color
                                        )}
                                    >
                                        <Icon className="h-6 w-6 mb-2" />
                                        <p className="text-sm font-medium">{action.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-5 gap-4 mb-6">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">PSP Instances</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{psps.length}</p>
                                        <p className="text-xs text-emerald-600 mt-1">{activePSPs} active</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Merchants</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalMerchants.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">Across all PSPs</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Payment Providers</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{providers.length}</p>
                                        <p className="text-xs text-slate-500 mt-1">In provider pool</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                                        <Database className="h-6 w-6 text-cyan-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Payout Routes</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{routes.length}</p>
                                        <p className="text-xs text-slate-500 mt-1">Available methods</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Wallet className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Platform Revenue</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">${(totalRevenue / 1000).toFixed(0)}k</p>
                                        <p className="text-xs text-emerald-600 mt-1">+15.3% MoM</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <DollarSign className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* PSP Cards Grid */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Active PSP Instances</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {psps.map((psp) => {
                                const isTemplate = psp.is_template;
                                
                                return (
                                    <Card 
                                        key={psp.id} 
                                        className={cn(
                                            "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group relative",
                                            isTemplate && "border-amber-300 bg-amber-50/30"
                                        )}
                                    >
                                        <CardContent className="p-4">
                                            {isTemplate && (
                                                <div className="absolute top-2 right-2">
                                                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 gap-1">
                                                        <Star className="h-3 w-3" />
                                                        Template
                                                    </Badge>
                                                </div>
                                            )}
                                            
                                            <div 
                                                className="flex items-start justify-between mb-3 cursor-pointer"
                                                onClick={() => navigate(createPageUrl('PSPInstanceConfig') + `?id=${psp.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                                        style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                                    >
                                                        {psp.psp_code?.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{psp.psp_name}</p>
                                                        <p className="text-xs text-slate-500 font-mono">{psp.psp_code}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                <div>
                                                    <p className="text-slate-500 text-xs">Merchants</p>
                                                    <p className="text-slate-900 font-semibold">{psp.total_merchants || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs">Volume</p>
                                                    <p className="text-slate-900 font-semibold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                                </div>
                                            </div>
                                            
                                            {!isTemplate && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const action = psp.status === 'active' ? 'suspend' : 'activate';
                                                            const newStatus = psp.status === 'active' ? 'suspended' : 'active';
                                                            if (confirm(`${action === 'suspend' ? 'Suspend' : 'Activate'} ${psp.psp_name}?`)) {
                                                                await base44.entities.ApprovalRequest.create({
                                                                    request_type: 'psp_status_change',
                                                                    entity_type: 'ProvisionedPSP',
                                                                    entity_id: psp.id,
                                                                    entity_data: psp,
                                                                    action_data: { new_status: newStatus },
                                                                    submitted_by: platformUser?.email || 'admin@fts.money',
                                                                    submitted_by_name: platformUser?.email || 'Admin',
                                                                    priority: 'high'
                                                                });
                                                                alert('Status change request submitted for approval');
                                                            }
                                                        }}
                                                    >
                                                        {psp.status === 'active' ? '⏸ Suspend' : '▶ Activate'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm(`Delete ${psp.psp_name}? This action cannot be undone.`)) {
                                                                await base44.entities.ApprovalRequest.create({
                                                                    request_type: 'psp_deletion',
                                                                    entity_type: 'ProvisionedPSP',
                                                                    entity_id: psp.id,
                                                                    entity_data: psp,
                                                                    submitted_by: platformUser?.email || 'admin@fts.money',
                                                                    submitted_by_name: platformUser?.email || 'Admin',
                                                                    priority: 'urgent'
                                                                });
                                                                alert('Deletion request submitted for approval');
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            {isTemplate && (
                                                <div className="text-xs text-amber-700 text-center pt-2 border-t border-amber-200">
                                                    Protected template - cannot be deleted
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            
                            {psps.length === 0 && (
                                <div className="col-span-3 text-center py-12">
                                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">No PSPs provisioned yet</p>
                                    <Button onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))} className="bg-blue-600 hover:bg-blue-700">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Provision Your First PSP
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}