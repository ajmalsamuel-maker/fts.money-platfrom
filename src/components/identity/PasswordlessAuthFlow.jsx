import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import CredentialSelector from './CredentialSelector';
import { 
    Shield, Key, CheckCircle2, Loader2, Fingerprint, 
    Lock, Unlock, Sparkles
} from 'lucide-react';
import { toast } from "sonner";

/**
 * Passwordless Authentication Flow
 * Demonstrates vLEI-based authentication without passwords
 */
export default function PasswordlessAuthFlow({ onAuthenticated, serviceName }) {
    const [step, setStep] = useState('select'); // select, challenge, verify, success
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSelector, setShowSelector] = useState(false);

    const initiateAuth = () => {
        setShowSelector(true);
    };

    const handleCredentialSelected = async (credential) => {
        setSelectedCredential(credential);
        setStep('challenge');

        // Generate cryptographic challenge
        const randomChallenge = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        setChallenge(randomChallenge);
        toast.info('Challenge generated. Sign with your private key.');
    };

    const simulateSignature = async () => {
        setLoading(true);
        setStep('verify');

        // Simulate signature verification (in production, this would verify actual cryptographic signature)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Record credential usage
        await base44.entities.UserCredential.update(selectedCredential.id, {
            last_used: new Date().toISOString(),
            used_for_services: [
                ...(selectedCredential.used_for_services || []),
                serviceName || 'Platform Access'
            ].filter((v, i, a) => a.indexOf(v) === i) // unique
        });

        setStep('success');
        setLoading(false);

        setTimeout(() => {
            onAuthenticated?.(selectedCredential);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            {/* Initial State */}
            {step === 'select' && (
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                            <Fingerprint className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Passwordless Authentication</h2>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                            Use your vLEI credential for secure, password-free authentication. 
                            No passwords to remember, no phishing risk.
                        </p>
                        <Button 
                            onClick={initiateAuth}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                        >
                            <Shield className="h-5 w-5 mr-2" />
                            Authenticate with vLEI
                        </Button>
                        <p className="text-xs text-slate-500 mt-4">
                            Secured by W3C Verifiable Credentials + GLEIF
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Challenge Step */}
            {step === 'challenge' && selectedCredential && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-purple-600" />
                            Cryptographic Challenge
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertDescription>
                                Using credential: <strong>{selectedCredential.credential_name}</strong>
                            </AlertDescription>
                        </Alert>

                        <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-900 mb-2">Challenge Code</p>
                            <div className="bg-slate-900 text-green-400 p-3 rounded font-mono text-xs break-all">
                                {challenge}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                In production, you would sign this challenge with your private key stored securely on your device or HSM.
                            </p>
                        </div>

                        <Button 
                            onClick={simulateSignature}
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Signing Challenge...
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

            {/* Verification Step */}
            {step === 'verify' && (
                <Card className="border-blue-200">
                    <CardContent className="p-8 text-center">
                        <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Verifying Signature...</h3>
                        <p className="text-sm text-slate-600">
                            Checking cryptographic proof against your public key
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Success Step */}
            {step === 'success' && (
                <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-900 mb-2">Authentication Successful!</h3>
                        <p className="text-emerald-700 mb-4">
                            Verified with {selectedCredential.credential_name}
                        </p>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                            <Unlock className="h-3 w-3 mr-1" />
                            Access Granted
                        </Badge>
                    </CardContent>
                </Card>
            )}

            {/* Credential Selector Dialog */}
            <CredentialSelector
                open={showSelector}
                onOpenChange={setShowSelector}
                onSelect={handleCredentialSelected}
                requiredType="vlei"
                title="Select vLEI Credential"
                description="Choose a vLEI credential for passwordless authentication"
            />
        </div>
    );
}