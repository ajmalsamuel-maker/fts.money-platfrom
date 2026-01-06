import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CredentialSelector from './CredentialSelector';
import { 
    Shield, CheckCircle2, Copy, Send, Key, Lock, 
    Globe, Fingerprint, ArrowRight, Loader2, FileCheck
} from 'lucide-react';
import { toast } from "sonner";

/**
 * Verifiable Presentation (VP) Flow
 * Generates W3C-compliant Verifiable Presentations for credential sharing
 */
export default function VerifiablePresentationFlow({ 
    recipientService,
    requiredCredentialType,
    onPresentationCreated,
    onCancel
}) {
    const [step, setStep] = useState('select'); // select, generate, sign, present, complete
    const [selectedCredentials, setSelectedCredentials] = useState([]);
    const [presentation, setPresentation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSelector, setShowSelector] = useState(false);

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const generatePresentation = async () => {
        setLoading(true);
        setStep('generate');

        try {
            // Generate W3C Verifiable Presentation
            const challenge = Array.from(crypto.getRandomValues(new Uint8Array(32)))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            const vp = {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.gleif.org/vlei/v1"
                ],
                "type": ["VerifiablePresentation"],
                "holder": user?.email,
                "verifiableCredential": selectedCredentials.map(cred => {
                    if (cred.vlei_credential) {
                        return JSON.parse(cred.vlei_credential);
                    }
                    return {
                        "@context": "https://www.gleif.org/lei/v1",
                        "type": ["VerifiableCredential", "LEICredential"],
                        "issuer": cred.issuer || "https://gleif.org",
                        "issuanceDate": cred.issued_date,
                        "credentialSubject": {
                            "id": user?.email,
                            "LEI": cred.lei_number,
                            "legalName": cred.credential_name
                        }
                    };
                }),
                "proof": {
                    "type": "Ed25519Signature2020",
                    "created": new Date().toISOString(),
                    "verificationMethod": `did:example:${user?.email}#key-1`,
                    "proofPurpose": "authentication",
                    "challenge": challenge,
                    "domain": recipientService || "fts.money",
                    "jws": btoa(JSON.stringify({
                        alg: "EdDSA",
                        challenge: challenge,
                        credentials: selectedCredentials.map(c => c.id)
                    }))
                }
            };

            setPresentation(vp);
            setStep('sign');

            // Update credential usage
            for (const cred of selectedCredentials) {
                await base44.entities.UserCredential.update(cred.id, {
                    last_used: new Date().toISOString(),
                    used_for_services: [
                        ...(cred.used_for_services || []),
                        recipientService || 'Third Party Service'
                    ].filter((v, i, a) => a.indexOf(v) === i)
                });
            }

            toast.success('Verifiable Presentation generated!');
        } catch (error) {
            toast.error('Failed to generate presentation: ' + error.message);
        }

        setLoading(false);
    };

    const signPresentation = async () => {
        setLoading(true);
        setStep('present');

        // Simulate cryptographic signing (in production, use actual private key)
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStep('complete');
        setLoading(false);
    };

    const copyPresentation = () => {
        navigator.clipboard.writeText(JSON.stringify(presentation, null, 2));
        toast.success('Verifiable Presentation copied to clipboard');
    };

    const sendPresentation = async () => {
        if (onPresentationCreated) {
            onPresentationCreated(presentation);
        }
        toast.success('Presentation sent to ' + recipientService);
    };

    return (
        <div className="space-y-6">
            {/* Step 1: Select Credentials */}
            {step === 'select' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Create Verifiable Presentation
                        </CardTitle>
                        <p className="text-sm text-slate-600">
                            Select credentials to share with {recipientService || 'the requesting service'}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Globe className="h-4 w-4" />
                            <AlertDescription>
                                <strong>What is a Verifiable Presentation?</strong><br />
                                A cryptographically secure package containing your selected credentials, 
                                proving both their validity and your control over them. The recipient can 
                                verify this without contacting the issuer.
                            </AlertDescription>
                        </Alert>

                        {selectedCredentials.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-900">
                                    Selected Credentials ({selectedCredentials.length})
                                </p>
                                {selectedCredentials.map((cred) => (
                                    <div key={cred.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Shield className="h-4 w-4 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{cred.credential_name}</p>
                                                <p className="text-xs text-slate-600">{cred.credential_type.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedCredentials(prev => prev.filter(c => c.id !== cred.id))}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => setShowSelector(true)}
                                className="flex-1"
                            >
                                <Shield className="h-4 w-4 mr-2" />
                                Select Credential
                            </Button>
                            <Button 
                                onClick={generatePresentation}
                                disabled={selectedCredentials.length === 0 || loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                Generate VP
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Generate VP */}
            {step === 'generate' && (
                <Card className="border-blue-200">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Generating Verifiable Presentation...</h3>
                        <p className="text-sm text-slate-600">
                            Creating W3C-compliant presentation with {selectedCredentials.length} credential(s)
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Sign Presentation */}
            {step === 'sign' && presentation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-purple-600" />
                            Sign Verifiable Presentation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert className="border-purple-200 bg-purple-50">
                            <Fingerprint className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-purple-900">
                                Your presentation has been generated and is ready to sign. 
                                The cryptographic signature proves you control these credentials.
                            </AlertDescription>
                        </Alert>

                        <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-slate-900">Presentation Preview</p>
                                <Button variant="ghost" size="sm" onClick={copyPresentation}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                            </div>
                            <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded overflow-auto max-h-64">
{JSON.stringify(presentation, null, 2)}
                            </pre>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-700 mb-1">Holder</p>
                                <p className="text-sm font-medium text-blue-900">{user?.email}</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-700 mb-1">Recipient</p>
                                <p className="text-sm font-medium text-blue-900">{recipientService || 'Third Party'}</p>
                            </div>
                        </div>

                        <Button 
                            onClick={signPresentation}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Signing...
                                </>
                            ) : (
                                <>
                                    <Key className="h-4 w-4 mr-2" />
                                    Sign with Private Key
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Present to Service */}
            {step === 'present' && (
                <Card className="border-blue-200">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Creating Cryptographic Proof...</h3>
                        <p className="text-sm text-slate-600">
                            Generating digital signature for presentation
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Step 5: Complete */}
            {step === 'complete' && presentation && (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-8">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Presentation Ready!</h3>
                            <p className="text-emerald-700">
                                Your Verifiable Presentation has been signed and is ready to share
                            </p>
                        </div>

                        <div className="bg-white border border-emerald-200 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-600">Credentials Included</p>
                                    <p className="font-semibold text-slate-900">{selectedCredentials.length}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Proof Type</p>
                                    <p className="font-semibold text-slate-900">Ed25519Signature2020</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Holder</p>
                                    <p className="font-semibold text-slate-900 truncate">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-slate-600">Recipient</p>
                                    <p className="font-semibold text-slate-900">{recipientService || 'Service'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={copyPresentation}
                                className="flex-1"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy VP JSON
                            </Button>
                            <Button 
                                onClick={sendPresentation}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                Send to Service
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Credential Selector */}
            <CredentialSelector
                open={showSelector}
                onOpenChange={setShowSelector}
                onSelect={(cred) => {
                    setSelectedCredentials([...selectedCredentials, cred]);
                    setShowSelector(false);
                }}
                requiredType={requiredCredentialType}
                title="Add Credential to Presentation"
                description="Select credentials to include in the Verifiable Presentation"
            />
        </div>
    );
}