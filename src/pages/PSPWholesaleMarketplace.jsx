import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    Building2, 
    ShoppingCart, 
    DollarSign,
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    Search,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function PSPWholesaleMarketplace() {
    const queryClient = useQueryClient();
    const { platformUser } = usePlatformAuth();
    const { t } = useI18n();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedOffering, setSelectedOffering] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const { data: offerings = [] } = useQuery({
        queryKey: ['wholesale-offerings'],
        queryFn: () => base44.entities.PSPWholesaleOffering.filter({ status: 'active' })
    });

    const { data: relationships = [] } = useQuery({
        queryKey: ['wholesale-relationships'],
        queryFn: () => base44.entities.PSPResellerRelationship.list()
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.filter({ status: 'active' })
    });

    const pendingApprovals = relationships.filter(r => r.status === 'pending_approval');

    const approveRelationship = useMutation({
        mutationFn: ({ id, approved }) => base44.entities.PSPResellerRelationship.update(id, {
            status: approved ? 'active' : 'rejected',
            approved_by: platformUser?.email,
            approval_date: new Date().toISOString().split('T')[0],
            rejection_reason: approved ? null : 'Rejected by platform admin'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['wholesale-relationships']);
            toast.success('Relationship status updated');
        }
    });

    const filteredOfferings = offerings.filter(offering => {
        const matchesSearch = offering.offering_name?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || offering.offering_category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const stats = {
        totalOfferings: offerings.length,
        activeRelationships: relationships.filter(r => r.status === 'active').length,
        pendingApprovals: pendingApprovals.length,
        totalRevenue: relationships.reduce((sum, r) => sum + (r.total_revenue_platform || 0), 0)
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PSPWholesaleMarketplace" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.wholesaleMarketplace')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:subMenuItems.wholesaleMarketplaceDesc')}</p>
                    </div>
                </header>

                <main className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Offerings</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalOfferings}</p>
                                    </div>
                                    <ShoppingCart className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Relationships</p>
                                        <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.activeRelationships}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending Approval</p>
                                        <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingApprovals}</p>
                                    </div>
                                    <Clock className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div>
                                    <p className="text-sm text-slate-600">Platform Revenue</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">${stats.totalRevenue.toLocaleString()}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {pendingApprovals.length > 0 && (
                        <Card className="mb-6 border-amber-300 bg-amber-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-amber-900">
                                            {pendingApprovals.length} wholesale {pendingApprovals.length === 1 ? 'relationship' : 'relationships'} pending approval
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => document.getElementById('approvals-tab')?.click()}
                                        className="bg-amber-600 hover:bg-amber-700"
                                    >
                                        Review Now
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="marketplace">
                        <TabsList>
                            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                            <TabsTrigger value="approvals" id="approvals-tab">
                                Approvals {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
                            </TabsTrigger>
                            <TabsTrigger value="relationships">Active Relationships</TabsTrigger>
                        </TabsList>

                        <TabsContent value="marketplace" className="mt-6">
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
                                {filteredOfferings.map(offering => (
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
                                            <Badge className="capitalize">{offering.offering_category.replace(/_/g, ' ')}</Badge>
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
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3" />
                                                    <span>${offering.total_revenue?.toLocaleString() || 0}</span>
                                                </div>
                                            </div>

                                            <Button 
                                                variant="outline" 
                                                className="w-full"
                                                onClick={() => {
                                                    setSelectedOffering(offering);
                                                    setShowDetails(true);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {filteredOfferings.length === 0 && (
                                <div className="text-center py-12">
                                    <ShoppingCart className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-600">No wholesale offerings found</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="approvals" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pending Approvals</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {pendingApprovals.length === 0 ? (
                                        <div className="text-center py-12">
                                            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                                            <p className="text-slate-600">No pending approvals</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {pendingApprovals.map(rel => (
                                                <div key={rel.id} className="border rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{rel.offering_name}</h4>
                                                            <p className="text-sm text-slate-600">
                                                                {rel.provider_psp_name} → {rel.reseller_psp_name}
                                                            </p>
                                                        </div>
                                                        <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            className="bg-emerald-600 hover:bg-emerald-700"
                                                            onClick={() => approveRelationship.mutate({ id: rel.id, approved: true })}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50"
                                                            onClick={() => approveRelationship.mutate({ id: rel.id, approved: false })}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="relationships" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Wholesale Relationships</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-4">Offering</th>
                                                    <th className="text-left py-3 px-4">Provider</th>
                                                    <th className="text-left py-3 px-4">Reseller</th>
                                                    <th className="text-right py-3 px-4">Volume</th>
                                                    <th className="text-right py-3 px-4">Platform Revenue</th>
                                                    <th className="text-left py-3 px-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {relationships.filter(r => r.status === 'active').map(rel => (
                                                    <tr key={rel.id} className="border-b hover:bg-slate-50">
                                                        <td className="py-3 px-4">{rel.offering_name}</td>
                                                        <td className="py-3 px-4">{rel.provider_psp_name}</td>
                                                        <td className="py-3 px-4">{rel.reseller_psp_name}</td>
                                                        <td className="py-3 px-4 text-right">${rel.total_volume?.toLocaleString() || 0}</td>
                                                        <td className="py-3 px-4 text-right font-medium">${rel.total_revenue_platform?.toLocaleString() || 0}</td>
                                                        <td className="py-3 px-4">
                                                            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
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
                                <h4 className="font-semibold mb-2">Pricing</h4>
                                <div className="bg-slate-50 rounded p-3">
                                    <p className="text-sm">
                                        Model: <span className="font-medium">{selectedOffering.wholesale_pricing?.pricing_model}</span>
                                    </p>
                                    <p className="text-sm mt-1">
                                        Platform Commission: <span className="font-medium">{selectedOffering.platform_commission_percentage}%</span>
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded p-3">
                                    <p className="text-xs text-slate-600">Current Resellers</p>
                                    <p className="text-xl font-bold">{selectedOffering.current_resellers || 0}</p>
                                </div>
                                <div className="bg-slate-50 rounded p-3">
                                    <p className="text-xs text-slate-600">Total Revenue</p>
                                    <p className="text-xl font-bold">${selectedOffering.total_revenue?.toLocaleString() || 0}</p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}