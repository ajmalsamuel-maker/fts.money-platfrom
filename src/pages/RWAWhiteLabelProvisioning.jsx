import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { Plus, Rocket, AlertCircle, CheckCircle2, Clock, Building2, Edit } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function RWAWhiteLabelProvisioning() {
    const { platformUser } = usePlatformAuth();
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        customer_code: '',
        company_name: '',
        company_type: 'fund_manager',
        lei: '',
        license_type: '',
        admin_email: '',
        password: '',
        subscription_tier: 'professional',
        asset_types_enabled: ['real_estate', 'commodity'],
        blockchain_networks: ['polygon']
    });

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['rwa-customers'],
        queryFn: () => base44.entities.RWAWhiteLabelCustomer.list('-created_date')
    });

    const provisionMutation = useMutation({
        mutationFn: async (customerData) => {
            const response = await base44.functions.invoke('provisionRWACustomer', customerData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['rwa-customers']);
            setShowDialog(false);
            setNewCustomer({
                customer_code: '',
                company_name: '',
                company_type: 'fund_manager',
                lei: '',
                license_type: '',
                admin_email: '',
                password: '',
                subscription_tier: 'professional',
                asset_types_enabled: ['real_estate', 'commodity'],
                blockchain_networks: ['polygon']
            });
        },
        onError: (error) => {
            console.error('Provisioning failed:', error);
            alert('Provisioning failed: ' + error.message);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await base44.functions.invoke('updateRWACustomer', { id, data });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['rwa-customers']);
            setEditingCustomer(null);
        },
        onError: (error) => {
            console.error('Update failed:', error);
            alert('Update failed: ' + error.message);
        }
    });



    const handleProvision = () => {
        provisionMutation.mutate(newCustomer);
    };

    const handleUpdate = () => {
        updateMutation.mutate({
            id: editingCustomer.id,
            data: editingCustomer
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-slate-100 text-slate-700',
            provisioning: 'bg-blue-100 text-blue-700',
            active: 'bg-green-100 text-green-700',
            suspended: 'bg-yellow-100 text-yellow-700',
            terminated: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    const getProvisioningIcon = (provisioningStatus) => {
        if (provisioningStatus === 'completed') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        if (provisioningStatus === 'failed') return <AlertCircle className="h-4 w-4 text-red-600" />;
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="RWAWhiteLabelProvisioning"
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:pages.rwaProvisioning.title')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:pages.rwaProvisioning.subtitle')}</p>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={true} />
                </header>
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">RWA Customers</h1>
                            </div>
                            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Provision New Customer
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Provision RWA White-Label Platform</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Customer Code *</Label>
                                                <Input
                                                    placeholder="goldvault"
                                                    value={newCustomer.customer_code}
                                                    onChange={(e) => setNewCustomer({...newCustomer, customer_code: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <Label>Company Name *</Label>
                                                <Input
                                                    placeholder="GoldVault Asset Management"
                                                    value={newCustomer.company_name}
                                                    onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Company Type *</Label>
                                                <Select
                                                    value={newCustomer.company_type}
                                                    onValueChange={(value) => setNewCustomer({...newCustomer, company_type: value})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="fund_manager">Fund Manager</SelectItem>
                                                        <SelectItem value="broker_dealer">Broker-Dealer</SelectItem>
                                                        <SelectItem value="investment_bank">Investment Bank</SelectItem>
                                                        <SelectItem value="wealth_manager">Wealth Manager</SelectItem>
                                                        <SelectItem value="family_office">Family Office</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>LEI (Legal Entity Identifier) *</Label>
                                                <Input
                                                    placeholder="123456789012ABCDEFGH"
                                                    value={newCustomer.lei}
                                                    onChange={(e) => setNewCustomer({...newCustomer, lei: e.target.value})}
                                                    maxLength={20}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>License Type</Label>
                                                <Input
                                                    placeholder="SEC Registered Investment Advisor"
                                                    value={newCustomer.license_type}
                                                    onChange={(e) => setNewCustomer({...newCustomer, license_type: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <Label>Admin Email *</Label>
                                                <Input
                                                    type="email"
                                                    placeholder="admin@goldvault.com"
                                                    value={newCustomer.admin_email}
                                                    onChange={(e) => setNewCustomer({...newCustomer, admin_email: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Admin Password *</Label>
                                            <Input
                                                type="password"
                                                placeholder="Set portal login password"
                                                value={newCustomer.password}
                                                onChange={(e) => setNewCustomer({...newCustomer, password: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <Label>Subscription Tier</Label>
                                            <Select
                                                value={newCustomer.subscription_tier}
                                                onValueChange={(value) => setNewCustomer({...newCustomer, subscription_tier: value})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="starter">Starter - $5,000/mo (up to $10M AUM)</SelectItem>
                                                    <SelectItem value="professional">Professional - $15,000/mo (up to $100M AUM)</SelectItem>
                                                    <SelectItem value="enterprise">Enterprise - $50,000/mo (unlimited)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block">Asset Types Enabled</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['real_estate', 'treasury_bill', 'private_credit', 'commodity', 'equity', 'corporate_bond'].map(type => (
                                                    <div key={type} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={type}
                                                            checked={newCustomer.asset_types_enabled.includes(type)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setNewCustomer({
                                                                        ...newCustomer,
                                                                        asset_types_enabled: [...newCustomer.asset_types_enabled, type]
                                                                    });
                                                                } else {
                                                                    setNewCustomer({
                                                                        ...newCustomer,
                                                                        asset_types_enabled: newCustomer.asset_types_enabled.filter(t => t !== type)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={type} className="text-sm">
                                                            {type.replace('_', ' ')}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="mb-2 block">Blockchain Networks</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['ethereum', 'polygon', 'base', 'avalanche'].map(network => (
                                                    <div key={network} className="flex items-center gap-2">
                                                        <Checkbox
                                                            id={network}
                                                            checked={newCustomer.blockchain_networks.includes(network)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setNewCustomer({
                                                                        ...newCustomer,
                                                                        blockchain_networks: [...newCustomer.blockchain_networks, network]
                                                                    });
                                                                } else {
                                                                    setNewCustomer({
                                                                        ...newCustomer,
                                                                        blockchain_networks: newCustomer.blockchain_networks.filter(n => n !== network)
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={network} className="text-sm capitalize">
                                                            {network}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-900">
                                                <strong>Provisioning will deploy:</strong> Smart contracts, identity registry, 
                                                compliance engine, Fireblocks vault, white-label portal, and admin access.
                                            </p>
                                        </div>

                                        <Button 
                                            onClick={handleProvision}
                                            disabled={!newCustomer.customer_code || !newCustomer.company_name || !newCustomer.lei || !newCustomer.admin_email || !newCustomer.password || provisionMutation.isPending}
                                            className="w-full"
                                        >
                                            {provisionMutation.isPending ? 'Provisioning...' : 'Start Provisioning'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total Customers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{customers.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Active Platforms</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-green-600">
                                    {customers.filter(c => c.status === 'active').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Provisioning</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-blue-600">
                                    {customers.filter(c => c.status === 'provisioning').length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-600">Total AUM</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">
                                    ${(customers.reduce((sum, c) => sum + (c.total_value_locked || 0), 0) / 1000000).toFixed(1)}M
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Provisioning Flow Diagram */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Provisioning Flow (Same as PSP)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                {[
                                    { label: 'Request', icon: Building2 },
                                    { label: 'Deploy Contracts', icon: Rocket },
                                    { label: 'Configure Custody', icon: CheckCircle2 },
                                    { label: 'Setup Portal', icon: CheckCircle2 },
                                    { label: 'Go Live', icon: CheckCircle2 }
                                ].map((step, idx) => {
                                    const Icon = step.icon;
                                    return (
                                        <React.Fragment key={idx}>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <span className="text-xs text-slate-600 whitespace-nowrap">{step.label}</span>
                                            </div>
                                            {idx < 4 && (
                                                <div className="w-8 h-0.5 bg-slate-300 mt-4" />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customers List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>RWA White-Label Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <p className="text-center text-slate-500 py-8">Loading...</p>
                            ) : customers.length === 0 ? (
                                <p className="text-center text-slate-500 py-8">No customers yet. Provision your first RWA platform above.</p>
                            ) : (
                                <div className="space-y-3">
                                    {customers.map(customer => (
                                        <div 
                                            key={customer.id}
                                            className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="font-semibold text-slate-900">{customer.company_name}</h3>
                                                        <Badge className={getStatusColor(customer.status)}>
                                                            {customer.status}
                                                        </Badge>
                                                        {customer.provisioning_status !== 'completed' && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-600">
                                                                {getProvisioningIcon(customer.provisioning_status)}
                                                                <span>{customer.provisioning_status?.replace('_', ' ')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                                                        <div>Code: <span className="font-mono">{customer.customer_code}</span></div>
                                                        <div>LEI: <span className="font-mono text-xs">{customer.lei}</span></div>
                                                        <div>Type: {customer.company_type?.replace('_', ' ')}</div>
                                                        <div>Tier: {customer.subscription_tier}</div>
                                                        {customer.portal_url && (
                                                            <div className="col-span-2">
                                                                Portal: <a href={customer.portal_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{customer.portal_url}</a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {customer.asset_types_enabled && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {customer.asset_types_enabled.map(type => (
                                                                <Badge key={type} variant="outline" className="text-xs">
                                                                    {type.replace('_', ' ')}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">Assets: {customer.total_assets_tokenized || 0}</p>
                                                        <p className="text-xs text-slate-500">AUM: ${((customer.total_value_locked || 0) / 1000000).toFixed(1)}M</p>
                                                        <p className="text-xs text-slate-500">Investors: {customer.total_investors || 0}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingCustomer(customer)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    </div>
                                                    </div>
                                                    </div>
                                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Customer Dialog */}
                    {editingCustomer && (
                        <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Edit Customer: {editingCustomer.company_name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Customer Code</Label>
                                            <Input value={editingCustomer.customer_code} disabled />
                                        </div>
                                        <div>
                                            <Label>Company Name</Label>
                                            <Input
                                                value={editingCustomer.company_name}
                                                onChange={(e) => setEditingCustomer({...editingCustomer, company_name: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Company Type</Label>
                                            <Select
                                                value={editingCustomer.company_type}
                                                onValueChange={(value) => setEditingCustomer({...editingCustomer, company_type: value})}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fund_manager">Fund Manager</SelectItem>
                                                    <SelectItem value="broker_dealer">Broker-Dealer</SelectItem>
                                                    <SelectItem value="investment_bank">Investment Bank</SelectItem>
                                                    <SelectItem value="wealth_manager">Wealth Manager</SelectItem>
                                                    <SelectItem value="family_office">Family Office</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <Select
                                                value={editingCustomer.status}
                                                onValueChange={(value) => setEditingCustomer({...editingCustomer, status: value})}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="provisioning">Provisioning</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="suspended">Suspended</SelectItem>
                                                    <SelectItem value="terminated">Terminated</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>LEI</Label>
                                            <Input
                                                value={editingCustomer.lei}
                                                onChange={(e) => setEditingCustomer({...editingCustomer, lei: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <Label>Admin Email</Label>
                                            <Input
                                                value={editingCustomer.admin_email}
                                                onChange={(e) => setEditingCustomer({...editingCustomer, admin_email: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>New Password (leave blank to keep current)</Label>
                                        <Input
                                            type="password"
                                            placeholder="Enter new password to change"
                                            value={editingCustomer.password || ''}
                                            onChange={(e) => setEditingCustomer({...editingCustomer, password: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <Label>Subscription Tier</Label>
                                        <Select
                                            value={editingCustomer.subscription_tier}
                                            onValueChange={(value) => setEditingCustomer({...editingCustomer, subscription_tier: value})}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="starter">Starter - $5,000/mo</SelectItem>
                                                <SelectItem value="professional">Professional - $15,000/mo</SelectItem>
                                                <SelectItem value="enterprise">Enterprise - $50,000/mo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="mb-2 block">Asset Types Enabled</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['real_estate', 'treasury_bill', 'private_credit', 'commodity', 'equity', 'corporate_bond'].map(type => (
                                                <div key={type} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`edit-${type}`}
                                                        checked={editingCustomer.asset_types_enabled?.includes(type)}
                                                        onCheckedChange={(checked) => {
                                                            const current = editingCustomer.asset_types_enabled || [];
                                                            setEditingCustomer({
                                                                ...editingCustomer,
                                                                asset_types_enabled: checked 
                                                                    ? [...current, type]
                                                                    : current.filter(t => t !== type)
                                                            });
                                                        }}
                                                    />
                                                    <Label htmlFor={`edit-${type}`} className="text-sm">{type.replace('_', ' ')}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 justify-end">
                                        <Button variant="outline" onClick={() => setEditingCustomer(null)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                                            {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Architecture Comparison */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Provisioning: PSP vs RWA</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold mb-3 text-blue-900">PSP Provisioning</h3>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>✓ Create tenant database schema</li>
                                        <li>✓ Deploy payment processing stack</li>
                                        <li>✓ Configure merchant portal</li>
                                        <li>✓ Connect payment providers</li>
                                        <li>✓ Setup routing/orchestration</li>
                                        <li>✓ Brand customization</li>
                                        <li>✓ Admin access provisioned</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3 text-green-900">RWA Provisioning</h3>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>✓ Deploy smart contracts to blockchain</li>
                                        <li>✓ Setup Fireblocks custody vault</li>
                                        <li>✓ Configure identity registry</li>
                                        <li>✓ Deploy compliance engine</li>
                                        <li>✓ Connect Chainlink oracles</li>
                                        <li>✓ Brand customization</li>
                                        <li>✓ Admin access provisioned</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 bg-slate-50 rounded-lg p-4">
                                <p className="text-sm text-slate-700">
                                    <strong>Key Difference:</strong> PSP provisions cloud infrastructure. 
                                    RWA provisions blockchain infrastructure + optional Base44 UI wrapper.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}