import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wallet, Zap, TrendingUp, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SettlementMethodsSelector({ merchant, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [methods, setMethods] = useState(merchant?.settlement_methods || {
        bank_transfer: true,
        usdc: false,
        usdt: false
    });
    const [primary, setPrimary] = useState(merchant?.primary_settlement_method || 'bank_transfer');

    const settlementOptions = [
        {
            id: 'bank_transfer',
            name: 'Bank Transfer',
            icon: Wallet,
            color: 'bg-blue-50 border-blue-200',
            badge: 'Traditional',
            badgeColor: 'bg-blue-100 text-blue-800',
            settlement_time: '1-2 business days',
            fees: '0.5-1%',
            description: 'ACH/Wire to your bank account',
            speed: '24-48 hours',
            min_amount: '$10'
        },
        {
            id: 'usdc',
            name: 'USDC (Stablecoin)',
            icon: Zap,
            color: 'bg-cyan-50 border-cyan-200',
            badge: 'Instant',
            badgeColor: 'bg-cyan-100 text-cyan-800',
            settlement_time: '30 seconds',
            fees: '0.1%',
            description: 'Receive USDC instantly on blockchain',
            speed: 'Instant',
            min_amount: '$1'
        },
        {
            id: 'usdt',
            name: 'USDT (Tether)',
            icon: TrendingUp,
            color: 'bg-emerald-50 border-emerald-200',
            badge: 'Fast',
            badgeColor: 'bg-emerald-100 text-emerald-800',
            settlement_time: '30 seconds',
            fees: '0.15%',
            description: 'Receive USDT on Ethereum/Polygon',
            speed: 'Instant',
            min_amount: '$1'
        }
    ];

    const handleToggle = (id) => {
        setMethods(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleSetPrimary = (id) => {
        if (methods[id]) {
            setPrimary(id);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await base44.entities.Merchant.update(merchant.id, {
                settlement_methods: methods,
                primary_settlement_method: primary
            });
            toast.success('Settlement methods updated!');
            if (onUpdate) onUpdate({ ...merchant, settlement_methods: methods, primary_settlement_method: primary });
        } catch (error) {
            toast.error('Failed to update settlement methods');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Settlement Methods
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-2">Choose how you want to receive payouts</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {settlementOptions.map(option => {
                            const Icon = option.icon;
                            const isEnabled = methods[option.id];
                            const isPrimary = primary === option.id;

                            return (
                                <div
                                    key={option.id}
                                    className={`border-2 rounded-lg p-4 transition-all ${option.color} ${isPrimary ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-5 w-5 text-slate-700" />
                                            <h3 className="font-semibold text-slate-900">{option.name}</h3>
                                        </div>
                                        <Badge className={option.badgeColor} variant="outline">
                                            {option.badge}
                                        </Badge>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-slate-600 mb-3">{option.description}</p>

                                    {/* Details Grid */}
                                    <div className="space-y-2 mb-4 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Settlement Time:</span>
                                            <span className="font-medium text-slate-900">{option.settlement_time}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Fees:</span>
                                            <span className="font-medium text-emerald-600">{option.fees}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Min Amount:</span>
                                            <span className="font-medium text-slate-900">{option.min_amount}</span>
                                        </div>
                                    </div>

                                    {/* Toggle */}
                                    <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                                        <Label htmlFor={`toggle-${option.id}`} className="cursor-pointer">
                                            Enable
                                        </Label>
                                        <Switch
                                            id={`toggle-${option.id}`}
                                            checked={isEnabled}
                                            onCheckedChange={() => handleToggle(option.id)}
                                        />
                                    </div>

                                    {/* Primary Badge */}
                                    {isEnabled && (
                                        <button
                                            onClick={() => handleSetPrimary(option.id)}
                                            className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                isPrimary
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                            }`}
                                        >
                                            {isPrimary ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Check className="h-4 w-4" />
                                                    Primary Method
                                                </span>
                                            ) : (
                                                'Set as Primary'
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                        <p className="font-medium mb-1">💡 Pro Tip:</p>
                        <p>Use USDC for instant settlements and lower fees. Switch to bank transfer if you need to withdraw to traditional accounts.</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Saving...' : 'Save Settlement Methods'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}