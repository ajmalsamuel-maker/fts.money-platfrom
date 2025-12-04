import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, DollarSign, Percent, CreditCard, Building2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const transactionTypes = [
    { id: 'sale', name: 'Sale', description: 'Standard purchase transaction' },
    { id: 'auth', name: 'Authorization', description: 'Pre-authorization hold' },
    { id: 'capture', name: 'Capture', description: 'Capture authorized amount' },
    { id: 'refund', name: 'Refund', description: 'Return funds to customer' },
    { id: 'void', name: 'Void', description: 'Cancel transaction' },
    { id: 'chargeback', name: 'Chargeback', description: 'Disputed transaction' },
    { id: 'payout', name: 'Payout', description: 'Funds transfer out' },
];

const defaultPaymentMethods = [
    { id: 'visa', name: 'Visa', baseFee: 1.65, baseFixed: 0.10 },
    { id: 'mastercard', name: 'Mastercard', baseFee: 1.70, baseFixed: 0.10 },
    { id: 'amex', name: 'American Express', baseFee: 2.50, baseFixed: 0.15 },
    { id: 'discover', name: 'Discover', baseFee: 1.80, baseFixed: 0.10 },
    { id: 'apple_pay', name: 'Apple Pay', baseFee: 1.65, baseFixed: 0.10 },
    { id: 'google_pay', name: 'Google Pay', baseFee: 1.65, baseFixed: 0.10 },
    { id: 'paypal', name: 'PayPal', baseFee: 2.90, baseFixed: 0.30 },
    { id: 'klarna', name: 'Klarna', baseFee: 3.29, baseFixed: 0.30 },
    { id: 'usdt', name: 'USDT', baseFee: 1.00, baseFixed: 0.00 },
    { id: 'usdc', name: 'USDC', baseFee: 1.00, baseFixed: 0.00 },
    { id: 'btc', name: 'Bitcoin', baseFee: 1.50, baseFixed: 0.00 },
    { id: 'eth', name: 'Ethereum', baseFee: 1.50, baseFixed: 0.00 },
    { id: 'bank_transfer', name: 'Bank Transfer', baseFee: 0.80, baseFixed: 0.25 },
    { id: 'sepa', name: 'SEPA', baseFee: 0.35, baseFixed: 0.20 },
];

