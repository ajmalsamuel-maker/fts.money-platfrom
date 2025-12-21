import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Check } from 'lucide-react';

export default function PSPProvisioningWizard() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 bg-white rounded-lg p-6 border border-slate-200">
                    <button 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Platform
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 mt-4">PSP Instance Provisioning</h1>
                    <p className="text-sm text-slate-600">Infrastructure deployment and configuration</p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center gap-4 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold border-2 ${
                                    step >= s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-300'
                                }`}>
                                    {step > s ? <Check className="h-5 w-5" /> : s}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Step {step} of 7</h2>
                        <p className="text-slate-600">Wizard content will appear here</p>
                        
                        <div className="flex justify-between pt-6">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Back
                                </button>
                            )}
                            {step < 7 && (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto"
                                >
                                    Continue
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}