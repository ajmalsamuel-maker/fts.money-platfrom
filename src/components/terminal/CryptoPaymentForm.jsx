import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Bitcoin, Loader2, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function CryptoPaymentForm({ merchant_id, onSuccess }) {
    const [formData, setFormData] = useState({
        crypto_asset: 'BTC',
        amount_crypto: '',
        amount_fiat: '',
        fiat_currency: 'USD',
        customer_email: '',
        customer_name: '',
        wallet_address: '',
        description: '',
        travel_rule_required: false
    });

    const [processing, setProcessing] = useState(false);
    const [travelRuleData, setTravelRuleData] = useState({
        originator_name: '',
        originator_address: '',
        originator_country: '',
        beneficiary_name: '',
        beneficiary_address: '',
        beneficiary_country: ''
    });

    const { data: blockchainConnectors = [] } = useQuery({
        queryKey: ['blockchainConnectors'],
        queryFn: () => base44.entities.BlockchainConnector.list(),
    });

    const { data: exchangeIntegrations = [] } = useQuery({
        queryKey: ['exchangeIntegrations'],
        queryFn: () => base44.entities.CryptoExchangeIntegration.filter({ status: 'active' }),
    });

    const activeConnector = blockchainConnectors.find(c => 
        c.supported_assets?.includes(formData.crypto_asset) && c.status === 'active'
    );

    const activeExchange = exchangeIntegrations[0];

    const handleAmountChange = async (value, type) => {
        if (type === 'fiat') {
            setFormData(p => ({ ...p, amount_fiat: value }));
            // Simplified conversion - in production, call exchange API for rate
            const rate = formData.crypto_asset === 'BTC' ? 42000 : 2200;
            setFormData(p => ({ ...p, amount_crypto: (parseFloat(value) / rate).toFixed(8) }));
        } else {
            setFormData(p => ({ ...p, amount_crypto: value }));
            const rate = formData.crypto_asset === 'BTC' ? 42000 : 2200;
            setFormData(p => ({ ...p, amount_fiat: (parseFloat(value) * rate).toFixed(2) }));
        }

        // Check Travel Rule threshold
        if (parseFloat(value) >= 1000) {
            setFormData(p => ({ ...p, travel_rule_required: true }));
        } else {
            setFormData(p => ({ ...p, travel_rule_required: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.customer_email || !formData.wallet_address) {
            toast.error('Customer email and wallet address required');
            return;
        }

        if (!activeConnector) {
            toast.error('No active blockchain connector for this asset');
            return;
        }

        if (formData.travel_rule_required) {
            if (!travelRuleData.originator_name || !travelRuleData.beneficiary_name) {
                toast.error('Travel Rule data required for transactions ≥ $1000');
                return;
            }
        }

        setProcessing(true);

        try {
            // Screen for sanctions
            const sanctionsCheck = await base44.functions.invoke('fatfCompliance', {
                action: 'screen_sanctions',
                data: {
                    entity_name: formData.customer_name,
                    country: travelRuleData.originator_country,
                    wallet_address: formData.wallet_address,
                    type: 'customer'
                }
            });

            if (sanctionsCheck.data.screening_result === 'confirmed_match') {
                toast.error('Transaction blocked - sanctions screening');
                setProcessing(false);
                return;
            }

            // Create transaction
            const txnId = `CRYPTO-${Date.now()}`;
            const transaction = await base44.entities.Transaction.create({
                transaction_id: txnId,
                merchant_id,
                type: 'sale',
                status: 'processing',
                amount: parseFloat(formData.amount_fiat),
                currency: formData.fiat_currency,
                payment_method: 'crypto_currency',
                crypto_asset: formData.crypto_asset,
                crypto_address: formData.wallet_address,
                blockchain_network: activeConnector.blockchain_network,
                customer_email: formData.customer_email,
                customer_name: formData.customer_name,
                customer_country: travelRuleData.originator_country,
                description: formData.description
            });

            // Travel Rule compliance
            if (formData.travel_rule_required) {
                await base44.entities.TravelRuleData.create({
                    transaction_id: transaction.id,
                    rule_triggered: true,
                    threshold_currency: formData.fiat_currency,
                    threshold_amount: 1000,
                    originator_name: travelRuleData.originator_name,
                    originator_account: formData.wallet_address,
                    originator_address: travelRuleData.originator_address,
                    originator_country: travelRuleData.originator_country,
                    beneficiary_name: travelRuleData.beneficiary_name,
                    beneficiary_address: travelRuleData.beneficiary_address,
                    beneficiary_country: travelRuleData.beneficiary_country,
                    transfer_direction: 'inbound',
                    compliance_status: 'verified'
                });
            }

            // Send blockchain transaction
            const blockchainTx = await base44.functions.invoke('blockchainConnector', {
                action: 'send_transaction',
                connector_id: activeConnector.connector_id,
                data: {
                    to_address: formData.wallet_address,
                    amount: parseFloat(formData.amount_crypto),
                    asset: formData.crypto_asset,
                    memo: `Payment for ${merchant_id}`
                }
            });

            toast.success('Crypto payment initiated');
            onSuccess && onSuccess(transaction);
            
        } catch (error) {
            toast.error('Crypto payment failed: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bitcoin className="h-5 w-5 text-orange-600" />
                        Crypto Payment
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1">
                                Crypto Asset (ISO 23257)
                                <Shield className="h-3 w-3 text-blue-600" />
                            </Label>
                            <Select value={formData.crypto_asset} onValueChange={(v) => setFormData(p => ({...p, crypto_asset: v}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                                    <SelectItem value="USDT">Tether (USDT)</SelectItem>
                                    <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                                    <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (Crypto)</Label>
                            <Input
                                type="number"
                                step="0.00000001"
                                value={formData.amount_crypto}
                                onChange={(e) => handleAmountChange(e.target.value, 'crypto')}
                                placeholder="0.00000000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fiat Currency</Label>
                            <Select value={formData.fiat_currency} onValueChange={(v) => setFormData(p => ({...p, fiat_currency: v}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount (Fiat) *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.amount_fiat}
                                onChange={(e) => handleAmountChange(e.target.value, 'fiat')}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {formData.travel_rule_required && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900">FATF Travel Rule Applies</p>
                                    <p className="text-xs text-amber-700">Transactions ≥ $1000 require originator & beneficiary data</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Customer Email *</Label>
                        <Input
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => setFormData(p => ({...p, customer_email: e.target.value}))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Customer Name *</Label>
                        <Input
                            value={formData.customer_name}
                            onChange={(e) => setFormData(p => ({...p, customer_name: e.target.value}))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Destination Wallet Address *</Label>
                        <Input
                            value={formData.wallet_address}
                            onChange={(e) => setFormData(p => ({...p, wallet_address: e.target.value}))}
                            placeholder="0x... or bc1..."
                            required
                        />
                    </div>

                    {formData.travel_rule_required && (
                        <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                            <h4 className="font-medium text-sm">Travel Rule Data (FATF Recommendation 16)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-xs">Originator Name *</Label>
                                    <Input
                                        value={travelRuleData.originator_name}
                                        onChange={(e) => setTravelRuleData(p => ({...p, originator_name: e.target.value}))}
                                        className="h-9"
                                        required={formData.travel_rule_required}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Originator Country (ISO 3166-1) *</Label>
                                    <Input
                                        value={travelRuleData.originator_country}
                                        onChange={(e) => setTravelRuleData(p => ({...p, originator_country: e.target.value.toUpperCase()}))}
                                        placeholder="US"
                                        maxLength={2}
                                        className="h-9"
                                        required={formData.travel_rule_required}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-xs">Originator Address</Label>
                                    <Input
                                        value={travelRuleData.originator_address}
                                        onChange={(e) => setTravelRuleData(p => ({...p, originator_address: e.target.value}))}
                                        className="h-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Beneficiary Name *</Label>
                                    <Input
                                        value={travelRuleData.beneficiary_name}
                                        onChange={(e) => setTravelRuleData(p => ({...p, beneficiary_name: e.target.value}))}
                                        className="h-9"
                                        required={formData.travel_rule_required}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Beneficiary Country *</Label>
                                    <Input
                                        value={travelRuleData.beneficiary_country}
                                        onChange={(e) => setTravelRuleData(p => ({...p, beneficiary_country: e.target.value.toUpperCase()}))}
                                        placeholder="US"
                                        maxLength={2}
                                        className="h-9"
                                        required={formData.travel_rule_required}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({...p, description: e.target.value}))}
                            rows={2}
                        />
                    </div>

                    {activeConnector && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-xs font-medium text-blue-900">Blockchain: {activeConnector.blockchain_network}</p>
                            <p className="text-xs text-blue-700">Connector: {activeConnector.connector_name}</p>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={processing || !activeConnector}>
                        {processing ? (
                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing Crypto Payment...</>
                        ) : (
                            <><Bitcoin className="h-4 w-4 mr-2" />Process Crypto Payment</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}