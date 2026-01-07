import React, { useState, useEffect } from 'react';
import { useRWAProviderAuth } from '@/components/auth/useRWAProviderAuth';
import RWAProviderSidebar from '@/components/rwa/RWAProviderSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, Plus, Eye, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AddCredentialDialog from '@/components/identity/AddCredentialDialog';
import CredentialDetailsDialog from '@/components/identity/CredentialDetailsDialog';
import CredentialPresentationButton from '@/components/identity/CredentialPresentationButton';

export default function RWAProviderIdentityWallet() {
    const { providerUser, loading: authLoading } = useRWAProviderAuth();
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const queryClient = useQueryClient();

    const { data: credentials = [], isLoading } = useQuery({
        queryKey: ['provider-credentials', providerUser?.provider_code],
        queryFn: async () => {
            if (!providerUser?.email) return [];
            return await base44.entities.UserCredential.filter({ user_email: providerUser.email });
        },
        enabled: !!providerUser?.email
    });

    const addCredentialMutation = useMutation({
        mutationFn: async (credentialData) => {
            return await base44.entities.UserCredential.create({
                ...credentialData,
                user_email: providerUser.email,
                issuer: 'FTS.Money Platform',
                status: 'active'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provider-credentials']);
            setShowAddDialog(false);
        }
    });

    if (authLoading || isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const activeCredentials = credentials.filter(c => c.status === 'active');
    const expiredCredentials = credentials.filter(c => c.status === 'expired');

    return (
        <div className="flex h-screen bg-slate-50">
            <RWAProviderSidebar 
                currentPage="RWAProviderIdentityWallet"
                providerName={providerUser?.company_name}
                providerEmail={providerUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <Wallet className="h-8 w-8 text-green-600" />
                                Digital Identity Wallet
                            </h1>
                            <p className="text-slate-600 mt-1">Manage your verifiable credentials and digital identity</p>
                        </div>
                        <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Credential
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-600">Total Credentials</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">{credentials.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">{activeCredentials.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-slate-600">Expired</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">{expiredCredentials.length}</div>
                            </CardContent>
                        </Card>
                    </div>

                    {credentials.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Wallet className="h-16 w-16 text-slate-300 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No credentials yet</h3>
                                <p className="text-slate-600 text-center mb-6 max-w-md">
                                    Start building your digital identity by adding verifiable credentials
                                </p>
                                <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Credential
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {activeCredentials.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        Active Credentials
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {activeCredentials.map(credential => (
                                            <Card key={credential.id} className="hover:shadow-lg transition-shadow">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-5 w-5 text-green-600" />
                                                            <CardTitle className="text-lg">{credential.credential_type}</CardTitle>
                                                        </div>
                                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                    </div>
                                                    <CardDescription className="text-sm mt-2">
                                                        Issued by: {credential.issuer}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <div className="text-xs text-slate-600">
                                                            <p>Issued: {new Date(credential.issued_date).toLocaleDateString()}</p>
                                                            <p>Expires: {new Date(credential.expiry_date).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                className="flex-1"
                                                                onClick={() => setSelectedCredential(credential)}
                                                            >
                                                                <Eye className="h-3 w-3 mr-1" />
                                                                View
                                                            </Button>
                                                            <CredentialPresentationButton 
                                                                credential={credential}
                                                                size="sm"
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {expiredCredentials.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        Expired Credentials
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {expiredCredentials.map(credential => (
                                            <Card key={credential.id} className="opacity-75">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Shield className="h-5 w-5 text-slate-400" />
                                                            <CardTitle className="text-lg">{credential.credential_type}</CardTitle>
                                                        </div>
                                                        <Badge variant="destructive">Expired</Badge>
                                                    </div>
                                                    <CardDescription className="text-sm mt-2">
                                                        Issued by: {credential.issuer}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-xs text-slate-600">
                                                        <p>Expired: {new Date(credential.expiry_date).toLocaleDateString()}</p>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="w-full mt-3"
                                                        onClick={() => setSelectedCredential(credential)}
                                                    >
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        View Details
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <AddCredentialDialog 
                open={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                onAdd={(data) => addCredentialMutation.mutate(data)}
            />

            {selectedCredential && (
                <CredentialDetailsDialog 
                    credential={selectedCredential}
                    open={!!selectedCredential}
                    onClose={() => setSelectedCredential(null)}
                />
            )}
        </div>
    );
}