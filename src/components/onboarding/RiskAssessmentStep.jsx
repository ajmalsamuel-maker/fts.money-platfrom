import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, AlertCircle } from 'lucide-react';

const volumeRanges = [
    { value: '0-10k', label: 'Less than $10,000' },
    { value: '10k-50k', label: '$10,000 - $50,000' },
    { value: '50k-100k', label: '$50,000 - $100,000' },
    { value: '100k-500k', label: '$100,000 - $500,000' },
    { value: '500k-1m', label: '$500,000 - $1,000,000' },
    { value: '1m+', label: 'Over $1,000,000' },
];

const avgTicketRanges = [
    { value: '0-25', label: 'Less than $25' },
    { value: '25-100', label: '$25 - $100' },
    { value: '100-500', label: '$100 - $500' },
    { value: '500-1000', label: '$500 - $1,000' },
    { value: '1000-5000', label: '$1,000 - $5,000' },
    { value: '5000+', label: 'Over $5,000' },
];

const chargebackReasons = [
    'Customer disputes',
    'Subscription cancellations',
    'Product/service quality issues',
    'Delivery problems',
    'Friendly fraud',
    'Other'
];

export default function RiskAssessmentStep({ data, onChange, errors }) {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const handleChargebackReason = (reason, checked) => {
        const current = data.chargeback_reasons || [];
        if (checked) {
            onChange({ ...data, chargeback_reasons: [...current, reason] });
        } else {
            onChange({ ...data, chargeback_reasons: current.filter(r => r !== reason) });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Risk Assessment</h2>
                    <p className="text-sm text-slate-500">Help us understand your business profile</p>
                </div>
            </div>

            {/* Processing Volume */}
            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Transaction Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Expected Monthly Volume *</Label>
                        <Select 
                            value={data.monthly_volume || ''} 
                            onValueChange={(val) => handleChange('monthly_volume', val)}
                        >
                            <SelectTrigger className={errors?.monthly_volume ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select volume range" />
                            </SelectTrigger>
                            <SelectContent>
                                {volumeRanges.map((v) => (
                                    <SelectItem key={v.value} value={v.value}>
                                        {v.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors?.monthly_volume && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.monthly_volume}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Average Transaction Amount *</Label>
                        <Select 
                            value={data.avg_ticket || ''} 
                            onValueChange={(val) => handleChange('avg_ticket', val)}
                        >
                            <SelectTrigger className={errors?.avg_ticket ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select average ticket" />
                            </SelectTrigger>
                            <SelectContent>
                                {avgTicketRanges.map((v) => (
                                    <SelectItem key={v.value} value={v.value}>
                                        {v.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors?.avg_ticket && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.avg_ticket}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max_ticket">Maximum Single Transaction ($)</Label>
                        <Input
                            id="max_ticket"
                            type="number"
                            value={data.max_ticket || ''}
                            onChange={(e) => handleChange('max_ticket', e.target.value)}
                            placeholder="e.g., 5000"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transaction_count">Expected Monthly Transactions</Label>
                        <Input
                            id="transaction_count"
                            type="number"
                            value={data.transaction_count || ''}
                            onChange={(e) => handleChange('transaction_count', e.target.value)}
                            placeholder="e.g., 1000"
                        />
                    </div>
                </div>
            </Card>

            {/* Business Model */}
            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Business Model</h3>
                
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label>Transaction Type *</Label>
                        <RadioGroup 
                            value={data.transaction_type || ''} 
                            onValueChange={(val) => handleChange('transaction_type', val)}
                            className="flex flex-wrap gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="one_time" id="one_time" />
                                <Label htmlFor="one_time" className="font-normal cursor-pointer">One-time payments</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="recurring" id="recurring" />
                                <Label htmlFor="recurring" className="font-normal cursor-pointer">Recurring/Subscription</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="both" id="both" />
                                <Label htmlFor="both" className="font-normal cursor-pointer">Both</Label>
                            </div>
                        </RadioGroup>
                        {errors?.transaction_type && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.transaction_type}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label>Sales Channel *</Label>
                        <RadioGroup 
                            value={data.sales_channel || ''} 
                            onValueChange={(val) => handleChange('sales_channel', val)}
                            className="flex flex-wrap gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="online" id="online" />
                                <Label htmlFor="online" className="font-normal cursor-pointer">Online only</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="instore" id="instore" />
                                <Label htmlFor="instore" className="font-normal cursor-pointer">In-store only</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="omnichannel" id="omnichannel" />
                                <Label htmlFor="omnichannel" className="font-normal cursor-pointer">Omnichannel</Label>
                            </div>
                        </RadioGroup>
                        {errors?.sales_channel && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.sales_channel}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="delivery_timeline">Typical Delivery/Fulfillment Timeline</Label>
                        <Input
                            id="delivery_timeline"
                            value={data.delivery_timeline || ''}
                            onChange={(e) => handleChange('delivery_timeline', e.target.value)}
                            placeholder="e.g., Immediate digital delivery, 3-5 business days shipping"
                        />
                    </div>
                </div>
            </Card>

            {/* Risk Indicators */}
            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Risk Indicators</h3>
                
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current_chargeback">Current Chargeback Rate (%)</Label>
                        <Input
                            id="current_chargeback"
                            type="number"
                            step="0.01"
                            value={data.current_chargeback || ''}
                            onChange={(e) => handleChange('current_chargeback', e.target.value)}
                            placeholder="e.g., 0.5"
                        />
                        <p className="text-xs text-slate-500">
                            Enter 0 if you don't have historical data
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Label>Common Chargeback Reasons (if applicable)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {chargebackReasons.map((reason) => (
                                <div key={reason} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`reason-${reason}`}
                                        checked={(data.chargeback_reasons || []).includes(reason)}
                                        onCheckedChange={(checked) => handleChargebackReason(reason, checked)}
                                    />
                                    <Label htmlFor={`reason-${reason}`} className="text-sm font-normal cursor-pointer">
                                        {reason}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="refund_policy">Refund Policy</Label>
                        <Textarea
                            id="refund_policy"
                            value={data.refund_policy || ''}
                            onChange={(e) => handleChange('refund_policy', e.target.value)}
                            placeholder="Describe your refund and return policy"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fraud_prevention">Fraud Prevention Measures</Label>
                        <Textarea
                            id="fraud_prevention"
                            value={data.fraud_prevention || ''}
                            onChange={(e) => handleChange('fraud_prevention', e.target.value)}
                            placeholder="Describe any fraud prevention tools or processes you use"
                            rows={3}
                        />
                    </div>
                </div>
            </Card>

            {/* Previous Processing */}
            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Previous Processing History</h3>
                
                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label>Have you processed payments before? *</Label>
                        <RadioGroup 
                            value={data.has_previous_processing || ''} 
                            onValueChange={(val) => handleChange('has_previous_processing', val)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="prev_yes" />
                                <Label htmlFor="prev_yes" className="font-normal cursor-pointer">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="prev_no" />
                                <Label htmlFor="prev_no" className="font-normal cursor-pointer">No</Label>
                            </div>
                        </RadioGroup>
                        {errors?.has_previous_processing && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.has_previous_processing}
                            </p>
                        )}
                    </div>

                    {data.has_previous_processing === 'yes' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="previous_processor">Previous Payment Processor</Label>
                                <Input
                                    id="previous_processor"
                                    value={data.previous_processor || ''}
                                    onChange={(e) => handleChange('previous_processor', e.target.value)}
                                    placeholder="e.g., Stripe, Square, PayPal"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="termination_reason">Reason for Switching (if applicable)</Label>
                                <Textarea
                                    id="termination_reason"
                                    value={data.termination_reason || ''}
                                    onChange={(e) => handleChange('termination_reason', e.target.value)}
                                    placeholder="Why are you switching from your previous provider?"
                                    rows={2}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}