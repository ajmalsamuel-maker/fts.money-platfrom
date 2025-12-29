import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, AlertTriangle, XCircle, Cpu, HardDrive, Database, Code, GitBranch, Wallet, Briefcase } from 'lucide-react';
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

    const { data: isoCustomers = [] } = useQuery({
        queryKey: ['iso-customers'],
        queryFn: () => base44.entities.ISOGatewayCustomer.list()
    });

    const { data: orchestrationCustomers = [] } = useQuery({
        queryKey: ['orchestration-customers'],
        queryFn: () => base44.entities.OrchestrationCustomer.list()
    });

    const { data: cryptoCustomers = [] } = useQuery({
        queryKey: ['crypto-customers'],
        queryFn: () => base44.entities.CryptoGatewayCustomer.list()
    });

    const { data: rwaProviders = [] } = useQuery({
        queryKey: ['rwa-providers'],
        queryFn: () => base44.entities.RWAWhiteLabelCustomer.list()
    });

    const activePSPs = psps.filter(p => p.status === 'active').length;
    const suspendedPSPs = psps.filter(p => p.status === 'suspended').length;
    const provisioningPSPs = psps.filter(p => p.status === 'provisioning').length;
    const activeConnectors = cloudConnectors.filter(c => c.status === 'active').length;
    const activeISO = isoCustomers.filter(c => c.status === 'active').length;
    const activeOrchestration = orchestrationCustomers.filter(c => c.status === 'active').length;
    const activeCrypto = cryptoCustomers.filter(c => c.status === 'active').length;
    const activeRWA = rwaProviders.filter(c => c.status === 'active').length;

    const totalServices = activePSPs + activeISO + activeOrchestration + activeCrypto + activeRWA;
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
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-600">Total Services</p>
                                        <p className="text-2xl font-bold text-blue-600 mt-1">{totalServices}</p>
                                    </div>
                                    <Activity className="h-6 w-6 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-600">PSPs</p>
                                        <p className="text-2xl font-bold text-emerald-600 mt-1">{activePSPs}</p>
                                    </div>
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-600">ISO Gateway</p>
                                        <p className="text-2xl font-bold text-indigo-600 mt-1">{activeISO}</p>
                                    </div>
                                    <Code className="h-6 w-6 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-600">Orchestration</p>
                                        <p className="text-2xl font-bold text-purple-600 mt-1">{activeOrchestration}</p>
                                    </div>
                                    <GitBranch className="h-6 w-6 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-600">Crypto</p>
                                        <p className="text-2xl font-bold text-cyan-600 mt-1">{activeCrypto}</p>
                                    </div>
                                    <Wallet className="h-6 w-6 text-cyan-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-600">RWA</p>
                                        <p className="text-2xl font-bold text-amber-600 mt-1">{activeRWA}</p>
                                    </div>
                                    <Briefcase className="h-6 w-6 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Service Status Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                    PSP Instances ({activePSPs})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {psps.slice(0, 6).map((psp) => (
                                        <div key={psp.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                                                    style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                                >
                                                    {psp.psp_code?.substring(0, 2)}
                                                </div>
                                                <span className="text-sm">{psp.psp_name}</span>
                                            </div>
                                            <Badge className={cn(
                                                psp.status === 'active' ? 'bg-emerald-100 text-emerald-700 text-xs' :
                                                'bg-red-100 text-red-700 text-xs'
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
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="h-5 w-5 text-indigo-600" />
                                    ISO Gateway ({activeISO})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {isoCustomers.slice(0, 6).map((customer) => (
                                        <div key={customer.id} className="flex items-center justify-between p-2 bg-indigo-50 rounded">
                                            <span className="text-sm">{customer.company_name}</span>
                                            <Badge className={cn(
                                                customer.status === 'active' ? 'bg-indigo-100 text-indigo-700 text-xs' :
                                                'bg-slate-100 text-slate-700 text-xs'
                                            )}>
                                                {customer.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GitBranch className="h-5 w-5 text-purple-600" />
                                    Orchestration ({activeOrchestration})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {orchestrationCustomers.slice(0, 6).map((customer) => (
                                        <div key={customer.id} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                                            <span className="text-sm">{customer.company_name}</span>
                                            <Badge className={cn(
                                                customer.status === 'active' ? 'bg-purple-100 text-purple-700 text-xs' :
                                                'bg-slate-100 text-slate-700 text-xs'
                                            )}>
                                                {customer.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-cyan-600" />
                                    Crypto Banking ({activeCrypto})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {cryptoCustomers.slice(0, 6).map((customer) => (
                                        <div key={customer.id} className="flex items-center justify-between p-2 bg-cyan-50 rounded">
                                            <span className="text-sm">{customer.company_name}</span>
                                            <Badge className={cn(
                                                customer.status === 'active' ? 'bg-cyan-100 text-cyan-700 text-xs' :
                                                'bg-slate-100 text-slate-700 text-xs'
                                            )}>
                                                {customer.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-amber-600" />
                                    RWA Platform ({activeRWA})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {rwaProviders.slice(0, 6).map((provider) => (
                                        <div key={provider.id} className="flex items-center justify-between p-2 bg-amber-50 rounded">
                                            <span className="text-sm">{provider.provider_name}</span>
                                            <Badge className={cn(
                                                provider.status === 'active' ? 'bg-amber-100 text-amber-700 text-xs' :
                                                'bg-slate-100 text-slate-700 text-xs'
                                            )}>
                                                {provider.status}
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
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm font-medium">Compute</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Healthy</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <Database className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm font-medium">Database</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Operational</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-2 bg-emerald-50 rounded border border-emerald-200">
                                        <div className="flex items-center gap-2">
                                            <HardDrive className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm font-medium">Storage</span>
                                        </div>
                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Online</Badge>
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