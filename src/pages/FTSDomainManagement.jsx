import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Globe, 
    Shield, 
    CheckCircle2, 
    AlertCircle, 
    Clock,
    RefreshCw,
    ExternalLink,
    Search,
    Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FTSDomainManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('domains');

    const { data: psps = [], isLoading: pspsLoading } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const renewSSLMutation = useMutation({
        mutationFn: async (domain) => {
            const response = await base44.functions.invoke('provisionSSL', { domain });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provisioned-psps']);
            toast.success('SSL certificate renewed successfully');
        },
        onError: (error) => {
            toast.error('Failed to renew SSL: ' + error.message);
        }
    });

    if (loading || pspsLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    // Extract domain information from PSPs
    const domainData = psps.map(psp => ({
        psp_id: psp.id,
        psp_code: psp.psp_code,
        psp_name: psp.psp_name,
        domain: psp.domain,
        subdomain: psp.subdomain,
        status: psp.status,
        ssl_status: psp.technical_config?.ssl_status || 'unknown',
        ssl_expiry: psp.technical_config?.ssl_expiry,
        dns_status: psp.technical_config?.dns_status || 'unknown',
        created_date: psp.created_date
    })).filter(d => d.domain || d.subdomain);

    const filteredDomains = domainData.filter(d => 
        d.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.subdomain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.psp_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // SSL Statistics
    const totalDomains = domainData.length;
    const activeSSL = domainData.filter(d => d.ssl_status === 'active').length;
    const expiringSoon = domainData.filter(d => {
        if (!d.ssl_expiry) return false;
        const daysUntilExpiry = (new Date(d.ssl_expiry) - new Date()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;
    const expired = domainData.filter(d => {
        if (!d.ssl_expiry) return false;
        return new Date(d.ssl_expiry) < new Date();
    }).length;

    const getSSLStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>;
            case 'expiring_soon':
                return <Badge className="bg-amber-100 text-amber-700">Expiring Soon</Badge>;
            case 'expired':
                return <Badge className="bg-red-100 text-red-700">Expired</Badge>;
            case 'provisioning':
                return <Badge className="bg-blue-100 text-blue-700">Provisioning</Badge>;
            default:
                return <Badge className="bg-slate-100 text-slate-700">Unknown</Badge>;
        }
    };

    const getExpiryStatus = (expiryDate) => {
        if (!expiryDate) return 'unknown';
        const daysUntilExpiry = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 30) return 'expiring_soon';
        return 'active';
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSDomainManagement" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Domain & SSL Management</h2>
                        <p className="text-xs text-slate-600">Manage domains and SSL certificates for all PSP instances</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search domains..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64"
                            />
                        </div>
                        <Button variant="outline" onClick={() => queryClient.invalidateQueries(['provisioned-psps'])}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </header>

                <div className="p-6">
                    {/* Statistics */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-100">Total Domains</p>
                                        <p className="text-3xl font-bold mt-1">{totalDomains}</p>
                                    </div>
                                    <Globe className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-emerald-100">Active SSL</p>
                                        <p className="text-3xl font-bold mt-1">{activeSSL}</p>
                                    </div>
                                    <Shield className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-amber-100">Expiring Soon</p>
                                        <p className="text-3xl font-bold mt-1">{expiringSoon}</p>
                                        <p className="text-xs text-amber-100 mt-1">Within 30 days</p>
                                    </div>
                                    <Clock className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-red-100">Expired</p>
                                        <p className="text-3xl font-bold mt-1">{expired}</p>
                                        <p className="text-xs text-red-100 mt-1">Needs renewal</p>
                                    </div>
                                    <AlertCircle className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="domains">All Domains</TabsTrigger>
                            <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
                            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
                        </TabsList>

                        <TabsContent value="domains">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Domain Registry</CardTitle>
                                    <p className="text-sm text-slate-600">All domains and subdomains provisioned for PSP instances</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 px-4 font-semibold">PSP Code</th>
                                                    <th className="text-left py-3 px-4 font-semibold">PSP Name</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Domain</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Subdomain</th>
                                                    <th className="text-center py-3 px-4 font-semibold">DNS Status</th>
                                                    <th className="text-center py-3 px-4 font-semibold">SSL Status</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredDomains.map((domain) => (
                                                    <tr key={domain.psp_id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="py-3 px-4 font-mono text-xs">{domain.psp_code}</td>
                                                        <td className="py-3 px-4">{domain.psp_name}</td>
                                                        <td className="py-3 px-4">
                                                            {domain.domain ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span>{domain.domain}</span>
                                                                    <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                                                                        <ExternalLink className="h-3 w-3 text-blue-600" />
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {domain.subdomain ? (
                                                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{domain.subdomain}</span>
                                                            ) : (
                                                                <span className="text-slate-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {domain.dns_status === 'active' ? (
                                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                                                            ) : (
                                                                <AlertCircle className="h-4 w-4 text-amber-600 mx-auto" />
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {getSSLStatusBadge(getExpiryStatus(domain.ssl_expiry))}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => navigate(createPageUrl('PSPInstanceConfig') + `?id=${domain.psp_id}`)}
                                                            >
                                                                <Settings className="h-4 w-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="ssl">
                            <Card>
                                <CardHeader>
                                    <CardTitle>SSL Certificate Management</CardTitle>
                                    <p className="text-sm text-slate-600">Monitor and renew SSL certificates</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {filteredDomains.map((domain) => (
                                            <Card key={domain.psp_id} className="border border-slate-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Shield className="h-5 w-5 text-blue-600" />
                                                                <div>
                                                                    <p className="font-semibold text-slate-900">{domain.domain || domain.subdomain}</p>
                                                                    <p className="text-xs text-slate-500">{domain.psp_code} • {domain.psp_name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Status</p>
                                                                    <div className="mt-1">
                                                                        {getSSLStatusBadge(getExpiryStatus(domain.ssl_expiry))}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Expiry Date</p>
                                                                    <p className="font-medium text-slate-900 mt-1">
                                                                        {domain.ssl_expiry ? format(new Date(domain.ssl_expiry), 'MMM dd, yyyy') : 'Not set'}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-slate-500">Days Remaining</p>
                                                                    <p className="font-medium text-slate-900 mt-1">
                                                                        {domain.ssl_expiry ? Math.floor((new Date(domain.ssl_expiry) - new Date()) / (1000 * 60 * 60 * 24)) : '-'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button 
                                                            onClick={() => renewSSLMutation.mutate(domain.domain || domain.subdomain)}
                                                            disabled={renewSSLMutation.isPending}
                                                            variant="outline"
                                                            className="gap-2"
                                                        >
                                                            <RefreshCw className={`h-4 w-4 ${renewSSLMutation.isPending ? 'animate-spin' : ''}`} />
                                                            Renew SSL
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="expiring">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Certificates Expiring Soon</CardTitle>
                                    <p className="text-sm text-slate-600">SSL certificates that require attention within 30 days</p>
                                </CardHeader>
                                <CardContent>
                                    {filteredDomains.filter(d => {
                                        const status = getExpiryStatus(d.ssl_expiry);
                                        return status === 'expiring_soon' || status === 'expired';
                                    }).length === 0 ? (
                                        <div className="text-center py-12">
                                            <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                                            <p className="text-slate-600">All SSL certificates are valid</p>
                                            <p className="text-xs text-slate-500 mt-1">No certificates expiring in the next 30 days</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {filteredDomains
                                                .filter(d => {
                                                    const status = getExpiryStatus(d.ssl_expiry);
                                                    return status === 'expiring_soon' || status === 'expired';
                                                })
                                                .map((domain) => {
                                                    const daysRemaining = Math.floor((new Date(domain.ssl_expiry) - new Date()) / (1000 * 60 * 60 * 24));
                                                    const isExpired = daysRemaining < 0;
                                                    
                                                    return (
                                                        <Card key={domain.psp_id} className={`border-2 ${isExpired ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <AlertCircle className={`h-6 w-6 ${isExpired ? 'text-red-600' : 'text-amber-600'}`} />
                                                                        <div>
                                                                            <p className="font-semibold text-slate-900">{domain.domain || domain.subdomain}</p>
                                                                            <p className="text-xs text-slate-600">{domain.psp_code} • {domain.psp_name}</p>
                                                                            <p className={`text-sm font-medium mt-1 ${isExpired ? 'text-red-700' : 'text-amber-700'}`}>
                                                                                {isExpired ? `Expired ${Math.abs(daysRemaining)} days ago` : `Expires in ${daysRemaining} days`}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <Button 
                                                                        onClick={() => renewSSLMutation.mutate(domain.domain || domain.subdomain)}
                                                                        disabled={renewSSLMutation.isPending}
                                                                        className={isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}
                                                                    >
                                                                        <RefreshCw className={`h-4 w-4 mr-2 ${renewSSLMutation.isPending ? 'animate-spin' : ''}`} />
                                                                        Renew Now
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}