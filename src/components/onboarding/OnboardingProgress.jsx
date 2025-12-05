import React from 'react';
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';

const steps = [
    { id: 1, name: 'Business Details', description: 'Company information' },
    { id: 2, name: 'LEI Verification', description: 'Legal Entity Identifier' },
    { id: 3, name: 'Contact Info', description: 'Primary contacts' },
    { id: 4, name: 'Documents', description: 'KYC documents' },
    { id: 5, name: 'KYB Verification', description: 'TheKYB integration' },
    { id: 6, name: 'AML Screening', description: 'AMLWatcher check' },
    { id: 7, name: 'Bank Details', description: 'Settlement accounts' },
    { id: 8, name: 'Pricing', description: 'Fee structure' },
    { id: 9, name: 'Review & Submit', description: 'Final review' },
];

export default function OnboardingProgress({ currentStep, completedSteps, totalSteps = 7 }) {
    const displaySteps = steps.slice(0, totalSteps);
    
    return (
        <div className="w-full">
            <div className="hidden lg:flex items-center justify-between">
                {displaySteps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                completedSteps.includes(step.id)
                                    ? "bg-[#54F0E4] border-[#54F0E4] text-[#000044]"
                                    : currentStep === step.id
                                        ? "bg-[#003EFF] border-[#003EFF] text-white"
                                        : "bg-white border-[#99C1FC] text-[#000044]/40"
                            )}>
                                {completedSteps.includes(step.id) ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span className="font-semibold">{step.id}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <p className={cn(
                                    "text-sm font-medium",
                                    currentStep === step.id ? "text-[#003EFF]" : "text-[#000044]"
                                )}>
                                    {step.name}
                                </p>
                                <p className="text-xs text-[#000044]/50">{step.description}</p>
                            </div>
                        </div>
                        {idx < displaySteps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 mx-2",
                                completedSteps.includes(step.id) ? "bg-[#54F0E4]" : "bg-[#99C1FC]/30"
                            )} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            
            {/* Mobile Progress */}
            <div className="lg:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#000044]">
                        Step {currentStep} of {displaySteps.length}
                    </span>
                    <span className="text-sm text-[#000044]/60">
                        {displaySteps[currentStep - 1]?.name}
                    </span>
                </div>
                <div className="w-full bg-[#99C1FC]/30 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-[#003EFF] to-[#54F0E4] h-2 rounded-full transition-all"
                        style={{ width: `${(currentStep / displaySteps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}