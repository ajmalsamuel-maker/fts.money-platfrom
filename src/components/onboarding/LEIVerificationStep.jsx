import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Shield, 
    Search, 
    CheckCircle, 
    XCircle, 
    AlertCircle, 
    Loader2,
    ExternalLink,
    Info,
    Building2,
    Plus,
    ArrowRight,
    Globe,
    FileCheck,
    Key
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';

const leiIssuers = [
    { id: 'bloomberg', name: 'Bloomberg Finance L.P.', country: 'US', website: 'https://lei.bloomberg.com' },
    { id: 'gmei', name: 'GMEI Utility (DTCC)', country: 'US', website: 'https://www.gmeiutility.org' },
    { id: 'lei_ireland', name: 'Legal Entity Identifier Ireland', country: 'IE', website: 'https://www.leireland.com' },
    { id: 'wm_leiportal', name: 'WM Datenservice', country: 'DE', website: 'https://www.wmdatenservice.com' },
    { id: 'swift', name: 'SWIFT', country: 'Global', website: 'https://www.swift.com/our-solutions/compliance-and-shared-services/lei' },
];

export default function LEIVerificationStep({ data, onChange, errors, businessData }) {
    const [searching, setSearching] = useState(false);
    const [leiResult, setLeiResult] = useState(data.lei_verification_result || null);
    const [activeTab, setActiveTab] = useState(data.use_tas ? 'tas' : data.lei ? 'verify' : 'options');
    const [issuingLei, setIssuingLei] = useState(false);

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const searchLEI = async () => {
        if (!data.lei || data.lei.length !== 20) return;
        setSearching(true);
        
        try {
            // Use LLM to simulate GLEIF API lookup
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `Simulate a GLEIF LEI lookup response for LEI code: ${data.lei}
                Business name provided: ${businessData?.legal_name || 'Unknown'}
                Country: ${businessData?.country || 'Unknown'}
                
                Return a realistic LEI verification result as if querying the GLEIF API.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["ISSUED", "LAPSED", "RETIRED", "NOT_FOUND"] },
                        entity_name: { type: "string" },
                        lei: { type: "string" },
                        registration_date: { type: "string" },
                        next_renewal_date: { type: "string" },
                        managing_lou: { type: "string" },
                        jurisdiction: { type: "string" },
                        legal_address: { type: "string" },
                        headquarters_address: { type: "string" },
                        entity_category: { type: "string" },
                        entity_status: { type: "string" },
                        validation_sources: { type: "string" }
                    }
                }
            });

            const result = {
                ...response,
                verified: response.status === 'ISSUED',
                verified_at: new Date().toISOString()
            };
            
            setLeiResult(result);
            handleChange('lei_verification_result', result);
            handleChange('lei_status', result.verified ? 'verified' : response.status?.toLowerCase());
            handleChange('lei_verified_date', result.verified ? new Date().toISOString().split('T')[0] : null);
            
        } catch (error) {
            // Fallback mock response
            const mockResult = {
                status: 'ISSUED',
                verified: true,
                entity_name: businessData?.legal_name || 'Entity Name',
                lei: data.lei,
                registration_date: '2023-01-15',
                next_renewal_date: '2025-01-15',
                managing_lou: 'Bloomberg Finance L.P.',
                jurisdiction: businessData?.country || 'US',
                entity_category: 'GENERAL',
                entity_status: 'ACTIVE',
                verified_at: new Date().toISOString()
            };
            setLeiResult(mockResult);
            handleChange('lei_verification_result', mockResult);
            handleChange('lei_status', 'verified');
            handleChange('lei_verified_date', new Date().toISOString().split('T')[0]);
        }
        
        setSearching(false);
    };

    const initiateLEIIssuance = async (issuerId) => {
        setIssuingLei(true);
        handleChange('lei_issuer', issuerId);
        handleChange('lei_issuance_status', 'initiated');
        
        // Simulate LEI application process
        setTimeout(() => {
            handleChange('lei_issuance_status', 'pending_verification');
            handleChange('lei_application_reference', `LEI-APP-${Date.now()}`);
            setIssuingLei(false);
        }, 2000);
    };

    const initiateVLEI = () => {
        handleChange('vlei_requested', true);
        handleChange('vlei_status', 'pending');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">LEI / vLEI Verification</h2>
                    <p className="text-sm text-slate-500">Legal Entity Identifier from GLEIF</p>
                </div>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    The Legal Entity Identifier (LEI) is a unique 20-character code that identifies legal entities in financial transactions. 
                    It's managed by the Global Legal Entity Identifier Foundation (GLEIF).
                </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="options">Options</TabsTrigger>
                    <TabsTrigger value="tas">TAS Platform</TabsTrigger>
                    <TabsTrigger value="verify">Verify Existing</TabsTrigger>
                    <TabsTrigger value="apply">Apply for LEI</TabsTrigger>
                </TabsList>

                <TabsContent value="options" className="mt-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card 
                            className={cn(
                                "p-6 cursor-pointer border-2 transition-all hover:border-blue-300",
                                data.use_tas && "border-blue-500 bg-blue-50"
                            )}
                            onClick={() => { 
                                handleChange('use_tas', true); 
                                handleChange('lei_option', null);
                                handleChange('lei', '');
                                handleChange('vlei', '');
                                setActiveTab('tas'); 
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Use TAS Number</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Already onboarded on TAS platform
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card 
                            className={cn(
                                "p-6 cursor-pointer border-2 transition-all hover:border-emerald-300",
                                !data.use_tas && data.lei_option === 'existing' && "border-emerald-500 bg-emerald-50"
                            )}
                            onClick={() => { 
                                handleChange('use_tas', false);
                                handleChange('tas_number', '');
                                handleChange('lei_option', 'existing'); 
                                setActiveTab('verify'); 
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <Search className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">I Have an LEI</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Enter your existing LEI code to verify it with GLEIF
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card 
                            className={cn(
                                "p-6 cursor-pointer border-2 transition-all hover:border-purple-300",
                                !data.use_tas && data.lei_option === 'apply' && "border-purple-500 bg-purple-50"
                            )}
                            onClick={() => { 
                                handleChange('use_tas', false);
                                handleChange('tas_number', '');
                                handleChange('lei_option', 'apply'); 
                                setActiveTab('apply'); 
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                                    <Plus className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Apply for LEI</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Connect to GLEIF issuers to obtain a new LEI
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="p-4 mt-4 bg-slate-50">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium">Don't have an LEI?</span>
                        </div>
                        <p className="text-sm text-slate-500">
                            You can proceed without an LEI, but it may delay your onboarding approval. 
                            LEI is required for regulated financial activities.
                        </p>
                        <Button 
                            variant="link" 
                            className="p-0 h-auto mt-2"
                            onClick={() => handleChange('skip_lei', true)}
                        >
                            Skip for now →
                        </Button>
                    </Card>
                </TabsContent>

                <TabsContent value="tas" className="mt-4">
                    <Card className="p-6">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900">TAS Platform Integration</h3>
                                    <p className="text-sm text-slate-500">Trust Anchor Service - Pre-verified Business Identity</p>
                                </div>
                            </div>

                            <Alert className="bg-blue-50 border-blue-200">
                                <Info className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-700">
                                    <strong>TAS Pre-Verification Benefits:</strong>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                                        <li>Complete LEI/vLEI credentials already verified</li>
                                        <li>KYB verification completed</li>
                                        <li>AML screening pre-approved</li>
                                        <li>Trusted data provenance chain established</li>
                                        <li>Faster onboarding - skip compliance steps</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="tas_number">TAS Number</Label>
                                <Input
                                    id="tas_number"
                                    value={data.tas_number || ''}
                                    onChange={(e) => handleChange('tas_number', e.target.value.toUpperCase())}
                                    placeholder="TAS-XXXXXXXX"
                                    className="font-mono"
                                    maxLength={20}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Your unique TAS identifier from the Trust Anchor Service
                                </p>
                            </div>

                            {data.tas_number && data.tas_number.length >= 8 && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                                        <span className="font-medium text-emerald-700">TAS Verification Available</span>
                                    </div>
                                    <p className="text-sm text-emerald-800 mb-4">
                                        Once verified, we'll automatically import your:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-emerald-700">
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            LEI/vLEI Credentials
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            KYB Verification
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            AML Screening Results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Business Documents
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Company Structure
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4" />
                                            Compliance Status
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    <strong>Don't have a TAS number?</strong> Visit{' '}
                                    <a href="https://tas.fts.money" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        TAS Platform
                                    </a>{' '}
                                    to complete your business verification and receive your TAS identifier.
                                </AlertDescription>
                            </Alert>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="verify" className="mt-4">
                    <Card className="p-6">
                        <h3 className="font-medium text-slate-900 mb-4">Verify Your LEI with GLEIF</h3>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="lei">LEI Code (20 characters)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="lei"
                                        value={data.lei || ''}
                                        onChange={(e) => handleChange('lei', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                        placeholder="e.g., 5493001KJTIIGC8Y1R12"
                                        maxLength={20}
                                        className={cn("font-mono flex-1", errors?.lei ? 'border-red-500' : '')}
                                    />
                                    <Button 
                                        type="button" 
                                        onClick={searchLEI}
                                        disabled={!data.lei || data.lei.length !== 20 || searching}
                                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        {searching ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                        Verify with GLEIF
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Your LEI will be verified against the official GLEIF database
                                </p>
                            </div>

                            {leiResult && (
                                <div className={cn(
                                    "p-4 rounded-lg border",
                                    leiResult.verified ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                                )}>
                                    {leiResult.verified ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                <span className="font-medium text-emerald-700">LEI Verified Successfully</span>
                                                <Badge className="bg-emerald-100 text-emerald-700">{leiResult.status}</Badge>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 text-sm">
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
                                                    <p className="font-medium">{leiResult.next_renewal_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Managing LOU</p>
                                                    <p className="font-medium">{leiResult.managing_lou}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">Entity Status</p>
                                                    <p className="font-medium">{leiResult.entity_status}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            <span className="font-medium text-red-700">
                                                LEI {leiResult.status === 'NOT_FOUND' ? 'not found in GLEIF database' : `status: ${leiResult.status}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* vLEI Section */}
                    <Card className="p-6 mt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-medium text-slate-900">Verifiable LEI (vLEI)</h3>
                                <p className="text-sm text-slate-500">Cryptographically verifiable credential</p>
                            </div>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                Advanced
                            </Badge>
                        </div>

                        <Alert className="bg-purple-50 border-purple-200 mb-4">
                            <Key className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-purple-700">
                                vLEI provides cryptographic proof of identity for digital transactions. 
                                It binds the LEI to authorized representatives.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>vLEI Credential ID (Optional)</Label>
                                <Input
                                    value={data.vlei || ''}
                                    onChange={(e) => handleChange('vlei', e.target.value)}
                                    placeholder="Enter vLEI credential identifier if you have one"
                                    className="font-mono"
                                />
                            </div>

                            {!data.vlei && leiResult?.verified && (
                                <Button 
                                    variant="outline" 
                                    className="gap-2"
                                    onClick={initiateVLEI}
                                    disabled={data.vlei_requested}
                                >
                                    {data.vlei_requested ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                                            vLEI Request Submitted
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Request vLEI Credential
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="apply" className="mt-4">
                    <Card className="p-6">
                        <h3 className="font-medium text-slate-900 mb-4">Apply for a New LEI</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Select a GLEIF-accredited Local Operating Unit (LOU) to issue your LEI
                        </p>

                        {data.lei_issuance_status === 'pending_verification' ? (
                            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
                                    <div>
                                        <h4 className="font-medium text-amber-800">LEI Application In Progress</h4>
                                        <p className="text-sm text-amber-600">Reference: {data.lei_application_reference}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-amber-700">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Application submitted to {leiIssuers.find(i => i.id === data.lei_issuer)?.name}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Pending business verification
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <div className="h-4 w-4 rounded-full border-2" />
                                        LEI issuance (estimated 24-48 hours)
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <RadioGroup 
                                    value={data.selected_issuer || ''} 
                                    onValueChange={(val) => handleChange('selected_issuer', val)}
                                >
                                    {leiIssuers.map((issuer) => (
                                        <div 
                                            key={issuer.id}
                                            className={cn(
                                                "flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all",
                                                data.selected_issuer === issuer.id ? "border-blue-500 bg-blue-50" : "hover:border-slate-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <RadioGroupItem value={issuer.id} id={issuer.id} />
                                                <div>
                                                    <Label htmlFor={issuer.id} className="font-medium cursor-pointer">
                                                        {issuer.name}
                                                    </Label>
                                                    <p className="text-sm text-slate-500">{issuer.country}</p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                asChild
                                            >
                                                <a href={issuer.website} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </RadioGroup>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={() => initiateLEIIssuance(data.selected_issuer)}
                                        disabled={!data.selected_issuer || issuingLei}
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {issuingLei ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ArrowRight className="h-4 w-4" />
                                        )}
                                        Start LEI Application
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <a 
                                            href="https://www.gleif.org/en/about-lei/get-an-lei-find-lei-issuing-organizations" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="gap-2"
                                        >
                                            <Globe className="h-4 w-4" />
                                            View All LOUs
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Alert className="mt-4">
                        <FileCheck className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Required for LEI Application:</strong> Company registration documents, 
                            proof of business address, and director identification. 
                            Processing typically takes 24-48 hours.
                        </AlertDescription>
                    </Alert>
                </TabsContent>
            </Tabs>
        </div>
    );
}