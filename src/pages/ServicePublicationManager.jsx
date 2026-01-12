import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
    Rocket, 
    Clock, 
    CheckCircle, 
    XCircle,
    Menu,
    Plus,
    Eye,
    Settings,
    Send,
    Archive,
    AlertCircle,
    Users,
    DollarSign,
    Calendar as CalendarIcon,
    Upload,
    FileText,
    TestTube,
    Globe
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/I18nextProvider';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';

const SERVICE_TYPES = [
    { value: 'psp_payment_processing', label: 'PSP Payment Processing', icon: '💳' },
    { value: 'crypto_vasp', label: 'Crypto Banking / VASP', icon: '₿' },
    { value: 'iso_gateway', label: 'ISO Gateway', icon: '🔗' },
    { value: 'orchestration', label: 'Payment Orchestration', icon: '🎯' },
    { value: 'rwa_tokenization', label: 'RWA Tokenization', icon: '🏛️' },
    { value: 'tax_management', label: 'Tax Management', icon: '📊' },
    { value: 'einvoicing', label: 'E-Invoicing', icon: '📄' },
    { value: 'loyalty_platform', label: 'Loyalty & Impact Platform', icon: '🏆' },
    { value: 'pci_compliance', label: 'PCI Compliance', icon: '🔒' },
    { value: 'lei_compliance', label: 'LEI Compliance', icon: '🆔' },
    { value: 'digital_identity', label: 'Digital Identity', icon: '👤' }
];

const GO_LIVE_CHECKLIST_TEMPLATE = [
    { item: 'Master Pricing Configuration Complete', completed: false },
    { item: 'Platform Tier Pricing Complete', completed: false },
    { item: 'Service Configuration Complete', completed: false },
    { item: 'Legal/Compliance Review Done', completed: false },
    { item: 'Infrastructure Provisioned & Tested', completed: false },
    { item: 'Documentation Published', completed: false },
    { item: 'Marketing Materials Ready', completed: false },
    { item: 'Support Team Trained', completed: false }
];

