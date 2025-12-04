import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    CreditCard, 
    Building2,
    Users,
    Shield,
    Landmark,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Check,
    Loader2,
    ExternalLink,
    Info,
    CheckCircle,
    Clock
} from 'lucide-react';
import { cn } from "@/lib/utils";

const steps = [
    { id: 1, name: 'Business Details', icon: Building2 },
    { id: 2, name: 'Contact Info', icon: Users },
    { id: 3, name: 'KYB Verification', icon: Shield },
    { id: 4, name: 'Bank Details', icon: Landmark },
    { id: 5, name: 'AML Screening', icon: AlertTriangle },
];

export default function MerchantSelfOnboarding() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const [currentStep, setCurrentStep] = useState(1);
    const [isValidToken, setIsValidToken] = useState(null);
    const [kybStatus, setKybStatus] = useState('not_started');
    const [amlStatus, setAmlStatus] = useState('not_started');
    
    const [formData, setFormData] = useState({
        business: {},
        contacts: {},
        bank: {},
    });

    useEffect(() => {
        // Validate token
        if (token) {
            // In production, validate against database
            setIsValidToken(true);
        } else {
            setIsValidToken(false);
        }
    }, [token]);

    const handleChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const initiateKYB = () => {
        setKybStatus('in_progress');
        // Simulate KYB initiation with TheKYB
        setTimeout(() => {
            setKybStatus('pending_review');
        }, 2000);
    };

    const initiateAML = () => {
        setAmlStatus('in_progress');
        // Simulate AML screening with AMLWatcher
        setTimeout(() => {
            setAmlStatus('clear');
        }, 2000);
    };

    if (isValidToken === false) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid or Expired Link</h1>
                    <p className="text-slate-500">This onboarding link is invalid or has expired. Please contact your payment provider for a new link.</p>
                </Card>
            </div>
        );
    }

    if (isValidToken === null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4">
                <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-slate-900">PaymentHub</h1>
                        <p className="text-xs text-slate-500">Merchant Onboarding</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                        currentStep > step.id ? "bg-emerald-500 border-emerald-500 text-white" :
                                        currentStep === step.id ? "bg-blue-600 border-blue-600 text-white" :
                                        "bg-white border-slate-300 text-slate-400"
                                    )}>
                                        {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                    </div>
                                    <p className={cn("text-xs mt-2 text-center", currentStep === step.id ? "text-blue-600 font-medium" : "text-slate-500")}>
                                        {step.name}
                                    </p>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={cn("flex-1 h-0.5 mx-2", currentStep > step.id ? "bg-emerald-500" : "bg-slate-200")} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </Card>

                {/* Step Content */}
                <Card className="p-6 mb-6">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Business Details</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Legal Business Name *</Label>
                                    <Input value={formData.business.legal_name || ''} onChange={(e) => handleChange('business', 'legal_name', e.target.value)} placeholder="Enter legal name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Trading Name</Label>
                                    <Input value={formData.business.trading_name || ''} onChange={(e) => handleChange('business', 'trading_name', e.target.value)} placeholder="DBA name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Registration Number *</Label>
                                    <Input value={formData.business.registration_number || ''} onChange={(e) => handleChange('business', 'registration_number', e.target.value)} placeholder="Company registration" />
                                </div>
                                <div className="space-y-2">
                                    <Label>LEI (Legal Entity Identifier)</Label>
                                    <Input value={formData.business.lei || ''} onChange={(e) => handleChange('business', 'lei', e.target.value.toUpperCase())} placeholder="20-character LEI" maxLength={20} className="font-mono" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Business Address *</Label>
                                    <Textarea value={formData.business.address || ''} onChange={(e) => handleChange('business', 'address', e.target.value)} placeholder="Full business address" />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Contact Information</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input value={formData.contacts.full_name || ''} onChange={(e) => handleChange('contacts', 'full_name', e.target.value)} placeholder="Primary contact name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role *</Label>
                                    <Select value={formData.contacts.role || ''} onValueChange={(val) => handleChange('contacts', 'role', val)}>
                                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="owner">Owner</SelectItem>
                                            <SelectItem value="ceo">CEO</SelectItem>
                                            <SelectItem value="cfo">CFO</SelectItem>
                                            <SelectItem value="director">Director</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input type="email" value={formData.contacts.email || ''} onChange={(e) => handleChange('contacts', 'email', e.target.value)} placeholder="email@company.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone *</Label>
                                    <Input value={formData.contacts.phone || ''} onChange={(e) => handleChange('contacts', 'phone', e.target.value)} placeholder="+1 234 567 8900" />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">KYB Verification</h2>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    We partner with <a href="https://thekyb.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">TheKYB</a> for business verification. 
                                    This includes company registry checks, UBO identification, and document verification.
                                </AlertDescription>
                            </Alert>

                            <Card className={cn("p-6 border-2", kybStatus === 'pending_review' ? "border-amber-200 bg-amber-50" : kybStatus === 'approved' ? "border-emerald-200 bg-emerald-50" : "")}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", 
                                            kybStatus === 'approved' ? "bg-emerald-100" : kybStatus === 'pending_review' ? "bg-amber-100" : "bg-blue-100"
                                        )}>
                                            {kybStatus === 'in_progress' ? (
                                                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                                            ) : kybStatus === 'approved' ? (
                                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                                            ) : kybStatus === 'pending_review' ? (
                                                <Clock className="h-6 w-6 text-amber-600" />
                                            ) : (
                                                <Shield className="h-6 w-6 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">Know Your Business (KYB)</p>
                                            <p className="text-sm text-slate-500">Powered by TheKYB.com</p>
                                        </div>
                                    </div>
                                    <div>
                                        {kybStatus === 'not_started' && (
                                            <Button onClick={initiateKYB} className="gap-2">
                                                <ExternalLink className="h-4 w-4" />Start Verification
                                            </Button>
                                        )}
                                        {kybStatus === 'in_progress' && <Badge>Processing...</Badge>}
                                        {kybStatus === 'pending_review' && <Badge className="bg-amber-100 text-amber-700">Pending Review</Badge>}
                                        {kybStatus === 'approved' && <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>}
                                    </div>
                                </div>
                            </Card>

                            <div className="grid md:grid-cols-3 gap-4">
                                {['Company Registry', 'UBO Identification', 'Document Verification'].map((item, idx) => (
                                    <Card key={idx} className="p-4">
                                        <div className="flex items-center gap-2">
                                            {kybStatus === 'approved' || kybStatus === 'pending_review' ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                                            )}
                                            <span className="text-sm font-medium">{item}</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">Bank Details</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Account Holder Name *</Label>
                                    <Input value={formData.bank.account_holder || ''} onChange={(e) => handleChange('bank', 'account_holder', e.target.value)} placeholder="Name on account" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bank Name *</Label>
                                    <Input value={formData.bank.bank_name || ''} onChange={(e) => handleChange('bank', 'bank_name', e.target.value)} placeholder="Bank name" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Account Number / IBAN *</Label>
                                    <Input value={formData.bank.account_number || ''} onChange={(e) => handleChange('bank', 'account_number', e.target.value)} placeholder="Account number" />
                                </div>
                                <div className="space-y-2">
                                    <Label>SWIFT / BIC Code *</Label>
                                    <Input value={formData.bank.swift_code || ''} onChange={(e) => handleChange('bank', 'swift_code', e.target.value.toUpperCase())} placeholder="SWIFT code" />
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">AML Screening</h2>
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    We use <a href="https://amlwatcher.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium">AMLWatcher</a> for 
                                    ongoing anti-money laundering monitoring including sanctions, PEP, and adverse media screening.
                                </AlertDescription>
                            </Alert>

                            <Card className={cn("p-6 border-2", amlStatus === 'clear' ? "border-emerald-200 bg-emerald-50" : "")}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", amlStatus === 'clear' ? "bg-emerald-100" : "bg-purple-100")}>
                                            {amlStatus === 'in_progress' ? (
                                                <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
                                            ) : amlStatus === 'clear' ? (
                                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                                            ) : (
                                                <AlertTriangle className="h-6 w-6 text-purple-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">AML Screening</p>
                                            <p className="text-sm text-slate-500">Powered by AMLWatcher</p>
                                        </div>
                                    </div>
                                    <div>
                                        {amlStatus === 'not_started' && (
                                            <Button onClick={initiateAML} className="gap-2" variant="outline">
                                                <ExternalLink className="h-4 w-4" />Run Screening
                                            </Button>
                                        )}
                                        {amlStatus === 'in_progress' && <Badge>Screening...</Badge>}
                                        {amlStatus === 'clear' && <Badge className="bg-emerald-100 text-emerald-700">Clear</Badge>}
                                    </div>
                                </div>
                            </Card>

                            <div className="grid md:grid-cols-4 gap-4">
                                {['Sanctions Lists', 'PEP Screening', 'Adverse Media', 'Watchlists'].map((item, idx) => (
                                    <Card key={idx} className="p-4">
                                        <div className="flex items-center gap-2">
                                            {amlStatus === 'clear' ? (
                                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                                            )}
                                            <span className="text-sm font-medium">{item}</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 1} className="gap-2">
                        <ChevronLeft className="h-4 w-4" />Back
                    </Button>
                    {currentStep < 5 ? (
                        <Button onClick={() => setCurrentStep(s => s + 1)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                            Continue<ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={kybStatus !== 'pending_review' && kybStatus !== 'approved'}>
                            <Check className="h-4 w-4" />Submit Application
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
}