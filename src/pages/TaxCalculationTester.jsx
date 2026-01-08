import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { base44 } from '@/api/base44Client';
import { Calculator, Zap, Globe, Shield, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'IE', name: 'Ireland' },
    { code: 'AT', name: 'Austria' },
    { code: 'SE', name: 'Sweden' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'NO', name: 'Norway' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'SG', name: 'Singapore' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'AE', name: 'UAE' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'TR', name: 'Turkey' },
    { code: 'RU', name: 'Russia' },
    { code: 'IL', name: 'Israel' },
    { code: 'EG', name: 'Egypt' },
];

export default function TaxCalculationTester() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    
    const [params, setParams] = useState({
        seller_country: 'US',
        buyer_country: 'GB',
        amount: 1000,
        currency: 'USD',
        product_category: 'digital_services',
        buyer_type: 'B2C',
        buyer_vat_number: '',
        seller_vat_number: '',
        is_export: false,
        sez_location: '',
        is_luxury: false
    });

    const calculateTax = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('globalTaxCalculationEngine', params);
            setResult(response.data.calculation);
        } catch (error) {
            alert('Calculation error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="TaxCalculationTester"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tax Calculation Engine Tester</h1>
                        <p className="text-slate-600">Test complex tax scenarios including product categories, SEZs, cross-border rules, and VAT MOSS</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Input Form */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction Parameters</CardTitle>
                                <CardDescription>Configure test scenario</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Seller Country *</Label>
                                        <Select value={params.seller_country} onValueChange={(v) => setParams({...params, seller_country: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COUNTRIES.map(country => (
                                                    <SelectItem key={country.code} value={country.code}>
                                                        {country.code} - {country.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Buyer Country *</Label>
                                        <Select value={params.buyer_country} onValueChange={(v) => setParams({...params, buyer_country: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {COUNTRIES.map(country => (
                                                    <SelectItem key={country.code} value={country.code}>
                                                        {country.code} - {country.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Amount *</Label>
                                        <Input 
                                            type="number"
                                            value={params.amount}
                                            onChange={(e) => setParams({...params, amount: parseFloat(e.target.value)})}
                                            placeholder="1000.00"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Select value={params.currency} onValueChange={(v) => setParams({...params, currency: v})}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">USD</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                                <SelectItem value="GBP">GBP</SelectItem>
                                                <SelectItem value="SGD">SGD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Product Category</Label>
                                    <Select value={params.product_category} onValueChange={(v) => setParams({...params, product_category: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="digital_services">Digital Services</SelectItem>
                                            <SelectItem value="luxury_goods">Luxury Goods</SelectItem>
                                            <SelectItem value="food">Food</SelectItem>
                                            <SelectItem value="medicine">Medicine</SelectItem>
                                            <SelectItem value="books">Books</SelectItem>
                                            <SelectItem value="education">Education</SelectItem>
                                            <SelectItem value="health_services">Health Services</SelectItem>
                                            <SelectItem value="financial_services">Financial Services</SelectItem>
                                            <SelectItem value="real_estate">Real Estate</SelectItem>
                                            <SelectItem value="agriculture">Agriculture</SelectItem>
                                            <SelectItem value="children_clothing">Children Clothing</SelectItem>
                                            <SelectItem value="newspapers">Newspapers</SelectItem>
                                            <SelectItem value="construction">Construction</SelectItem>
                                            <SelectItem value="general">General Goods</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Buyer Type</Label>
                                    <Select value={params.buyer_type} onValueChange={(v) => setParams({...params, buyer_type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="B2C">B2C (Consumer)</SelectItem>
                                            <SelectItem value="B2B">B2B (Business)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {params.buyer_type === 'B2B' && (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Buyer VAT Number</Label>
                                            <Input 
                                                value={params.buyer_vat_number}
                                                onChange={(e) => setParams({...params, buyer_vat_number: e.target.value})}
                                                placeholder="GB123456789"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Seller VAT Number</Label>
                                            <Input 
                                                value={params.seller_vat_number}
                                                onChange={(e) => setParams({...params, seller_vat_number: e.target.value})}
                                                placeholder="US987654321"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>SEZ Location (optional)</Label>
                                    <Input 
                                        value={params.sez_location}
                                        onChange={(e) => setParams({...params, sez_location: e.target.value})}
                                        placeholder="e.g., DIFC, NEOM, Free Zone..."
                                    />
                                    <p className="text-xs text-slate-500">Enter SEZ name to test special economic zone rates</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox"
                                            checked={params.is_export}
                                            onChange={(e) => setParams({...params, is_export: e.target.checked})}
                                            className="h-4 w-4"
                                        />
                                        <Label>Is Export</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox"
                                            checked={params.is_luxury}
                                            onChange={(e) => setParams({...params, is_luxury: e.target.checked})}
                                            className="h-4 w-4"
                                        />
                                        <Label>Luxury Item (10% surcharge)</Label>
                                    </div>
                                </div>

                                <Button 
                                    onClick={calculateTax}
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    size="lg"
                                >
                                    <Calculator className="h-5 w-5 mr-2" />
                                    Calculate Tax
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Results */}
                        <div className="space-y-4">
                            {result ? (
                                <>
                                    <Card className="border-green-200 bg-green-50">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-green-900">
                                                <CheckCircle className="h-5 w-5" />
                                                Calculation Result
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs text-slate-600">Subtotal</Label>
                                                    <div className="text-2xl font-bold text-slate-900">
                                                        {result.currency} {result.subtotal.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-600">Tax Amount</Label>
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {result.currency} {result.taxAmount.toFixed(2)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-600">Tax Rate</Label>
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {result.taxRate}%
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-600">Total</Label>
                                                    <div className="text-2xl font-bold text-slate-900">
                                                        {result.currency} {result.total.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {result.luxurySurcharge > 0 && (
                                                <Alert className="bg-purple-50 border-purple-200">
                                                    <TrendingUp className="h-4 w-4 text-purple-600" />
                                                    <AlertDescription className="text-purple-800">
                                                        Luxury surcharge: {result.currency} {result.luxurySurcharge.toFixed(2)}
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {result.reverseCharge && (
                                                <Alert className="bg-blue-50 border-blue-200">
                                                    <Shield className="h-4 w-4 text-blue-600" />
                                                    <AlertDescription className="text-blue-800">
                                                        <strong>Reverse Charge Applies:</strong> Buyer is liable for tax in their country
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {result.exemptReason && (
                                                <Alert className="bg-yellow-50 border-yellow-200">
                                                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                    <AlertDescription className="text-yellow-800">
                                                        <strong>Exemption:</strong> {result.exemptReason}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Tax Breakdown</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <Label className="text-xs text-slate-600">Tax Type</Label>
                                                    <div className="font-medium">{result.taxType}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-600">Tax Jurisdiction</Label>
                                                    <div className="font-medium">{result.taxJurisdiction}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-600">Place of Supply</Label>
                                                    <div className="font-medium">{result.placeOfSupply}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-slate-600">Supply Rule</Label>
                                                    <div className="font-medium text-xs">{result.breakdown.place_of_supply_rule}</div>
                                                </div>
                                            </div>

                                            <div className="pt-3 border-t">
                                                <Label className="text-xs text-slate-600 mb-2 block">Applicable Rule</Label>
                                                <Badge className="bg-blue-100 text-blue-800">
                                                    {result.breakdown.applicable_rule}
                                                </Badge>
                                            </div>

                                            <div className="pt-3 border-t space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Seller Country:</span>
                                                    <span className="font-medium">{result.breakdown.seller_country}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Buyer Country:</span>
                                                    <span className="font-medium">{result.breakdown.buyer_country}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Transaction Type:</span>
                                                    <span className="font-medium">{result.breakdown.buyer_type}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">Product Category:</span>
                                                    <span className="font-medium">{result.breakdown.product_category || 'General'}</span>
                                                </div>
                                                {result.breakdown.sez_location && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-600">SEZ Location:</span>
                                                        <span className="font-medium">{result.breakdown.sez_location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Example Scenarios */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Quick Test Scenarios</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start"
                                                onClick={() => setParams({
                                                    seller_country: 'DE',
                                                    buyer_country: 'FR',
                                                    amount: 1000,
                                                    buyer_type: 'B2B',
                                                    buyer_vat_number: 'FR123456789',
                                                    product_category: 'digital_services',
                                                    is_export: false,
                                                    sez_location: '',
                                                    is_luxury: false
                                                })}
                                            >
                                                EU B2B Digital Services
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start"
                                                onClick={() => setParams({
                                                    seller_country: 'AE',
                                                    buyer_country: 'AE',
                                                    amount: 5000,
                                                    buyer_type: 'B2C',
                                                    product_category: 'general',
                                                    sez_location: 'DIFC',
                                                    is_export: false,
                                                    is_luxury: false
                                                })}
                                            >
                                                UAE SEZ (DIFC) Transaction
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start"
                                                onClick={() => setParams({
                                                    seller_country: 'US',
                                                    buyer_country: 'GB',
                                                    amount: 2500,
                                                    buyer_type: 'B2C',
                                                    product_category: 'luxury_goods',
                                                    is_luxury: true,
                                                    is_export: false,
                                                    sez_location: ''
                                                })}
                                            >
                                                Luxury Goods + Surcharge
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start"
                                                onClick={() => setParams({
                                                    seller_country: 'GB',
                                                    buyer_country: 'GB',
                                                    amount: 100,
                                                    buyer_type: 'B2C',
                                                    product_category: 'medicine',
                                                    is_export: false,
                                                    sez_location: '',
                                                    is_luxury: false
                                                })}
                                            >
                                                Zero-Rated Medicine (UK)
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                className="w-full justify-start"
                                                onClick={() => setParams({
                                                    seller_country: 'SG',
                                                    buyer_country: 'US',
                                                    amount: 5000,
                                                    buyer_type: 'B2B',
                                                    buyer_vat_number: 'US123456',
                                                    product_category: 'digital_services',
                                                    is_export: false,
                                                    sez_location: ''
                                                })}
                                            >
                                                Cross-Border B2B Digital
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <Card className="lg:row-span-2">
                                    <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                                        <div className="text-center text-slate-500">
                                            <Calculator className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                            <p className="text-lg font-medium">No Calculation Yet</p>
                                            <p className="text-sm">Configure parameters and click "Calculate Tax"</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    {/* Features Overview */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Supported Features</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex gap-3">
                                    <Globe className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-sm">Cross-Border Rules</div>
                                        <p className="text-xs text-slate-600">VAT MOSS, place of supply, origin/destination principles</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-sm">Reverse Charge</div>
                                        <p className="text-xs text-slate-600">EU intra-community, B2B imports, specific categories</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Zap className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-sm">SEZ & Free Zones</div>
                                        <p className="text-xs text-slate-600">0% or reduced rates in special economic zones</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <TrendingUp className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-sm">Product Categories</div>
                                        <p className="text-xs text-slate-600">Digital, luxury, food, medicine, books, education</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-sm">Exemptions</div>
                                        <p className="text-xs text-slate-600">Financial, insurance, health, education, exports</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Globe className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-medium text-sm">157 Countries</div>
                                        <p className="text-xs text-slate-600">Global coverage with granular rules</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}