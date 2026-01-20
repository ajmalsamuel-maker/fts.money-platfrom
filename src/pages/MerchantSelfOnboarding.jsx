import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, CheckCircle, Store, Building2, Globe, FileText, CreditCard } from 'lucide-react';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { toast } from 'sonner';

export default function MerchantSelfOnboarding() {
    const queryClient = useQueryClient();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        business_name: '',
        trading_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        country: '',
        category: 'ecommerce',
        mcc_code: '',
        address: ''
    });

    const steps = [
        { number: 1, title: 'Business Info', icon: Store },
        { number: 2, title: 'Contact Details', icon: Building2 },
        { number: 3, title: 'Business Details', icon: Globe },
        { number: 4, title: 'Review', icon: CheckCircle }
    ];

    const createMerchantMutation = useMutation({
        mutationFn: async (data) => {
            try {
                // Get PSP code from session
                const staffSession = JSON.parse(localStorage.getItem('staff_session') || '{}');
                const pspCode = staffSession.psp_code;

                console.log('🔄 Submitting merchant application...', { pspCode, data });

                if (!pspCode) {
                    throw new Error('No PSP code found in session');
                }

                // Generate merchant code
                const merchantCode = `MERCH${Date.now().toString().slice(-8)}`;

                const merchantData = {
                    ...data,
                    merchant_id: `MID-${Date.now()}`,
                    psp_code: pspCode,
                    merchant_code: merchantCode,
                    status: 'pending',
                    currency: 'USD',
                    timezone: 'UTC',
                    settlement_period: 'T+1',
                    risk_level: 'medium',
                    total_transactions: 0,
                    total_volume: 0,
                    lei_status: 'pending',
                    kyb_status: 'not_started',
                    kyb_provider: 'thekyb',
                    aml_status: 'clear',
                    aml_provider: 'amlwatcher'
                };

                console.log('📤 Creating merchant in PostgreSQL...', merchantData);

                // Create merchant in PostgreSQL via pspData function
                const response = await base44.functions.invoke('pspData', {
                    action: 'createMerchant',
                    psp_code: pspCode,
                    merchantData: merchantData
                });

                console.log('📥 Response from pspData:', response);

                if (!response.data.success) {
                    throw new Error(response.data.error || 'Failed to create merchant');
                }

                const merchant = response.data.merchant;
                console.log('✅ Merchant created:', merchant);

                // Create approval request so it shows in Approvals page
                await base44.entities.ApprovalRequest.create({
                    request_type: 'merchant_onboarding',
                    entity_type: 'Merchant',
                    entity_id: merchant.id,
                    entity_data: merchant,
                    submitted_by: staffSession.email || 'admin',
                    submitted_by_name: staffSession.full_name || 'Admin',
                    priority: 'normal',
                    status: 'pending'
                });

                return merchant;
            } catch (error) {
                console.error('❌ Error creating merchant:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['merchants']);
            queryClient.invalidateQueries(['approval-requests']);
            toast.success('Merchant application submitted successfully!');
            window.location.href = createPageUrl('Merchants');
        },
        onError: (error) => {
            console.error('Mutation error:', error);
            toast.error('Failed to submit application: ' + error.message);
        }
    });

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = () => {
        createMerchantMutation.mutate(formData);
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
                currentPage="MerchantSelfOnboarding"
            />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-[21rem]'}`}>
                <TopHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
                
                <main className="flex-1 overflow-y-auto p-6">
                    {/* Breadcrumbs */}
                    <div className="mb-6">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink onClick={() => window.location.href = createPageUrl('Dashboard')} className="cursor-pointer">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink onClick={() => window.location.href = createPageUrl('Merchants')} className="cursor-pointer">
                                        Merchants
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Self-Service Onboarding</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <Button 
                                variant="ghost" 
                                onClick={() => window.location.href = createPageUrl('Merchants')}
                                className="mb-4"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Merchants
                            </Button>
                            <h1 className="text-3xl font-bold text-slate-900">Merchant Self-Service Onboarding</h1>
                            <p className="text-slate-600 mt-2">Complete the form below to onboard a new merchant</p>
                        </div>

                        {/* Progress Steps */}
                        <div className="flex items-center justify-between mb-8">
                            {steps.map((step, index) => {
                                const StepIcon = step.icon;
                                const isActive = currentStep === step.number;
                                const isCompleted = currentStep > step.number;
                                
                                return (
                                    <React.Fragment key={step.number}>
                                        <div className="flex flex-col items-center">
                                            <div className={`
                                                w-12 h-12 rounded-full flex items-center justify-center transition-all
                                                ${isCompleted ? 'bg-green-500 text-white' : 
                                                  isActive ? 'bg-blue-500 text-white' : 
                                                  'bg-slate-200 text-slate-500'}
                                            `}>
                                                {isCompleted ? (
                                                    <CheckCircle className="h-6 w-6" />
                                                ) : (
                                                    <StepIcon className="h-6 w-6" />
                                                )}
                                            </div>
                                            <span className={`text-sm mt-2 ${isActive ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-slate-200'}`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* Form Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {currentStep === 1 && 'Business Information'}
                                    {currentStep === 2 && 'Contact Details'}
                                    {currentStep === 3 && 'Business Details'}
                                    {currentStep === 4 && 'Review & Submit'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Step 1: Business Info */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="business_name">Legal Business Name *</Label>
                                            <Input
                                                id="business_name"
                                                value={formData.business_name}
                                                onChange={(e) => updateField('business_name', e.target.value)}
                                                placeholder="e.g., Acme Corporation Ltd"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="trading_name">Trading Name / DBA</Label>
                                            <Input
                                                id="trading_name"
                                                value={formData.trading_name}
                                                onChange={(e) => updateField('trading_name', e.target.value)}
                                                placeholder="e.g., Acme Shop"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="category">Business Category *</Label>
                                            <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="retail">Retail</SelectItem>
                                                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                                                    <SelectItem value="hospitality">Hospitality</SelectItem>
                                                    <SelectItem value="services">Services</SelectItem>
                                                    <SelectItem value="travel">Travel</SelectItem>
                                                    <SelectItem value="gaming">Gaming</SelectItem>
                                                    <SelectItem value="crypto">Crypto</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Contact Details */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="contact_name">Contact Name *</Label>
                                            <Input
                                                id="contact_name"
                                                value={formData.contact_name}
                                                onChange={(e) => updateField('contact_name', e.target.value)}
                                                placeholder="John Smith"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contact_email">Contact Email *</Label>
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={formData.contact_email}
                                                onChange={(e) => updateField('contact_email', e.target.value)}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="contact_phone">Contact Phone</Label>
                                            <Input
                                                id="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={(e) => updateField('contact_phone', e.target.value)}
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Business Details */}
                                {currentStep === 3 && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="website">Website</Label>
                                            <Input
                                                id="website"
                                                value={formData.website}
                                                onChange={(e) => updateField('website', e.target.value)}
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="country">Country *</Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => updateField('country', e.target.value)}
                                                placeholder="US"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="address">Business Address</Label>
                                            <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={(e) => updateField('address', e.target.value)}
                                                placeholder="123 Main Street, City, State"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="mcc_code">MCC Code</Label>
                                            <Input
                                                id="mcc_code"
                                                value={formData.mcc_code}
                                                onChange={(e) => updateField('mcc_code', e.target.value)}
                                                placeholder="5812"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Review */}
                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-3">Review Your Information</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-slate-600">Business Name:</span>
                                                    <span className="font-medium">{formData.business_name}</span>
                                                </div>
                                                {formData.trading_name && (
                                                    <div className="flex justify-between py-2 border-b">
                                                        <span className="text-slate-600">Trading Name:</span>
                                                        <span className="font-medium">{formData.trading_name}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-slate-600">Category:</span>
                                                    <span className="font-medium capitalize">{formData.category}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-slate-600">Contact Name:</span>
                                                    <span className="font-medium">{formData.contact_name}</span>
                                                </div>
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-slate-600">Contact Email:</span>
                                                    <span className="font-medium">{formData.contact_email}</span>
                                                </div>
                                                {formData.contact_phone && (
                                                    <div className="flex justify-between py-2 border-b">
                                                        <span className="text-slate-600">Phone:</span>
                                                        <span className="font-medium">{formData.contact_phone}</span>
                                                    </div>
                                                )}
                                                {formData.website && (
                                                    <div className="flex justify-between py-2 border-b">
                                                        <span className="text-slate-600">Website:</span>
                                                        <span className="font-medium">{formData.website}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between py-2 border-b">
                                                    <span className="text-slate-600">Country:</span>
                                                    <span className="font-medium">{formData.country}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t">
                                    {currentStep > 1 && (
                                        <Button variant="outline" onClick={handleBack}>
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Back
                                        </Button>
                                    )}
                                    <div className="ml-auto">
                                        {currentStep < steps.length ? (
                                            <Button onClick={handleNext}>
                                                Next
                                            </Button>
                                        ) : (
                                            <Button 
                                                onClick={handleSubmit}
                                                disabled={createMerchantMutation.isPending}
                                            >
                                                {createMerchantMutation.isPending ? 'Submitting...' : 'Submit Application'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}