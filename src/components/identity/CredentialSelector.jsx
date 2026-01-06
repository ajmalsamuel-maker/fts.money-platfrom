import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CredentialCard from './CredentialCard';
import { Shield, Wallet, ArrowRight, Plus } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * Credential Selector Component
 * Used during authentication/onboarding flows to select a credential for verification
 */
export default function CredentialSelector({ 
    open, 
    onOpenChange, 
    onSelect,
    requiredType,
    title = "Select Credential",
    description = "Choose a credential to authenticate"
}) {
    const [selectedId, setSelectedId] = useState(null);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: credentials = [] } = useQuery({
        queryKey: ['user-credentials'],
        queryFn: () => base44.entities.UserCredential.filter({ 
            created_by: user?.email,
            status: 'active'
        }),
        enabled: !!user && open
    });

    const filteredCredentials = requiredType 
        ? credentials.filter(c => c.credential_type === requiredType)
        : credentials;

    const selectedCredential = filteredCredentials.find(c => c.id === selectedId);

    const handleSelect = () => {
        if (selectedCredential) {
            onSelect(selectedCredential);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        {title}
                    </DialogTitle>
                    {description && (
                        <p className="text-sm text-slate-600">{description}</p>
                    )}
                </DialogHeader>

                <div className="space-y-6">
                    {filteredCredentials.length === 0 ? (
                        <Alert>
                            <Wallet className="h-4 w-4" />
                            <AlertDescription>
                                <p className="mb-2">
                                    No {requiredType ? requiredType.toUpperCase() : ''} credentials found in your wallet.
                                </p>
                                <Button 
                                    size="sm"
                                    onClick={() => window.location.href = createPageUrl('DigitalIdentityWallet')}
                                    className="mt-2"
                                >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Add Credential
                                </Button>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredCredentials.map((credential) => (
                                    <div 
                                        key={credential.id}
                                        onClick={() => setSelectedId(credential.id)}
                                    >
                                        <CredentialCard
                                            credential={credential}
                                            selectable
                                            selected={selectedId === credential.id}
                                        />
                                    </div>
                                ))}
                            </div>

                            {selectedCredential && (
                                <Alert className="border-blue-200 bg-blue-50">
                                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-900">
                                        <strong>{selectedCredential.credential_name}</strong> will be used for authentication.
                                        Trust Score: {selectedCredential.trust_score}/100
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleSelect}
                                    disabled={!selectedId}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500"
                                >
                                    Continue with Selected Credential
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}