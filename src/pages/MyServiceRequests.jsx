import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
    CreditCard, 
    Wallet, 
    Plus,
    CheckCircle2,
    Clock,
    XCircle,
    Send
} from 'lucide-react';
import { cn } from "@/lib/utils";

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
};

export default function MyServiceRequests() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const session = JSON.parse(localStorage.getItem('community_portal_session') || '{}');
    
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [requestType, setRequestType] = useState('payment_provider');
    const [formData, setFormData] = useState({
        business_justification: '',
        expected_volume: ''
    });

    if (!session.email) {
        navigate(createPageUrl('CommunityPortalLogin'));
        return null;
    }

    const { data: myPSPs = [], isLoading: loadingPSPs } = useQuery({
        queryKey: ['my-psps', session.email],
        queryFn: async () => {
            const psps = await base44.entities.ProvisionedPSP.filter({ owner_email: session.email });
            console.log('My PSPs:', psps);
            return psps;
        }
    });

    const activePSP = myPSPs.find(p => p.status === 'active');

    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: async () => {
            const result = await base44.entities.PaymentProvider.list();
            console.log('Payment Providers:', result);
            return result;
        },
        enabled: !!activePSP
    });

    const { data: payoutRoutes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: async () => {
            const result = await base44.entities.PayoutRoute.list();
            console.log('Payout Routes:', result);
            return result;
        },
        enabled: !!activePSP
    });

    const { data: myRequests = [] } = useQuery({
        queryKey: ['my-service-requests', activePSP?.id],
        queryFn: () => base44.entities.ServiceRequest.filter({ psp_id: activePSP.id }, '-created_date'),
        enabled: !!activePSP
    });

    const createRequestMutation = useMutation({
        mutationFn: (data) => base44.entities.ServiceRequest.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-service-requests']);
            setDialogOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setFormData({
            business_justification: '',
            expected_volume: ''
        });
        setSelectedService(null);
    };

    const handleRequestService = (service, type) => {
        setSelectedService(service);
        setRequestType(type);
        setDialogOpen(true);
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        createRequestMutation.mutate({
            psp_id: activePSP.id,
            psp_code: activePSP.psp_code,
            psp_name: activePSP.psp_name,
            request_type: requestType,
            service_id: selectedService.id,
            service_name: selectedService.name || selectedService.route_name,
            business_justification: formData.business_justification,
            expected_volume: parseFloat(formData.expected_volume) || 0,
            status: 'pending'
        });
    };

    // Filter out already enabled services
    const enabledPaymentProviders = activePSP?.enabled_payment_methods || [];
    const enabledPayoutRoutes = activePSP?.enabled_payout_methods || [];
    const requestedProviderIds = myRequests
        .filter(r => r.request_type === 'payment_provider' && r.status === 'pending')
        .map(r => r.service_id);
    const requestedRouteIds = myRequests
        .filter(r => r.request_type === 'payout_route' && r.status === 'pending')
        .map(r => r.service_id);

    const availableProviders = paymentProviders.filter(
        p => !enabledPaymentProviders.includes(p.id) && !requestedProviderIds.includes(p.id)
    );
    const availableRoutes = payoutRoutes.filter(
        r => !enabledPayoutRoutes.includes(r.id) && !requestedRouteIds.includes(r.id)
    );

    if (!activePSP) {
        return (
            <div className="flex h-screen bg-slate-50">
                <CommunityPortalSidebar currentPage="MyServiceRequests" userEmail={session.email} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active PSP</h2>
                        <p className="text-slate-600 mb-4">You need an active PSP instance to request services</p>
                        <Button onClick={() => navigate(createPageUrl('MyPSPInstances'))}>
                            View My PSP Instances
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="MyServiceRequests" userEmail={session.email} />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Service Requests</h2>
                        <p className="text-xs text-slate-600">Request payment providers and payout routes for {activePSP.psp_name}</p>
                    </div>
                </header>

                <div className="p-6">
                    <Tabs defaultValue="available">
                        <TabsList className="mb-6">
                            <TabsTrigger value="available">Available Services</TabsTrigger>
                            <TabsTrigger value="requests">My Requests ({myRequests.length})</TabsTrigger>
                        </TabsList>

                        {/* Available Services Tab */}
                        <TabsContent value="available" className="space-y-6">
                            {/* Payment Providers */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payment Providers</CardTitle>
                                    <CardDescription>Request access to payment gateways and processors</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {availableProviders.length === 0 ? (
                                        <p className="text-center py-8 text-slate-500">No additional payment providers available</p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            {availableProviders.map((provider) => (
                                                <div key={provider.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center">
                                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{provider.name}</p>
                                                            {provider.type && (
                                                                <p className="text-xs text-slate-500 capitalize">{provider.type}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleRequestService(provider, 'payment_provider')}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Request
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Payout Routes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Payout Routes</CardTitle>
                                    <CardDescription>Request access to payout and settlement methods</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {availableRoutes.length === 0 ? (
                                        <p className="text-center py-8 text-slate-500">No additional payout routes available</p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            {availableRoutes.map((route) => (
                                                <div key={route.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-emerald-300 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded bg-emerald-50 flex items-center justify-center">
                                                            <Wallet className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{route.route_name}</p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <span className="capitalize">{route.channel_type}</span>
                                                                <span>•</span>
                                                                <span>{route.speed}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        size="sm"
                                                        onClick={() => handleRequestService(route, 'payout_route')}
                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Request
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* My Requests Tab */}
                        <TabsContent value="requests">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Request History</CardTitle>
                                    <CardDescription>Track status of your service requests</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {myRequests.length === 0 ? (
                                        <p className="text-center py-8 text-slate-500">No service requests yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {myRequests.map((request) => {
                                                const status = statusConfig[request.status];
                                                const StatusIcon = status.icon;
                                                return (
                                                    <div key={request.id} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg">
                                                        <div className="flex items-start gap-3">
                                                            <div className={cn(
                                                                "w-10 h-10 rounded flex items-center justify-center",
                                                                request.request_type === 'payment_provider' ? 'bg-blue-50' : 'bg-emerald-50'
                                                            )}>
                                                                {request.request_type === 'payment_provider' ? (
                                                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                                                ) : (
                                                                    <Wallet className="h-5 w-5 text-emerald-600" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{request.service_name}</p>
                                                                <p className="text-xs text-slate-500 capitalize mb-2">{request.request_type.replace('_', ' ')}</p>
                                                                {request.business_justification && (
                                                                    <p className="text-sm text-slate-600 mb-1">{request.business_justification}</p>
                                                                )}
                                                                {request.expected_volume > 0 && (
                                                                    <p className="text-xs text-slate-500">Expected volume: ${(request.expected_volume / 1000000).toFixed(1)}M/mo</p>
                                                                )}
                                                                {request.review_notes && (
                                                                    <p className="text-sm text-slate-600 mt-2 italic">Note: {request.review_notes}</p>
                                                                )}
                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    Requested {new Date(request.created_date).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Badge className={status.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {status.label}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                
                <ComplianceFooter />
            </div>

            {/* Request Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request {selectedService?.name || selectedService?.route_name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                        <div>
                            <Label>Business Justification *</Label>
                            <Textarea
                                value={formData.business_justification}
                                onChange={(e) => setFormData({...formData, business_justification: e.target.value})}
                                placeholder="Why do you need this service? What use case will it serve?"
                                rows={4}
                                required
                            />
                        </div>
                        <div>
                            <Label>Expected Monthly Volume (USD)</Label>
                            <Input
                                type="number"
                                value={formData.expected_volume}
                                onChange={(e) => setFormData({...formData, expected_volume: e.target.value})}
                                placeholder="1000000"
                            />
                            <p className="text-xs text-slate-500 mt-1">Estimated transaction volume per month</p>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Send className="h-4 w-4 mr-2" />
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}