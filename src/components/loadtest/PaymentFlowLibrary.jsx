import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Repeat, CreditCard, Globe, Shield, Zap } from 'lucide-react';

const PAYMENT_FLOWS = {
    recurring_subscription: {
        name: 'Recurring Subscription',
        icon: Repeat,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        steps: [
            { type: 'auth', description: 'Initial card authorization' },
            { type: 'sale', description: 'First payment charge' },
            { type: 'sale', description: 'Monthly recurring charge (Month 2)' },
            { type: 'sale', description: 'Monthly recurring charge (Month 3)' }
        ],
        scenarios: ['successful_payment', '3ds_required', 'declined_card'],
        use_case: 'SaaS, streaming services, memberships'
    },
    multi_currency_checkout: {
        name: 'Multi-Currency Checkout',
        icon: Globe,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        steps: [
            { type: 'sale', currency: 'USD', description: 'USD transaction' },
            { type: 'sale', currency: 'EUR', description: 'EUR transaction' },
            { type: 'sale', currency: 'GBP', description: 'GBP transaction' },
            { type: 'sale', currency: 'JPY', description: 'JPY transaction' }
        ],
        scenarios: ['successful_payment', 'fraud_detected'],
        use_case: 'International e-commerce, travel booking'
    },
    secure_auth_flow: {
        name: '3D Secure Authentication Flow',
        icon: Shield,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        steps: [
            { type: 'auth', description: 'Pre-auth validation' },
            { type: '3ds', description: '3DS challenge initiated' },
            { type: 'sale', description: 'Post-auth payment' }
        ],
        scenarios: ['3ds_required', 'successful_payment'],
        use_case: 'SCA compliance, high-risk transactions'
    },
    refund_reversal_flow: {
        name: 'Purchase & Refund Flow',
        icon: CreditCard,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        steps: [
            { type: 'sale', description: 'Initial purchase' },
            { type: 'refund', description: 'Full refund' },
            { type: 'sale', description: 'New purchase attempt' }
        ],
        scenarios: ['successful_payment', 'declined_card'],
        use_case: 'Returns processing, dispute resolution'
    },
    auth_capture_flow: {
        name: 'Auth & Capture Flow',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        steps: [
            { type: 'auth', description: 'Authorization hold' },
            { type: 'capture', description: 'Capture partial amount' },
            { type: 'void', description: 'Void remaining auth' }
        ],
        scenarios: ['successful_payment', 'timeout'],
        use_case: 'Hotel reservations, car rentals'
    }
};

export default function PaymentFlowLibrary({ onSelectFlow }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PAYMENT_FLOWS).map(([key, flow]) => {
                const Icon = flow.icon;
                
                return (
                    <Card key={key} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Icon className={`h-4 w-4 ${flow.color}`} />
                                    {flow.name}
                                </CardTitle>
                                <Badge variant="outline">{flow.steps.length} steps</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-slate-600 mb-3">{flow.use_case}</p>
                            <div className="space-y-2 mb-4">
                                {flow.steps.map((step, idx) => (
                                    <div key={idx} className={`p-2 rounded ${flow.bgColor} border border-slate-200`}>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">{idx + 1}</Badge>
                                            <span className="text-xs font-medium">{step.type.toUpperCase()}</span>
                                            {step.currency && <Badge className="text-xs">{step.currency}</Badge>}
                                        </div>
                                        <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                            <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => onSelectFlow && onSelectFlow(key, flow)}
                            >
                                Use This Flow
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}