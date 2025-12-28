import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, Check, Loader2, Send } from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import InvestorRegistrationStep from './InvestorRegistrationStep';
import AccreditationStep from './AccreditationStep';
import KYBVerificationStep from '@/components/onboarding/KYBVerificationStep';
import DocumentUploadStep from '@/components/onboarding/DocumentUploadStep';
import AMLScreeningStep from '@/components/onboarding/AMLScreeningStep';

const STEPS = [
    { id: 1, label: 'Registration', description: 'Personal details' },
    { id: 2, label: 'Accreditation', description: 'Investor status' },
    { id: 3, label: 'KYC Verification', description: 'Identity verification' },
    { id: 4, label: 'AML Screening', description: 'Compliance check' },
    { id: 5, label: 'Documents', description: 'Upload documents' },
    { id: 6, label: 'Review & Submit', description: 'Final review' }
];

export default function InvestorOnboardingWizard({ open, onClose, onSuccess }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [formData, setFormData] = useState({
        registration: {},
        accreditation: {},
        kyc: {},
        aml: {},
        documents: {}
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            const data = formData.registration;
            if (!data.full_name) newErrors.full_name = 'Full name is required';
            if (!data.email) newErrors.email = 'Email is required';
            if (!data.phone) newErrors.phone = 'Phone number is required';
            if (!data.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
            if (!data.address) newErrors.address = 'Address is required';
            if (!data.city) newErrors.city = 'City is required';
            if (!data.state) newErrors.state = 'State is required';
            if (!data.postal_code) newErrors.postal_code = 'Postal code is required';
            if (!data.jurisdiction) newErrors.jurisdiction = 'Jurisdiction is required';
            if (!data.investor_type) newErrors.investor_type = 'Investor type is required';
            if (!data.password || data.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }
        }

        if (step === 2) {
            const data = formData.accreditation;
            if (data.accredited_investor === undefined) {
                newErrors.accreditation = 'Please indicate accreditation status';
            }
            if (data.accredited_investor && !data.accreditation_method) {
                newErrors.accreditation_method = 'Please select accreditation method';
            }
        }

        if (step === 5) {
            const docs = formData.documents?.documents || {};
            const requiredDocs = ['proof_of_identity', 'proof_of_address'];
            if (formData.accreditation.accredited_investor) {
                requiredDocs.push('accreditation_proof');
            }
            const missingDocs = requiredDocs.filter(d => !docs[d]);
            if (missingDocs.length > 0) {
                newErrors.documents = `Missing ${missingDocs.length} required documents`;
            }
        }

        return newErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep);
        
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        
        setErrors({});
        setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
        
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const walletAddress = '0x' + Math.random().toString(16).substring(2, 42);
            
            const investorData = {
                wallet_address: walletAddress,
                email: formData.registration.email,
                full_name: formData.registration.full_name,
                investor_type: formData.registration.investor_type,
                jurisdiction: formData.registration.jurisdiction,
                kyc_status: formData.kyc.kyc_status || 'pending',
                accredited_investor: formData.accreditation.accredited_investor || false,
                accreditation_proof: formData.documents.documents?.accreditation_proof,
                aml_screening_status: formData.aml.aml_status || 'clear',
                tax_id: formData.registration.tax_id,
                documents: Object.values(formData.documents.documents || {}).map(doc => ({
                    document_type: doc.type,
                    ipfs_hash: doc.url,
                    upload_date: new Date().toISOString()
                }))
            };

            const created = await base44.entities.RWAInvestor.create(investorData);

            await base44.integrations.Core.SendEmail({
                to: formData.registration.email,
                subject: 'Welcome to the Investment Platform',
                body: `Welcome ${formData.registration.full_name}!

Your investor account has been created successfully.

=== LOGIN CREDENTIALS ===
Email: ${formData.registration.email}
Wallet Address: ${walletAddress}

Login URL: ${window.location.origin}/InvestorLogin

=== ACCOUNT STATUS ===
${formData.kyc.kyc_status === 'approved' ? '✓ KYC Verified' : '⏳ KYC Pending Review'}
${formData.accreditation.accredited_investor ? '✓ Accredited Investor' : 'ℹ Non-Accredited (Limited Access)'}
${formData.aml.aml_status === 'clear' ? '✓ AML Screening Passed' : '⏳ AML Review In Progress'}

You can now explore investment opportunities in the marketplace.

Need help? Contact support.`
            });

            setCredentials({
                email: formData.registration.email,
                wallet_address: walletAddress,
                full_name: formData.registration.full_name,
                kyc_status: formData.kyc.kyc_status || 'pending',
                accredited: formData.accreditation.accredited_investor
            });

            if (onSuccess) {
                onSuccess(created);
            }

        } catch (error) {
            console.error('Investor creation failed:', error);
            alert('Failed to create investor account. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStepData = (step, data) => {
        const keys = ['', 'registration', 'accreditation', 'kyc', 'aml', 'documents', 'review'];
        setFormData(prev => ({
            ...prev,
            [keys[step]]: data
        }));
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <InvestorRegistrationStep data={formData.registration} onChange={(data) => updateStepData(1, data)} errors={errors} />;
            case 2:
                return <AccreditationStep data={formData.accreditation} onChange={(data) => updateStepData(2, data)} errors={errors} />;
            case 3:
                return <KYBVerificationStep data={formData.kyc} onChange={(data) => updateStepData(3, data)} errors={errors} businessData={formData.registration} />;
            case 4:
                return <AMLScreeningStep data={formData.aml} onChange={(data) => updateStepData(4, data)} errors={errors} businessData={formData.registration} />;
            case 5:
                return <DocumentUploadStep data={formData.documents} onChange={(data) => updateStepData(5, data)} errors={errors} merchantType="investor" />;
            case 6:
                return <ReviewSubmitStep formData={formData} />;
            default:
                return null;
        }
    };

    const progress = (currentStep / STEPS.length) * 100;

    if (credentials) {
        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Check className="h-6 w-6 text-green-600" />
                            Welcome to the Platform!
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="font-medium text-green-900 mb-3">
                                Account created for: {credentials.full_name}
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-green-700 font-medium">Email (Login)</p>
                                    <code className="block bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono mt-1">
                                        {credentials.email}
                                    </code>
                                </div>
                                <div>
                                    <p className="text-xs text-green-700 font-medium">Wallet Address</p>
                                    <code className="block bg-white border border-green-300 rounded px-3 py-2 text-xs font-mono mt-1">
                                        {credentials.wallet_address}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                <p className="text-xs text-blue-600 font-medium">KYC Status</p>
                                <p className="text-sm font-bold text-blue-900 mt-1">{credentials.kyc_status}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded p-3">
                                <p className="text-xs text-purple-600 font-medium">Investor Type</p>
                                <p className="text-sm font-bold text-purple-900 mt-1">
                                    {credentials.accredited ? 'Accredited' : 'Non-Accredited'}
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-900">
                                ✓ Credentials emailed to: <strong>{credentials.email}</strong>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={onClose} className="flex-1">
                                Done
                            </Button>
                            <Button variant="outline" onClick={() => window.open('/InvestorLogin', '_blank')}>
                                Go to Login
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Investor Onboarding</DialogTitle>
                    <p className="text-sm text-slate-500">Complete verification to start investing in tokenized assets</p>
                </DialogHeader>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Step {currentStep} of {STEPS.length}</span>
                        <span className="text-sm text-slate-500">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
                        {STEPS.map((step) => (
                            <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                    completedSteps.includes(step.id) ? "bg-green-100 text-green-700" :
                                    currentStep === step.id ? "bg-purple-100 text-purple-700" :
                                    "bg-slate-100 text-slate-400"
                                )}>
                                    {completedSteps.includes(step.id) ? <Check className="h-4 w-4" /> : step.id}
                                </div>
                                {step.id < STEPS.length && <div className="w-4 h-0.5 bg-slate-200" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <Card className="p-6">
                        {renderStep()}
                    </Card>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
                        {currentStep < STEPS.length ? (
                            <Button onClick={handleNext} className="gap-2 bg-purple-600 hover:bg-purple-700">
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Create Account
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ReviewSubmitStep({ formData }) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Application Review</h3>
            <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="font-medium">{formData.registration?.full_name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{formData.registration?.email}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Investor Type</p>
                    <p className="font-medium">{formData.registration?.investor_type}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Accredited Status</p>
                    <p className="font-medium">
                        {formData.accreditation?.accredited_investor ? 'Accredited Investor' : 'Non-Accredited'}
                    </p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">KYC Status</p>
                    <p className="font-medium">{formData.kyc?.kyc_status || 'Pending'}</p>
                </div>
            </div>
        </div>
    );
}