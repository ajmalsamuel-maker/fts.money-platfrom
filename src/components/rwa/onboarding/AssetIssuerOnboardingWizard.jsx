import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    ChevronLeft, 
    ChevronRight, 
    Check,
    Loader2,
    Send,
    Shield,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import AssetIssuerBusinessStep from './AssetIssuerBusinessStep';
import LEIVerificationStep from '@/components/onboarding/LEIVerificationStep';
import KYBVerificationStep from '@/components/onboarding/KYBVerificationStep';
import ContactInfoStep from '@/components/onboarding/ContactInfoStep';
import DocumentUploadStep from '@/components/onboarding/DocumentUploadStep';
import AMLScreeningStep from '@/components/onboarding/AMLScreeningStep';
import CompanyStructureStep from '@/components/onboarding/CompanyStructureStep';

const STEPS = [
    { id: 1, label: 'Business Info', description: 'Company details' },
    { id: 2, label: 'Company Structure', description: 'Ownership & UBOs' },
    { id: 3, label: 'LEI/TAS Verification', description: 'Entity identification' },
    { id: 4, label: 'Licensing', description: 'Regulatory licenses' },
    { id: 5, label: 'Contacts', description: 'Key personnel' },
    { id: 6, label: 'Documents', description: 'Upload required docs' },
    { id: 7, label: 'KYB Verification', description: 'Business verification' },
    { id: 8, label: 'AML Screening', description: 'Compliance checks' },
    { id: 9, label: 'Securities Compliance', description: 'Regulatory framework' },
    { id: 10, label: 'Review & Submit', description: 'Final review' }
];

