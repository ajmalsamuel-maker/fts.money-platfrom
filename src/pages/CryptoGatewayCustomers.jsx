import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, Building2, CheckCircle2, AlertCircle, Clock, TrendingUp, Shield, Activity } from 'lucide-react';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function CryptoGatewayCustomers() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        company_name: '',
        email: '',
        company_type: 'exchange',
        contact_name: '',
        phone: '',
        website: '',
        lei: '',
        tas_id: ''
    });
    const queryClient = useQueryClient();

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['crypto-gateway-customers'],
        queryFn: () => base44.asServiceRole.entities.CryptoGatewayCustomer.list('-created_date')
    });

    const createCustomerMutation = useMutation({
        mutationFn: (data) => {
            const gracePeriodEnd = new Date();
            gracePeriodEnd.setMonth(gracePeriodEnd.getMonth() + 3);
            
            const hasLEI = data.lei && data.lei.trim() !== '';
            const hasTAS = data.tas_id && data.tas_id.trim() !== '';
            
            const customerData = {
                ...data,
                compliance_status: (!hasLEI && !hasTAS) ? 'grace_period' : 'pending_review',
                compliance_grace_period_end: (!hasLEI && !hasTAS) ? gracePeriodEnd.toISOString() : null,
                requires_kyb: hasLEI && !hasTAS,
                kyb_status: (hasLEI && !hasTAS) ? 'not_started' : 'not_started',
                lei_status: hasLEI ? 'pending' : 'not_applicable',
                tas_status: hasTAS ? 'pending' : 'not_provided'
            };
            
            return base44.asServiceRole.entities.CryptoGatewayCustomer.create(customerData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['crypto-gateway-customers']);
            setCreateDialogOpen(false);
            setNewCustomer({
                company_name: '',
                email: '',
                company_type: 'exchange',
                contact_name: '',
                phone: '',
                website: '',
                lei: '',
                tas_id: ''
            });
        }
    });

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen">
                <FTSPlatformSidebarRestructured currentPage="CryptoGatewayCustomers" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-slate-500">Loading customers...</div>
                </div>
            </div>
        );
    }

    const filteredCustomers = customers.filter(c => 
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'active').length,
        pending: customers.filter(c => c.status === 'pending').length,
        totalVolume: customers.reduce((sum, c) => sum + (c.total_volume || 0), 0)
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="CryptoGatewayCustomers"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Crypto Banking Customers</h2>
                        <p className="text-xs text-slate-600">Manage customer accounts and KYB/KYC status</p>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={true} />
                </header>
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Customer Accounts</h1>
                        </div>
                        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Customer
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Crypto Banking Customer</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Company Name *</Label>
                                            <Input
                                                value={newCustomer.company_name}
                                                onChange={(e) => setNewCustomer({...newCustomer, company_name: e.target.value})}
                                                placeholder="Acme Exchange"
                                            />
                                        </div>
                                        <div>
                                            <Label>Email *</Label>
                                            <Input
                                                type="email"
                                                value={newCustomer.email}
                                                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                                                placeholder="admin@acme.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Company Type *</Label>
                                            <Select value={newCustomer.company_type} onValueChange={(v) => setNewCustomer({...newCustomer, company_type: v})}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="exchange">Crypto Exchange</SelectItem>
                                                    <SelectItem value="defi_platform">DeFi Platform</SelectItem>
                                                    <SelectItem value="wallet_provider">Wallet Provider</SelectItem>
                                                    <SelectItem value="marketplace">NFT Marketplace</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Contact Name</Label>
                                            <Input
                                                value={newCustomer.contact_name}
                                                onChange={(e) => setNewCustomer({...newCustomer, contact_name: e.target.value})}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Phone</Label>
                                            <Input
                                                value={newCustomer.phone}
                                                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                                                placeholder="+1234567890"
                                            />
                                        </div>
                                        <div>
                                            <Label>Website</Label>
                                            <Input
                                                value={newCustomer.website}
                                                onChange={(e) => setNewCustomer({...newCustomer, website: e.target.value})}
                                                placeholder="https://acme.com"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
                                        <div className="flex items-start gap-2">
                                            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-blue-900 mb-1">Compliance Requirements</h4>
                                                <p className="text-sm text-blue-800 mb-3">
                                                    Provide either TAS ID or LEI. Without either, customer gets 3-month grace period.
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <Label>Trust Anchor Service (TAS) ID <span className="text-xs text-slate-500">(Preferred)</span></Label>
                                            <Input
                                                value={newCustomer.tas_id}
                                                onChange={(e) => setNewCustomer({...newCustomer, tas_id: e.target.value})}
                                                placeholder="TAS-XXXX-XXXX-XXXX"
                                            />
                                        </div>
                                        
                                        <div>
                                            <Label>Legal Entity Identifier (LEI) <span className="text-xs text-slate-500">(Alternative)</span></Label>
                                            <Input
                                                value={newCustomer.lei}
                                                onChange={(e) => setNewCustomer({...newCustomer, lei: e.target.value})}
                                                placeholder="20-character GLEIF LEI"
                                                maxLength={20}
                                            />
                                            {newCustomer.lei && !newCustomer.tas_id && (
                                                <p className="text-xs text-amber-700 mt-1">
                                                    ⚠️ Full KYB verification will be required
                                                </p>
                                            )}
                                        </div>
                                        
                                        {!newCustomer.lei && !newCustomer.tas_id && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                                <strong>Grace Period:</strong> Customer will have 3 months to provide credentials.
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Button 
                                        onClick={() => createCustomerMutation.mutate(newCustomer)}
                                        disabled={!newCustomer.company_name || !newCustomer.email}
                                        className="w-full"
                                    >
                                        Create Customer
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Customers</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active</p>
                                        <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending KYB</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Volume</p>
                                        <p className="text-2xl font-bold text-slate-900 mt-1">
                                            ${(stats.totalVolume / 1000000).toFixed(1)}M
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by company name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Customer List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Customers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {filteredCustomers.map((customer) => (
                                    <div key={customer.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                    {customer.company_name?.charAt(0) || 'C'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-slate-900">{customer.company_name}</h3>
                                                        <Badge variant={
                                                            customer.status === 'active' ? 'default' :
                                                            customer.status === 'pending' ? 'secondary' : 'destructive'
                                                        }>
                                                            {customer.status}
                                                        </Badge>
                                                        {customer.compliance_status === 'grace_period' && (
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                                                                Grace Period
                                                            </Badge>
                                                        )}
                                                        {customer.requires_kyb && customer.kyb_status !== 'completed' && (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                                                KYB Required
                                                            </Badge>
                                                        )}
                                                        {customer.kyc_enabled && (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                KYC Enabled
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mb-2">{customer.email}</p>
                                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {customer.company_type}
                                                        </span>
                                                        <span>Volume: ${(customer.total_volume || 0).toLocaleString()}</span>
                                                        <span>Txns: {customer.total_transactions || 0}</span>
                                                    </div>
                                                    
                                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                            {customer.tas_id ? (
                                                                <div className="flex items-center gap-1 text-green-700">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    <span>TAS: {customer.tas_status}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-slate-500">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    <span>No TAS</span>
                                                                </div>
                                                            )}
                                                            {customer.lei ? (
                                                                <div className="flex items-center gap-1 text-blue-700">
                                                                    <Shield className="h-3 w-3" />
                                                                    <span>LEI: {customer.lei_status}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-slate-500">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    <span>No LEI</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {customer.compliance_grace_period_end && (
                                                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                                                Grace period ends: {new Date(customer.compliance_grace_period_end).toLocaleDateString()}
                                                            </div>
                                                        )}
                                                        {customer.requires_kyb && customer.kyb_status !== 'completed' && (
                                                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                                                                ⚠️ Full KYB verification required
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">View Details</Button>
                                                <Button variant="outline" size="sm">Login As</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <div className="text-center py-12 text-slate-500">
                                        No customers found
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