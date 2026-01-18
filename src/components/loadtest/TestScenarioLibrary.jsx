import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Shield, CreditCard, Zap } from 'lucide-react';

// Industry-standard payment test scenarios based on real-world payment processing
export const TEST_SCENARIOS = {
    successful_payment: {
        name: 'Successful Payment',
        description: 'Standard approved transaction - ISO 8583 response code 00',
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        response_code: '00',
        status: 'approved',
        success_rate: 100,
        use_case: 'Baseline happy path testing'
    },
    declined_card: {
        name: 'Declined Card',
        description: 'Generic decline - ISO 8583 response code 05',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        response_code: '05',
        status: 'declined',
        success_rate: 0,
        use_case: 'Test decline handling and user messaging'
    },
    insufficient_funds: {
        name: 'Insufficient Funds',
        description: 'NSF - ISO 8583 response code 51',
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        response_code: '51',
        status: 'declined',
        success_rate: 0,
        use_case: 'Test retry logic and soft decline handling'
    },
    fraud_detected: {
        name: 'Fraud Detected',
        description: 'Suspected fraud - ISO 8583 response code 59',
        icon: Shield,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        response_code: '59',
        status: 'declined',
        risk_score: 95,
        success_rate: 0,
        use_case: 'Test fraud prevention rules and alerts'
    },
    '3ds_required': {
        name: '3D Secure Required',
        description: '3DS authentication needed - strong customer authentication',
        icon: Shield,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        response_code: '3DS',
        status: 'pending_auth',
        success_rate: 85,
        use_case: 'Test SCA compliance and 3DS flow'
    },
    expired_card: {
        name: 'Expired Card',
        description: 'Card past expiration - ISO 8583 response code 54',
        icon: Clock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        response_code: '54',
        status: 'declined',
        success_rate: 0,
        use_case: 'Test account updater integration'
    },
    invalid_cvv: {
        name: 'Invalid CVV',
        description: 'CVV mismatch - security code verification failed',
        icon: AlertTriangle,
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        response_code: 'N7',
        status: 'declined',
        success_rate: 0,
        use_case: 'Test CVV validation and security'
    },
    timeout: {
        name: 'Gateway Timeout',
        description: 'Network timeout - no response from issuer',
        icon: Clock,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        response_code: '68',
        status: 'error',
        success_rate: 0,
        use_case: 'Test timeout handling and retry logic'
    },
    velocity_limit: {
        name: 'Velocity Limit Exceeded',
        description: 'Too many transactions in time window - rate limiting',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        response_code: '65',
        status: 'declined',
        success_rate: 0,
        use_case: 'Test velocity controls and fraud prevention'
    },
    network_error: {
        name: 'Network Error',
        description: 'Communication failure - ISO 8583 response code 91',
        icon: XCircle,
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        response_code: '91',
        status: 'error',
        success_rate: 0,
        use_case: 'Test resilience and failover'
    }
};

export default function TestScenarioLibrary({ selectedScenarios, onToggle }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(TEST_SCENARIOS).map(([key, scenario]) => {
                const Icon = scenario.icon;
                const isSelected = selectedScenarios.includes(key);
                
                return (
                    <Card 
                        key={key}
                        className={`cursor-pointer transition-all ${
                            isSelected 
                                ? `${scenario.borderColor} border-2 ${scenario.bgColor}` 
                                : 'border hover:border-slate-300'
                        }`}
                        onClick={() => onToggle(key)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Icon className={`h-5 w-5 ${scenario.color} mt-0.5`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">{scenario.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {scenario.response_code}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">{scenario.description}</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">{scenario.use_case}</p>
                                </div>
                                {isSelected && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}