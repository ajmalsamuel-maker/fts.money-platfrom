import React from 'react';
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';

const steps = [
    { id: 1, name: 'Business Details', description: 'Company information' },
    { id: 2, name: 'Contact Info', description: 'Primary contacts' },
    { id: 3, name: 'Compliance', description: 'KYC/AML documents' },
    { id: 4, name: 'Bank Details', description: 'Settlement accounts' },
    { id: 5, name: 'Risk Assessment', description: 'Business evaluation' },
];

export default function OnboardingProgress({ currentStep, completedSteps }) {
    return (
        <div className="w-full">
            <div className="hidden md:flex items-center justify-between">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                completedSteps.includes(step.id)
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : currentStep === step.id
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "bg-white border-slate-300 text-slate-400"
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
                                    currentStep === step.id ? "text-blue-600" : "text-slate-600"
                                )}>
                                    {step.name}
                                </p>
                                <p className="text-xs text-slate-400">{step.description}</p>
                            </div>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={cn(
                                "flex-1 h-0.5 mx-4",
                                completedSteps.includes(step.id) ? "bg-emerald-500" : "bg-slate-200"
                            )} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            
            {/* Mobile Progress */}
            <div className="md:hidden">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">
                        Step {currentStep} of {steps.length}
                    </span>
                    <span className="text-sm text-slate-500">
                        {steps[currentStep - 1]?.name}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(currentStep / steps.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}