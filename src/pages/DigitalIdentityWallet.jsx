import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import CredentialCard from '@/components/identity/CredentialCard';
import AddCredentialDialog from '@/components/identity/AddCredentialDialog';
import CredentialDetailsDialog from '@/components/identity/CredentialDetailsDialog';
import CredentialPresentationButton from '@/components/identity/CredentialPresentationButton';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { 
    Wallet, Plus, Shield, CheckCircle2, AlertCircle, Clock,
    Key, Lock, Globe, Fingerprint, Sparkles, Info
} from 'lucide-react';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function DigitalIdentityWallet() {
    const { platformUser } = usePlatformAuth();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState(null);
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: credentials = [] } = useQuery({
        queryKey: ['user-credentials'],
        queryFn: () => base44.entities.UserCredential.filter({ created_by: user?.email }),
        enabled: !!user
    });

    const activeCredentials = credentials.filter(c => c.status === 'active');
    const expiringCredentials = credentials.filter(c => {
        if (!c.expiry_date) return false;
        const daysUntilExpiry = (new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    const getTrustLevel = (score) => {
        if (score >= 90) return { label: 'Highest Trust', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 };
        if (score >= 70) return { label: 'High Trust', color: 'bg-blue-100 text-blue-700', icon: Shield };
        if (score >= 50) return { label: 'Medium Trust', color: 'bg-amber-100 text-amber-700', icon: AlertCircle };
        return { label: 'Low Trust', color: 'bg-red-100 text-red-700', icon: AlertCircle };
    };

    const avgTrustScore = activeCredentials.length > 0
        ? Math.round(activeCredentials.reduce((sum, c) => sum + (c.trust_score || 0), 0) / activeCredentials.length)
        : 0;

    const trustLevel = getTrustLevel(avgTrustScore);
    const TrustIcon = trustLevel.icon;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="DigitalIdentityWallet" 
                userEmail={platformUser?.email} 
                userRole={platformUser?.platform_role}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 overflow-auto">
                <Toaster position="top-right" />
                
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Digital Identity Wallet</h1>
                                <p className="text-sm text-slate-600">Manage your verifiable credentials</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <CredentialPresentationButton
                                serviceName="Third Party Service"
                                buttonText="Present Credentials"
                                buttonVariant="outline"
                                onPresentationComplete={(vp) => {
                                    toast.success('Presentation created successfully');
                                }}
                            />
                            <Button 
                                onClick={() => setShowAddDialog(true)}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Credential
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Trust Score Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-100">Active Credentials</p>
                                    <p className="text-4xl font-bold mt-1">{activeCredentials.length}</p>
                                </div>
                                <Shield className="h-10 w-10 opacity-80" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Average Trust Score</p>
                                    <p className="text-4xl font-bold text-slate-900 mt-1">{avgTrustScore}</p>
                                    <Badge className={`mt-2 ${trustLevel.color}`}>
                                        {trustLevel.label}
                                    </Badge>
                                </div>
                                <TrustIcon className="h-10 w-10 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Services Connected</p>
                                    <p className="text-4xl font-bold text-slate-900 mt-1">
                                        {new Set(credentials.flatMap(c => c.used_for_services || [])).size}
                                    </p>
                                </div>
                                <Globe className="h-10 w-10 text-slate-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={expiringCredentials.length > 0 ? "border-amber-300 bg-amber-50" : ""}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600">Expiring Soon</p>
                                    <p className="text-4xl font-bold text-slate-900 mt-1">{expiringCredentials.length}</p>
                                    {expiringCredentials.length > 0 && (
                                        <p className="text-xs text-amber-600 mt-1">Action required</p>
                                    )}
                                </div>
                                <Clock className="h-10 w-10 text-amber-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Passwordless Authentication Status */}
                <Alert className="mb-8 border-blue-200 bg-blue-50">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-900">
                        <strong>Passwordless Authentication Ready:</strong> Your vLEI credentials enable secure, password-free access to FTS services. 
                        No passwords to remember, no phishing risk. {activeCredentials.filter(c => c.credential_type === 'vlei').length > 0 ? 
                        '✅ vLEI credential detected!' : '⚠️ Add a vLEI credential to enable passwordless login.'}
                    </AlertDescription>
                </Alert>

                {/* Credentials Grid */}
                {credentials.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="p-12 text-center">
                            <Wallet className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Credentials Yet</h3>
                            <p className="text-slate-600 mb-6 max-w-md mx-auto">
                                Add your LEI or vLEI credentials to unlock passwordless authentication, 
                                instant KYB verification, and streamlined access to all FTS services.
                            </p>
                            <Button 
                                onClick={() => setShowAddDialog(true)}
                                className="bg-gradient-to-r from-blue-600 to-cyan-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Credential
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {/* Active Credentials */}
                        {activeCredentials.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    Active Credentials ({activeCredentials.length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeCredentials.map((credential) => (
                                        <CredentialCard
                                            key={credential.id}
                                            credential={credential}
                                            onClick={() => setSelectedCredential(credential)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Expired/Revoked Credentials */}
                        {credentials.filter(c => c.status !== 'active').length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-slate-500 mb-4">
                                    Inactive Credentials ({credentials.filter(c => c.status !== 'active').length})
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {credentials.filter(c => c.status !== 'active').map((credential) => (
                                        <CredentialCard
                                            key={credential.id}
                                            credential={credential}
                                            onClick={() => setSelectedCredential(credential)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* How It Works */}
                <Card className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            How Your Digital Identity Wallet Works
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                                    <Key className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold mb-2">Cryptographic Security</h3>
                                <p className="text-sm text-slate-300">
                                    Your credentials are cryptographically signed and verified using public-key cryptography. 
                                    No passwords stored, no breach risk.
                                </p>
                            </div>
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold mb-2">GLEIF Verified</h3>
                                <p className="text-sm text-slate-300">
                                    LEI credentials are verified against the Global Legal Entity Identifier Foundation (GLEIF) 
                                    for instant business verification.
                                </p>
                            </div>
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                                    <Fingerprint className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold mb-2">Passwordless Login</h3>
                                <p className="text-sm text-slate-300">
                                    Use your vLEI credential for one-click authentication across all FTS services. 
                                    Sign cryptographic challenges instead of entering passwords.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            </div>

            {/* Add Credential Dialog */}
            <AddCredentialDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={() => {
                    queryClient.invalidateQueries(['user-credentials']);
                    setShowAddDialog(false);
                }}
            />

            {/* Credential Details Dialog */}
            {selectedCredential && (
                <CredentialDetailsDialog
                    credential={selectedCredential}
                    open={!!selectedCredential}
                    onOpenChange={(open) => !open && setSelectedCredential(null)}
                />
            )}
            </div>
    );
}