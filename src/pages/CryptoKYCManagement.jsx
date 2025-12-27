import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, CheckCircle2, AlertCircle, Clock, FileText, User, Building2 } from 'lucide-react';

export default function CryptoKYCManagement() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const [selectedTab, setSelectedTab] = useState('pending');
    const queryClient = useQueryClient();

    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['crypto-gateway-customers'],
        queryFn: () => base44.asServiceRole.entities.CryptoGatewayCustomer.list('-created_date')
    });

    const approveKYBMutation = useMutation({
        mutationFn: ({ id }) => base44.asServiceRole.entities.CryptoGatewayCustomer.update(id, {
            compliance_status: 'compliant',
            status: 'active'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['crypto-gateway-customers']);
        }
    });

    const rejectKYBMutation = useMutation({
        mutationFn: ({ id }) => base44.asServiceRole.entities.CryptoGatewayCustomer.update(id, {
            compliance_status: 'non_compliant',
            status: 'suspended'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['crypto-gateway-customers']);
        }
    });

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen">
                <FTSPlatformSidebarRestructured currentPage="CryptoKYCManagement" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-slate-500">Loading verification data...</div>
                </div>
            </div>
        );
    }

    const pendingCustomers = customers.filter(c => c.compliance_status === 'pending_review');
    const approvedCustomers = customers.filter(c => c.compliance_status === 'compliant');
    const rejectedCustomers = customers.filter(c => c.compliance_status === 'non_compliant');

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="CryptoKYCManagement"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">KYB/KYC Verification</h1>
                                <p className="text-slate-600">Review and approve customer compliance status</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending Review</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCustomers.length}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Approved</p>
                                        <p className="text-3xl font-bold text-green-600 mt-1">{approvedCustomers.length}</p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Rejected</p>
                                        <p className="text-3xl font-bold text-red-600 mt-1">{rejectedCustomers.length}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{customers.length}</p>
                                    </div>
                                    <User className="h-8 w-8 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                        <TabsList>
                            <TabsTrigger value="pending">
                                Pending Review ({pendingCustomers.length})
                            </TabsTrigger>
                            <TabsTrigger value="approved">
                                Approved ({approvedCustomers.length})
                            </TabsTrigger>
                            <TabsTrigger value="rejected">
                                Rejected ({rejectedCustomers.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pending KYB/KYC Reviews</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {pendingCustomers.map((customer) => (
                                            <div key={customer.id} className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Building2 className="h-5 w-5 text-slate-600" />
                                                            <h3 className="font-semibold text-slate-900">{customer.company_name}</h3>
                                                            <Badge variant="secondary">Pending</Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-2">{customer.email}</p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                                            <span>Type: {customer.company_type}</span>
                                                            <span>Contact: {customer.contact_name || 'N/A'}</span>
                                                            <span>Submitted: {new Date(customer.created_date).toLocaleDateString()}</span>
                                                        </div>
                                                        {customer.lei && (
                                                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="h-3 w-3 text-blue-600" />
                                                                    <span className="font-semibold text-blue-900">LEI:</span>
                                                                    <span className="font-mono text-blue-800">{customer.lei}</span>
                                                                    <Badge variant={
                                                                        customer.lei_status === 'verified' ? 'default' :
                                                                        customer.lei_status === 'pending' ? 'secondary' : 'destructive'
                                                                    } className="text-[9px]">
                                                                        {customer.lei_status}
                                                                    </Badge>
                                                                </div>
                                                                {customer.vlei && (
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="font-semibold text-blue-900">vLEI:</span>
                                                                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                                        <span className="text-green-700">Verified</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => approveKYBMutation.mutate({ id: customer.id })}
                                                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                                        >
                                                            <CheckCircle2 className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => rejectKYBMutation.mutate({ id: customer.id })}
                                                            className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                                        >
                                                            <AlertCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {pendingCustomers.length === 0 && (
                                            <div className="text-center py-12 text-slate-500">
                                                No pending reviews
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="approved" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Approved Customers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {approvedCustomers.map((customer) => (
                                            <div key={customer.id} className="p-4 border border-green-200 bg-green-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-slate-900">{customer.company_name}</h3>
                                                            <Badge className="bg-green-600">Compliant</Badge>
                                                            {customer.lei_status === 'verified' && (
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                                                                    LEI Verified
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-600">{customer.email}</p>
                                                        {customer.lei && (
                                                            <p className="text-xs text-slate-500 font-mono mt-1">LEI: {customer.lei}</p>
                                                        )}
                                                    </div>
                                                    <Button variant="outline" size="sm">View Details</Button>
                                                </div>
                                            </div>
                                        ))}
                                        {approvedCustomers.length === 0 && (
                                            <div className="text-center py-12 text-slate-500">
                                                No approved customers yet
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="rejected" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rejected Customers</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {rejectedCustomers.map((customer) => (
                                            <div key={customer.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-slate-900">{customer.company_name}</h3>
                                                            <Badge variant="destructive">Non-Compliant</Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{customer.email}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">Review Again</Button>
                                                </div>
                                            </div>
                                        ))}
                                        {rejectedCustomers.length === 0 && (
                                            <div className="text-center py-12 text-slate-500">
                                                No rejected customers
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}