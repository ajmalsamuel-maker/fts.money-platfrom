import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ChevronLeft, ChevronRight, Building2, FileText, Shield, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ONBOARDING_STEPS = [
    { id: 1, title: 'Company Information', icon: Building2 },
    { id: 2, title: 'Business Address', icon: Globe },
    { id: 3, title: 'Tax Registration', icon: FileText },
    { id: 4, title: 'LEI Verification', icon: Shield },
    { id: 5, title: 'Bank Details', icon: FileText },
    { id: 6, title: 'Authorized Signatories', icon: Shield },
    { id: 7, title: 'Document Upload', icon: FileText },
    { id: 8, title: 'E-Invoicing Preferences', icon: FileText },
    { id: 9, title: 'Integration Setup', icon: Globe },
    { id: 10, title: 'Review & Submit', icon: CheckCircle }
];

export default function BusinessOnboarding() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        company_name: '',
        company_type: '',
        registration_number: '',
        country: '',
        tax_id: '',
        lei_number: '',
        lei_status: 'pending'
    });
    const [leiChecking, setLeiChecking] = useState(false);

    const handleNext = () => {
        if (currentStep < 10) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const checkLEI = async () => {
        setLeiChecking(true);
        try {
            const response = await base44.functions.invoke('leiVerification', {
                lei: formData.lei_number
            });
            
            if (response.data.valid) {
                setFormData(prev => ({ ...prev, lei_status: 'verified' }));
            } else {
                setFormData(prev => ({ ...prev, lei_status: 'invalid' }));
            }
        } catch (error) {
            console.error('LEI check failed:', error);
        } finally {
            setLeiChecking(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Company Name *</Label>
                            <Input
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                placeholder="ABC Corporation"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Company Type *</Label>
                            <Select value={formData.company_type} onValueChange={(v) => setFormData({ ...formData, company_type: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="corporation">Corporation</SelectItem>
                                    <SelectItem value="llc">LLC</SelectItem>
                                    <SelectItem value="partnership">Partnership</SelectItem>
                                    <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Registration Number *</Label>
                            <Input
                                value={formData.registration_number}
                                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                                placeholder="REG123456"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Country *</Label>
                            <Input
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                placeholder="US"
                                maxLength={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Street Address</Label>
                            <Input placeholder="123 Main Street" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input placeholder="New York" />
                            </div>
                            <div className="space-y-2">
                                <Label>Postal Code</Label>
                                <Input placeholder="10001" />
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tax ID / VAT Number *</Label>
                            <Input
                                value={formData.tax_id}
                                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                                placeholder="123456789"
                            />
                        </div>
                        <Alert>
                            <AlertDescription>
                                Enter your country-specific tax identification number (VAT, GST, TIN, etc.)
                            </AlertDescription>
                        </Alert>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                <strong>Legal Entity Identifier (LEI)</strong> is required for cross-border transactions. 
                                If you don't have one, we can help you obtain it.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="space-y-2">
                            <Label>LEI Number</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={formData.lei_number}
                                    onChange={(e) => setFormData({ ...formData, lei_number: e.target.value })}
                                    placeholder="549300XXXXXXXXXXXXXX"
                                    maxLength={20}
                                />
                                <Button onClick={checkLEI} disabled={!formData.lei_number || leiChecking}>
                                    {leiChecking ? 'Checking...' : 'Verify'}
                                </Button>
                            </div>
                        </div>

                        {formData.lei_status === 'verified' && (
                            <Alert className="bg-green-50 border-green-200">
                                <AlertDescription className="text-green-800">
                                    ✓ LEI verified successfully
                                </AlertDescription>
                            </Alert>
                        )}

                        {formData.lei_status === 'invalid' && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    LEI verification failed. Please check the number or apply for a new LEI.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button variant="outline" className="w-full">
                            Don't have LEI? Apply Now
                        </Button>
                    </div>
                );

            case 10:
                return (
                    <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription className="text-green-800">
                                <strong>Review Complete!</strong> Your onboarding information is ready for submission.
                            </AlertDescription>
                        </Alert>
                        
                        <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                            <div><strong>Company:</strong> {formData.company_name}</div>
                            <div><strong>Country:</strong> {formData.country}</div>
                            <div><strong>Tax ID:</strong> {formData.tax_id}</div>
                            <div><strong>LEI:</strong> {formData.lei_number || 'Not provided'}</div>
                        </div>

                        <Button className="w-full bg-green-600 hover:bg-green-700">
                            Submit Application
                        </Button>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-slate-600">
                        Step {currentStep} content coming soon...
                    </div>
                );
        }
    };

    const progress = (currentStep / 10) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Progress */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Step {currentStep} of 10</span>
                        <span className="text-sm text-slate-600">{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Steps Navigation */}
                <div className="grid grid-cols-5 gap-2 mb-8">
                    {ONBOARDING_STEPS.map((step) => {
                        const Icon = step.icon;
                        const isComplete = step.id < currentStep;
                        const isCurrent = step.id === currentStep;
                        
                        return (
                            <div
                                key={step.id}
                                className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                                    isComplete ? 'bg-green-100 text-green-700' :
                                    isCurrent ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-400'
                                }`}
                                onClick={() => setCurrentStep(step.id)}
                            >
                                <Icon className="h-4 w-4 mx-auto mb-1" />
                                <div className="text-xs hidden md:block">{step.title}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>{ONBOARDING_STEPS[currentStep - 1].title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {renderStepContent()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6 pt-6 border-t">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentStep === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <Button onClick={handleNext} disabled={currentStep === 10}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}