import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Building2, 
    Plus, 
    TrendingUp, 
    Users, 
    DollarSign, 
    Activity,
    Globe,
    Calendar,
    Shield
} from 'lucide-react';

export default function PSPProvisioning() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        psp_code: '',
        psp_name: '',
        legal_entity_name: '',
        domain: '',
        contact_email: '',
        contact_phone: '',
        license_type: 'full_license',
        pricing_model: 'revenue_share',
        revenue_share_percentage: 20,
        country: '',
        currency: 'USD'
    });

    const queryClient = useQueryClient();

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.ProvisionedPSP.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['provisioned-psps']);
            setDialogOpen(false);
            setFormData({
                psp_code: '',
                psp_name: '',
                legal_entity_name: '',
                domain: '',
                contact_email: '',
                contact_phone: '',
                license_type: 'full_license',
                pricing_model: 'revenue_share',
                revenue_share_percentage: 20,
                country: '',
                currency: 'USD'
            });
        }
    });

    const totalVolume = psps.reduce((sum, p) => sum + (p.monthly_volume || 0), 0);
    const totalRevenue = psps.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
    const totalMerchants = psps.reduce((sum, p) => sum + (p.total_merchants || 0), 0);
    const activePSPs = psps.filter(p => p.status === 'active').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">FTS.Money</h1>
                                <p className="text-slate-500">Payment Infrastructure Platform</p>
                            </div>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                                    <Plus className="h-5 w-5" />
                                    Provision New PSP
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Provision New PSP Instance</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>PSP Code *</Label>
                                        <Input
                                            value={formData.psp_code}
                                            onChange={(e) => setFormData({...formData, psp_code: e.target.value.toUpperCase()})}
                                            placeholder="ACME"
                                        />
                                    </div>
                                    <div>
                                        <Label>PSP Name *</Label>
                                        <Input
                                            value={formData.psp_name}
                                            onChange={(e) => setFormData({...formData, psp_name: e.target.value})}
                                            placeholder="Acme Payments"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Legal Entity Name</Label>
                                        <Input
                                            value={formData.legal_entity_name}
                                            onChange={(e) => setFormData({...formData, legal_entity_name: e.target.value})}
                                            placeholder="Acme Payments Ltd"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label>Custom Domain</Label>
                                        <Input
                                            value={formData.domain}
                                            onChange={(e) => setFormData({...formData, domain: e.target.value})}
                                            placeholder="payments.acme.com"
                                        />
                                    </div>
                                    <div>
                                        <Label>Contact Email *</Label>
                                        <Input
                                            type="email"
                                            value={formData.contact_email}
                                            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Contact Phone</Label>
                                        <Input
                                            value={formData.contact_phone}
                                            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>License Type</Label>
                                        <Select value={formData.license_type} onValueChange={(v) => setFormData({...formData, license_type: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="full_license">Full License</SelectItem>
                                                <SelectItem value="agent_model">Agent Model</SelectItem>
                                                <SelectItem value="payfac">PayFac</SelectItem>
                                                <SelectItem value="iso">ISO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Pricing Model</Label>
                                        <Select value={formData.pricing_model} onValueChange={(v) => setFormData({...formData, pricing_model: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="revenue_share">Revenue Share</SelectItem>
                                                <SelectItem value="fixed_fee">Fixed Fee</SelectItem>
                                                <SelectItem value="transaction_based">Transaction Based</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Revenue Share %</Label>
                                        <Input
                                            type="number"
                                            value={formData.revenue_share_percentage}
                                            onChange={(e) => setFormData({...formData, revenue_share_percentage: parseFloat(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <Label>Country</Label>
                                        <Input
                                            value={formData.country}
                                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                                            placeholder="US"
                                        />
                                    </div>
                                    <div>
                                        <Label>Base Currency</Label>
                                        <Input
                                            value={formData.currency}
                                            onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                            placeholder="USD"
                                        />
                                    </div>
                                </div>
                                <Button onClick={() => createMutation.mutate(formData)} className="w-full mt-4" size="lg">
                                    Provision PSP Instance
                                </Button>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Total PSPs</p>
                                    <p className="text-3xl font-bold text-slate-900">{psps.length}</p>
                                    <p className="text-xs text-emerald-600 mt-1">{activePSPs} active</p>
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
                                    <p className="text-sm text-slate-500">Total Merchants</p>
                                    <p className="text-3xl font-bold text-slate-900">{totalMerchants.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500 mt-1">Across all PSPs</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Monthly Volume</p>
                                    <p className="text-3xl font-bold text-slate-900">${(totalVolume / 1000000).toFixed(1)}M</p>
                                    <p className="text-xs text-emerald-600 mt-1">+12.5% vs last month</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Total Revenue</p>
                                    <p className="text-3xl font-bold text-slate-900">${(totalRevenue / 1000).toFixed(0)}k</p>
                                    <p className="text-xs text-slate-500 mt-1">FTS.Money earnings</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* PSP Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {psps.map((psp) => (
                        <Card key={psp.id} className="hover:shadow-xl transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        {psp.logo_url ? (
                                            <img src={psp.logo_url} alt={psp.psp_name} className="w-12 h-12 rounded-lg object-cover" />
                                        ) : (
                                            <div 
                                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                                                style={{ background: psp.primary_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                                            >
                                                {psp.psp_code?.substring(0, 2)}
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-lg">{psp.psp_name}</CardTitle>
                                            <p className="text-xs text-slate-500 font-mono">{psp.psp_code}</p>
                                        </div>
                                    </div>
                                    <Badge className={
                                        psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                        psp.status === 'provisioning' ? 'bg-blue-100 text-blue-700' :
                                        psp.status === 'suspended' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                    }>
                                        {psp.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="h-3 w-3 text-slate-500" />
                                            <p className="text-xs text-slate-500">Merchants</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">{psp.total_merchants || 0}</p>
                                        <p className="text-xs text-emerald-600">{psp.active_merchants || 0} active</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity className="h-3 w-3 text-slate-500" />
                                            <p className="text-xs text-slate-500">Volume</p>
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</p>
                                        <p className="text-xs text-slate-500">This month</p>
                                    </div>
                                </div>
                                
                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            {psp.license_type?.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-slate-500 flex items-center gap-1">
                                            <Globe className="h-3 w-3" />
                                            {psp.country}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Revenue Share</span>
                                        <span className="font-semibold text-slate-900">{psp.revenue_share_percentage}%</span>
                                    </div>
                                    {psp.go_live_date && (
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <Calendar className="h-3 w-3" />
                                            Live since {new Date(psp.go_live_date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <div className="text-xs">
                                        <p className="text-slate-500">FTS Revenue</p>
                                        <p className="font-semibold text-slate-900">${((psp.total_revenue || 0) / 1000).toFixed(1)}k</p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Manage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {psps.length === 0 && (
                        <div className="col-span-3 text-center py-12">
                            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 mb-2">No PSPs provisioned yet</p>
                            <p className="text-sm text-slate-400">Click "Provision New PSP" to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}