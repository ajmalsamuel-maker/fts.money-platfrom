import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check, Building2, FileText, Shield, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import OnboardingProgress from '../onboarding/OnboardingProgress';
import BusinessDetailsStep from '../onboarding/BusinessDetailsStep';
import CompanyStructureStep from '../onboarding/CompanyStructureStep';
import ContactInfoStep from '../onboarding/ContactInfoStep';
import DocumentUploadStep from '../onboarding/DocumentUploadStep';
import BankDetailsStep from '../onboarding/BankDetailsStep';
import KYBVerificationStep from '../onboarding/KYBVerificationStep';
import AMLScreeningStep from '../onboarding/AMLScreeningStep';
import LEIVerificationStep from '../onboarding/LEIVerificationStep';
import PricingStep from '../onboarding/PricingStep';
import ReviewSubmitStep from '../onboarding/ReviewSubmitStep';

const onboardingSteps = [
    { id: 1, name: 'Business Details', component: BusinessDetailsStep },
    { id: 2, name: 'Company Structure', component: CompanyStructureStep },
    { id: 3, name: 'Contact Information', component: ContactInfoStep },
    { id: 4, name: 'Document Upload', component: DocumentUploadStep },
    { id: 5, name: 'Bank Details', component: BankDetailsStep },
    { id: 6, name: 'KYB Verification', component: KYBVerificationStep },
    { id: 7, name: 'AML Screening', component: AMLScreeningStep },
    { id: 8, name: 'LEI Verification', component: LEIVerificationStep },
    { id: 9, name: 'Pricing & Fees', component: PricingStep },
    { id: 10, name: 'Review & Submit', component: ReviewSubmitStep },
];

export default function MerchantOnboardingDialog({ merchant, open, onOpenChange, onSave, mode = 'edit' }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Business Details
        business_name: '',
        trading_name: '',
        business_type: '',
        registration_number: '',
        tax_id: '',
        incorporation_date: '',
        country: '',
        industry: '',
        website: '',
        description: '',
        mcc_code: '',
        monthly_volume: '',
        average_ticket_size: '',
        
        // Company Structure
        ownership_structure: [],
        directors: [],
        beneficial_owners: [],
        
        // Contact Info
        primary_contact: {},
        additional_contacts: [],
        
        // Documents
        documents: [],
        
        // Bank Details
        account_holder_name: '',
        bank_name: '',
        account_number: '',
        routing_number: '',
        swift_code: '',
        settlement_currency: '',
        settlement_period: '',
        crypto_settlement_enabled: false,
        
        // KYB/AML
        kyb_status: 'not_started',
        aml_status: 'not_started',
        
        // LEI
        lei: '',
        lei_status: '',
        
        // Pricing
        fee_rate: '',
        processing_volume: '',
        
        // Status
        status: 'pending',
        risk_level: 'medium',
    });
    const [errors, setErrors] = useState({});
    const [completedSteps, setCompletedSteps] = useState([]);

    useEffect(() => {
        if (merchant) {
            setFormData({
                business_name: merchant.business_name || '',
                trading_name: merchant.trading_name || '',
                business_type: merchant.business_type || '',
                registration_number: merchant.registration_number || '',
                tax_id: merchant.tax_id || '',
                incorporation_date: merchant.incorporation_date || '',
                country: merchant.country || '',
                industry: merchant.industry || '',
                website: merchant.website || '',
                description: merchant.description || '',
                mcc_code: merchant.mcc_code || '',
                monthly_volume: merchant.monthly_volume || '',
                average_ticket_size: merchant.average_ticket_size || '',
                ownership_structure: merchant.ownership_structure || [],
                directors: merchant.directors || [],
                beneficial_owners: merchant.beneficial_owners || [],
                primary_contact: merchant.primary_contact || {},
                additional_contacts: merchant.additional_contacts || [],
                documents: merchant.documents || [],
                account_holder_name: merchant.account_holder_name || '',
                bank_name: merchant.bank_name || '',
                account_number: merchant.account_number || '',
                routing_number: merchant.routing_number || '',
                swift_code: merchant.swift_code || '',
                settlement_currency: merchant.settlement_currency || '',
                settlement_period: merchant.settlement_period || '',
                crypto_settlement_enabled: merchant.crypto_settlement_enabled || false,
                kyb_status: merchant.kyb_status || 'not_started',
                kyb_reference_id: merchant.kyb_reference_id || '',
                kyb_provider: merchant.kyb_provider || 'thekyb',
                aml_status: merchant.aml_status || 'not_started',
                aml_reference_id: merchant.aml_reference_id || '',
                aml_risk_score: merchant.aml_risk_score || 0,
                aml_provider: merchant.aml_provider || 'amlwatcher',
                lei: merchant.lei || '',
                lei_status: merchant.lei_status || '',
                fee_rate: merchant.fee_rate || '',
                processing_volume: merchant.processing_volume || '',
                status: merchant.status || 'pending',
                risk_level: merchant.risk_level || 'medium',
                merchant_id: merchant.merchant_id,
                id: merchant.id,
            });

            // Determine completed steps based on data
            const completed = [];
            if (merchant.business_name && merchant.country) completed.push(1);
            if (merchant.business_type) completed.push(2);
            if (merchant.primary_contact?.email) completed.push(3);
            if (merchant.documents?.length > 0) completed.push(4);
            if (merchant.bank_name) completed.push(5);
            if (merchant.kyb_status !== 'not_started') completed.push(6);
            if (merchant.aml_status !== 'not_started') completed.push(7);
            if (merchant.lei) completed.push(8);
            if (merchant.fee_rate) completed.push(9);
            setCompletedSteps(completed);
        }
    }, [merchant]);

    const handleStepChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleNext = () => {
        if (currentStep < onboardingSteps.length) {
            if (!completedSteps.includes(currentStep)) {
                setCompletedSteps([...completedSteps, currentStep]);
            }
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSaveAndClose = () => {
        // Save current data
        onSave(formData);
        onOpenChange(false);
    };

    const CurrentStepComponent = onboardingSteps[currentStep - 1].component;

    if (!merchant) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="px-6 py-4 border-b bg-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {mode === 'view' ? 'View' : 'Edit'} Merchant: {merchant.business_name}
                                </h2>
                                <p className="text-sm text-slate-500">
                                    {mode === 'view' ? 'Review complete onboarding information' : 'Update merchant onboarding details'}
                                </p>
                            </div>
                            <Badge className={cn(
                                merchant.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                merchant.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            )}>
                                {merchant.status}
                            </Badge>
                        </div>
                        <OnboardingProgress
                            currentStep={currentStep}
                            completedSteps={completedSteps}
                            totalSteps={onboardingSteps.length}
                        />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        <CurrentStepComponent
                            data={formData}
                            onChange={handleStepChange}
                            errors={errors}
                            businessData={formData}
                            contactData={formData}
                            allData={formData}
                            businessType={formData.business_type}
                            formData={formData}
                        />
                    </div>

                    {/* Footer Navigation */}
                    <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back
                        </Button>

                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="font-medium">Step {currentStep} of {onboardingSteps.length}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {mode === 'edit' && (
                                <Button
                                    variant="outline"
                                    onClick={handleSaveAndClose}
                                    className="gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    Save Changes
                                </Button>
                            )}
                            {currentStep < onboardingSteps.length ? (
                                <Button
                                    onClick={handleNext}
                                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    Continue
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSaveAndClose}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Check className="h-4 w-4" />
                                    {mode === 'edit' ? 'Save & Close' : 'Close'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}