export default function MerchantPricingForm({ data, onChange, connectors = [], errors }) {
    const [activeTab, setActiveTab] = useState('transaction');

    const pricing = data || {
        pricing_model: 'blended',
        transaction_fees: {},
        payment_method_fees: [],
        connector_fees: [],
        monthly_minimum: 0,
        monthly_fee: 0,
        setup_fee: 0,
        pci_compliance_fee: 0,
        chargeback_fee: 25,
        refund_fee: 0,
    };

    const updatePricing = (updates) => {
        onChange({ ...pricing, ...updates });
    };

    const updateTransactionFee = (txnType, field, value) => {
        const fees = { ...pricing.transaction_fees };
        if (!fees[txnType]) fees[txnType] = { percentage: 0, fixed: 0, enabled: true };
        fees[txnType][field] = field === 'enabled' ? value : parseFloat(value) || 0;
        updatePricing({ transaction_fees: fees });
    };

    const updatePaymentMethodFee = (methodId, field, value) => {
        const fees = [...(pricing.payment_method_fees || [])];
        const idx = fees.findIndex(f => f.method_id === methodId);
        if (idx >= 0) {
            fees[idx] = { ...fees[idx], [field]: field === 'enabled' ? value : parseFloat(value) || 0 };
        } else {
            const base = defaultPaymentMethods.find(m => m.id === methodId);
            fees.push({ method_id: methodId, name: base?.name || methodId, base_percentage: base?.baseFee || 0, base_fixed: base?.baseFixed || 0, markup_percentage: 0, markup_fixed: 0, enabled: true, [field]: field === 'enabled' ? value : parseFloat(value) || 0 });
        }
        updatePricing({ payment_method_fees: fees });
    };

    const updateConnectorFee = (connectorId, field, value) => {
        const fees = [...(pricing.connector_fees || [])];
        const idx = fees.findIndex(f => f.connector_id === connectorId);
        if (idx >= 0) {
            fees[idx] = { ...fees[idx], [field]: field === 'enabled' ? value : parseFloat(value) || 0 };
        } else {
            const conn = connectors.find(c => c.processor_id === connectorId);
            fees.push({ connector_id: connectorId, name: conn?.name || connectorId, base_percentage: conn?.base_fee_percentage || 0, base_fixed: conn?.fixed_fee || 0, markup_percentage: 0, markup_fixed: 0, enabled: true, [field]: field === 'enabled' ? value : parseFloat(value) || 0 });
        }
        updatePricing({ connector_fees: fees });
    };

    const getMethodFee = (methodId) => {
        return pricing.payment_method_fees?.find(f => f.method_id === methodId) || {};
    };

    const getConnectorFee = (connectorId) => {
        return pricing.connector_fees?.find(f => f.connector_id === connectorId) || {};
    };

    return (
        <div className="space-y-6">
            {/* Pricing Model Selection */}
            <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" />Pricing Model</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['flat', 'interchange_plus', 'tiered', 'blended'].map((model) => (
                            <button key={model} onClick={() => updatePricing({ pricing_model: model })} className={cn("p-3 border rounded-lg text-left transition-all", pricing.pricing_model === model ? "border-blue-500 bg-blue-50" : "hover:bg-slate-50")}>
                                <p className="font-medium capitalize">{model.replace('_', ' + ')}</p>
                                <p className="text-xs text-slate-500">{model === 'flat' ? 'Fixed rate for all' : model === 'interchange_plus' ? 'Cost + markup' : model === 'tiered' ? 'Volume-based tiers' : 'Single blended rate'}</p>
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div className="space-y-1">
                            <Label className="text-xs">Monthly Fee</Label>
                            <Input type="number" value={pricing.monthly_fee} onChange={(e) => updatePricing({ monthly_fee: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Monthly Minimum</Label>
                            <Input type="number" value={pricing.monthly_minimum} onChange={(e) => updatePricing({ monthly_minimum: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Setup Fee</Label>
                            <Input type="number" value={pricing.setup_fee} onChange={(e) => updatePricing({ setup_fee: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">PCI Compliance Fee</Label>
                            <Input type="number" value={pricing.pci_compliance_fee} onChange={(e) => updatePricing({ pci_compliance_fee: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b">
                {[
                    { id: 'transaction', label: 'Transaction Fees', icon: DollarSign },
                    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                    { id: 'connector', label: 'PSP/Acquirer Fees', icon: Building2 },
                ].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center gap-2 px-4 py-2 border-b-2 transition-all", activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}>
                        <tab.icon className="h-4 w-4" />{tab.label}
                    </button>
                ))}
            </div>

            {/* Transaction Fees */}
            {activeTab === 'transaction' && (
                <Card>
                    <CardHeader><CardTitle className="text-lg">Transaction Type Fees</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Transaction Type</TableHead><TableHead>Percentage (%)</TableHead><TableHead>Fixed Fee ($)</TableHead><TableHead>Enabled</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactionTypes.map((txn) => {
                                    const fee = pricing.transaction_fees?.[txn.id] || { percentage: 0, fixed: 0, enabled: true };
                                    return (
                                        <TableRow key={txn.id}>
                                            <TableCell>
                                                <div><p className="font-medium">{txn.name}</p><p className="text-xs text-slate-500">{txn.description}</p></div>
                                            </TableCell>
                                            <TableCell><Input type="number" step="0.01" value={fee.percentage || ''} onChange={(e) => updateTransactionFee(txn.id, 'percentage', e.target.value)} className="w-24" placeholder="0.00" /></TableCell>
                                            <TableCell><Input type="number" step="0.01" value={fee.fixed || ''} onChange={(e) => updateTransactionFee(txn.id, 'fixed', e.target.value)} className="w-24" placeholder="0.00" /></TableCell>
                                            <TableCell><Switch checked={fee.enabled !== false} onCheckedChange={(c) => updateTransactionFee(txn.id, 'enabled', c)} /></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                            <div className="space-y-1">
                                <Label className="text-xs">Chargeback Fee</Label>
                                <Input type="number" value={pricing.chargeback_fee} onChange={(e) => updatePricing({ chargeback_fee: parseFloat(e.target.value) || 0 })} placeholder="25.00" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Refund Fee</Label>
                                <Input type="number" value={pricing.refund_fee} onChange={(e) => updatePricing({ refund_fee: parseFloat(e.target.value) || 0 })} placeholder="0.00" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Method Fees */}
            {activeTab === 'payment' && (
                <Card>
                    <CardHeader><CardTitle className="text-lg">Payment Method Pricing & Markup</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow><TableHead>Payment Method</TableHead><TableHead>Base %</TableHead><TableHead>Base Fixed</TableHead><TableHead>Markup %</TableHead><TableHead>Markup Fixed</TableHead><TableHead>Total</TableHead><TableHead>Enabled</TableHead></TableRow>
                            </TableHeader>
                            <TableBody>
                                {defaultPaymentMethods.map((method) => {
                                    const fee = getMethodFee(method.id);
                                    const baseP = fee.base_percentage ?? method.baseFee;
                                    const baseF = fee.base_fixed ?? method.baseFixed;
                                    const markupP = fee.markup_percentage || 0;
                                    const markupF = fee.markup_fixed || 0;
                                    return (
                                        <TableRow key={method.id}>
                                            <TableCell className="font-medium">{method.name}</TableCell>
                                            <TableCell className="text-slate-500">{baseP}%</TableCell>
                                            <TableCell className="text-slate-500">${baseF}</TableCell>
                                            <TableCell><Input type="number" step="0.01" value={markupP || ''} onChange={(e) => updatePaymentMethodFee(method.id, 'markup_percentage', e.target.value)} className="w-20" placeholder="0" /></TableCell>
                                            <TableCell><Input type="number" step="0.01" value={markupF || ''} onChange={(e) => updatePaymentMethodFee(method.id, 'markup_fixed', e.target.value)} className="w-20" placeholder="0" /></TableCell>
                                            <TableCell><Badge className="bg-blue-100 text-blue-700">{(baseP + markupP).toFixed(2)}% + ${(baseF + markupF).toFixed(2)}</Badge></TableCell>
                                            <TableCell><Switch checked={fee.enabled !== false} onCheckedChange={(c) => updatePaymentMethodFee(method.id, 'enabled', c)} /></TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Connector/PSP Fees */}
            {activeTab === 'connector' && (
                <Card>
                    <CardHeader><CardTitle className="text-lg">PSP/Acquirer Connector Fees</CardTitle></CardHeader>
                    <CardContent>
                        {connectors.length === 0 ? (
                            <p className="text-center py-8 text-slate-500">No payment processors configured. Add connectors first.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Connector</TableHead><TableHead>Base %</TableHead><TableHead>Base Fixed</TableHead><TableHead>Markup %</TableHead><TableHead>Markup Fixed</TableHead><TableHead>Total</TableHead><TableHead>Enabled</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {connectors.map((conn) => {
                                        const fee = getConnectorFee(conn.processor_id);
                                        const baseP = fee.base_percentage ?? conn.base_fee_percentage ?? 0;
                                        const baseF = fee.base_fixed ?? conn.fixed_fee ?? 0;
                                        const markupP = fee.markup_percentage || 0;
                                        const markupF = fee.markup_fixed || 0;
                                        return (
                                            <TableRow key={conn.processor_id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center"><Building2 className="h-4 w-4 text-slate-500" /></div>
                                                        <div><p className="font-medium">{conn.name}</p><p className="text-xs text-slate-500">{conn.type}</p></div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500">{baseP}%</TableCell>
                                                <TableCell className="text-slate-500">${baseF}</TableCell>
                                                <TableCell><Input type="number" step="0.01" value={markupP || ''} onChange={(e) => updateConnectorFee(conn.processor_id, 'markup_percentage', e.target.value)} className="w-20" placeholder="0" /></TableCell>
                                                <TableCell><Input type="number" step="0.01" value={markupF || ''} onChange={(e) => updateConnectorFee(conn.processor_id, 'markup_fixed', e.target.value)} className="w-20" placeholder="0" /></TableCell>
                                                <TableCell><Badge className="bg-emerald-100 text-emerald-700">{(baseP + markupP).toFixed(2)}% + ${(baseF + markupF).toFixed(2)}</Badge></TableCell>
                                                <TableCell><Switch checked={fee.enabled !== false} onCheckedChange={(c) => updateConnectorFee(conn.processor_id, 'enabled', c)} /></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}