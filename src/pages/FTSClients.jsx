import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { ArrowLeft, Search, Building2, Mail, Phone, Globe, Pencil, Shield } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSClients() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [search, setSearch] = React.useState('');
    const [editClient, setEditClient] = React.useState(null);
    const [editForm, setEditForm] = React.useState({
        psp_name: '',
        contact_email: '',
        contact_phone: '',
        domain: ''
    });
    const [error, setError] = React.useState('');
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const updateClientMutation = useMutation({
        mutationFn: async ({ clientId, updates }) => {
            await base44.asServiceRole.entities.ProvisionedPSP.update(clientId, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provisioned-psps']);
            setEditClient(null);
            setError('');
        },
        onError: (err) => {
            setError(err.message);
        }
    });

    const filteredPSPs = psps.filter(p => 
        p.psp_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.psp_code?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSClients" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.clientAccounts')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:subMenuItems.clientAccountsDesc')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder={t('platform:pages.clients.searchClients')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-600">{t('platform:dashboard.loggedInAs')}</p>
                            <p className="text-sm font-medium text-slate-900">{platformUser?.email}</p>
                            <Badge className="mt-1 bg-blue-600 text-white text-xs">
                                {getRoleLabel(platformUser?.platform_role)}
                            </Badge>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <div className="grid gap-4">
                        {filteredPSPs.map((psp) => (
                            <Card 
                                key={psp.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                                style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                            >
                                                {psp.psp_code?.substring(0, 2)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-slate-900">{psp.psp_name}</h3>
                                                    <Badge className={cn(
                                                        psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                    )}>
                                                        {psp.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 font-mono mb-2">Code: {psp.psp_code}</p>
                                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        {psp.contact_email}
                                                    </div>
                                                    {psp.contact_phone && (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-4 w-4" />
                                                            {psp.contact_phone}
                                                        </div>
                                                    )}
                                                    {psp.domain && (
                                                        <div className="flex items-center gap-1">
                                                            <Globe className="h-4 w-4" />
                                                            {psp.domain}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="text-right">
                                                <Badge variant="outline" className="mb-2">{psp.tier} tier</Badge>
                                                <div className="space-y-1 text-sm">
                                                    <p className="text-slate-600">
                                                        <span className="font-semibold">{psp.total_merchants || 0}</span> merchants
                                                    </p>
                                                    <p className="text-slate-600">
                                                        <span className="font-semibold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</span> volume
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditClient(psp);
                                                        setEditForm({
                                                            psp_name: psp.psp_name,
                                                            contact_email: psp.contact_email,
                                                            contact_phone: psp.contact_phone || '',
                                                            domain: psp.domain || ''
                                                        });
                                                    }}
                                                    className="gap-2"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    {t('common:actions.edit')}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(createPageUrl('PSPInstanceConfig') + `?id=${psp.id}`)}
                                                    className="gap-2"
                                                >
                                                    <Shield className="h-4 w-4" />
                                                    {t('common:actions.manage')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="h-5 w-5 text-blue-600" />
                            {t('platform:pages.clients.editClientAccount')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <Label>PSP Name</Label>
                            <Input
                                value={editForm.psp_name}
                                onChange={(e) => setEditForm({...editForm, psp_name: e.target.value})}
                                placeholder="Company Name"
                            />
                        </div>
                        <div>
                            <Label>Contact Email</Label>
                            <Input
                                type="email"
                                value={editForm.contact_email}
                                onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})}
                                placeholder="contact@company.com"
                            />
                        </div>
                        <div>
                            <Label>Contact Phone</Label>
                            <Input
                                value={editForm.contact_phone}
                                onChange={(e) => setEditForm({...editForm, contact_phone: e.target.value})}
                                placeholder="+1234567890"
                            />
                        </div>
                        <div>
                            <Label>Domain</Label>
                            <Input
                                value={editForm.domain}
                                onChange={(e) => setEditForm({...editForm, domain: e.target.value})}
                                placeholder="example.com"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setEditClient(null)}>Cancel</Button>
                        <Button 
                            onClick={() => {
                                if (!editForm.psp_name || !editForm.contact_email) {
                                    setError('Please fill in required fields');
                                    return;
                                }
                                updateClientMutation.mutate({
                                    clientId: editClient.id,
                                    updates: {
                                        psp_name: editForm.psp_name,
                                        contact_email: editForm.contact_email,
                                        contact_phone: editForm.contact_phone,
                                        domain: editForm.domain
                                    }
                                });
                            }}
                            disabled={updateClientMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {updateClientMutation.isPending ? 'Updating...' : 'Update Client'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}