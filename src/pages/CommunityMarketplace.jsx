import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Search, 
    Star,
    Users,
    TrendingUp,
    CheckCircle2,
    Shield,
    Zap,
    DollarSign,
    Clock,
    Globe,
    Building2,
    ExternalLink,
    Sparkles
} from 'lucide-react';
import { cn } from "@/lib/utils";

const categoryConfig = {
    payment_rail: { label: 'Payment Rails', color: 'bg-blue-100 text-blue-700', icon: Zap },
    compliance: { label: 'Compliance', color: 'bg-purple-100 text-purple-700', icon: Shield },
    fraud_detection: { label: 'Fraud Detection', color: 'bg-red-100 text-red-700', icon: Shield },
    analytics: { label: 'Analytics', color: 'bg-cyan-100 text-cyan-700', icon: TrendingUp },
    crypto: { label: 'Crypto', color: 'bg-amber-100 text-amber-700', icon: DollarSign },
    developer_tools: { label: 'Developer Tools', color: 'bg-green-100 text-green-700', icon: Zap },
    orchestration: { label: 'Orchestration', color: 'bg-indigo-100 text-indigo-700', icon: Zap },
    payout: { label: 'Payout', color: 'bg-pink-100 text-pink-700', icon: DollarSign }
};

const pricingModelLabels = {
    fixed: 'Fixed Monthly',
    per_transaction: 'Per Transaction',
    tiered: 'Volume-Based',
    custom: 'Custom Pricing'
};

