import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import BusinessDetailsStep from '@/components/onboarding/BusinessDetailsStep';
import CompanyStructureStep from '@/components/onboarding/CompanyStructureStep';
import LEIVerificationStep from '@/components/onboarding/LEIVerificationStep';
import ContactInfoStep from '@/components/onboarding/ContactInfoStep';
import DocumentUploadStep from '@/components/onboarding/DocumentUploadStep';
import AIDocumentVerification from '@/components/onboarding/AIDocumentVerification';
import KYBVerificationStep from '@/components/onboarding/KYBVerificationStep';
import AMLScreeningStep from '@/components/onboarding/AMLScreeningStep';
import BankDetailsStep from '@/components/onboarding/BankDetailsStep';
import PricingStep from '@/components/onboarding/PricingStep';
import ReviewSubmitStep from '@/components/onboarding/ReviewSubmitStep';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    ChevronLeft, 
    ChevronRight, 
    Check,
    Loader2,
    CreditCard,
    Send,
    AlertTriangle
} from 'lucide-react';
import { createMerchantUsers } from '@/components/merchants/MerchantUserProvisioning';
import { toast } from 'sonner';

const TOTAL_STEPS = 10;

export default function MerchantOnboarding() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        business: {},
        structure: {},
        lei: {},
        contacts: {},
        documents: {},
        kyb: {},
        aml: {},
        bank: {},
        pricing: {},
    });

    const createMerchantMutation = useMutation({
        mutationFn: async (data) => {
            const merchantData = {
                merchant_id: `MID-${Date.now()}`,
                business_name: data.business.legal_name,
                trading_name: data.business.trading_name,
                status: determineInitialStatus(data),
                category: data.business.industry,
                country: data.business.country,
                contact_name: data.contacts.contacts?.[0]?.full_name,
                contact_email: data.contacts.contacts?.[0]?.email,
                contact_phone: data.contacts.contacts?.[0]?.phone,
                website: data.business.website,
                address: data.business.business_address,
                // LEI fields
                lei: data.lei.lei,
                vlei: data.lei.vlei,
                lei_status: data.lei.lei_status,
                lei_verified_date: data.lei.lei_verified_date,
                // KYB fields
                kyb_status: data.kyb.kyb_status,
                kyb_provider: 'thekyb',
                kyb_reference_id: data.kyb.kyb_reference_id,
                // AML fields
                aml_status: data.aml.aml_status,
                aml_provider: 'amlwatcher',
                aml_last_check: data.aml.aml_completed_at,
                aml_risk_score: data.aml.aml_risk_score,
                // Other fields
                risk_level: determineRiskLevel(data),
                settlement_period: data.bank.settlement_period,
                processing_volume: getVolumeValue(data.business.expected_volume),
                fee_rate: 2.5,
            };
            
            const merchant = await base44.entities.Merchant.create(merchantData);
            
            // Auto-create merchant user accounts if merchant is approved
            if (merchant.status === 'active' && data.contacts.contacts?.length > 0) {
                try {
                    await createMerchantUsers(merchant, data.contacts.contacts);
                    toast.success('Merchant users created and welcome emails sent');
                } catch (error) {
                    console.error('Failed to create merchant users:', error);
                    toast.error('Merchant created but user provisioning failed');
                }
            }
            
            // Send notification to compliance if there are alerts
            if (data.aml.aml_alerts?.length > 0 || data.kyb.kyb_status === 'pending_review') {
                await notifyCompliance(merchant, data);
            }
            
            return merchant;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            navigate(createPageUrl('Merchants'));
        }
    });

    const determineInitialStatus = (data) => {
        if (data.kyb.kyb_status === 'rejected' || data.aml.aml_status === 'flagged') {
            return 'suspended';
        }
        if (data.kyb.kyb_status === 'approved' && data.aml.aml_status === 'clear' && data.lei.lei_status === 'verified') {
            return 'active';
        }
        return 'pending';
    };

    const determineRiskLevel = (data) => {
        const riskScore = data.aml.aml_risk_score || 0;
        if (riskScore >= 50) return 'high';
        if (riskScore >= 25) return 'medium';
        return 'low';
    };

    const notifyCompliance = async (merchant, data) => {
        try {
            await base44.integrations.Core.SendEmail({
                to: 'compliance@paymenthub.com',
                subject: `[Action Required] New Merchant Review: ${merchant.business_name}`,
                body: `
                    A new merchant application requires compliance review.
                    
                    Merchant: ${merchant.business_name}
                    MID: ${merchant.merchant_id}
                    
                    KYB Status: ${data.kyb.kyb_status}
                    AML Status: ${data.aml.aml_status}
                    AML Risk Score: ${data.aml.aml_risk_score || 0}/100
                    
                    ${data.aml.aml_alerts?.length > 0 ? `AML Alerts: ${data.aml.aml_alerts.length} alerts detected` : ''}
                    
                    Please review this application in the compliance dashboard.
                `
            });
        } catch (error) {
            console.log('Compliance notification simulated');
        }
    };

    const getVolumeValue = (range) => {
        const values = {
            '0-10k': 10000,
            '10k-50k': 50000,
            '50k-100k': 100000,
            '100k-500k': 500000,
            '500k-1m': 1000000,
            '1m+': 2000000
        };
        return values[range] || 0;
    };

    const validateStep = (step) => {
        const newErrors = {};
        
        if (step === 1) {
            const data = formData.business;
            if (!data.legal_name) newErrors.legal_name = 'Legal business name is required';
            if (!data.registration_number) newErrors.registration_number = 'Registration number is required';
            if (!data.tax_id) newErrors.tax_id = 'Tax ID is required';
            if (!data.business_type) newErrors.business_type = 'Business type is required';
            if (!data.industry) newErrors.industry = 'Industry is required';
            if (!data.country) newErrors.country = 'Country is required';
            if (!data.business_address) newErrors.business_address = 'Business address is required';
            if (!data.business_description) newErrors.business_description = 'Business description is required';
        }
        
        if (step === 2) {
            // Company Structure validation based on business type
            const businessType = formData.business?.business_type;
            const structure = formData.structure;
            
            if (businessType === 'sole_proprietorship') {
                if (!structure.owner_full_name) newErrors.owner_full_name = 'Owner name is required';
                if (!structure.owner_dob) newErrors.owner_dob = 'Date of birth is required';
            } else if (businessType === 'partnership') {
                if (!structure.partnership_type) newErrors.partnership_type = 'Partnership type is required';
                if (!structure.managing_partner) newErrors.managing_partner = 'Managing partner is required';
            } else if (businessType === 'llc') {
                if (!structure.llc_type) newErrors.llc_type = 'LLC type is required';
                if (!structure.managing_member) newErrors.managing_member = 'Managing member is required';
            } else if (businessType === 'corporation') {
                if (!structure.corporation_type) newErrors.corporation_type = 'Corporation type is required';
            }
        }

        if (step === 3) {
            // LEI is optional but if provided must be valid
            if (formData.lei.lei && formData.lei.lei.length !== 20) {
                newErrors.lei = 'LEI must be exactly 20 characters';
            }
        }
        
        if (step === 4) {
            const contacts = formData.contacts.contacts || [];
            if (contacts.length === 0) {
                newErrors.contacts = [{ full_name: 'At least one contact is required' }];
            } else {
                const contactErrors = [];
                contacts.forEach((contact, index) => {
                    const errs = {};
                    if (!contact.full_name) errs.full_name = 'Full name is required';
                    if (!contact.role) errs.role = 'Role is required';
                    if (!contact.email) errs.email = 'Email is required';
                    else if (!/\S+@\S+\.\S+/.test(contact.email)) errs.email = 'Invalid email format';
                    if (!contact.phone) errs.phone = 'Phone is required';
                    
                    if (contact.is_primary) {
                        if (!contact.date_of_birth) errs.date_of_birth = 'Date of birth is required';
                        if (!contact.nationality) errs.nationality = 'Nationality is required';
                    }
                    
                    if (Object.keys(errs).length > 0) {
                        contactErrors[index] = errs;
                    }
                });
                if (contactErrors.length > 0) {
                    newErrors.contacts = contactErrors;
                }
            }
        }
        
        if (step === 5) {
            // Document upload validation
            const docs = formData.documents?.documents || {};
            const requiredDocs = ['certificate_incorporation', 'business_license', 'director_id', 'proof_of_address', 'bank_statement'];
            const missingDocs = requiredDocs.filter(d => !docs[d]);
            if (missingDocs.length > 0) {
                newErrors.documents = `Please upload all required documents (${missingDocs.length} missing)`;
            }
        }

        if (step === 6) {
            // KYB verification - warn if not completed
            if (!formData.kyb.kyb_status || formData.kyb.kyb_status === 'not_started') {
                // Allow to proceed but show warning
            }
        }
        
        if (step === 7) {
            // AML screening - warn if not completed
            if (!formData.aml.aml_status || formData.aml.aml_status === 'not_started') {
                // Allow to proceed but show warning
            }
        }
        
        if (step === 8) {
              const data = formData.bank;
              if (!data.account_holder_name) newErrors.account_holder_name = 'Account holder name is required';
              if (!data.bank_name) newErrors.bank_name = 'Bank name is required';
              if (!data.account_number) newErrors.account_number = 'Account number is required';
              if (!data.routing_number) newErrors.routing_number = 'Routing number is required';
              if (!data.swift_code) newErrors.swift_code = 'SWIFT code is required';
              if (!data.settlement_currency) newErrors.settlement_currency = 'Settlement currency is required';
              if (!data.settlement_period) newErrors.settlement_period = 'Settlement period is required';
          }

          if (step === 9) {
              // Pricing is optional but recommended
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
        
        if (currentStep < TOTAL_STEPS) {
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
            await createMerchantMutation.mutateAsync(formData);
        } catch (error) {
            console.error('Submission error:', error);
        }
        setIsSubmitting(false);
    };

    const updateStepData = (step, data) => {
        const keys = ['', 'business', 'structure', 'lei', 'contacts', 'documents', 'kyb', 'aml', 'bank', 'pricing', 'review'];
        setFormData(prev => ({
            ...prev,
            [keys[step]]: data
        }));
    };

    const canProceed = () => {
        // Allow proceeding through all steps (real integrations will be added later)
        return true;
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BusinessDetailsStep 
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
                        businessType={formData.business?.business_type}
                    />
                );
            case 3:
                return (
                    <LEIVerificationStep 
                        data={formData.lei} 
                        onChange={(data) => updateStepData(3, data)}
                        errors={errors}
                        businessData={formData.business}
                    />
                );
            case 4:
                return (
                    <ContactInfoStep 
                        data={formData.contacts} 
                        onChange={(data) => updateStepData(4, data)}
                        errors={errors}
                    />
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <DocumentUploadStep 
                            data={formData.documents} 
                            onChange={(data) => updateStepData(5, data)}
                            errors={errors}
                            merchantType={formData.business?.business_type}
                        />
                        {formData.documents?.documents && Object.keys(formData.documents.documents).length > 0 && (
                            <AIDocumentVerification 
                                documents={formData.documents.documents}
                                businessData={formData.business}
                                onVerificationComplete={(result) => {
                                    updateStepData(5, { 
                                        ...formData.documents, 
                                        aiVerification: result 
                                    });
                                }}
                            />
                        )}
                    </div>
                );
            case 6:
                return (
                    <KYBVerificationStep 
                        data={formData.kyb} 
                        onChange={(data) => updateStepData(6, data)}
                        errors={errors}
                        businessData={formData.business}
                        contactData={formData.contacts}
                    />
                );
            case 7:
                return (
                    <AMLScreeningStep 
                        data={formData.aml} 
                        onChange={(data) => updateStepData(7, data)}
                        errors={errors}
                        businessData={formData.business}
                        contactData={formData.contacts}
                    />
                );
            case 8:
                  return (
                      <BankDetailsStep 
                          data={formData.bank} 
                          onChange={(data) => updateStepData(8, data)}
                          errors={errors}
                      />
                  );
              case 9:
                  return (
                      <PricingStep 
                          data={formData.pricing} 
                          onChange={(data) => updateStepData(9, data)}
                          errors={errors}
                      />
                  );
              case 10:
                  return (
                      <ReviewSubmitStep formData={formData} />
                  );
            default:
                return null;
        }
    };

    const showVerificationWarning = (currentStep === 6 && (!formData.kyb.kyb_status || formData.kyb.kyb_status === 'not_started')) ||
                                    (currentStep === 7 && (!formData.aml.aml_status || formData.aml.aml_status === 'not_started'));

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Merchants" />
            
            <div className={cn("transition-all duration-300", "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Merchant Onboarding</h1>
                                <p className="text-slate-500">Complete the application with automated KYC/AML verification</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <Card className="p-6 mb-6">
                        <OnboardingProgress 
                            currentStep={currentStep} 
                            completedSteps={completedSteps}
                            totalSteps={TOTAL_STEPS}
                        />
                    </Card>

                    {/* Form Content */}
                    <Card className="p-6 mb-6">
                        {renderStep()}
                    </Card>



                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => navigate(createPageUrl('Merchants'))}>
                                Save as Draft
                            </Button>
                            
                            {currentStep < TOTAL_STEPS ? (
                                <Button 
                                    onClick={handleNext} 
                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    Continue
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleSubmit} 
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    disabled={isSubmitting || createMerchantMutation.isPending}
                                >
                                    {isSubmitting || createMerchantMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    Submit Application
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}