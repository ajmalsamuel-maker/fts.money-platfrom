import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
    CreditCard, 
    Users, 
    Shield, 
    BarChart3, 
    Zap, 
    Globe,
    Coins,
    Terminal,
    FileText,
    Repeat,
    Key,
    Webhook,
    TrendingUp
} from 'lucide-react';

// Module Configuration Component
export function ModuleSelector({ selectedModules, onChange }) {
    const modules = [
        { id: 'transactions', name: 'Transactions', icon: CreditCard, description: 'Payment processing' },
        { id: 'merchants', name: 'Merchants', icon: Users, description: 'Merchant management' },
        { id: 'payouts', name: 'Payouts', icon: TrendingUp, description: 'Settlement & payouts' },
        { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Reports & insights' },
        { id: 'fraud_prevention', name: 'Fraud Prevention', icon: Shield, description: 'Risk management' },
        { id: 'compliance', name: 'Compliance', icon: FileText, description: 'KYC/AML tools' },
        { id: 'api_gateway', name: 'API Gateway', icon: Key, description: 'API management' },
        { id: 'terminals', name: 'Terminals', icon: Terminal, description: 'POS systems' },
        { id: 'crypto', name: 'Crypto Payments', icon: Coins, description: 'Cryptocurrency' },
        { id: 'orchestration', name: 'Smart Routing', icon: Zap, description: 'Payment orchestration' },
        { id: 'webhooks', name: 'Webhooks', icon: Webhook, description: 'Event notifications' },
        { id: 'reconciliation', name: 'Reconciliation', icon: FileText, description: 'Financial reconciliation' },
        { id: 'invoicing', name: 'Invoicing', icon: FileText, description: 'Invoice management' },
        { id: 'subscriptions', name: 'Subscriptions', icon: Repeat, description: 'Recurring billing' }
    ];

    const toggleModule = (moduleId) => {
        if (selectedModules.includes(moduleId)) {
            onChange(selectedModules.filter(m => m !== moduleId));
        } else {
            onChange([...selectedModules, moduleId]);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {modules.map(module => {
                const Icon = module.icon;
                const isSelected = selectedModules.includes(module.id);
                return (
                    <Card 
                        key={module.id}
                        className={`cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-slate-300'}`}
                        onClick={() => toggleModule(module.id)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Checkbox checked={isSelected} />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className="h-4 w-4 text-slate-600" />
                                        <span className="font-medium text-sm">{module.name}</span>
                                    </div>
                                    <p className="text-xs text-slate-600">{module.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}

// Feature Toggle Component
export function FeatureToggles({ features, onChange }) {
    const featureList = [
        { id: 'multi_currency', name: 'Multi-Currency', description: 'Support multiple currencies' },
        { id: 'crypto_payments', name: 'Crypto Payments', description: 'Accept cryptocurrency' },
        { id: 'instant_payouts', name: 'Instant Payouts', description: 'Real-time settlements' },
        { id: 'smart_routing', name: 'Smart Routing', description: 'AI-powered routing' },
        { id: 'fraud_detection', name: 'Fraud Detection', description: 'Real-time fraud checks' },
        { id: 'compliance_tools', name: 'Compliance Tools', description: 'KYC/AML automation' },
        { id: 'merchant_portal', name: 'Merchant Portal', description: 'Self-service portal' },
        { id: 'white_label', name: 'White Label', description: 'Full customization' },
        { id: 'api_access', name: 'API Access', description: 'RESTful API' },
        { id: 'webhooks', name: 'Webhooks', description: 'Event notifications' },
        { id: 'reporting', name: 'Reporting', description: 'Advanced reports' },
        { id: 'reconciliation', name: 'Reconciliation', description: 'Auto reconciliation' }
    ];

    return (
        <div className="space-y-3">
            {featureList.map(feature => (
                <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                        <p className="font-medium text-sm">{feature.name}</p>
                        <p className="text-xs text-slate-600">{feature.description}</p>
                    </div>
                    <Checkbox
                        checked={features[feature.id]}
                        onCheckedChange={(checked) => onChange({ ...features, [feature.id]: checked })}
                    />
                </div>
            ))}
        </div>
    );
}

// Branding Configuration Component
export function BrandingConfig({ branding, onChange }) {
    return (
        <div className="space-y-4">
            <div>
                <Label>Company Name</Label>
                <Input
                    value={branding.company_name}
                    onChange={(e) => onChange({ ...branding, company_name: e.target.value })}
                    placeholder="Enter company name"
                />
            </div>
            <div>
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={branding.primary_color}
                        onChange={(e) => onChange({ ...branding, primary_color: e.target.value })}
                        className="w-20 h-10"
                    />
                    <Input
                        value={branding.primary_color}
                        onChange={(e) => onChange({ ...branding, primary_color: e.target.value })}
                        className="flex-1"
                    />
                </div>
            </div>
            <div>
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                    <Input
                        type="color"
                        value={branding.secondary_color}
                        onChange={(e) => onChange({ ...branding, secondary_color: e.target.value })}
                        className="w-20 h-10"
                    />
                    <Input
                        value={branding.secondary_color}
                        onChange={(e) => onChange({ ...branding, secondary_color: e.target.value })}
                        className="flex-1"
                    />
                </div>
            </div>
            <div>
                <Label>Logo URL</Label>
                <Input
                    value={branding.logo_url}
                    onChange={(e) => onChange({ ...branding, logo_url: e.target.value })}
                    placeholder="https://..."
                />
            </div>
        </div>
    );
}

// Limits Configuration Component
export function LimitsConfig({ limits, onChange }) {
    return (
        <div className="space-y-4">
            <div>
                <Label>Max Merchants</Label>
                <Input
                    type="number"
                    value={limits.max_merchants}
                    onChange={(e) => onChange({ ...limits, max_merchants: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <Label>Max Transactions/Month</Label>
                <Input
                    type="number"
                    value={limits.max_transactions_per_month}
                    onChange={(e) => onChange({ ...limits, max_transactions_per_month: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <Label>Max Transaction Amount ($)</Label>
                <Input
                    type="number"
                    value={limits.max_transaction_amount}
                    onChange={(e) => onChange({ ...limits, max_transaction_amount: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <Label>API Calls/Minute</Label>
                <Input
                    type="number"
                    value={limits.max_api_calls_per_minute}
                    onChange={(e) => onChange({ ...limits, max_api_calls_per_minute: parseInt(e.target.value) })}
                />
            </div>
        </div>
    );
}

// Pricing Model Component
export function PricingModelConfig({ pricingModel, onChange }) {
    return (
        <div className="space-y-4">
            <div>
                <Label>Transaction Fee (%)</Label>
                <Input
                    type="number"
                    step="0.1"
                    value={pricingModel.transaction_fee_percentage}
                    onChange={(e) => onChange({ ...pricingModel, transaction_fee_percentage: parseFloat(e.target.value) })}
                />
            </div>
            <div>
                <Label>Fixed Fee per Transaction ($)</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={pricingModel.transaction_fee_fixed}
                    onChange={(e) => onChange({ ...pricingModel, transaction_fee_fixed: parseFloat(e.target.value) })}
                />
            </div>
            <div>
                <Label>Monthly Fee ($)</Label>
                <Input
                    type="number"
                    value={pricingModel.monthly_fee}
                    onChange={(e) => onChange({ ...pricingModel, monthly_fee: parseInt(e.target.value) })}
                />
            </div>
            <div>
                <Label>Setup Fee ($)</Label>
                <Input
                    type="number"
                    value={pricingModel.setup_fee}
                    onChange={(e) => onChange({ ...pricingModel, setup_fee: parseInt(e.target.value) })}
                />
            </div>
        </div>
    );
}