export default function ServicePublicationManager() {
    const { t } = useI18n();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [createDialog, setCreateDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [approvalDialog, setApprovalDialog] = useState(false);
    const [selectedPublication, setSelectedPublication] = useState(null);
    const [formData, setFormData] = useState({});

    const { data: publications = [] } = useQuery({
        queryKey: ['service-publications'],
        queryFn: () => base44.entities.ServicePublication.list('-created_date')
    });

    const { data: subscriptions = [] } = useQuery({
        queryKey: ['service-subscriptions'],
        queryFn: () => base44.entities.ServiceSubscription.list()
    });

    const { data: billingConfigs = [] } = useQuery({
        queryKey: ['service-billing-configs'],
        queryFn: () => base44.entities.ServiceBillingConfig.list()
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ServicePublication.create({
            ...data,
            go_live_checklist: GO_LIVE_CHECKLIST_TEMPLATE,
            requested_by: platformUser?.email,
            requested_date: new Date().toISOString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-publications']);
            setCreateDialog(false);
            setFormData({});
            toast.success('Service publication draft created');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ServicePublication.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-publications']);
            setEditDialog(false);
            setSelectedPublication(null);
            toast.success('Publication updated');
        }
    });

    const requestApprovalMutation = useMutation({
        mutationFn: (id) => base44.entities.ServicePublication.update(id, {
            publication_status: 'pending_approval',
            requested_date: new Date().toISOString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-publications']);
            toast.success('Approval requested');
        }
    });

    const approveMutation = useMutation({
        mutationFn: ({ id, approved, notes }) => base44.entities.ServicePublication.update(id, {
            publication_status: approved ? 'soft_launch' : 'draft',
            approved_by: approved ? platformUser?.email : null,
            approved_date: approved ? new Date().toISOString() : null,
            approval_notes: notes,
            rejection_reason: !approved ? notes : null
        }),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries(['service-publications']);
            setApprovalDialog(false);
            setSelectedPublication(null);
            toast.success(variables.approved ? 'Service approved for soft launch' : 'Service approval rejected');
        }
    });

    const publishMutation = useMutation({
        mutationFn: ({ id, scheduledDate }) => base44.entities.ServicePublication.update(id, {
            publication_status: scheduledDate ? 'soft_launch' : 'published',
            visibility: 'public',
            published_date: scheduledDate || new Date().toISOString(),
            scheduled_publish_date: scheduledDate,
            allow_new_signups: true
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-publications']);
            toast.success('Service published to community!');
        }
    });

    const unpublishMutation = useMutation({
        mutationFn: ({ id, reason }) => base44.entities.ServicePublication.update(id, {
            publication_status: 'unpublished',
            allow_new_signups: false,
            unpublished_date: new Date().toISOString(),
            unpublish_reason: reason
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['service-publications']);
            toast.success('Service unpublished (existing subscriptions maintained)');
        }
    });

    const stats = {
        draft: publications.filter(p => p.publication_status === 'draft').length,
        pending: publications.filter(p => p.publication_status === 'pending_approval').length,
        softLaunch: publications.filter(p => p.publication_status === 'soft_launch').length,
        published: publications.filter(p => p.publication_status === 'published').length,
        totalSubscriptions: subscriptions.length
    };

    const canApprove = [PLATFORM_ROLES.SUPER_ADMIN, PLATFORM_ROLES.PLATFORM_ADMIN].includes(platformUser?.platform_role);

    if (loading) return null;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
            
            <FTSPlatformSidebar 
                currentPage="ServicePublicationManager" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
                mobileMenuOpen={mobileSidebarOpen}
                setMobileMenuOpen={setMobileSidebarOpen}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden flex-shrink-0"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">Service Publication Manager</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">Go-to-Market service rollout control</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        <LanguageSwitcher variant="select" showLabel={false} />
                        <Button onClick={() => { setFormData({ version: 'v1.0' }); setCreateDialog(true); }} className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200">
                            <Plus className="h-4 w-4" />
                            New Publication
                        </Button>
                    </div>
                </header>

                <main className="p-6 space-y-6">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200/50 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-4 relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Draft</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">{stats.draft}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="h-6 w-6 text-slate-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-xl transition-all duration-300 border-amber-200/50 bg-gradient-to-br from-white to-amber-50/30 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-4 relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending</p>
                                        <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Clock className="h-6 w-6 text-amber-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-xl transition-all duration-300 border-blue-200/50 bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-4 relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Soft Launch</p>
                                        <p className="text-3xl font-bold text-blue-700 mt-1">{stats.softLaunch}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <TestTube className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-xl transition-all duration-300 border-emerald-200/50 bg-gradient-to-br from-white to-emerald-50/30 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-4 relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Published</p>
                                        <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.published}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Globe className="h-6 w-6 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="group hover:shadow-xl transition-all duration-300 border-purple-200/50 bg-gradient-to-br from-white to-purple-50/30 backdrop-blur-sm overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-4 relative">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">Subscriptions</p>
                                        <p className="text-3xl font-bold text-purple-700 mt-1">{stats.totalSubscriptions}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Approval Queue Alert */}
                    {stats.pending > 0 && canApprove && (
                        <Card className="border-amber-300/50 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/50 backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center animate-pulse">
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-amber-900">
                                            {stats.pending} service publication{stats.pending > 1 ? 's' : ''} awaiting approval
                                        </p>
                                        <p className="text-sm text-amber-700">Review and approve to enable soft launch</p>
                                    </div>
                                    <Button size="sm" className="bg-amber-600 hover:bg-amber-700 shadow-md">
                                        Review Now
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Publications List */}
                    <Tabs defaultValue="all" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="all">All Services</TabsTrigger>
                            <TabsTrigger value="draft">Draft</TabsTrigger>
                            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                            <TabsTrigger value="soft_launch">Soft Launch</TabsTrigger>
                            <TabsTrigger value="published">Published</TabsTrigger>
                        </TabsList>

                        {['all', 'draft', 'pending', 'soft_launch', 'published'].map(tabValue => (
                            <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                                {publications
                                    .filter(p => tabValue === 'all' || 
                                        (tabValue === 'pending' && p.publication_status === 'pending_approval') ||
                                        (tabValue !== 'all' && tabValue !== 'pending' && p.publication_status === tabValue))
                                    .map((pub) => {
                                        const serviceType = SERVICE_TYPES.find(s => s.value === pub.service_type);
                                        const activeSubscriptions = subscriptions.filter(s => s.service_publication_id === pub.id && s.subscription_status === 'active').length;
                                        const billingConfig = billingConfigs.find(c => c.service_type === pub.service_type);

                                        return (
                                            <Card key={pub.id} className="group hover:shadow-2xl transition-all duration-300 border-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                <CardHeader className="relative">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-start gap-3">
                                                            <div className="text-3xl">{serviceType?.icon}</div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <CardTitle className="text-lg">{pub.marketing_name}</CardTitle>
                                                                    <Badge variant="outline">{pub.version}</Badge>
                                                                    <Badge className={cn(
                                                                       "backdrop-blur-sm shadow-sm",
                                                                       pub.publication_status === 'published' ? 'bg-emerald-500/20 text-emerald-700 border-emerald-300' :
                                                                       pub.publication_status === 'soft_launch' ? 'bg-blue-500/20 text-blue-700 border-blue-300' :
                                                                       pub.publication_status === 'pending_approval' ? 'bg-amber-500/20 text-amber-700 border-amber-300' :
                                                                       'bg-slate-500/20 text-slate-700 border-slate-300'
                                                                    )}>
                                                                        {pub.publication_status.replace(/_/g, ' ')}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-slate-600 mt-1">{pub.tagline}</p>
                                                                <p className="text-xs text-slate-500 mt-1">{serviceType?.label}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setSelectedPublication(pub);
                                                                    setFormData(pub);
                                                                    setEditDialog(true);
                                                                }}
                                                            >
                                                                <Settings className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="relative">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div className="flex items-center gap-2">
                                                            {pub.pricing_configured ? (
                                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-slate-300" />
                                                            )}
                                                            <span className="text-sm text-slate-600">Pricing</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {pub.compliance_verified ? (
                                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-slate-300" />
                                                            )}
                                                            <span className="text-sm text-slate-600">Compliance</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {pub.infrastructure_ready ? (
                                                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-slate-300" />
                                                            )}
                                                            <span className="text-sm text-slate-600">Infrastructure</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-purple-600" />
                                                            <span className="text-sm text-slate-600">{activeSubscriptions} subscribers</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 flex-wrap">
                                                        {pub.publication_status === 'draft' && (
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => requestApprovalMutation.mutate(pub.id)}
                                                                disabled={!pub.pricing_configured || !pub.compliance_verified || !pub.infrastructure_ready}
                                                                className="gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md"
                                                            >
                                                                <Send className="h-3 w-3" />
                                                                Request Approval
                                                            </Button>
                                                        )}

                                                        {pub.publication_status === 'pending_approval' && canApprove && (
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => {
                                                                    setSelectedPublication(pub);
                                                                    setApprovalDialog(true);
                                                                }}
                                                                className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all"
                                                            >
                                                                <CheckCircle className="h-3 w-3" />
                                                                Review & Approve
                                                            </Button>
                                                        )}

                                                        {pub.publication_status === 'soft_launch' && canApprove && (
                                                            <Button 
                                                                size="sm" 
                                                                onClick={() => publishMutation.mutate({ id: pub.id })}
                                                                className="gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700 shadow-md hover:shadow-xl transition-all animate-pulse"
                                                            >
                                                                <Rocket className="h-3 w-3" />
                                                                Publish to Community
                                                            </Button>
                                                        )}

                                                        {pub.publication_status === 'published' && canApprove && (
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const reason = prompt('Reason for unpublishing:');
                                                                    if (reason) unpublishMutation.mutate({ id: pub.id, reason });
                                                                }}
                                                                className="gap-2 text-red-600"
                                                            >
                                                                <Archive className="h-3 w-3" />
                                                                Unpublish
                                                            </Button>
                                                        )}

                                                        {pub.publication_status === 'soft_launch' && (
                                                            <Badge className="bg-blue-100 text-blue-700">
                                                                {pub.beta_customer_emails?.length || 0} beta users
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                            </TabsContent>
                        ))}
                    </Tabs>
                </main>
            </div>

            {/* Create Publication Dialog */}
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create Service Publication</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Service Type *</Label>
                                <Select value={formData.service_type} onValueChange={(value) => setFormData({...formData, service_type: value})}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICE_TYPES.map(st => (
                                            <SelectItem key={st.value} value={st.value}>
                                                {st.icon} {st.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Version *</Label>
                                <Input
                                    value={formData.version || 'v1.0'}
                                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                                    placeholder="v1.0"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Marketing Name *</Label>
                            <Input
                                value={formData.marketing_name || ''}
                                onChange={(e) => setFormData({...formData, marketing_name: e.target.value})}
                                placeholder="e.g., FTS Payment Hub Pro"
                            />
                        </div>

                        <div>
                            <Label>Tagline</Label>
                            <Input
                                value={formData.tagline || ''}
                                onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                                placeholder="Short compelling tagline"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Full service description"
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
                            <Button onClick={() => createMutation.mutate(formData)} className="bg-blue-600">
                                Create Draft
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Publication Dialog */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Publication: {selectedPublication?.marketing_name}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="details" className="mt-4">
                        <TabsList>
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="checklist">Go-Live Checklist</TabsTrigger>
                            <TabsTrigger value="beta">Beta Access</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4 mt-4">
                            <div>
                                <Label>Marketing Name</Label>
                                <Input
                                    value={formData.marketing_name || ''}
                                    onChange={(e) => setFormData({...formData, marketing_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Tagline</Label>
                                <Input
                                    value={formData.tagline || ''}
                                    onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={4}
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4 border-t pt-4">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.pricing_configured || false}
                                        onChange={(e) => setFormData({...formData, pricing_configured: e.target.checked})}
                                    />
                                    <Label>Pricing Configured</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.compliance_verified || false}
                                        onChange={(e) => setFormData({...formData, compliance_verified: e.target.checked})}
                                    />
                                    <Label>Compliance Verified</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.infrastructure_ready || false}
                                        onChange={(e) => setFormData({...formData, infrastructure_ready: e.target.checked})}
                                    />
                                    <Label>Infrastructure Ready</Label>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="checklist" className="space-y-3 mt-4">
                            {(formData.go_live_checklist || GO_LIVE_CHECKLIST_TEMPLATE).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <input 
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={(e) => {
                                            const newChecklist = [...(formData.go_live_checklist || [])];
                                            newChecklist[idx] = {
                                                ...item,
                                                completed: e.target.checked,
                                                completed_by: e.target.checked ? platformUser?.email : null,
                                                completed_date: e.target.checked ? new Date().toISOString() : null
                                            };
                                            setFormData({...formData, go_live_checklist: newChecklist});
                                        }}
                                        className="w-5 h-5"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{item.item}</p>
                                        {item.completed && (
                                            <p className="text-xs text-slate-500">
                                                ✓ {item.completed_by} on {format(new Date(item.completed_date), 'MMM d, yyyy')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="beta" className="space-y-4 mt-4">
                            <div>
                                <Label>Beta Customer Emails (one per line)</Label>
                                <Textarea
                                    value={formData.beta_customer_emails?.join('\n') || ''}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        beta_customer_emails: e.target.value.split('\n').filter(email => email.trim())
                                    })}
                                    placeholder="user1@example.com&#10;user2@example.com"
                                    rows={6}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    These customers can see and subscribe during soft launch
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
                        <Button 
                            onClick={() => updateMutation.mutate({ id: selectedPublication?.id, data: formData })}
                            className="bg-blue-600"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approval Dialog */}
            <Dialog open={approvalDialog} onOpenChange={setApprovalDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Approve Service Publication</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">{selectedPublication?.marketing_name}</h3>
                            <p className="text-sm text-slate-600 mb-3">{selectedPublication?.tagline}</p>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex items-center gap-2">
                                    {selectedPublication?.pricing_configured ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">Pricing</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedPublication?.compliance_verified ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">Compliance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedPublication?.infrastructure_ready ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <span className="text-sm">Infrastructure</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Approval Notes</Label>
                            <Textarea
                                value={formData.approval_notes || ''}
                                onChange={(e) => setFormData({...formData, approval_notes: e.target.value})}
                                placeholder="Add comments..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => approveMutation.mutate({ 
                                    id: selectedPublication?.id, 
                                    approved: false, 
                                    notes: formData.approval_notes 
                                })}
                                className="text-red-600"
                            >
                                Reject
                            </Button>
                            <Button 
                                onClick={() => approveMutation.mutate({ 
                                    id: selectedPublication?.id, 
                                    approved: true, 
                                    notes: formData.approval_notes 
                                })}
                                className="bg-emerald-600"
                            >
                                Approve for Soft Launch
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}