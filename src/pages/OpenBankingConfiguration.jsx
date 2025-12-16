import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, 
    Edit, 
    Trash2, 
    CheckCircle,
    AlertCircle,
    Settings,
    Globe,
    Activity,
    DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const providerTemplates = {
    TrueLayer: {
        provider_display_name: 'TrueLayer',
        provider_type: 'Both',
        regions_supported: ['UK', 'EU'],
        api_base_url: 'https://api.truelayer.com',
        scopes: ['info', 'accounts', 'balance', 'transactions', 'payments'],
        capabilities: {
            account_balance: true,
            transaction_history: true,
            payment_initiation: true,
            standing_orders: false,
            beneficiary_management: true
        }
    },
    Tink: {
        provider_display_name: 'Tink',
        provider_type: 'Both',
        regions_supported: ['EU', 'UK'],
        api_base_url: 'https://api.tink.com',
        scopes: ['accounts:read', 'transactions:read', 'payment:write'],
        capabilities: {
            account_balance: true,
            transaction_history: true,
            payment_initiation: true,
            standing_orders: true,
            beneficiary_management: true
        }
    },
    Brankas: {
        provider_display_name: 'Brankas',
        provider_type: 'Both',
        regions_supported: ['PH', 'ID', 'SG', 'TH', 'VN'],
        api_base_url: 'https://api.brankas.com',
        scopes: ['accounts', 'transactions', 'payments'],
        capabilities: {
            account_balance: true,
            transaction_history: true,
            payment_initiation: true,
            standing_orders: false,
            beneficiary_management: false
        }
    }
};

