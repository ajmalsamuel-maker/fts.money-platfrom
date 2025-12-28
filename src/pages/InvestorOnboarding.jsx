import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InvestorOnboardingWizard from '@/components/rwa/onboarding/InvestorOnboardingWizard';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { UserPlus, Shield, FileCheck, TrendingUp } from 'lucide-react';

export default function InvestorOnboarding() {
    const [showWizard, setShowWizard] = useState(false);
    const navigate = useNavigate();

    const features = [
        {
            icon: UserPlus,
            title: 'Quick Registration',
            description: 'Create your account in minutes with our streamlined process'
        },
        {
            icon: Shield,
            title: 'Secure KYC/AML',
            description: 'Automated identity verification with industry-leading security'
        },
        {
            icon: FileCheck,
            title: 'Document Upload',
            description: 'Securely upload verification documents directly in the portal'
        },
        {
            icon: TrendingUp,
            title: 'Start Investing',
            description: 'Access tokenized assets and start building your portfolio'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome to Tokenized Investing</h1>
                    <p className="text-lg text-slate-600">
                        Join thousands of investors accessing institutional-grade tokenized assets
                    </p>
                </div>

                <Card className="mb-6">
                    <CardContent className="p-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {features.map((feature, idx) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={idx} className="text-center">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Icon className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                                        <p className="text-sm text-slate-600">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white text-center">
                            <h2 className="text-2xl font-bold mb-2">Ready to Get Started?</h2>
                            <p className="mb-4 opacity-90">Complete your investor verification in just 6 simple steps</p>
                            <Button 
                                size="lg" 
                                className="bg-white text-purple-600 hover:bg-slate-100"
                                onClick={() => setShowWizard(true)}
                            >
                                <UserPlus className="h-5 w-5 mr-2" />
                                Start Onboarding
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-sm text-slate-600">
                        Already have an account?{' '}
                        <button 
                            onClick={() => navigate(createPageUrl('InvestorLogin'))}
                            className="text-purple-600 hover:underline font-medium"
                        >
                            Sign In
                        </button>
                    </p>
                </div>

                <InvestorOnboardingWizard
                    open={showWizard}
                    onClose={() => setShowWizard(false)}
                    onSuccess={() => {
                        setShowWizard(false);
                    }}
                />
            </div>
        </div>
    );
}