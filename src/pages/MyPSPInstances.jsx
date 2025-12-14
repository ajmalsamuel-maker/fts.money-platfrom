import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
    Building2,
    Plus,
    ExternalLink,
    Settings,
    TrendingUp,
    Users,
    DollarSign,
    Sparkles
} from 'lucide-react';

export default function MyPSPInstances() {
    const navigate = useNavigate();
    const [session, setSession] = useState(null);

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
    }, [navigate]);

    // Filter PSPs by ownership - only show PSPs owned by current user
    const { data: allPSPs = [] } = useQuery({
        queryKey: ['my-psp-instances', session?.email],
        queryFn: async () => {
            const all = await base44.entities.ProvisionedPSP.list('-created_date');
            // Filter to only show PSPs owned by current user (exclude templates)
            return all.filter(psp => 
                psp.owner_email === session?.email && 
                !psp.is_template && 
                psp.visibility !== 'template'
            );
        },
        enabled: !!session?.email
    });
    
    const psps = allPSPs || [];

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="MyPSPInstances" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">My PSP Instances</h2>
                        <p className="text-xs text-slate-600">Manage your payment infrastructure</p>
                    </div>
                    <Button onClick={() => navigate(createPageUrl('CommunityPSPProvisioning'))} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Launch New PSP
                    </Button>
                </header>

                <div className="p-6">
                    {psps.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No PSP Instances Yet</h3>
                                <p className="text-slate-600 mb-6">Get started by launching your first PSP instance</p>
                                <Button onClick={() => navigate(createPageUrl('CommunityPSPProvisioning'))} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Launch Your First PSP
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {psps.map((psp) => (
                                <Card key={psp.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                                    style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                                >
                                                    {psp.psp_code?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{psp.psp_name}</h3>
                                                    <p className="text-sm text-slate-600 font-mono">{psp.psp_code}</p>
                                                    <p className="text-sm text-slate-600">{psp.subdomain}.fts.money</p>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                psp.status === 'provisioning' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            )}>
                                                {psp.status}
                                            </Badge>
                                        </div>

                                        {psp.status === 'provisioning' && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm text-slate-600">Provisioning Progress</p>
                                                    <p className="text-sm font-semibold">{psp.provisioning_progress || 0}%</p>
                                                </div>
                                                <Progress value={psp.provisioning_progress || 0} className="h-2" />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-slate-500">Tier</p>
                                                <p className="font-semibold capitalize">{psp.tier}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Merchants</p>
                                                <p className="font-semibold">{psp.total_merchants || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Monthly Volume</p>
                                                <p className="font-semibold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Revenue</p>
                                                <p className="font-semibold">${((psp.monthly_revenue || 0) / 1000).toFixed(1)}k</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!psp.setup_completed && (
                                                <Button 
                                                    size="sm"
                                                    onClick={() => navigate(createPageUrl('PSPSetupWizard') + `?psp_id=${psp.id}`)}
                                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                                                >
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Complete Setup
                                                </Button>
                                            )}
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => window.open(`https://${psp.subdomain}.fts.money`, '_blank')}
                                                disabled={psp.status !== 'active'}
                                            >
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                Open Portal
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => navigate(createPageUrl('PSPInstanceConfig', `?id=${psp.id}`))}
                                            >
                                                <Settings className="h-4 w-4 mr-2" />
                                                Configure
                                            </Button>
                                            <Button 
                                                size="sm"
                                                variant="outline"
                                                onClick={() => navigate(createPageUrl('CommunityMarketplace', `?psp=${psp.id}`))}
                                            >
                                                Browse Services
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}