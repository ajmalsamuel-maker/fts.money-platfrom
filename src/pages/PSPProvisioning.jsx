import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import WorkflowValidator from '@/components/workflow/WorkflowValidator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    Shield,
    Search,
    Settings,
    MoreVertical
} from 'lucide-react';

export default function PSPProvisioning() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [search, setSearch] = useState('');
    const [workflowCompliance, setWorkflowCompliance] = useState(null);

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    // Check workflow compliance on mount
    useEffect(() => {
        const checkCompliance = async () => {
            const result = await WorkflowValidator.checkCompliance('psp_provisioning', ['iso_19510', 'iso_10746', 'iso_9001']);
            setWorkflowCompliance(result);
        };
        checkCompliance();
    }, []);

    const filteredPSPs = psps.filter(p => 
        p.psp_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.psp_code?.toLowerCase().includes(search.toLowerCase())
    );

    const totalVolume = psps.reduce((sum, p) => sum + (p.monthly_volume || 0), 0);
    const totalRevenue = psps.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    const totalMerchants = psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0);
    const activePSPs = psps.filter(p => p.status === 'active').length;

    const tierInfo = {
        starter: { color: 'text-blue-700 bg-blue-100', label: 'Starter', price: '$2k/mo' },
        professional: { color: 'text-purple-700 bg-purple-100', label: 'Professional', price: '$5k/mo' },
        enterprise: { color: 'text-amber-700 bg-amber-100', label: 'Enterprise', price: '$10k/mo' },
        custom: { color: 'text-emerald-700 bg-emerald-100', label: 'Custom', price: 'Contact' }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PSPProvisioning" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">PSP Instances</h2>
                            <p className="text-xs text-slate-600">Manage white-label PSP infrastructure</p>
                        </div>
                        {workflowCompliance && (
                            <Badge className={workflowCompliance.compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                <Shield className="h-3 w-3 mr-1" />
                                {workflowCompliance.compliant ? 'ISO Compliant' : 'Compliance Issue'}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                        <Button 
                            onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-5 w-5" />
                            Provision New PSP
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by PSP name or code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                {/* Stats Overview */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Total PSPs</p>
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
                                    <p className="text-sm text-slate-600">Monthly Volume</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">${(totalVolume / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-emerald-600 mt-1">+12.5% vs last month</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Monthly Revenue</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">${(totalRevenue / 1000).toFixed(0)}k</p>
                                    <p className="text-xs text-slate-500 mt-1">FTS.Money earnings</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* PSP Table */}
                <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle>All PSP Instances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {filteredPSPs.map((psp) => {
                                const tier = tierInfo[psp.tier] || tierInfo.starter;
                                return (
                                    <div 
                                        key={psp.id} 
                                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                                                style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                            >
                                                {psp.psp_code?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900">{psp.psp_name}</p>
                                                    <Badge className={cn(tier.color, "text-xs")}>{tier.label}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 font-mono">{psp.psp_code}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Merchants</p>
                                                <p className="font-semibold">{psp.total_merchants || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Volume</p>
                                                <p className="font-semibold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                            </div>
                                            <Badge className={cn(
                                                psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                psp.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            )}>
                                                {psp.status}
                                            </Badge>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate(createPageUrl('PSPInstanceManagement') + `?id=${psp.id}`)}
                                                >
                                                    Manage
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="sm" variant="ghost">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => navigate(createPageUrl('PSPInstanceConfig') + `?id=${psp.id}`)}>
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Configure
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => navigate(createPageUrl('PSPInstanceManagement') + `?id=${psp.id}`)}>
                                                            <Activity className="h-4 w-4 mr-2" />
                                                            View Logs
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredPSPs.length === 0 && (
                                <div className="text-center py-12">
                                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        {search ? 'No PSPs match your search' : 'No PSPs provisioned yet'}
                                    </p>
                                    {!search && (
                                        <Button 
                                            onClick={() => navigate(createPageUrl('PSPProvisioningWizard'))}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Provision Your First PSP
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
                </div>
            </div>
        </div>
    );
}