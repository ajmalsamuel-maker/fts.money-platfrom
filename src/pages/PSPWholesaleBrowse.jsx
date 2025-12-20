import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Building2, ShoppingCart, CheckCircle, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function PSPWholesaleBrowse() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedOffering, setSelectedOffering] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const staffSession = JSON.parse(localStorage.getItem('staff_session') || '{}');
    const pspCode = staffSession.psp_code;

    const { data: currentPSP } = useQuery({
        queryKey: ['current-psp', pspCode],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ psp_code: pspCode }).then(r => r[0]),
        enabled: !!pspCode
    });

    const { data: offerings = [] } = useQuery({
        queryKey: ['available-wholesale-offerings'],
        queryFn: () => base44.entities.PSPWholesaleOffering.filter({ 
            status: 'active',
            visibility: 'public'
        })
    });

    const { data: mySubscriptions = [] } = useQuery({
        queryKey: ['my-wholesale-subscriptions', currentPSP?.id],
        queryFn: () => base44.entities.PSPResellerRelationship.filter({ reseller_psp_id: currentPSP.id }),
        enabled: !!currentPSP?.id
    });

    const subscribeMutation = useMutation({
        mutationFn: (offering) => base44.entities.PSPResellerRelationship.create({
            relationship_id: `REL-${Date.now()}`,
            offering_id: offering.id,
            offering_name: offering.offering_name,
            provider_psp_id: offering.provider_psp_id,
            provider_psp_name: offering.provider_psp_name,
            reseller_psp_id: currentPSP.id,
            reseller_psp_name: currentPSP.psp_name,
            status: 'pending_approval',
            pricing_terms: offering.wholesale_pricing,
            platform_commission_percentage: offering.platform_commission_percentage,
            monthly_fee: offering.wholesale_pricing?.base_price || 0,
            per_transaction_fee: offering.wholesale_pricing?.per_transaction_fee || 0,
            auto_renew: true
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-wholesale-subscriptions']);
            setShowDetails(false);
            toast.success('Subscription request submitted for platform approval');
        }
    });

    const filteredOfferings = offerings.filter(o => {
        const matchesSearch = o.offering_name?.toLowerCase().includes(search.toLowerCase());
        const notOwnOffering = o.provider_psp_id !== currentPSP?.id;
        return matchesSearch && notOwnOffering;
    });

    const isSubscribed = (offeringId) => {
        return mySubscriptions.some(sub => 
            sub.offering_id === offeringId && 
            (sub.status === 'active' || sub.status === 'pending_approval')
        );
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar currentPage="PSPWholesaleBrowse" />
            <div className="flex-1 flex flex-col">
                <TopHeader />
                <main className="flex-1 overflow-auto p-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">PSP Wholesale Marketplace</h2>
                        <p className="text-slate-600">Browse and subscribe to services from other PSPs</p>
                    </div>

                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search wholesale offerings..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOfferings.map(offering => {
                            const subscribed = isSubscribed(offering.id);
                            return (
                                <Card key={offering.id} className="hover:shadow-lg transition-all">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{offering.offering_name}</CardTitle>
                                                    <p className="text-xs text-slate-500">{offering.provider_psp_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="capitalize">{offering.offering_category?.replace(/_/g, ' ')}</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{offering.description}</p>
                                        
                                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                            <p className="text-xs text-slate-600 mb-1">Wholesale Pricing</p>
                                            <p className="font-semibold text-sm">
                                                {offering.wholesale_pricing?.pricing_model === 'fixed_monthly' && `$${offering.wholesale_pricing.base_price}/mo`}
                                                {offering.wholesale_pricing?.pricing_model === 'per_transaction' && `$${offering.wholesale_pricing.per_transaction_fee}/txn`}
                                                {offering.wholesale_pricing?.pricing_model === 'revenue_share' && `${offering.wholesale_pricing.revenue_share_percentage}% revenue share`}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Platform commission: {offering.platform_commission_percentage}%
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                <span>{offering.current_resellers || 0} resellers</span>
                                            </div>
                                            {offering.sla_uptime && (
                                                <div className="flex items-center gap-1">
                                                    <span>{offering.sla_uptime}% SLA</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => { setSelectedOffering(offering); setShowDetails(true); }}
                                            >
                                                Details
                                            </Button>
                                            {subscribed ? (
                                                <Badge className="flex-1 h-9 flex items-center justify-center bg-emerald-100 text-emerald-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Subscribed
                                                </Badge>
                                            ) : (
                                                <Button 
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => subscribeMutation.mutate(offering)}
                                                >
                                                    <ShoppingCart className="h-3 w-3 mr-1" />
                                                    Subscribe
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {filteredOfferings.length === 0 && (
                        <div className="text-center py-12">
                            <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-600">No wholesale offerings available</p>
                        </div>
                    )}
                </main>
            </div>

            {selectedOffering && (
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selectedOffering.offering_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Provider</h4>
                                <p className="text-slate-600">{selectedOffering.provider_psp_name}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-slate-600">{selectedOffering.description}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Pricing Details</h4>
                                <div className="bg-slate-50 rounded p-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Model:</span>
                                        <span className="font-medium">{selectedOffering.wholesale_pricing?.pricing_model}</span>
                                    </div>
                                    {selectedOffering.wholesale_pricing?.base_price > 0 && (
                                        <div className="flex justify-between">
                                            <span>Monthly Fee:</span>
                                            <span className="font-medium">${selectedOffering.wholesale_pricing.base_price}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span>Platform Commission:</span>
                                        <span className="font-medium">{selectedOffering.platform_commission_percentage}%</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button 
                                    className="flex-1"
                                    onClick={() => subscribeMutation.mutate(selectedOffering)}
                                    disabled={isSubscribed(selectedOffering.id)}
                                >
                                    {isSubscribed(selectedOffering.id) ? 'Already Subscribed' : 'Subscribe Now'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}