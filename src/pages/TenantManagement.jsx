import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Plus, Users, DollarSign, Settings, ExternalLink, Search } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TenantManagement() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    
    const [createOpen, setCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [tenantForm, setTenantForm] = useState({
        tenant_code: '',
        tenant_name: '',
        legal_entity_name: '',
        contact_email: '',
        contact_phone: '',
        subdomain: '',
        subscription: {
            plan: 'professional',
            status: 'trial'
        },
        configuration: {
            max_psps: 5,
            max_users: 10,
            default_currency: 'USD',
            timezone: 'UTC'
        }
    });
    const [error, setError] = useState('');

    // Only SuperAdmins can access this page
    React.useEffect(() => {
        if (!loading && platformUser?.platform_role !== PLATFORM_ROLES.SUPER_ADMIN) {
            navigate(createPageUrl('FTSMoneyPlatform'));
        }
    }, [platformUser, loading, navigate]);

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants'],
        queryFn: () => base44.asServiceRole.entities.Tenant.list('-created_date')
    });

    const createMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.asServiceRole.entities.Tenant.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tenants']);
            setCreateOpen(false);
            setTenantForm({
                tenant_code: '',
                tenant_name: '',
                legal_entity_name: '',
                contact_email: '',
                contact_phone: '',
                subdomain: '',
                subscription: { plan: 'professional', status: 'trial' },
                configuration: { max_psps: 5, max_users: 10, default_currency: 'USD', timezone: 'UTC' }
            });
            setError('');
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const handleCreate = () => {
        if (!tenantForm.tenant_code || !tenantForm.tenant_name || !tenantForm.contact_email) {
            setError('Please fill in required fields');
            return;
        }
        createMutation.mutate(tenantForm);
    };

    const filteredTenants = tenants.filter(t => 
        searchTerm === '' || 
        t.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tenant_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="TenantManagement" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Tenant Management</h2>
                        <p className="text-xs text-slate-600">Manage client organizations and their configurations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right mr-2">
                            <p className="text-xs text-slate-600">Logged in as</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4" />
                                    Create Tenant
                                </Button>
                            </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Tenant</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tenant Code *</Label>
                                        <Input
                                            value={tenantForm.tenant_code}
                                            onChange={(e) => setTenantForm({...tenantForm, tenant_code: e.target.value.toUpperCase()})}
                                            placeholder="ACME"
                                        />
                                    </div>
                                    <div>
                                        <Label>Tenant Name *</Label>
                                        <Input
                                            value={tenantForm.tenant_name}
                                            onChange={(e) => setTenantForm({...tenantForm, tenant_name: e.target.value})}
                                            placeholder="Acme Corporation"
                                        />
                                    </div>
                                    <div>
                                        <Label>Legal Entity Name</Label>
                                        <Input
                                            value={tenantForm.legal_entity_name}
                                            onChange={(e) => setTenantForm({...tenantForm, legal_entity_name: e.target.value})}
                                            placeholder="Acme Corp Ltd."
                                        />
                                    </div>
                                    <div>
                                        <Label>Contact Email *</Label>
                                        <Input
                                            type="email"
                                            value={tenantForm.contact_email}
                                            onChange={(e) => setTenantForm({...tenantForm, contact_email: e.target.value})}
                                            placeholder="contact@acme.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>Contact Phone</Label>
                                        <Input
                                            value={tenantForm.contact_phone}
                                            onChange={(e) => setTenantForm({...tenantForm, contact_phone: e.target.value})}
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                    <div>
                                        <Label>Subdomain</Label>
                                        <Input
                                            value={tenantForm.subdomain}
                                            onChange={(e) => setTenantForm({...tenantForm, subdomain: e.target.value})}
                                            placeholder="acme.fts.money"
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Subscription Settings</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Plan</Label>
                                            <Select 
                                                value={tenantForm.subscription.plan} 
                                                onValueChange={(v) => setTenantForm({
                                                    ...tenantForm, 
                                                    subscription: {...tenantForm.subscription, plan: v}
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="starter">Starter</SelectItem>
                                                    <SelectItem value="professional">Professional</SelectItem>
                                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                                    <SelectItem value="custom">Custom</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <Select 
                                                value={tenantForm.subscription.status} 
                                                onValueChange={(v) => setTenantForm({
                                                    ...tenantForm, 
                                                    subscription: {...tenantForm.subscription, status: v}
                                                })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="trial">Trial</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Configuration Limits</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Max PSPs</Label>
                                            <Input
                                                type="number"
                                                value={tenantForm.configuration.max_psps}
                                                onChange={(e) => setTenantForm({
                                                    ...tenantForm,
                                                    configuration: {...tenantForm.configuration, max_psps: parseInt(e.target.value)}
                                                })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Max Users</Label>
                                            <Input
                                                type="number"
                                                value={tenantForm.configuration.max_users}
                                                onChange={(e) => setTenantForm({
                                                    ...tenantForm,
                                                    configuration: {...tenantForm.configuration, max_users: parseInt(e.target.value)}
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                                    {createMutation.isPending ? 'Creating...' : 'Create Tenant'}
                                </Button>
                            </div>
                        </DialogContent>
                        </Dialog>
                    </div>
                </header>

                <div className="p-6">
                    {/* Search */}
                    <Card className="bg-white border-slate-200 mb-6">
                        <CardContent className="pt-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by tenant name, code, or email..."
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Tenants</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{tenants.length}</p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Tenants</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            {tenants.filter(t => t.status === 'active').length}
                                        </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total PSPs</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            {tenants.reduce((sum, t) => sum + (t.total_psps || 0), 0)}
                                        </p>
                                    </div>
                                    <Building2 className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Users</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            {tenants.reduce((sum, t) => sum + (t.total_users || 0), 0)}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tenants List */}
                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Client Tenants ({filteredTenants.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredTenants.map((tenant) => (
                                    <div 
                                        key={tenant.id} 
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                                                style={{ background: tenant.branding?.primary_color || '#3b82f6' }}
                                            >
                                                {tenant.tenant_code?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900">{tenant.tenant_name}</p>
                                                    <Badge variant="outline" className="font-mono text-xs">
                                                        {tenant.tenant_code}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">{tenant.contact_email}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-500">{tenant.total_psps || 0} PSPs</span>
                                                    <span className="text-xs text-slate-500">•</span>
                                                    <span className="text-xs text-slate-500">{tenant.total_users || 0} Users</span>
                                                    <span className="text-xs text-slate-500">•</span>
                                                    <Badge className={cn(
                                                        "text-xs",
                                                        tenant.subscription?.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                                                        tenant.subscription?.plan === 'professional' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                    )}>
                                                        {tenant.subscription?.plan || 'N/A'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={cn(
                                                tenant.status === 'active' ? 'bg-green-100 text-green-700' :
                                                tenant.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                                'bg-slate-100 text-slate-700'
                                            )}>
                                                {tenant.status}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(createPageUrl('TenantUserManagement') + `?tenant_id=${tenant.id}`)}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                Users
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate(createPageUrl('TenantDetails') + `?id=${tenant.id}`)}
                                            >
                                                <Settings className="h-4 w-4" />
                                            </Button>
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