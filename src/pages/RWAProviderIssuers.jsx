import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { Plus, Building2, Mail } from 'lucide-react';

export default function RWAProviderIssuers() {
    const { provider } = useRWAProviderAuth();
    const queryClient = useQueryClient();
    const [showDialog, setShowDialog] = useState(false);
    const [newIssuer, setNewIssuer] = useState({
        company_name: '',
        lei: '',
        email: '',
        issuer_type: 'corporation'
    });

    const { data: issuers = [] } = useQuery({
        queryKey: ['issuers', provider?.provider_code],
        queryFn: () => base44.entities.AssetIssuer.filter({ provider_code: provider.provider_code }),
        enabled: !!provider
    });

    const createMutation = useMutation({
        mutationFn: async (issuerData) => {
            const issuer_code = issuerData.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const tempPassword = Math.random().toString(36).slice(-8);
            
            const created = await base44.entities.AssetIssuer.create({
                ...issuerData,
                provider_code: provider.provider_code,
                issuer_code,
                password_hash: tempPassword,
                status: 'pending_kyb'
            });

            // Send welcome email with credentials
            await base44.integrations.Core.SendEmail({
                to: issuerData.email,
                subject: `Welcome to ${provider.company_name}`,
                body: `Your asset issuer account has been created.\n\nIssuer Code: ${issuer_code}\nTemporary Password: ${tempPassword}\n\nLogin at: ${provider.portal_url}/AssetIssuerLogin`
            });

            return created;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['issuers']);
            setShowDialog(false);
            setNewIssuer({ company_name: '', lei: '', email: '', issuer_type: 'corporation' });
        }
    });

    return (
        <div className="flex h-screen bg-slate-50">
            <RWAProviderSidebar 
                currentPage="RWAProviderIssuers"
                providerName={provider?.company_name}
                providerEmail={provider?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Asset Issuers</h1>
                            <p className="text-slate-600">Companies tokenizing assets through your platform</p>
                        </div>
                        <Dialog open={showDialog} onOpenChange={setShowDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Issuer
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Onboard Asset Issuer</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Company Name</Label>
                                        <Input
                                            placeholder="ACME Real Estate Fund"
                                            value={newIssuer.company_name}
                                            onChange={(e) => setNewIssuer({...newIssuer, company_name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <Label>LEI (Legal Entity Identifier)</Label>
                                        <Input
                                            placeholder="123456789012ABCDEFGH"
                                            value={newIssuer.lei}
                                            onChange={(e) => setNewIssuer({...newIssuer, lei: e.target.value})}
                                            maxLength={20}
                                        />
                                    </div>
                                    <div>
                                        <Label>Admin Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="admin@acmefund.com"
                                            value={newIssuer.email}
                                            onChange={(e) => setNewIssuer({...newIssuer, email: e.target.value})}
                                        />
                                    </div>
                                    <Button 
                                        onClick={() => createMutation.mutate(newIssuer)}
                                        disabled={!newIssuer.company_name || !newIssuer.email}
                                        className="w-full"
                                    >
                                        Create Issuer Account
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardContent className="p-6">
                            <div className="space-y-3">
                                {issuers.map(issuer => (
                                    <div key={issuer.id} className="border rounded-lg p-4 hover:bg-slate-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900">{issuer.company_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="h-3 w-3 text-slate-400" />
                                                        <span className="text-xs text-slate-600">{issuer.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-500">Code: {issuer.issuer_code}</span>
                                                        <span className="text-xs text-slate-500">LEI: {issuer.lei}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={
                                                    issuer.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    issuer.kyb_status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }>
                                                    {issuer.status}
                                                </Badge>
                                                <p className="text-xs text-slate-500 mt-2">Assets: {issuer.total_assets_tokenized || 0}</p>
                                                <p className="text-xs text-slate-500">Value: ${((issuer.total_value || 0) / 1000000).toFixed(1)}M</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {issuers.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No asset issuers yet. Click "Add Issuer" to onboard your first customer.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}