import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Shield, 
    Search, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Loader2,
    ExternalLink,
    Info,
    Building2
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function LEIVerificationStep({ data, onChange, errors }) {
    const [searching, setSearching] = useState(false);
    const [leiResult, setLeiResult] = useState(null);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const searchLEI = async () => {
        if (!data.lei) return;
        setSearching(true);
        
        // Simulate LEI lookup via GLEIF API
        setTimeout(() => {
            // Mock response - in production would call GLEIF API
            if (data.lei.length === 20) {
                setLeiResult({
                    status: 'verified',
                    entity_name: data.legal_name || 'Entity Name',
                    lei: data.lei,
                    registration_date: '2023-01-15',
                    next_renewal: '2025-01-15',
                    managing_lou: 'Bloomberg Finance L.P.',
                    jurisdiction: 'US-DE',
                });
                handleChange('lei_status', 'verified');
                handleChange('lei_verified_date', new Date().toISOString().split('T')[0]);
            } else {
                setLeiResult({
                    status: 'not_found',
                    message: 'LEI not found in GLEIF database'
                });
                handleChange('lei_status', 'not_found');
            }
            setSearching(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">LEI / vLEI Verification</h2>
                    <p className="text-sm text-slate-500">Legal Entity Identifier mapping (GLEIF)</p>
                </div>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    The Legal Entity Identifier (LEI) is a unique 20-character code that identifies legal entities participating in financial transactions. 
                    <a href="https://www.gleif.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 ml-1 inline-flex items-center gap-1">
                        Learn more about GLEIF <ExternalLink className="h-3 w-3" />
                    </a>
                </AlertDescription>
            </Alert>

            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Legal Entity Identifier (LEI)</h3>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="lei">LEI Code (20 characters)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="lei"
                                value={data.lei || ''}
                                onChange={(e) => handleChange('lei', e.target.value.toUpperCase())}
                                placeholder="e.g., 5493001KJTIIGC8Y1R12"
                                maxLength={20}
                                className={cn("font-mono", errors?.lei ? 'border-red-500' : '')}
                            />
                            <Button 
                                type="button" 
                                onClick={searchLEI}
                                disabled={!data.lei || data.lei.length !== 20 || searching}
                                className="gap-2"
                            >
                                {searching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                Verify
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Enter the 20-character LEI code to verify against GLEIF database
                        </p>
                        {errors?.lei && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.lei}
                            </p>
                        )}
                    </div>

                    {leiResult && (
                        <div className={cn(
                            "p-4 rounded-lg border",
                            leiResult.status === 'verified' ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                        )}>
                            {leiResult.status === 'verified' ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        <span className="font-medium text-emerald-700">LEI Verified</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">Entity Name</p>
                                            <p className="font-medium">{leiResult.entity_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">LEI</p>
                                            <p className="font-mono">{leiResult.lei}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Jurisdiction</p>
                                            <p className="font-medium">{leiResult.jurisdiction}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Next Renewal</p>
                                            <p className="font-medium">{leiResult.next_renewal}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                    <span className="font-medium text-red-700">{leiResult.message}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <p className="text-sm text-slate-600 mb-2">Don't have an LEI?</p>
                        <Button variant="outline" size="sm" asChild>
                            <a href="https://www.gleif.org/en/about-lei/get-an-lei-find-lei-issuing-organizations" target="_blank" rel="noopener noreferrer" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Apply for LEI via GLEIF
                            </a>
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Verifiable LEI (vLEI)</h3>
                
                <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-700">
                            vLEI is a digitally verifiable credential that cryptographically binds the LEI to the entity and its authorized representatives.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="vlei">vLEI Credential ID (Optional)</Label>
                        <Input
                            id="vlei"
                            value={data.vlei || ''}
                            onChange={(e) => handleChange('vlei', e.target.value)}
                            placeholder="Enter vLEI credential identifier"
                            className="font-mono"
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                        <Building2 className="h-8 w-8 text-slate-400" />
                        <div>
                            <p className="font-medium text-slate-900">vLEI Roles</p>
                            <p className="text-sm text-slate-500">
                                Legal Entity Official Role (ECR), Qualified vLEI Issuer (QVI), Legal Entity Engagement Context Role
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" asChild>
                        <a href="https://www.gleif.org/en/vlei/introducing-the-verifiable-lei-vlei" target="_blank" rel="noopener noreferrer" className="gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Learn about vLEI
                        </a>
                    </Button>
                </div>
            </Card>
        </div>
    );
}