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
import { Building2, Plus, Search, TrendingUp, Activity, AlertCircle } from 'lucide-react';

export default function ISOGatewayCustomers() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        company_name: '',
        contact_email: '',
        contact_phone: '',
        password_hash: 'demo123',
        customer_type: 'fintech',
        subscription_tier: 'developer',
        monthly_message_limit: 50000
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
            return await base44.entities.ISOGatewayCustomer.create({
                ...data,
                customer_id: `iso_cust_${Date.now()}`,
                status: 'trial',
                trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                current_month_usage: 0,
                total_messages_processed: 0,
                webhook_secret: crypto.randomUUID()
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
                monthly_message_limit: 50000
            });
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
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">ISO Gateway Customers</h1>
                            <p className="text-gray-600 mt-1">Manage customer subscriptions and usage</p>
                        </div>
                        
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Customer
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
        </div>
    );
}