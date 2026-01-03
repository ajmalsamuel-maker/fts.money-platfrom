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
import { 
    Plus, 
    Search, 
    Building2, 
    CheckCircle2, 
    Clock,
    AlertCircle,
    XCircle,
    DollarSign,
    Users,
    TrendingUp,
    Globe,
    Mail,
    Phone,
    Shield
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700', icon: Clock },
    under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Clock },
    approved: { label: 'Approved', color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 },
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    suspended: { label: 'Suspended', color: 'bg-amber-100 text-amber-700', icon: AlertCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
};

export default function FTSServiceProviders() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { t } = useI18n();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);

    const [formData, setFormData] = useState({
        company_name: '',
        legal_name: '',
        website: '',
        description: '',
        headquarters_country: '',
        contact_email: '',
        support_email: '',
        technical_contact_email: '',
        certifications: [],
        status: 'pending',
        commission_rate: 0.20
    });

    const { data: providers = [] } = useQuery({
        queryKey: ['service-providers'],
        queryFn: () => base44.entities.ServiceProvider.list('-created_date')
    });

    const { data: services = [] } = useQuery({
        queryKey: ['service-catalog'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['psp-service-subscriptions'],
        queryFn: () => base44.entities.PSPServiceSubscription.list()
    });

    const createProviderMutation = useMutation({
        mutationFn: (data) => base44.entities.ServiceProvider.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-providers']);
            setDialogOpen(false);
            resetForm();
        }
    });

    const updateProviderMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ServiceProvider.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-providers']);
            setDialogOpen(false);
            resetForm();
        }
    });

    const resetForm = () => {
        setFormData({
            company_name: '',
            legal_name: '',
            website: '',
            description: '',
            headquarters_country: '',
            contact_email: '',
            support_email: '',
            technical_contact_email: '',
            certifications: [],
            status: 'pending',
            commission_rate: 0.20
        });
        setEditMode(false);
        setSelectedProvider(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editMode && selectedProvider) {
            updateProviderMutation.mutate({
                id: selectedProvider.id,
                data: formData
            });
        } else {
            createProviderMutation.mutate({
                ...formData,
                provider_id: `pvd_${Date.now()}`,
                total_services: 0,
                active_subscribers: 0,
                total_revenue_earned: 0,
                monthly_revenue: 0
            });
        }
    };

    const handleEdit = (provider) => {
        setSelectedProvider(provider);
        setFormData({
            company_name: provider.company_name,
            legal_name: provider.legal_name,
            website: provider.website || '',
            description: provider.description || '',
            headquarters_country: provider.headquarters_country || '',
            contact_email: provider.contact_email,
            support_email: provider.support_email || '',
            technical_contact_email: provider.technical_contact_email || '',
            certifications: provider.certifications || [],
            status: provider.status,
            commission_rate: provider.commission_rate || 0.20
        });
        setEditMode(true);
        setDialogOpen(true);
    };

    const filteredProviders = providers.filter(provider => {
        const matchesSearch = provider.company_name?.toLowerCase().includes(search.toLowerCase()) ||
                            provider.legal_name?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalProviders = providers.length;
    const activeProviders = providers.filter(p => p.status === 'active').length;
    const pendingProviders = providers.filter(p => p.status === 'pending' || p.status === 'under_review').length;
    const totalServices = services.filter(s => !s.is_fts_owned).length;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="FTSServiceProviders" />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.serviceProviders')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:subMenuItems.serviceProvidersDesc')}</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4" />
                                Add Provider
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editMode ? 'Edit Service Provider' : 'Add Service Provider'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Company Name *</Label>
                                        <Input
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                                            placeholder="Acme Corp"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Legal Name *</Label>
                                        <Input
                                            value={formData.legal_name}
                                            onChange={(e) => setFormData({...formData, legal_name: e.target.value})}
                                            placeholder="Acme Corporation Ltd"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Website</Label>
                                        <Input
                                            value={formData.website}
                                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                                            placeholder="https://acme.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>Headquarters Country</Label>
                                        <Input
                                            value={formData.headquarters_country}
                                            onChange={(e) => setFormData({...formData, headquarters_country: e.target.value})}
                                            placeholder="United States"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            placeholder="Brief company description..."
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <Label>Contact Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.contact_email}
                                            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                            placeholder="contact@acme.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Support Email</Label>
                                        <Input
                                            type="email"
                                            value={formData.support_email}
                                            onChange={(e) => setFormData({...formData, support_email: e.target.value})}
                                            placeholder="support@acme.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>Technical Contact</Label>
                                        <Input
                                            type="email"
                                            value={formData.technical_contact_email}
                                            onChange={(e) => setFormData({...formData, technical_contact_email: e.target.value})}
                                            placeholder="tech@acme.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>FTS Commission Rate (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.commission_rate * 100}
                                            onChange={(e) => setFormData({...formData, commission_rate: parseFloat(e.target.value) / 100})}
                                        />
                                        <p className="text-xs text-slate-500 mt-1">FTS.Money revenue share (typically 15-25%)</p>
                                    </div>
                                    <div>
                                        <Label>Status</Label>
                                        <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="under_review">Under Review</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                        {editMode ? 'Update Provider' : 'Add Provider'}
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
                                        <p className="text-sm text-slate-600">Total Providers</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalProviders}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Providers</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{activeProviders}</p>
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
                                        <p className="text-sm text-slate-600">Pending Review</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{pendingProviders}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">3rd Party Services</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{totalServices}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-purple-600" />
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
                                placeholder="Search providers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
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

                    {/* Providers Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredProviders.map((provider) => {
                            const status = statusConfig[provider.status] || statusConfig.pending;
                            const StatusIcon = status.icon;
                            const providerServices = services.filter(s => s.provider_id === provider.id);
                            const providerServiceIds = providerServices.map(s => s.id);
                            const uniquePSPs = new Set(subscriptions.filter(sub => providerServiceIds.includes(sub.service_id)).map(sub => sub.psp_code));
                            const pspCount = uniquePSPs.size;
                            
                            return (
                                <Card key={provider.id} className="hover:shadow-md transition-all">
                                    <CardHeader>
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{provider.company_name}</CardTitle>
                                                    <p className="text-xs text-slate-500">{provider.legal_name}</p>
                                                </div>
                                            </div>
                                            <Badge className={status.color}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{provider.description}</p>
                                        <div className="space-y-2 text-xs mb-4">
                                            {provider.website && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Globe className="h-3 w-3" />
                                                    <span className="truncate">{provider.website}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Mail className="h-3 w-3" />
                                                <span className="truncate">{provider.contact_email}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="text-slate-500">Services:</span>
                                                <span className="font-semibold">{providerServices.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Used by PSPs:</span>
                                                <Badge variant="secondary">{pspCount} PSPs</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">FTS Commission:</span>
                                                <span className="font-semibold">{((provider.commission_rate || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleEdit(provider)}
                                        >
                                            Edit Provider
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        {filteredProviders.length === 0 && (
                            <div className="col-span-3 text-center py-12">
                                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600 mb-4">No providers found</p>
                                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Provider
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}