export default function CommunityMarketplace() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedPSP, setSelectedPSP] = useState('');

    const { data: services = [], isLoading: loadingServices, error: servicesError } = useQuery({
        queryKey: ['marketplace-services'],
        queryFn: async () => {
            try {
                const result = await base44.entities.ServiceCatalog.list();
                const filtered = result.filter(s => s.status === 'active' || s.status === 'certified');
                console.log('All services:', result);
                console.log('Filtered services:', filtered);
                return filtered;
            } catch (err) {
                console.error('Error fetching services:', err);
                throw err;
            }
        }
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['service-providers'],
        queryFn: () => base44.entities.ServiceProvider.list()
    });

    const { data: psps = [], isLoading: loadingPSPs } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: async () => {
            const result = await base44.entities.ProvisionedPSP.filter({ status: 'active' });
            console.log('Fetched PSPs:', result);
            return result;
        }
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['psp-subscriptions', selectedPSP],
        queryFn: () => selectedPSP ? base44.entities.PSPServiceSubscription.filter({ psp_id: selectedPSP }) : [],
        enabled: !!selectedPSP
    });

    const subscribeMutation = useMutation({
        mutationFn: (data) => {
            console.log('Creating subscription:', data);
            return base44.entities.PSPServiceSubscription.create(data);
        },
        onSuccess: (result) => {
            console.log('Subscription created:', result);
            queryClient.invalidateQueries(['psp-subscriptions']);
            setDetailsOpen(false);
            alert('Successfully subscribed to ' + result.service_name);
        },
        onError: (error) => {
            console.error('Subscription failed:', error);
            alert('Failed to subscribe: ' + error.message);
        }
    });

    const handleSubscribe = (service, isTrial = false) => {
        if (!selectedPSP) {
            alert('Please select a PSP first');
            return;
        }

        const psp = psps.find(p => p.id === selectedPSP);
        if (!psp) {
            alert('PSP not found');
            return;
        }

        const trialEndDate = isTrial && service.trial_available 
            ? new Date(Date.now() + service.trial_duration_days * 24 * 60 * 60 * 1000).toISOString()
            : null;

        const subscriptionData = {
            psp_id: selectedPSP,
            psp_code: psp.psp_code,
            psp_name: psp.psp_name,
            service_id: service.id,
            service_name: service.service_name,
            provider_id: service.provider_id || '',
            subscribed_date: new Date().toISOString(),
            status: isTrial ? 'trial' : 'active',
            trial_ends_at: trialEndDate,
            base_fee: service.base_price || 0,
            variable_fee: service.variable_price || 0,
            billing_cycle: 'monthly',
            auto_renew: true
        };

        console.log('Attempting to subscribe:', subscriptionData);
        subscribeMutation.mutate(subscriptionData);
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.service_name?.toLowerCase().includes(search.toLowerCase()) ||
                            service.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.service_category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const isSubscribed = (serviceId) => {
        return subscriptions.some(sub => sub.service_id === serviceId && sub.status !== 'cancelled');
    };

    const ftsServices = filteredServices.filter(s => s.is_fts_owned);
    const thirdPartyServices = filteredServices.filter(s => !s.is_fts_owned);

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="CommunityMarketplace" userEmail={localStorage.getItem('communitySession') ? JSON.parse(localStorage.getItem('communitySession')).email : null} />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="px-6 py-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-8 w-8" />
                            <h1 className="text-3xl font-bold">Community Marketplace</h1>
                        </div>
                        <p className="text-blue-100 max-w-2xl">
                            Discover and integrate powerful services to enhance your PSP platform. 
                            From compliance tools to payment orchestration, find everything you need to scale.
                        </p>
                    </div>
                    <div className="px-6 pb-6 space-y-4">
                        {/* PSP Selection - Prominent */}
                        {psps.length > 0 && !selectedPSP && (
                            <div className="bg-white border-2 border-amber-400 rounded-lg p-4 shadow-lg">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Select Your PSP Instance</h3>
                                        <p className="text-xs text-slate-600 mb-3">Choose which PSP instance you want to subscribe services to</p>
                                        <Select value={selectedPSP} onValueChange={setSelectedPSP}>
                                            <SelectTrigger className="w-full h-12 text-base border-2 border-amber-300 hover:border-amber-400 bg-white">
                                                <SelectValue placeholder="👉 Click here to select your PSP" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {psps.map(psp => (
                                                    <SelectItem key={psp.id} value={psp.id} className="text-base py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4" />
                                                            <span className="font-medium">{psp.psp_name}</span>
                                                            <span className="text-slate-500">({psp.psp_code})</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Selected PSP Display */}
                        {selectedPSP && psps.find(p => p.id === selectedPSP) && (
                            <div className="bg-white border-2 border-emerald-400 rounded-lg p-4 shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600">Subscribing for</p>
                                            <p className="font-semibold text-slate-900">{psps.find(p => p.id === selectedPSP).psp_name}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setSelectedPSP('')}
                                    >
                                        Change
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Search and Filters */}
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search services..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 bg-white"
                                />
                            </div>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-48 bg-white">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {Object.entries(categoryConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {servicesError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-800">Error loading services: {servicesError.message}</p>
                        </div>
                    )}
                    {loadingServices && (
                        <div className="text-center py-12">
                            <p className="text-slate-600">Loading services...</p>
                        </div>
                    )}
                    {!selectedPSP && psps.length > 0 && (
                        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded">
                            <p className="text-amber-800">Please select a PSP from the dropdown above to subscribe to services</p>
                        </div>
                    )}
                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">All Services ({filteredServices.length})</TabsTrigger>
                            <TabsTrigger value="fts">FTS.Money ({ftsServices.length})</TabsTrigger>
                            <TabsTrigger value="community">Community ({thirdPartyServices.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-6">
                            {ftsServices.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">FTS.Money Services</h3>
                                    <ServiceGrid 
                                        services={ftsServices} 
                                        providers={providers}
                                        isSubscribed={isSubscribed}
                                        onViewDetails={(service) => {
                                            setSelectedService(service);
                                            setDetailsOpen(true);
                                        }}
                                        onSubscribe={handleSubscribe}
                                        selectedPSP={selectedPSP}
                                    />
                                </div>
                            )}
                            {thirdPartyServices.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Community Services</h3>
                                    <ServiceGrid 
                                        services={thirdPartyServices} 
                                        providers={providers}
                                        isSubscribed={isSubscribed}
                                        onViewDetails={(service) => {
                                            setSelectedService(service);
                                            setDetailsOpen(true);
                                        }}
                                        onSubscribe={handleSubscribe}
                                        selectedPSP={selectedPSP}
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="fts">
                            <ServiceGrid 
                                services={ftsServices} 
                                providers={providers}
                                isSubscribed={isSubscribed}
                                onViewDetails={(service) => {
                                    setSelectedService(service);
                                    setDetailsOpen(true);
                                }}
                                onSubscribe={handleSubscribe}
                                selectedPSP={selectedPSP}
                            />
                        </TabsContent>

                        <TabsContent value="community">
                            <ServiceGrid 
                                services={thirdPartyServices} 
                                providers={providers}
                                isSubscribed={isSubscribed}
                                onViewDetails={(service) => {
                                    setSelectedService(service);
                                    setDetailsOpen(true);
                                }}
                                onSubscribe={handleSubscribe}
                                selectedPSP={selectedPSP}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <ComplianceFooter />
            </div>

            {/* Service Details Dialog */}
            {selectedService && (
                <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        {selectedService.is_fts_owned ? (
                                            <Sparkles className="h-6 w-6 text-blue-600" />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl">{selectedService.service_name}</DialogTitle>
                                        <p className="text-sm text-slate-600">{selectedService.is_fts_owned ? 'FTS.Money' : selectedService.provider_name}</p>
                                    </div>
                                </div>
                                <Badge className={categoryConfig[selectedService.service_category]?.color}>
                                    {categoryConfig[selectedService.service_category]?.label}
                                </Badge>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-slate-600">{selectedService.description}</p>
                            </div>

                            {selectedService.features && selectedService.features.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2">Key Features</h4>
                                    <ul className="space-y-2">
                                        {selectedService.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-slate-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-600 mb-1">Pricing Model</p>
                                    <p className="font-semibold">{pricingModelLabels[selectedService.pricing_model]}</p>
                                </div>
                                {selectedService.base_price > 0 && (
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Base Price</p>
                                        <p className="font-semibold">${selectedService.base_price}/mo</p>
                                    </div>
                                )}
                                {selectedService.variable_price > 0 && (
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Per Transaction</p>
                                        <p className="font-semibold">${selectedService.variable_price}</p>
                                    </div>
                                )}
                                {selectedService.uptime_sla && (
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs text-slate-600 mb-1">Uptime SLA</p>
                                        <p className="font-semibold">{selectedService.uptime_sla}%</p>
                                    </div>
                                )}
                            </div>

                            {selectedService.documentation_url && (
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={selectedService.documentation_url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        View Documentation
                                    </a>
                                </Button>
                            )}

                            <div className="flex gap-3 pt-4">
                                {selectedService.trial_available && !isSubscribed(selectedService.id) && (
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={() => handleSubscribe(selectedService, true)}
                                        disabled={!selectedPSP}
                                    >
                                        <Clock className="h-4 w-4 mr-2" />
                                        Start {selectedService.trial_duration_days}-Day Trial
                                    </Button>
                                )}
                                <Button 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                        console.log('Dialog subscribe button clicked');
                                        console.log('Selected service:', selectedService);
                                        console.log('Selected PSP:', selectedPSP);
                                        console.log('Is subscribed:', isSubscribed(selectedService.id));
                                        handleSubscribe(selectedService, false);
                                    }}
                                    disabled={!selectedPSP || isSubscribed(selectedService.id)}
                                >
                                    {isSubscribed(selectedService.id) ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Subscribed
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="h-4 w-4 mr-2" />
                                            Subscribe Now
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}

function ServiceGrid({ services, providers, isSubscribed, onViewDetails, onSubscribe, selectedPSP }) {
    if (services.length === 0) {
        return (
            <div className="text-center py-12">
                <Globe className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No services found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => {
                const category = categoryConfig[service.service_category];
                const CategoryIcon = category?.icon || Zap;
                const subscribed = isSubscribed(service.id);

                return (
                    <Card key={service.id} className={cn(
                        "hover:shadow-lg transition-all cursor-pointer",
                        subscribed && "border-2 border-emerald-500"
                    )}>
                        <CardHeader>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", category?.color)}>
                                        <CategoryIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base leading-tight">{service.service_name}</CardTitle>
                                        <p className="text-xs text-slate-500">{service.is_fts_owned ? 'FTS.Money' : service.provider_name}</p>
                                    </div>
                                </div>
                                {service.is_fts_owned && (
                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        FTS
                                    </Badge>
                                )}
                            </div>
                            <Badge variant="outline" className={category?.color}>
                                {category?.label}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
                            
                            <div className="flex items-center justify-between text-xs text-slate-600 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    <span>{service.rating || 'New'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span>{service.total_subscribers || 0} subs</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{service.uptime_sla}% SLA</span>
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Pricing</p>
                                <p className="font-semibold text-sm">
                                    {pricingModelLabels[service.pricing_model]}
                                    {service.base_price > 0 && ` - $${service.base_price}/mo`}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => onViewDetails(service)}
                                >
                                    Details
                                </Button>
                                {subscribed ? (
                                    <Badge className="flex-1 h-9 flex items-center justify-center bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                ) : (
                                    <Button 
                                        size="sm" 
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={() => {
                                            console.log('Subscribe button clicked for:', service.service_name);
                                            console.log('Selected PSP:', selectedPSP);
                                            onSubscribe(service, false);
                                        }}
                                        disabled={!selectedPSP}
                                    >
                                        Subscribe
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}