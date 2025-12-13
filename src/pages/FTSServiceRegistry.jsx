import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Plus, 
    Search, 
    Zap, 
    Building2, 
    CheckCircle2, 
    Clock,
    AlertCircle,
    TrendingUp,
    Users,
    DollarSign,
    Eye,
    Settings as SettingsIcon,
    ArrowRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

const categoryConfig = {
    payment_rail: { label: 'Payment Rails', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Building2 },
    compliance: { label: 'Compliance', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle2 },
    fraud_detection: { label: 'Fraud Detection', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
    analytics: { label: 'Analytics', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: TrendingUp },
    crypto: { label: 'Crypto', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Zap },
    developer_tools: { label: 'Developer Tools', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: SettingsIcon },
    orchestration: { label: 'Orchestration', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: Zap },
    payout: { label: 'Payout', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: DollarSign }
};

const statusConfig = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
    certified: { label: 'Certified', color: 'bg-purple-100 text-purple-700' },
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    deprecated: { label: 'Deprecated', color: 'bg-red-100 text-red-700' }
};

export default function FTSServiceRegistry() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    const [formData, setFormData] = useState({
        service_name: '',
        service_category: 'payment_rail',
        provider_id: '',
        is_fts_owned: true,
        description: '',
        pricing_model: 'fixed',
        base_price: 0,
        variable_price: 0,
        status: 'draft',
        uptime_sla: 99.9,
        features: []
    });

    const { data: services = [] } = useQuery({
        queryKey: ['service-catalog'],
        queryFn: () => base44.entities.ServiceCatalog.list('-created_date')
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['service-providers'],
        queryFn: () => base44.entities.ServiceProvider.list()
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['service-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list()
    });

    const createServiceMutation = useMutation({
        mutationFn: (data) => base44.entities.ServiceCatalog.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-catalog']);
            setDialogOpen(false);
            setFormData({
                service_name: '',
                service_category: 'payment_rail',
                provider_id: '',
                is_fts_owned: true,
                description: '',
                pricing_model: 'fixed',
                base_price: 0,
                variable_price: 0,
                status: 'draft',
                uptime_sla: 99.9,
                features: []
            });
        }
    });

    const updateServiceMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ServiceCatalog.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-catalog']);
        }
    });

    const filteredServices = services.filter(service => {
        const matchesSearch = service.service_name?.toLowerCase().includes(search.toLowerCase()) ||
                            service.provider_name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || service.service_category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const provider = providers.find(p => p.id === formData.provider_id);
        createServiceMutation.mutate({
            ...formData,
            service_id: `svc_${Date.now()}`,
            provider_name: provider?.company_name || 'FTS.Money',
            total_subscribers: 0,
            total_reviews: 0,
            rating: 0
        });
    };

    const handleStatusChange = (service, newStatus) => {
        updateServiceMutation.mutate({
            id: service.id,
            data: { 
                status: newStatus,
                certification_date: newStatus === 'certified' || newStatus === 'active' ? new Date().toISOString().split('T')[0] : service.certification_date
            }
        });
    };

    const totalServices = services.length;
    const activeServices = services.filter(s => s.status === 'active').length;
    const ftsServices = services.filter(s => s.is_fts_owned).length;
    const totalSubscribers = services.reduce((sum, s) => sum + (s.total_subscribers || 0), 0);

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="FTSServiceRegistry" />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Service Registry</h2>
                        <p className="text-xs text-slate-600">Manage marketplace service catalog</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4" />
                                Register Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Register New Service</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Service Name *</Label>
                                        <Input
                                            value={formData.service_name}
                                            onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                                            placeholder="Payment Orchestration Service"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Category *</Label>
                                        <Select value={formData.service_category} onValueChange={(v) => setFormData({...formData, service_category: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(categoryConfig).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                                        <Switch
                                            checked={formData.is_fts_owned}
                                            onCheckedChange={(checked) => setFormData({...formData, is_fts_owned: checked})}
                                        />
                                        <div>
                                            <p className="font-medium text-sm">FTS-Owned Service</p>
                                            <p className="text-xs text-slate-600">Developed and operated by FTS.Money (100% margin)</p>
                                        </div>
                                    </div>
                                    {!formData.is_fts_owned && (
                                        <div className="col-span-2">
                                            <Label>Service Provider</Label>
                                            <Select value={formData.provider_id} onValueChange={(v) => setFormData({...formData, provider_id: v})}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select provider" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {providers.map(provider => (
                                                        <SelectItem key={provider.id} value={provider.id}>
                                                            {provider.company_name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Brief service description..."
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>Pricing Model</Label>
                                        <Select value={formData.pricing_model} onValueChange={(v) => setFormData({...formData, pricing_model: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Fixed Monthly</SelectItem>
                                                <SelectItem value="per_transaction">Per Transaction</SelectItem>
                                                <SelectItem value="tiered">Volume Tiers</SelectItem>
                                                <SelectItem value="custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Base Price (Monthly)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.base_price}
                                            onChange={(e) => setFormData({...formData, base_price: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    {formData.pricing_model === 'per_transaction' && (
                                        <div>
                                            <Label>Per-Transaction Fee</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={formData.variable_price}
                                                onChange={(e) => setFormData({...formData, variable_price: parseFloat(e.target.value)})}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <Label>Uptime SLA (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.uptime_sla}
                                            onChange={(e) => setFormData({...formData, uptime_sla: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        Register Service
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Services</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalServices}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Zap className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Services</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{activeServices}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">FTS-Owned</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{ftsServices}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Subscribers</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalSubscribers}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-cyan-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search services..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {Object.entries(categoryConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Services Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredServices.map((service) => {
                            const category = categoryConfig[service.service_category] || categoryConfig.payment_rail;
                            const status = statusConfig[service.status] || statusConfig.draft;
                            const CategoryIcon = category.icon;
                            
                            return (
                                <Card key={service.id} className="hover:shadow-md transition-all cursor-pointer group">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", category.color)}>
                                                    <CategoryIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{service.service_name}</CardTitle>
                                                    <p className="text-xs text-slate-500">{service.provider_name}</p>
                                                </div>
                                            </div>
                                            <Badge className={status.color}>{status.label}</Badge>
                                        </div>
                                        {service.is_fts_owned && (
                                            <Badge variant="outline" className="text-xs w-fit">
                                                <Zap className="h-3 w-3 mr-1" />
                                                FTS-Owned
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Pricing:</span>
                                                <span className="font-semibold">
                                                    {service.pricing_model === 'fixed' && `$${service.base_price}/mo`}
                                                    {service.pricing_model === 'per_transaction' && `$${service.variable_price} per tx`}
                                                    {service.pricing_model === 'tiered' && 'Volume-based'}
                                                    {service.pricing_model === 'custom' && 'Custom'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">SLA Uptime:</span>
                                                <span className="font-semibold">{service.uptime_sla}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Subscribers:</span>
                                                <span className="font-semibold">{service.total_subscribers || 0}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedService(service);
                                                    setDetailsOpen(true);
                                                }}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                Details
                                            </Button>
                                            {service.status === 'under_review' && (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                                    onClick={() => handleStatusChange(service, 'active')}
                                                >
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Approve
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {filteredServices.length === 0 && (
                            <div className="col-span-3 text-center py-12">
                                <Zap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600 mb-4">No services found</p>
                                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Register First Service
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Service Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {selectedService && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3">
                                    {selectedService.service_name}
                                    <Badge className={statusConfig[selectedService.status]?.color}>
                                        {statusConfig[selectedService.status]?.label}
                                    </Badge>
                                </DialogTitle>
                            </DialogHeader>
                            <Tabs defaultValue="overview">
                                <TabsList>
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                                    <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-slate-500">Provider</Label>
                                            <p className="font-medium">{selectedService.provider_name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-500">Category</Label>
                                            <Badge className={categoryConfig[selectedService.service_category]?.color}>
                                                {categoryConfig[selectedService.service_category]?.label}
                                            </Badge>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-500">Service ID</Label>
                                            <p className="font-mono text-sm">{selectedService.service_id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-500">SLA Uptime</Label>
                                            <p className="font-medium">{selectedService.uptime_sla}%</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500">Description</Label>
                                        <p className="text-sm text-slate-700">{selectedService.description}</p>
                                    </div>
                                    {selectedService.is_fts_owned && (
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                            <p className="text-sm font-medium text-blue-900">FTS-Owned Service</p>
                                            <p className="text-xs text-blue-700">100% margin - no revenue sharing</p>
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="pricing" className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded border">
                                        <p className="font-medium mb-2">Pricing Model: {selectedService.pricing_model}</p>
                                        <div className="space-y-2 text-sm">
                                            {selectedService.base_price > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Base Fee:</span>
                                                    <span className="font-bold">${selectedService.base_price}/month</span>
                                                </div>
                                            )}
                                            {selectedService.variable_price > 0 && (
                                                <div className="flex justify-between">
                                                    <span>Variable Fee:</span>
                                                    <span className="font-bold">${selectedService.variable_price} per transaction</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                                <TabsContent value="subscribers">
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600">{selectedService.total_subscribers || 0} PSPs subscribed</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="mt-4"
                                            onClick={() => navigate(createPageUrl('PSPProvisioning'))}
                                        >
                                            View PSPs
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}