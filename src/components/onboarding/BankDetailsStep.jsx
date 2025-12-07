import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Landmark, AlertCircle, Info, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'SGD', label: 'SGD - Singapore Dollar' },
    { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
];

const settlementPeriods = [
    { value: 'T+0', label: 'Same Day (T+0)' },
    { value: 'T+1', label: 'Next Day (T+1)' },
    { value: 'T+2', label: 'T+2' },
    { value: 'T+3', label: 'T+3' },
    { value: 'T+7', label: 'Weekly (T+7)' },
];

const stablecoins = [
    { id: 'usdt', name: 'USDT (Tether)', networks: ['Ethereum (ERC-20)', 'Tron (TRC-20)', 'Polygon', 'BSC'], logo: '₮' },
    { id: 'usdc', name: 'USDC (USD Coin)', networks: ['Ethereum (ERC-20)', 'Polygon', 'Solana', 'Algorand'], logo: '◎' },
    { id: 'dai', name: 'DAI', networks: ['Ethereum (ERC-20)', 'Polygon', 'BSC'], logo: '◈' },
    { id: 'busd', name: 'BUSD (Binance USD)', networks: ['Ethereum (ERC-20)', 'BSC (BEP-20)'], logo: '◆' },
];

export default function BankDetailsStep({ data, onChange, errors }) {
    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Landmark className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Bank Details</h2>
                    <p className="text-sm text-slate-500">Configure your settlement account</p>
                </div>
            </div>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Settlement funds will be transferred to this bank account. Please ensure all details are accurate to avoid payment delays.
                </AlertDescription>
            </Alert>

            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Primary Settlement Account</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                        <Input
                            id="account_holder_name"
                            value={data.account_holder_name || ''}
                            onChange={(e) => handleChange('account_holder_name', e.target.value)}
                            placeholder="Name as it appears on account"
                            className={errors?.account_holder_name ? 'border-red-500' : ''}
                        />
                        {errors?.account_holder_name && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.account_holder_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bank_name">Bank Name *</Label>
                        <Input
                            id="bank_name"
                            value={data.bank_name || ''}
                            onChange={(e) => handleChange('bank_name', e.target.value)}
                            placeholder="Enter bank name"
                            className={errors?.bank_name ? 'border-red-500' : ''}
                        />
                        {errors?.bank_name && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.bank_name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account_number">Account Number / IBAN *</Label>
                        <Input
                            id="account_number"
                            value={data.account_number || ''}
                            onChange={(e) => handleChange('account_number', e.target.value)}
                            placeholder="Enter account number"
                            className={errors?.account_number ? 'border-red-500' : ''}
                        />
                        {errors?.account_number && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.account_number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="routing_number">Routing Number / Sort Code *</Label>
                        <Input
                            id="routing_number"
                            value={data.routing_number || ''}
                            onChange={(e) => handleChange('routing_number', e.target.value)}
                            placeholder="Enter routing/sort code"
                            className={errors?.routing_number ? 'border-red-500' : ''}
                        />
                        {errors?.routing_number && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.routing_number}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="swift_code">SWIFT / BIC Code *</Label>
                        <Input
                            id="swift_code"
                            value={data.swift_code || ''}
                            onChange={(e) => handleChange('swift_code', e.target.value.toUpperCase())}
                            placeholder="e.g., CHASUS33"
                            className={errors?.swift_code ? 'border-red-500' : ''}
                        />
                        {errors?.swift_code && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.swift_code}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Settlement Currency *</Label>
                        <Select 
                            value={data.settlement_currency || ''} 
                            onValueChange={(val) => handleChange('settlement_currency', val)}
                        >
                            <SelectTrigger className={errors?.settlement_currency ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors?.settlement_currency && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.settlement_currency}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="bank_address">Bank Address</Label>
                        <Input
                            id="bank_address"
                            value={data.bank_address || ''}
                            onChange={(e) => handleChange('bank_address', e.target.value)}
                            placeholder="Enter bank branch address"
                        />
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="font-medium text-slate-900 mb-4">Settlement Preferences</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Preferred Settlement Period *</Label>
                        <Select 
                            value={data.settlement_period || ''} 
                            onValueChange={(val) => handleChange('settlement_period', val)}
                        >
                            <SelectTrigger className={errors?.settlement_period ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select settlement period" />
                            </SelectTrigger>
                            <SelectContent>
                                {settlementPeriods.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors?.settlement_period && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {errors.settlement_period}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="min_settlement">Minimum Settlement Amount</Label>
                        <Input
                            id="min_settlement"
                            type="number"
                            value={data.min_settlement || ''}
                            onChange={(e) => handleChange('min_settlement', e.target.value)}
                            placeholder="e.g., 100"
                        />
                        <p className="text-xs text-slate-500">
                            Leave empty for no minimum threshold
                        </p>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Wallet className="h-5 w-5 text-purple-600" />
                    <div>
                        <h3 className="font-medium text-slate-900">Crypto Settlement (Optional)</h3>
                        <p className="text-xs text-slate-500">Receive settlements in stablecoins</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <Switch 
                        id="enable-crypto"
                        checked={data.crypto_settlement_enabled || false}
                        onCheckedChange={(checked) => handleChange('crypto_settlement_enabled', checked)}
                    />
                    <Label htmlFor="enable-crypto" className="text-sm cursor-pointer">
                        Enable cryptocurrency settlements
                    </Label>
                </div>

                {data.crypto_settlement_enabled && (
                    <div className="space-y-4 pt-4 border-t">
                        <Alert className="bg-purple-50 border-purple-200">
                            <Info className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-purple-700 text-xs">
                                Stablecoin settlements offer instant transfers and lower fees. Ensure wallet addresses are correct - crypto transactions are irreversible.
                            </AlertDescription>
                        </Alert>

                        {stablecoins.map((coin) => (
                            <div key={coin.id} className="space-y-3 p-4 bg-slate-50 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{coin.logo}</span>
                                    <div>
                                        <p className="font-medium text-sm">{coin.name}</p>
                                        <p className="text-xs text-slate-500">Select network and enter wallet address</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Network</Label>
                                        <Select 
                                            value={data[`${coin.id}_network`] || ''} 
                                            onValueChange={(val) => handleChange(`${coin.id}_network`, val)}
                                        >
                                            <SelectTrigger className="h-9 text-sm">
                                                <SelectValue placeholder="Select network" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {coin.networks.map((network) => (
                                                    <SelectItem key={network} value={network} className="text-sm">
                                                        {network}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Wallet Address</Label>
                                        <Input
                                            value={data[`${coin.id}_wallet`] || ''}
                                            onChange={(e) => handleChange(`${coin.id}_wallet`, e.target.value)}
                                            placeholder="0x..."
                                            className="h-9 text-sm font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-2">
                            <Label className="text-sm">Settlement Split Percentage</Label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs text-slate-500">Fiat (Bank)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.fiat_settlement_percent || 100}
                                        onChange={(e) => {
                                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                            handleChange('fiat_settlement_percent', val);
                                            handleChange('crypto_settlement_percent', 100 - val);
                                        }}
                                        className="h-9"
                                    />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs text-slate-500">Crypto (Stablecoin)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.crypto_settlement_percent || 0}
                                        onChange={(e) => {
                                            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                            handleChange('crypto_settlement_percent', val);
                                            handleChange('fiat_settlement_percent', 100 - val);
                                        }}
                                        className="h-9"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                Split settlements between traditional banking and crypto wallets (must total 100%)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm">Preferred Stablecoin for Settlements</Label>
                            <Select 
                                value={data.preferred_stablecoin || ''} 
                                onValueChange={(val) => handleChange('preferred_stablecoin', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select preferred stablecoin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stablecoins.map((coin) => (
                                        <SelectItem key={coin.id} value={coin.id}>
                                            {coin.logo} {coin.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}