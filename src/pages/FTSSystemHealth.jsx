import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertTriangle, XCircle, Cpu, HardDrive, Database } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FTSSystemHealth() {
    const { platformUser } = usePlatformAuth();

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: cloudConnectors = [] } = useQuery({
        queryKey: ['cloud-connectors'],
        queryFn: () => base44.entities.CloudConnector.list()
    });

    const activePSPs = psps.filter(p => p.status === 'active').length;
    const suspendedPSPs = psps.filter(p => p.status === 'suspended').length;
    const provisioningPSPs = psps.filter(p => p.status === 'provisioning').length;
    const activeConnectors = cloudConnectors.filter(c => c.status === 'active').length;

    const systemStatus = suspendedPSPs === 0 && provisioningPSPs === 0 ? 'healthy' : provisioningPSPs > 0 ? 'warning' : 'degraded';

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="FTSSystemHealth" 
                userRole={platformUser?.platform_role} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10" style={{ height: '64px' }}>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">System Health Monitor</h2>
                        <p className="text-xs text-slate-600">Real-time platform status and metrics</p>
                    </div>
                    <Badge className={cn(
                        systemStatus === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
                        systemStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                    )}>
                        {systemStatus === 'healthy' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {systemStatus === 'warning' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {systemStatus === 'degraded' && <XCircle className="h-3 w-3 mr-1" />}
                        System {systemStatus}
                    </Badge>
                </header>

                <div className="p-6">
                    {/* System Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active PSPs</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">{activePSPs}</p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Provisioning</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{provisioningPSPs}</p>
                                    </div>
                                    <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Suspended</p>
                                        <p className="text-3xl font-bold text-red-600 mt-1">{suspendedPSPs}</p>
                                    </div>
                                    <XCircle className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Cloud Nodes</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-1">{activeConnectors}</p>
                                    </div>
                                    <Database className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Service Status Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>PSP Instance Health</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {psps.slice(0, 10).map((psp) => (
                                        <div key={psp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                                >
                                                    {psp.psp_code?.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{psp.psp_name}</p>
                                                    <p className="text-xs text-slate-600">{psp.total_merchants || 0} merchants</p>
                                                </div>
                                            </div>
                                            <Badge className={cn(
                                                psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                                psp.status === 'provisioning' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            )}>
                                                {psp.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Infrastructure Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="flex items-center gap-3">
                                            <Cpu className="h-5 w-5 text-emerald-600" />
                                            <span className="text-sm font-medium">Compute Resources</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">Healthy</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="flex items-center gap-3">
                                            <Database className="h-5 w-5 text-emerald-600" />
                                            <span className="text-sm font-medium">Database Clusters</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">Operational</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="flex items-center gap-3">
                                            <HardDrive className="h-5 w-5 text-emerald-600" />
                                            <span className="text-sm font-medium">Storage Systems</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700">Online</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}