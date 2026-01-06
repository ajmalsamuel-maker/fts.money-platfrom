import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { toast } from "sonner";

export default function AddCredentialDialog({ open, onOpenChange, onSuccess }) {
    const [method, setMethod] = useState('lei');
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    
    const [formData, setFormData] = useState({
        credential_name: '',
        lei_number: '',
        vlei_credential: '',
        credential_type: 'lei'
    });

    const handleVerifyLEI = async () => {
        if (!formData.lei_number || formData.lei_number.length !== 20) {
            toast.error('LEI must be 20 characters');
            return;
        }

        setLoading(true);
        setVerificationResult(null);

        try {
            // Verify via GLEIF API
            const response = await fetch(`https://api.gleif.org/api/v1/lei-records/${formData.lei_number}`);
            
            if (!response.ok) {
                throw new Error('LEI not found in GLEIF database');
            }

            const data = await response.json();
            const entity = data.data.attributes.entity;
            const registration = data.data.attributes.registration;

            setVerificationResult({
                verified: registration.status === 'ISSUED',
                entity_name: entity.legalName.name,
                status: registration.status,
                registration_authority: registration.registrationAuthority,
                trust_score: 80
            });

            setFormData({
                ...formData,
                credential_name: entity.legalName.name,
                credential_type: 'lei'
            });

            toast.success('LEI verified successfully!');
        } catch (error) {
            toast.error(error.message);
            setVerificationResult({ verified: false, error: error.message });
        }

        setLoading(false);
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const credentialData = {
                credential_type: formData.credential_type,
                credential_name: formData.credential_name,
                lei_number: formData.lei_number || null,
                vlei_credential: formData.vlei_credential || null,
                status: 'active',
                trust_score: verificationResult?.trust_score || 50,
                issuer: verificationResult?.issuer || 'GLEIF',
                issuer_name: verificationResult?.issuer_name || 'Global Legal Entity Identifier Foundation',
                issued_date: new Date().toISOString(),
                metadata: verificationResult || {}
            };

            await base44.entities.UserCredential.create(credentialData);
            toast.success('Credential added to your wallet!');
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to add credential: ' + error.message);
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        Add Credential to Wallet
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={method} onValueChange={setMethod}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="lei">
                            <Building2 className="h-4 w-4 mr-2" />
                            LEI Number
                        </TabsTrigger>
                        <TabsTrigger value="vlei">
                            <Shield className="h-4 w-4 mr-2" />
                            vLEI Credential
                        </TabsTrigger>
                    </TabsList>

                    {/* LEI Entry */}
                    <TabsContent value="lei" className="space-y-4">
                        <Alert>
                            <Globe className="h-4 w-4" />
                            <AlertDescription>
                                Enter your 20-character Legal Entity Identifier. We'll verify it against GLEIF's database.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                            <div>
                                <Label>LEI Number (20 characters)</Label>
                                <Input
                                    value={formData.lei_number}
                                    onChange={(e) => setFormData({...formData, lei_number: e.target.value.toUpperCase()})}
                                    placeholder="213800ABCDEFG1234567"
                                    maxLength={20}
                                    className="font-mono"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.lei_number.length}/20 characters
                                </p>
                            </div>

                            <Button 
                                onClick={handleVerifyLEI}
                                disabled={loading || formData.lei_number.length !== 20}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Verifying with GLEIF...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Verify LEI
                                    </>
                                )}
                            </Button>

                            {verificationResult && (
                                <Alert className={verificationResult.verified ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
                                    <AlertDescription>
                                        {verificationResult.verified ? (
                                            <div className="space-y-2">
                                                <p className="font-semibold text-emerald-900 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    LEI Verified!
                                                </p>
                                                <div className="text-sm text-emerald-800">
                                                    <p><strong>Entity:</strong> {verificationResult.entity_name}</p>
                                                    <p><strong>Status:</strong> {verificationResult.status}</p>
                                                    <p><strong>Trust Score:</strong> {verificationResult.trust_score}/100</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-red-900">{verificationResult.error}</p>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {verificationResult?.verified && (
                                <div className="space-y-3">
                                    <div>
                                        <Label>Credential Name</Label>
                                        <Input
                                            value={formData.credential_name}
                                            onChange={(e) => setFormData({...formData, credential_name: e.target.value})}
                                            placeholder="My Company LEI"
                                        />
                                    </div>

                                    <Button 
                                        onClick={handleSubmit}
                                        disabled={loading || !formData.credential_name}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        Add to Wallet
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* vLEI Entry */}
                    <TabsContent value="vlei" className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                Paste your W3C Verifiable Credential JSON. This will be cryptographically verified.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                            <div>
                                <Label>Credential Name</Label>
                                <Input
                                    value={formData.credential_name}
                                    onChange={(e) => setFormData({...formData, credential_name: e.target.value})}
                                    placeholder="My vLEI Credential"
                                />
                            </div>

                            <div>
                                <Label>vLEI Credential (W3C VC JSON)</Label>
                                <Textarea
                                    value={formData.vlei_credential}
                                    onChange={(e) => setFormData({...formData, vlei_credential: e.target.value, credential_type: 'vlei'})}
                                    placeholder='{"@context": [...], "type": ["VerifiableCredential", ...], ...}'
                                    className="font-mono text-xs h-48"
                                />
                            </div>

                            <Button 
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        // Parse and validate JSON
                                        const credential = JSON.parse(formData.vlei_credential);
                                        
                                        // Basic validation
                                        if (!credential.type?.includes('VerifiableCredential')) {
                                            throw new Error('Not a valid W3C Verifiable Credential');
                                        }

                                        setFormData({
                                            ...formData,
                                            credential_type: 'vlei'
                                        });

                                        await handleSubmit();
                                    } catch (error) {
                                        toast.error('Invalid vLEI credential: ' + error.message);
                                    }
                                    setLoading(false);
                                }}
                                disabled={loading || !formData.credential_name || !formData.vlei_credential}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Add vLEI to Wallet'
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}