export default function OpenBankingConfiguration() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [showDialog, setShowDialog] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [formData, setFormData] = useState({
        provider_name: '',
        environment: 'sandbox',
        status: 'testing',
        is_enabled: false
    });

    const { data: configurations = [] } = useQuery({
        queryKey: ['open-banking-configs'],
        queryFn: () => base44.entities.OpenBankingProviderConfiguration.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.OpenBankingProviderConfiguration.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['open-banking-configs']);
            setShowDialog(false);
            resetForm();
            toast.success('Open banking provider configured');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.OpenBankingProviderConfiguration.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['open-banking-configs']);
            setShowDialog(false);
            setEditingConfig(null);
            resetForm();
            toast.success('Configuration updated');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.OpenBankingProviderConfiguration.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['open-banking-configs']);
            toast.success('Configuration deleted');
        }
    });

    const testConnectionMutation = useMutation({
        mutationFn: async (config) => {
            const result = await base44.functions.invoke('invokeOpenBanking', {
                provider_name: config.provider_name,
                operation: 'getAuthUrl',
                payload: { redirect_uri: 'https://fts.money/callback' }
            });
            return result;
        },
        onSuccess: (data) => {
            if (data.success) {
                toast.success('Connection test successful');
            } else {
                toast.error('Connection test failed: ' + data.error);
            }
        }
    });

    const resetForm = () => {
        setFormData({
            provider_name: '',
            environment: 'sandbox',
            status: 'testing',
            is_enabled: false
        });
    };

    const handleProviderSelect = (providerName) => {
        const template = providerTemplates[providerName];
        if (template) {
            setFormData({
                ...formData,
                provider_name: providerName,
                ...template
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingConfig) {
            updateMutation.mutate({ id: editingConfig.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (config) => {
        setEditingConfig(config);
        setFormData(config);
        setShowDialog(true);
    };

    const activeConfigs = configurations.filter(c => c.is_enabled && c.status === 'active');
    const testingConfigs = configurations.filter(c => c.status === 'testing');

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="OpenBankingConfiguration" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Open Banking Configuration</h2>
                        <p className="text-xs text-slate-600">Manage open banking provider integrations</p>
                    </div>
                    <Button onClick={() => { resetForm(); setShowDialog(true); }} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Provider
                    </Button>
                </header>

                <main className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Providers</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">{activeConfigs.length}</p>
                                    </div>
                                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Testing</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{testingConfigs.length}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Regions</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">
                                            {new Set(configurations.flatMap(c => c.regions_supported || [])).size}
                                        </p>
                                    </div>
                                    <Globe className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Configs</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{configurations.length}</p>
                                    </div>
                                    <Settings className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="europe" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="europe">Europe (TrueLayer, Tink)</TabsTrigger>
                            <TabsTrigger value="asia">Asia (Brankas)</TabsTrigger>
                            <TabsTrigger value="all">All Providers</TabsTrigger>
                        </TabsList>

                        <TabsContent value="europe">
                            <div className="grid grid-cols-2 gap-4">
                                {configurations.filter(c => ['TrueLayer', 'Tink', 'Yapily'].includes(c.provider_name)).map((config) => (
                                    <ProviderCard 
                                        key={config.id} 
                                        config={config} 
                                        onEdit={handleEdit}
                                        onDelete={deleteMutation.mutate}
                                        onTest={testConnectionMutation.mutate}
                                    />
                                ))}
                                {configurations.filter(c => ['TrueLayer', 'Tink'].includes(c.provider_name)).length === 0 && (
                                    <div className="col-span-2 text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                                        <p className="text-slate-600 mb-4">No European providers configured yet</p>
                                        <Button onClick={() => setShowDialog(true)} variant="outline">
                                            Configure TrueLayer or Tink
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="asia">
                            <div className="grid grid-cols-2 gap-4">
                                {configurations.filter(c => ['Brankas', 'Belvo', 'Pluggy'].includes(c.provider_name)).map((config) => (
                                    <ProviderCard 
                                        key={config.id} 
                                        config={config} 
                                        onEdit={handleEdit}
                                        onDelete={deleteMutation.mutate}
                                        onTest={testConnectionMutation.mutate}
                                    />
                                ))}
                                {configurations.filter(c => c.provider_name === 'Brankas').length === 0 && (
                                    <div className="col-span-2 text-center py-12 border-2 border-dashed border-slate-300 rounded-lg">
                                        <p className="text-slate-600 mb-4">No Asian providers configured yet</p>
                                        <Button onClick={() => setShowDialog(true)} variant="outline">
                                            Configure Brankas
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="all">
                            <div className="grid grid-cols-2 gap-4">
                                {configurations.map((config) => (
                                    <ProviderCard 
                                        key={config.id} 
                                        config={config} 
                                        onEdit={handleEdit}
                                        onDelete={deleteMutation.mutate}
                                        onTest={testConnectionMutation.mutate}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>

            {/* Configuration Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingConfig ? 'Edit' : 'Add'} Open Banking Provider</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Provider *</Label>
                                <Select 
                                    value={formData.provider_name} 
                                    onValueChange={handleProviderSelect}
                                    disabled={!!editingConfig}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TrueLayer">TrueLayer (Europe)</SelectItem>
                                        <SelectItem value="Tink">Tink (Europe)</SelectItem>
                                        <SelectItem value="Brankas">Brankas (SEA)</SelectItem>
                                        <SelectItem value="Yapily">Yapily (Europe)</SelectItem>
                                        <SelectItem value="Belvo">Belvo (LatAm)</SelectItem>
                                        <SelectItem value="Pluggy">Pluggy (Brazil)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Provider Type</Label>
                                <Select value={formData.provider_type} onValueChange={(value) => setFormData({ ...formData, provider_type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AIS">AIS (Account Info)</SelectItem>
                                        <SelectItem value="PIS">PIS (Payments)</SelectItem>
                                        <SelectItem value="Both">Both AIS & PIS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Client ID *</Label>
                                <Input
                                    value={formData.client_id || ''}
                                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                    placeholder="Your client ID"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Secret Reference *</Label>
                                <Input
                                    value={formData.client_secret_reference || ''}
                                    onChange={(e) => setFormData({ ...formData, client_secret_reference: e.target.value })}
                                    placeholder="e.g., TRUELAYER_CLIENT_SECRET"
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Environment variable name</p>
                            </div>
                        </div>

                        <div>
                            <Label>API Base URL</Label>
                            <Input
                                value={formData.api_base_url || ''}
                                onChange={(e) => setFormData({ ...formData, api_base_url: e.target.value })}
                                placeholder="https://api.provider.com"
                            />
                        </div>

                        <div>
                            <Label>Redirect URI</Label>
                            <Input
                                value={formData.redirect_uri || ''}
                                onChange={(e) => setFormData({ ...formData, redirect_uri: e.target.value })}
                                placeholder="https://fts.money/oauth/callback"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Environment</Label>
                                <Select value={formData.environment} onValueChange={(value) => setFormData({ ...formData, environment: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox</SelectItem>
                                        <SelectItem value="production">Production</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="testing">Testing</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label>Configuration Notes</Label>
                            <Textarea
                                value={formData.configuration_notes || ''}
                                onChange={(e) => setFormData({ ...formData, configuration_notes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.is_enabled}
                                onChange={(e) => setFormData({ ...formData, is_enabled: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label>Enable this provider</Label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingConfig ? 'Update' : 'Create'} Configuration
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ProviderCard({ config, onEdit, onDelete, onTest }) {
    return (
        <Card className={config.is_enabled ? 'border-emerald-300' : 'border-slate-200'}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            {config.provider_display_name || config.provider_name}
                            <Badge className={
                                config.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                config.status === 'testing' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                            }>
                                {config.status}
                            </Badge>
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                            {config.provider_type} • {config.environment}
                        </p>
                    </div>
                    {config.is_enabled && (
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-slate-600">Regions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(config.regions_supported || []).map((region, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {region}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-600">Capabilities</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {config.capabilities?.account_balance && <Badge variant="outline" className="text-xs">Balance</Badge>}
                            {config.capabilities?.transaction_history && <Badge variant="outline" className="text-xs">Transactions</Badge>}
                            {config.capabilities?.payment_initiation && <Badge variant="outline" className="text-xs">Payments</Badge>}
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => onTest(config)} className="flex-1">
                            <Activity className="h-3 w-3 mr-1" />
                            Test
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onEdit(config)}>
                            <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onDelete(config.id)} className="text-red-600">
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}