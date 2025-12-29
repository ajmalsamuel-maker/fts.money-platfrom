import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Clock, Search, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LEIVerificationWidget({ entityType, entityId, currentLEI, onLEIVerified }) {
    const [lei, setLei] = useState(currentLEI || '');
    const [verifying, setVerifying] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [verificationResult, setVerificationResult] = useState(null);
    const [companyName, setCompanyName] = useState('');
    const [gracePeriodInfo, setGracePeriodInfo] = useState(null);

    const verifyLEI = async () => {
        if (!lei || lei.length !== 20) {
            setVerificationResult({ valid: false, error: 'LEI must be exactly 20 characters' });
            return;
        }

        setVerifying(true);
        try {
            const { data } = await base44.functions.invoke('gleifIntegration', {
                action: 'verify_lei',
                lei: lei.toUpperCase()
            });

            setVerificationResult(data);
            
            if (data.valid && onLEIVerified) {
                onLEIVerified(data);
            }
        } catch (error) {
            setVerificationResult({ valid: false, error: error.message });
        } finally {
            setVerifying(false);
        }
    };

    const searchLEI = async () => {
        if (!companyName || companyName.length < 3) return;

        setSearching(true);
        try {
            const { data } = await base44.functions.invoke('gleifIntegration', {
                action: 'search_lei',
                company_name: companyName
            });

            setSearchResults(data.results || []);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const startGracePeriod = async () => {
        try {
            const { data } = await base44.functions.invoke('gleifIntegration', {
                action: 'start_grace_period',
                entity_type: entityType,
                entity_id: entityId
            });

            setGracePeriodInfo(data);
        } catch (error) {
            console.error('Grace period error:', error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    LEI Verification
                </CardTitle>
                <CardDescription>
                    Verify Legal Entity Identifier with GLEIF registry
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* LEI Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Legal Entity Identifier (LEI)</label>
                    <div className="flex gap-2">
                        <Input
                            value={lei}
                            onChange={(e) => setLei(e.target.value.toUpperCase())}
                            placeholder="549300ABCDEF1234567890"
                            maxLength={20}
                            className="font-mono"
                        />
                        <Button onClick={verifyLEI} disabled={verifying || lei.length !== 20}>
                            {verifying ? 'Verifying...' : 'Verify'}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500">20-character alphanumeric identifier</p>
                </div>

                {/* Verification Result */}
                {verificationResult && (
                    <Alert className={verificationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                        <div className="flex items-start gap-2">
                            {verificationResult.valid ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <AlertDescription>
                                    {verificationResult.valid ? (
                                        <div className="space-y-2">
                                            <p className="font-medium text-green-900">LEI Verified ✓</p>
                                            <div className="text-sm space-y-1">
                                                <p><span className="font-medium">Entity:</span> {verificationResult.legal_name}</p>
                                                <p><span className="font-medium">Jurisdiction:</span> {verificationResult.jurisdiction}</p>
                                                <p><span className="font-medium">Status:</span> <Badge variant="outline" className="bg-green-100 text-green-800">{verificationResult.status}</Badge></p>
                                                <p><span className="font-medium">Next Renewal:</span> {new Date(verificationResult.next_renewal).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="font-medium text-red-900">{verificationResult.error}</p>
                                            {verificationResult.suggestion && (
                                                <p className="text-sm mt-1">{verificationResult.suggestion}</p>
                                            )}
                                        </div>
                                    )}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Search LEI */}
                <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Don't have an LEI? Search existing registrations:</p>
                    <div className="flex gap-2">
                        <Input
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Company name..."
                            onKeyPress={(e) => e.key === 'Enter' && searchLEI()}
                        />
                        <Button onClick={searchLEI} disabled={searching || companyName.length < 3} variant="outline">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                            {searchResults.map((result) => (
                                <div
                                    key={result.lei}
                                    className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                    onClick={() => setLei(result.lei)}
                                >
                                    <p className="font-medium text-sm">{result.legal_name}</p>
                                    <p className="text-xs text-slate-600 font-mono">{result.lei}</p>
                                    <p className="text-xs text-slate-500">{result.jurisdiction} • {result.status}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Grace Period Option */}
                {!verificationResult?.valid && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <AlertDescription className="text-sm">
                            <p className="font-medium text-yellow-900 mb-2">No LEI yet?</p>
                            <p className="mb-3">You can enter a 90-day grace period while you apply for your LEI.</p>
                            <Button onClick={startGracePeriod} size="sm" variant="outline">
                                <Clock className="h-4 w-4 mr-2" />
                                Start Grace Period
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Grace Period Info */}
                {gracePeriodInfo && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <AlertDescription>
                            <p className="font-medium text-blue-900">Grace Period Activated</p>
                            <p className="text-sm mt-1">
                                You have {gracePeriodInfo.grace_period_days} days to obtain your LEI.
                                Expires: {new Date(gracePeriodInfo.grace_period_end).toLocaleDateString()}
                            </p>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}