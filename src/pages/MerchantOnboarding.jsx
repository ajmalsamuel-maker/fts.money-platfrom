import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import OnboardingProgress from '@/components/onboarding/OnboardingProgress';
import BusinessDetailsStep from '@/components/onboarding/BusinessDetailsStep';
import ContactInfoStep from '@/components/onboarding/ContactInfoStep';
import ComplianceStep from '@/components/onboarding/ComplianceStep';
import BankDetailsStep from '@/components/onboarding/BankDetailsStep';
import RiskAssessmentStep from '@/components/onboarding/RiskAssessmentStep';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
    ChevronLeft, 
    ChevronRight, 
    Check,
    Loader2,
    CreditCard
} from 'lucide-react';

export default function MerchantOnboarding() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        business: {},
        contacts: {},
        compliance: {},
        bank: {},
        risk: {}
    });

    const createMerchantMutation = useMutation({
        mutationFn: async (data) => {
            const merchantData = {
                merchant_id: `MID-${Date.now()}`,
                business_name: data.business.legal_name,
                trading_name: data.business.trading_name,
                status: 'pending',
                category: data.business.industry,
                country: data.business.country,
                contact_name: data.contacts.contacts?.[0]?.full_name,
                contact_email: data.contacts.contacts?.[0]?.email,
                contact_phone: data.contacts.contacts?.[0]?.phone,
                website: data.business.website,
                address: data.business.business_address,
                risk_level: 'medium',
                settlement_period: data.bank.settlement_period,
                processing_volume: getVolumeValue(data.risk.monthly_volume),
                fee_rate: 2.5,
            };
            return base44.entities.Merchant.create(merchantData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['merchants'] });
            navigate(createPageUrl('Merchants'));
        }
    });

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
            const contacts = formData.contacts.contacts || [];
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
        
        if (step === 3) {
            const data = formData.compliance;
            const requiredDocs = ['certificate_of_incorporation', 'business_license', 'proof_of_address', 'director_id', 'shareholder_register'];
            const docErrors = {};
            
            requiredDocs.forEach(docId => {
                if (!data.documents?.[docId]) {
                    docErrors[docId] = 'This document is required';
                }
            });
            
            if (Object.keys(docErrors).length > 0) {
                newErrors.documents = docErrors;
            }
            
            if (!data.declarations?.beneficial_owners || !data.declarations?.no_sanctions || !data.declarations?.accurate_info) {
                newErrors.declarations = 'All declarations must be acknowledged';
            }
        }
        
        if (step === 4) {
            const data = formData.bank;
            if (!data.account_holder_name) newErrors.account_holder_name = 'Account holder name is required';
            if (!data.bank_name) newErrors.bank_name = 'Bank name is required';
            if (!data.account_number) newErrors.account_number = 'Account number is required';
            if (!data.routing_number) newErrors.routing_number = 'Routing number is required';
            if (!data.swift_code) newErrors.swift_code = 'SWIFT code is required';
            if (!data.settlement_currency) newErrors.settlement_currency = 'Settlement currency is required';
            if (!data.settlement_period) newErrors.settlement_period = 'Settlement period is required';
        }
        
        if (step === 5) {
            const data = formData.risk;
            if (!data.monthly_volume) newErrors.monthly_volume = 'Monthly volume is required';
            if (!data.avg_ticket) newErrors.avg_ticket = 'Average ticket is required';
            if (!data.transaction_type) newErrors.transaction_type = 'Transaction type is required';
            if (!data.sales_channel) newErrors.sales_channel = 'Sales channel is required';
            if (!data.has_previous_processing) newErrors.has_previous_processing = 'This field is required';
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
        
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setErrors({});
        }
    };

    const handleSubmit = () => {
        const stepErrors = validateStep(currentStep);
        
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        
        createMerchantMutation.mutate(formData);
    };

    const updateStepData = (step, data) => {
        const keys = ['', 'business', 'contacts', 'compliance', 'bank', 'risk'];
        setFormData(prev => ({
            ...prev,
            [keys[step]]: data
        }));
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
                    <ContactInfoStep 
                        data={formData.contacts} 
                        onChange={(data) => updateStepData(2, data)}
                        errors={errors}
                    />
                );
            case 3:
                return (
                    <ComplianceStep 
                        data={formData.compliance} 
                        onChange={(data) => updateStepData(3, data)}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <BankDetailsStep 
                        data={formData.bank} 
                        onChange={(data) => updateStepData(4, data)}
                        errors={errors}
                    />
                );
            case 5:
                return (
                    <RiskAssessmentStep 
                        data={formData.risk} 
                        onChange={(data) => updateStepData(5, data)}
                        errors={errors}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="Merchants"
            />
            
            <div className={cn(
                "transition-all duration-300",
                sidebarCollapsed ? "ml-20" : "ml-64"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Merchant Onboarding</h1>
                                <p className="text-slate-500">Complete the application to start processing payments</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <Card className="p-6 mb-6">
                        <OnboardingProgress 
                            currentStep={currentStep} 
                            completedSteps={completedSteps}
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
                            
                            {currentStep < 5 ? (
                                <Button onClick={handleNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                    Continue
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleSubmit} 
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    disabled={createMerchantMutation.isPending}
                                >
                                    {createMerchantMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
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