export default function AssetIssuerOnboardingWizard({ open, onClose, providerCode, onSuccess }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [formData, setFormData] = useState({
        business: {},
        structure: {},
        lei: {},
        licensing: {},
        contacts: {},
        documents: {},
        kyb: {},
        aml: {},
        securities: {}
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [credentials, setCredentials] = useState(null);

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            const data = formData.business;
            if (!data.company_name) newErrors.company_name = 'Company name is required';
            if (!data.issuer_type) newErrors.issuer_type = 'Issuer type is required';
            if (!data.primary_jurisdiction) newErrors.primary_jurisdiction = 'Jurisdiction is required';
            if (!data.registration_number) newErrors.registration_number = 'Registration number is required';
            if (!data.incorporation_date) newErrors.incorporation_date = 'Incorporation date is required';
            if (!data.admin_email) newErrors.admin_email = 'Admin email is required';
            if (!data.business_address) newErrors.business_address = 'Business address is required';
            if (!data.business_description || data.business_description.length < 50) {
                newErrors.business_description = 'Description must be at least 50 characters';
            }
            if (!data.asset_types_planned || data.asset_types_planned.length === 0) {
                newErrors.asset_types_planned = 'Select at least one asset type';
            }
        }

        if (step === 3) {
            const data = formData.lei;
            // LEI/TAS is optional but if provided, must be valid
            if (data.lei && data.lei.length !== 20) {
                newErrors.lei = 'LEI must be exactly 20 characters';
            }
            if (data.tas_number && data.tas_number.length < 8) {
                newErrors.tas_number = 'Invalid TAS number';
            }
            // Grace period check: if no LEI and no TAS, warn but allow
            if (!data.lei && !data.tas_number) {
                // 6-month grace period applies
                const gracePeriodEnd = new Date();
                gracePeriodEnd.setMonth(gracePeriodEnd.getMonth() + 6);
                data.lei_grace_period_end = gracePeriodEnd.toISOString();
                data.compliance_grace_status = 'grace_period_active';
            }
        }

        if (step === 4) {
            const data = formData.licensing;
            if (!data.has_securities_license && !data.exempt_status) {
                newErrors.licensing = 'Securities license or exemption status required';
            }
        }

        if (step === 5) {
            const contacts = formData.contacts.contacts || [];
            if (contacts.length === 0) {
                newErrors.contacts = [{ full_name: 'At least one contact is required' }];
            }
        }

        if (step === 6) {
            const docs = formData.documents?.documents || {};
            const requiredDocs = [
                'certificate_incorporation',
                'securities_license',
                'kyb_documents',
                'director_id',
                'proof_of_address',
                'aml_policy'
            ];
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
            // Generate issuer code
            const issuerCode = formData.business.company_name
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .substring(0, 20);
            
            const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';

            // Determine status based on LEI/TAS and KYB
            let status = 'pending_kyb';
            let complianceNote = '';
            
            if (formData.lei.tas_number) {
                status = 'active'; // TAS pre-verified
                complianceNote = 'TAS pre-verified - instant approval';
            } else if (formData.lei.lei_status === 'verified' && formData.kyb.kyb_status === 'approved') {
                status = 'active';
            } else if (!formData.lei.lei && !formData.lei.tas_number) {
                complianceNote = '6-month LEI grace period active';
            }

            const issuerData = {
                provider_code: providerCode,
                issuer_code: issuerCode,
                company_name: formData.business.company_name,
                issuer_type: formData.business.issuer_type,
                lei: formData.lei.lei || '',
                email: formData.business.admin_email,
                password_hash: tempPassword,
                status: status,
                kyb_status: formData.kyb.kyb_status || 'pending',
                registration_number: formData.business.registration_number,
                incorporation_date: formData.business.incorporation_date,
                primary_jurisdiction: formData.business.primary_jurisdiction,
                business_address: formData.business.business_address,
                website: formData.business.website,
                asset_types_planned: formData.business.asset_types_planned,
                expected_aum: formData.business.expected_aum,
                // LEI/TAS compliance
                tas_number: formData.lei.tas_number,
                lei_status: formData.lei.lei_status || 'pending',
                lei_grace_period_end: formData.lei.lei_grace_period_end,
                compliance_grace_status: formData.lei.compliance_grace_status,
                // Licensing
                securities_license_number: formData.licensing?.license_number,
                securities_regulator: formData.licensing?.regulator,
                license_jurisdiction: formData.licensing?.jurisdiction,
                // Compliance
                aml_status: formData.aml?.aml_status || 'pending',
                aml_risk_score: formData.aml?.aml_risk_score || 0,
                // Metadata
                onboarding_data: JSON.stringify(formData),
                compliance_notes: complianceNote
            };

            const created = await base44.entities.AssetIssuer.create(issuerData);

            // Send welcome email
            await base44.integrations.Core.SendEmail({
                to: formData.business.admin_email,
                subject: 'Welcome to the Asset Tokenization Platform',
                body: `Your asset issuer account has been created.

=== LOGIN CREDENTIALS ===
Issuer Code: ${issuerCode}
Password: ${tempPassword}

Login URL: ${window.location.origin}/AssetIssuerLogin

${complianceNote}

Next Steps:
${formData.lei.lei ? '✓ LEI verified' : '⚠️ LEI grace period: 6 months to obtain LEI'}
${formData.kyb.kyb_status === 'approved' ? '✓ KYB approved' : '⏳ KYB verification pending'}
${formData.aml.aml_status === 'clear' ? '✓ AML screening passed' : '⏳ AML screening in progress'}

You can start preparing your tokenization documentation while compliance checks complete.

Need help? Contact support.`
            });

            setCredentials({
                issuer_code: issuerCode,
                password: tempPassword,
                email: formData.business.admin_email,
                company_name: formData.business.company_name,
                status: status,
                grace_period: !formData.lei.lei && !formData.lei.tas_number
            });

        } catch (error) {
            console.error('Issuer creation failed:', error);
            alert('Failed to create issuer account. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStepData = (step, data) => {
        const keys = ['', 'business', 'structure', 'lei', 'licensing', 'contacts', 'documents', 'kyb', 'aml', 'securities', 'review'];
        setFormData(prev => ({
            ...prev,
            [keys[step]]: data
        }));
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <AssetIssuerBusinessStep
                        data={formData.business}
                        onChange={(data) => updateStepData(1, data)}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <CompanyStructureStep
                        data={formData.structure}
                        onChange={(data) => updateStepData(2, data)}
                        errors={errors}
                        businessType={formData.business?.issuer_type}
                    />
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <LEIVerificationStep
                            data={formData.lei}
                            onChange={(data) => updateStepData(3, data)}
                            errors={errors}
                            businessData={formData.business}
                        />
                        <Alert className="bg-amber-50 border-amber-200">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                                <strong>6-Month Grace Period:</strong> You can proceed without an LEI or TAS number. 
                                However, you must obtain one within 6 months to maintain active status and access full tokenization capabilities.
                                <ul className="mt-2 text-xs space-y-1">
                                    <li>• TAS Number: Instant verification (recommended)</li>
                                    <li>• LEI: 24-48 hour verification</li>
                                    <li>• Grace Period: Limited functionality during first 6 months</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                );
            case 4:
                return <LicensingStep data={formData.licensing} onChange={(data) => updateStepData(4, data)} errors={errors} jurisdiction={formData.business?.primary_jurisdiction} />;
            case 5:
                return <ContactInfoStep data={formData.contacts} onChange={(data) => updateStepData(5, data)} errors={errors} />;
            case 6:
                return <DocumentUploadStep data={formData.documents} onChange={(data) => updateStepData(6, data)} errors={errors} merchantType="asset_issuer" />;
            case 7:
                return <KYBVerificationStep data={formData.kyb} onChange={(data) => updateStepData(7, data)} errors={errors} businessData={formData.business} />;
            case 8:
                return <AMLScreeningStep data={formData.aml} onChange={(data) => updateStepData(8, data)} errors={errors} businessData={formData.business} />;
            case 9:
                return <SecuritiesComplianceStep data={formData.securities} onChange={(data) => updateStepData(9, data)} errors={errors} businessData={formData.business} />;
            case 10:
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
                            Asset Issuer Created Successfully
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="font-medium text-green-900 mb-3">
                                Account created for: {credentials.company_name}
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-green-700 font-medium">Issuer Code (Login)</p>
                                    <code className="block bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono mt-1">
                                        {credentials.issuer_code}
                                    </code>
                                </div>
                                <div>
                                    <p className="text-xs text-green-700 font-medium">Temporary Password</p>
                                    <code className="block bg-white border border-green-300 rounded px-3 py-2 text-sm font-mono mt-1">
                                        {credentials.password}
                                    </code>
                                </div>
                                <div>
                                    <p className="text-xs text-green-700 font-medium">Status</p>
                                    <Badge className={credentials.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                        {credentials.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {credentials.grace_period && (
                            <Alert className="bg-amber-50 border-amber-200">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800 text-sm">
                                    <strong>LEI Grace Period Active:</strong> You have 6 months to obtain an LEI or TAS number. 
                                    During this period, some features may be restricted.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-900">
                                ✓ Credentials emailed to: <strong>{credentials.email}</strong>
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={() => { onSuccess(); onClose(); }} className="flex-1">
                                Done
                            </Button>
                            <Button variant="outline" onClick={() => window.open('/AssetIssuerLogin', '_blank')}>
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
                    <DialogTitle>Onboard Asset Issuer</DialogTitle>
                    <p className="text-sm text-slate-500">Complete 10-step verification with LEI/TAS integration</p>
                </DialogHeader>

                {/* Progress Bar */}
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
                                    currentStep === step.id ? "bg-blue-100 text-blue-700" :
                                    "bg-slate-100 text-slate-400"
                                )}>
                                    {completedSteps.includes(step.id) ? <Check className="h-4 w-4" /> : step.id}
                                </div>
                                {step.id < STEPS.length && <div className="w-4 h-0.5 bg-slate-200" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto">
                    <Card className="p-6">
                        {renderStep()}
                    </Card>
                </div>

                {/* Navigation */}
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
                            <Button onClick={handleNext} className="gap-2">
                                Continue
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                                className="gap-2 bg-green-600 hover:bg-green-700"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Submit Application
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Licensing Step Component
function LicensingStep({ data, onChange, errors, jurisdiction }) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Securities & Regulatory Licensing
            </h3>
            <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-900">
                    Depending on your jurisdiction and asset types, you may need specific licenses:
                    <ul className="mt-2 space-y-1 text-xs">
                        <li>• <strong>US:</strong> SEC registration (Broker-Dealer, RIA, ATS)</li>
                        <li>• <strong>EU:</strong> MiFID II license, AIFM authorization</li>
                        <li>• <strong>UK:</strong> FCA approval for digital securities</li>
                        <li>• <strong>Singapore:</strong> MAS Capital Markets Services license</li>
                    </ul>
                </AlertDescription>
            </Alert>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Do you hold securities licenses?</label>
                    <select 
                        className="w-full mt-1 px-3 py-2 border rounded-lg"
                        value={data.has_securities_license ? 'yes' : 'no'}
                        onChange={(e) => onChange({ ...data, has_securities_license: e.target.value === 'yes' })}
                    >
                        <option value="">Select...</option>
                        <option value="yes">Yes - Licensed</option>
                        <option value="no">No - Seeking Exemption</option>
                    </select>
                </div>
                {data.has_securities_license && (
                    <>
                        <Input placeholder="License Number" value={data.license_number || ''} onChange={(e) => onChange({ ...data, license_number: e.target.value })} />
                        <Input placeholder="Regulator (e.g., SEC, FCA)" value={data.regulator || ''} onChange={(e) => onChange({ ...data, regulator: e.target.value })} />
                    </>
                )}
            </div>
        </div>
    );
}

// Securities Compliance Step
function SecuritiesComplianceStep({ data, onChange, businessData }) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Securities Law Compliance Framework</h3>
            <Alert>
                <AlertDescription className="text-sm">
                    Based on your jurisdiction and asset types, ensure compliance with:
                    <ul className="mt-2 space-y-1 text-xs">
                        <li>• Anti-Money Laundering (AML) program</li>
                        <li>• Know Your Customer (KYC) procedures</li>
                        <li>• Investor accreditation verification</li>
                        <li>• Securities offering registration/exemption</li>
                        <li>• Transfer restrictions and lock-ups</li>
                        <li>• Ongoing reporting obligations</li>
                    </ul>
                </AlertDescription>
            </Alert>
            <div className="space-y-2">
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={data.aml_program || false} onChange={(e) => onChange({ ...data, aml_program: e.target.checked })} />
                    <span className="text-sm">I have an AML/CFT program in place</span>
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={data.kyc_procedures || false} onChange={(e) => onChange({ ...data, kyc_procedures: e.target.checked })} />
                    <span className="text-sm">I have KYC procedures for investors</span>
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" checked={data.accredited_investor_verification || false} onChange={(e) => onChange({ ...data, accredited_investor_verification: e.target.checked })} />
                    <span className="text-sm">I can verify accredited investor status</span>
                </label>
            </div>
        </div>
    );
}

// Review Step
function ReviewSubmitStep({ formData }) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Application Review</h3>
            <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="font-medium">{formData.business?.company_name}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Jurisdiction</p>
                    <p className="font-medium">{formData.business?.primary_jurisdiction}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Asset Types</p>
                    <p className="font-medium">{formData.business?.asset_types_planned?.join(', ')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">LEI Status</p>
                    <p className="font-medium">{formData.lei?.lei || formData.lei?.tas_number || 'Grace Period (6 months)'}</p>
                </div>
            </div>
        </div>
    );
}