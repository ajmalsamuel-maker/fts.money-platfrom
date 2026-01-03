import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Search, TrendingUp, Activity, AlertCircle, Pencil, Shield, GitBranch } from 'lucide-react';
import OrchestrationRuleBuilder from '@/components/orchestration/OrchestrationRuleBuilder';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function ISOGatewayCustomers() {
    const { t } = useI18n();
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [newCustomer, setNewCustomer] = useState({
        company_name: '',
        contact_email: '',
        contact_phone: '',
        password_hash: 'demo123',
        customer_type: 'fintech',
        subscription_tier: 'developer',
        monthly_message_limit: 50000,
        identifier_type: 'none',
        tas_number: '',
        lei: '',
        lei_status: 'not_provided',
        lei_grace_period_end: null
    });

    const queryClient = useQueryClient();

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['iso-gateway-customers'],
        queryFn: async () => {
            const result = await base44.entities.ISOGatewayCustomer.list();
            return result || [];
        }
    });

    const createCustomerMutation = useMutation({
        mutationFn: async (data) => {
            const gracePeriodEnd = data.lei_status === 'grace_period' 
                ? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
                : null;
            
            return await base44.entities.ISOGatewayCustomer.create({
                ...data,
                customer_id: `iso_cust_${Date.now()}`,
                status: 'trial',
                trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                current_month_usage: 0,
                total_messages_processed: 0,
                webhook_secret: crypto.randomUUID(),
                lei_grace_period_end: gracePeriodEnd
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['iso-gateway-customers']);
            setShowCreateDialog(false);
            setNewCustomer({
                company_name: '',
                contact_email: '',
                contact_phone: '',
                password_hash: 'demo123',
                customer_type: 'fintech',
                subscription_tier: 'developer',
                monthly_message_limit: 50000,
                lei: '',
                lei_status: 'not_provided',
                lei_grace_period_end: null
            });
        }
    });

    const updateCustomerMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            return await base44.entities.ISOGatewayCustomer.update(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['iso-gateway-customers']);
            setShowEditDialog(false);
            setEditingCustomer(null);
        }
    });

    const filteredCustomers = customers.filter(c =>
        c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const statusColors = {
        active: 'bg-green-100 text-green-800',
        trial: 'bg-blue-100 text-blue-800',
        suspended: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800'
    };

    const tierInfo = {
        developer: { limit: 50000, price: '$499/mo' },
        business: { limit: 500000, price: '$1,999/mo' },
        enterprise: { limit: 999999999, price: 'Custom' }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <FTSPlatformSidebar currentPage="ISOGatewayCustomers" />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('iso:customers.title')}</h2>
                        <p className="text-xs text-slate-600">{t('iso:customers.subtitle')}</p>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={true} />
                </header>
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('iso:customers.customerAccounts')}</h1>
                        </div>
                        
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('iso:customers.addCustomer')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create ISO Gateway Customer</DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Company Name</label>
                                        <Input
                                            value={newCustomer.company_name}
                                            onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})}
                                            placeholder="Acme Bank Ltd"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Contact Email (Login)</label>
                                            <Input
                                                type="email"
                                                value={newCustomer.contact_email}
                                                onChange={(e) => setNewCustomer({...newCustomer, contact_email: e.target.value})}
                                                placeholder="tech@acmebank.com"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium">Password</label>
                                            <Input
                                                type="password"
                                                value={newCustomer.password_hash}
                                                onChange={(e) => setNewCustomer({...newCustomer, password_hash: e.target.value})}
                                                placeholder="demo123"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium">Contact Phone</label>
                                        <Input
                                            value={newCustomer.contact_phone}
                                            onChange={(e) => setNewCustomer({...newCustomer, contact_phone: e.target.value})}
                                            placeholder="+1 555 0100"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Customer Type</label>
                                            <Select value={newCustomer.customer_type} onValueChange={(v) => setNewCustomer({...newCustomer, customer_type: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="psp">PSP</SelectItem>
                                                    <SelectItem value="bank">Bank</SelectItem>
                                                    <SelectItem value="fintech">Fintech</SelectItem>
                                                    <SelectItem value="corporate">Corporate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div>
                                            <label className="text-sm font-medium">Subscription Tier</label>
                                            <Select value={newCustomer.subscription_tier} onValueChange={(v) => {
                                                const limits = { developer: 50000, business: 500000, enterprise: 999999999 };
                                                setNewCustomer({...newCustomer, subscription_tier: v, monthly_message_limit: limits[v]});
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="developer">Developer ($499/mo)</SelectItem>
                                                    <SelectItem value="business">Business ($1,999/mo)</SelectItem>
                                                    <SelectItem value="enterprise">Enterprise (Custom)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium">Business Identifier Type</label>
                                        <Select value={newCustomer.identifier_type} onValueChange={(v) => setNewCustomer({...newCustomer, identifier_type: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (6-month grace period)</SelectItem>
                                                <SelectItem value="tas">TAS Number</SelectItem>
                                                <SelectItem value="lei">LEI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {newCustomer.identifier_type === 'tas' && (
                                        <div>
                                            <label className="text-sm font-medium">TAS Number</label>
                                            <Input
                                                value={newCustomer.tas_number}
                                                onChange={(e) => setNewCustomer({...newCustomer, tas_number: e.target.value})}
                                                placeholder="Enter TAS number"
                                            />
                                            <p className="text-xs text-blue-600 mt-1">
                                                ℹ️ Will be verified against TAS system
                                            </p>
                                        </div>
                                    )}
                                    
                                    {newCustomer.identifier_type === 'lei' && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium">LEI Number</label>
                                                <Input
                                                    value={newCustomer.lei}
                                                    onChange={(e) => setNewCustomer({...newCustomer, lei: e.target.value})}
                                                    placeholder="20-character LEI"
                                                    maxLength={20}
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="text-sm font-medium">LEI Status</label>
                                                <Select value={newCustomer.lei_status} onValueChange={(v) => setNewCustomer({...newCustomer, lei_status: v})}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending Verification</SelectItem>
                                                        <SelectItem value="verified">Verified</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </>
                                    )}
                                    
                                    {newCustomer.identifier_type === 'none' && (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                                            <p className="text-xs text-amber-800">
                                                ⚠️ Customer will have 6 months grace period to provide TAS or LEI
                                            </p>
                                        </div>
                                    )}
                                    
                                    <Button 
                                        onClick={() => createCustomerMutation.mutate(newCustomer)}
                                        disabled={!newCustomer.company_name || !newCustomer.contact_email}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        Create Customer (30-day trial)
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-12">Loading customers...</div>
                    ) : filteredCustomers.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                                <p className="text-gray-600">Create your first ISO Gateway customer to get started</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {filteredCustomers.map((customer) => (
                                <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                    {customer.company_name}
                                                </CardTitle>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {customer.contact_email} • {customer.customer_type}
                                                </p>
                                            </div>
                                            <Badge className={statusColors[customer.status]}>
                                                {customer.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent>
                                        <div className="flex justify-end mb-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingCustomer(customer);
                                                    setShowEditDialog(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.href = `/ISOGatewayRouting?customer_id=${customer.id}`}
                                            >
                                                <GitBranch className="h-4 w-4 mr-2" />
                                                Routing
                                            </Button>
                                            </div>

                                        {customer.lei_grace_period_end && new Date(customer.lei_grace_period_end) > new Date() && (
                                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-amber-900">LEI Grace Period Active</p>
                                                    <p className="text-xs text-amber-700 mt-1">
                                                        Must provide LEI/TAS by {new Date(customer.lei_grace_period_end).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-4 gap-6">
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Subscription
                                                </div>
                                                <p className="text-lg font-semibold capitalize">{customer.subscription_tier}</p>
                                                <p className="text-xs text-gray-500">{tierInfo[customer.subscription_tier]?.price}</p>
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                    <Activity className="h-4 w-4" />
                                                    Usage This Month
                                                </div>
                                                <p className="text-lg font-semibold">
                                                    {(customer.current_month_usage || 0).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    of {customer.monthly_message_limit.toLocaleString()}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Success Rate
                                                </div>
                                                <p className="text-lg font-semibold">
                                                    {customer.success_rate ? `${customer.success_rate.toFixed(1)}%` : 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {customer.avg_latency_ms ? `${customer.avg_latency_ms}ms avg` : 'No data'}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <div className="text-sm text-gray-600 mb-1">Total Processed</div>
                                                <p className="text-lg font-semibold">
                                                    {(customer.total_messages_processed || 0).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    ${(customer.total_revenue || 0).toFixed(2)} revenue
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {customer.status === 'trial' && customer.trial_ends_at && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                                                Trial ends: {new Date(customer.trial_ends_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Edit Customer Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Customer - {editingCustomer?.company_name}</DialogTitle>
                    </DialogHeader>
                    
                    {editingCustomer && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Company Name</label>
                                <Input
                                    value={editingCustomer.company_name}
                                    onChange={(e) => setEditingCustomer({...editingCustomer, company_name: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Contact Email (Login)</label>
                                    <Input
                                        type="email"
                                        value={editingCustomer.contact_email}
                                        onChange={(e) => setEditingCustomer({...editingCustomer, contact_email: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-sm font-medium">Password (leave blank to keep)</label>
                                    <Input
                                        type="password"
                                        placeholder="Enter new password"
                                        onChange={(e) => setEditingCustomer({...editingCustomer, password_hash: e.target.value || editingCustomer.password_hash})}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Contact Phone</label>
                                <Input
                                    value={editingCustomer.contact_phone || ''}
                                    onChange={(e) => setEditingCustomer({...editingCustomer, contact_phone: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Identifier Type</label>
                                    <Select 
                                        value={editingCustomer.identifier_type || 'none'} 
                                        onValueChange={(v) => setEditingCustomer({...editingCustomer, identifier_type: v})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="tas">TAS Number</SelectItem>
                                            <SelectItem value="lei">LEI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                {editingCustomer.identifier_type === 'tas' && (
                                    <div>
                                        <label className="text-sm font-medium">TAS Number</label>
                                        <Input
                                            value={editingCustomer.tas_number || ''}
                                            onChange={(e) => setEditingCustomer({...editingCustomer, tas_number: e.target.value})}
                                            placeholder="Enter TAS number"
                                        />
                                    </div>
                                )}
                                
                                {editingCustomer.identifier_type === 'lei' && (
                                    <div>
                                        <label className="text-sm font-medium">LEI Number</label>
                                        <Input
                                            value={editingCustomer.lei || ''}
                                            onChange={(e) => setEditingCustomer({...editingCustomer, lei: e.target.value})}
                                            placeholder="20-character LEI"
                                            maxLength={20}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Status</label>
                                    <Select value={editingCustomer.status} onValueChange={(v) => setEditingCustomer({...editingCustomer, status: v})}>
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
                                
                                <div>
                                    <label className="text-sm font-medium">Subscription Tier</label>
                                    <Select value={editingCustomer.subscription_tier} onValueChange={(v) => {
                                        const limits = { developer: 50000, business: 500000, enterprise: 999999999 };
                                        setEditingCustomer({...editingCustomer, subscription_tier: v, monthly_message_limit: limits[v]});
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="developer">Developer</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => updateCustomerMutation.mutate({ id: editingCustomer.id, data: editingCustomer })}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Update Customer
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}