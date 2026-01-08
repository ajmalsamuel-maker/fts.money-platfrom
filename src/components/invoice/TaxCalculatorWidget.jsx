import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TaxCalculatorWidget() {
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState(null);
    const [formData, setFormData] = useState({
        seller_country: 'DE',
        buyer_country: 'FR',
        amount: '',
        currency: 'EUR',
        product_category: 'standard',
        buyer_type: 'B2C',
        buyer_vat_number: '',
        is_export: false
    });

    const countries = [
        { code: 'DE', name: 'Germany' },
        { code: 'FR', name: 'France' },
        { code: 'IT', name: 'Italy' },
        { code: 'ES', name: 'Spain' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'BE', name: 'Belgium' },
        { code: 'PL', name: 'Poland' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' },
        { code: 'IN', name: 'India' },
        { code: 'SG', name: 'Singapore' },
        { code: 'MY', name: 'Malaysia' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'AE', name: 'UAE' },
        { code: 'PK', name: 'Pakistan' }
    ];

    const handleCalculate = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            return;
        }

        setCalculating(true);
        try {
            const response = await base44.functions.invoke('globalTaxCalculationEngine', {
                ...formData,
                amount: parseFloat(formData.amount)
            });

            setResult(response.data.calculation);
        } catch (error) {
            console.error('Tax calculation error:', error);
            alert('Failed to calculate tax: ' + error.message);
        } finally {
            setCalculating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Real-Time Tax Calculator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Seller Country</Label>
                        <Select value={formData.seller_country} onValueChange={(value) => setFormData({...formData, seller_country: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map(c => (
                                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Buyer Country</Label>
                        <Select value={formData.buyer_country} onValueChange={(value) => setFormData({...formData, buyer_country: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map(c => (
                                    <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Amount</Label>
                        <Input 
                            type="number" 
                            placeholder="1000.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        />
                    </div>

                    <div>
                        <Label>Currency</Label>
                        <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="INR">INR</SelectItem>
                                <SelectItem value="MYR">MYR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Buyer Type</Label>
                        <Select value={formData.buyer_type} onValueChange={(value) => setFormData({...formData, buyer_type: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="B2C">B2C (Consumer)</SelectItem>
                                <SelectItem value="B2B">B2B (Business)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Product Category</Label>
                        <Select value={formData.product_category} onValueChange={(value) => setFormData({...formData, product_category: value})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="digital_services">Digital Services</SelectItem>
                                <SelectItem value="food">Food</SelectItem>
                                <SelectItem value="medicine">Medicine</SelectItem>
                                <SelectItem value="books">Books</SelectItem>
                                <SelectItem value="education">Education</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {formData.buyer_type === 'B2B' && (
                    <div>
                        <Label>Buyer VAT Number (optional)</Label>
                        <Input 
                            placeholder="EU12345678"
                            value={formData.buyer_vat_number}
                            onChange={(e) => setFormData({...formData, buyer_vat_number: e.target.value})}
                        />
                    </div>
                )}

                <Button 
                    onClick={handleCalculate} 
                    disabled={calculating || !formData.amount}
                    className="w-full"
                >
                    {calculating ? 'Calculating...' : 'Calculate Tax'}
                </Button>

                {result && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between font-semibold">
                                    <span>Tax Type:</span>
                                    <Badge>{result.taxType}</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Tax Rate:</span>
                                    <span className="font-bold">{result.taxRate}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Subtotal:</span>
                                    <span>{result.subtotal} {result.currency}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Tax Amount:</span>
                                    <span className="font-bold">{result.taxAmount} {result.currency}</span>
                                </div>
                                <div className="flex items-center justify-between text-lg font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span>{result.total} {result.currency}</span>
                                </div>
                                {result.reverseCharge && (
                                    <Badge variant="secondary" className="w-full justify-center">
                                        Reverse Charge Applicable
                                    </Badge>
                                )}
                                {result.exemptReason && (
                                    <div className="text-xs text-slate-600">
                                        {result.exemptReason}
                                    </div>
                                )}
                                <div className="text-xs text-slate-500 mt-2">
                                    Tax Jurisdiction: {result.taxJurisdiction}
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}