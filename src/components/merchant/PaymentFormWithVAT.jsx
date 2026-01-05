import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import VATBreakdown from '@/components/transaction/VATBreakdown';
import { calculateTransactionVAT } from '@/components/transaction/VATCalculator';
import { Loader2 } from 'lucide-react';

export default function PaymentFormWithVAT({ merchantId, pspCode, onSubmit }) {
    const [amount, setAmount] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCountry, setCustomerCountry] = useState('');
    const [vatData, setVatData] = useState(null);
    const [calculating, setCalculating] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Auto-calculate VAT when amount or country changes
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (amount && parseFloat(amount) > 0) {
                setCalculating(true);
                const result = await calculateTransactionVAT({
                    amount: parseFloat(amount),
                    merchant_id: merchantId,
                    psp_code: pspCode,
                    customer_country: customerCountry || 'US',
                    customer_email: customerEmail,
                    merchant_category: 'DIGITAL_SERVICES'
                });
                setVatData(result);
                setCalculating(false);
            }
        }, 500); // Debounce

        return () => clearTimeout(timer);
    }, [amount, customerCountry, merchantId, pspCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        const transactionData = {
            amount: parseFloat(amount),
            merchant_id: merchantId,
            psp_code: pspCode,
            customer_email: customerEmail,
            customer_country: customerCountry,
            type: 'sale',
            status: 'pending',
            currency: 'USD',
            // VAT data will be calculated server-side
            tax_category: 'DIGITAL_SERVICES'
        };

        await onSubmit(transactionData, vatData);
        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Amount *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="100.00"
                            required
                        />
                    </div>

                    <div>
                        <Label>Customer Email *</Label>
                        <Input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            placeholder="customer@example.com"
                            required
                        />
                    </div>

                    <div>
                        <Label>Customer Country</Label>
                        <Input
                            value={customerCountry}
                            onChange={(e) => setCustomerCountry(e.target.value.toUpperCase())}
                            placeholder="US, GB, FR"
                            maxLength={2}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* VAT Calculation */}
            {calculating && (
                <Card className="bg-slate-50">
                    <CardContent className="py-4 flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-slate-600">Calculating VAT...</span>
                    </CardContent>
                </Card>
            )}

            {vatData && !calculating && (
                <VATBreakdown vatData={vatData} />
            )}

            <Button 
                type="submit" 
                className="w-full"
                disabled={!amount || !customerEmail || processing || calculating}
            >
                {processing ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    `Pay ${vatData?.gross_amount ? `$${vatData.gross_amount.toFixed(2)}` : ''}`
                )}
            </Button>
        </form>
    );
}