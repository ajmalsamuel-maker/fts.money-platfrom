import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { base44 } from '@/api/base44Client';
import { CheckCircle, AlertTriangle, Loader2, FileText, Send, Calculator } from 'lucide-react';

const EINVOICING_STANDARDS = [
    { code: 'zatca_saudi', name: 'Saudi Arabia (ZATCA)', format: 'UBL 2.1 XML' },
    { code: 'ksef_poland', name: 'Poland (KSeF)', format: 'FA(3) XML' },
    { code: 'peppol_belgium', name: 'Belgium (Peppol)', format: 'UBL 2.1' },
    { code: 'gst_india', name: 'India (GST e-Invoice)', format: 'JSON' },
    { code: 'myinvois_malaysia', name: 'Malaysia (MyInvois)', format: 'UBL/JSON' },
    { code: 'efatura_turkey', name: 'Turkey (e-Fatura)', format: 'UBL-TR 1.2' },
    { code: 'chorus_france', name: 'France (Chorus Pro)', format: 'UBL/CII' },
    { code: 'coretax_indonesia', name: 'Indonesia (Coretax)', format: 'XML' },
    { code: 'gdt_vietnam', name: 'Vietnam (GDT)', format: 'XML' },
    { code: 'nts_korea', name: 'South Korea (NTS)', format: 'XML' },
    { code: 'bir_philippines', name: 'Philippines (BIR)', format: 'XML' },
    { code: 'dian_colombia', name: 'Colombia (DIAN)', format: 'UBL 2.1' },
    { code: 'sunat_peru', name: 'Peru (SUNAT)', format: 'UBL 2.1' },
    { code: 'eta_egypt', name: 'Egypt (ETA)', format: 'JSON/XML' },
    { code: 'fta_uae', name: 'UAE (FTA)', format: 'UBL 2.1/PDF' },
    { code: 'etims_kenya', name: 'Kenya (eTIMS)', format: 'JSON' },
    { code: 'afip_argentina', name: 'Argentina (AFIP)', format: 'XML' },
    { code: 'cfe_uruguay', name: 'Uruguay (CFE)', format: 'XML' },
    { code: 'jqis_japan', name: 'Japan (JQIS)', format: 'Digital' },
    { code: 'etax_thailand', name: 'Thailand (e-Tax)', format: 'XML' },
    { code: 'peppol_australia', name: 'Australia (Peppol)', format: 'UBL' },
    { code: 'erca_ethiopia', name: 'Ethiopia (ERCA)', format: 'JSON/XML' },
    { code: 'vfd_tanzania', name: 'Tanzania (VFD)', format: 'JSON' }
];

export default function EInvoiceGenerator() {
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('input');
    const [processing, setProcessing] = useState(false);
    const [calculatedTax, setCalculatedTax] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);

    const [invoiceData, setInvoiceData] = useState({
        standard: '',
        invoiceNumber: '',
        issueDate: new Date().toISOString().split('T')[0],
        sellerCountry: '',
        buyerCountry: '',
        sellerTaxId: '',
        buyerTaxId: '',
        amount: '',
        currency: 'USD',
        buyerType: 'B2B',
        description: '',
        lineItems: []
    });

    const handleInputChange = (field, value) => {
        setInvoiceData(prev => ({ ...prev, [field]: value }));
    };

    const calculateTax = async () => {
        setProcessing(true);
        try {
            const response = await base44.functions.invoke('globalTaxCalculationEngine', {
                seller_country: invoiceData.sellerCountry,
                buyer_country: invoiceData.buyerCountry,
                amount: parseFloat(invoiceData.amount),
                currency: invoiceData.currency,
                buyer_type: invoiceData.buyerType,
                product_category: 'standard'
            });
            setCalculatedTax(response.data);
            setActiveTab('tax');
        } catch (error) {
            console.error('Tax calculation error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const validateInvoice = async () => {
        setProcessing(true);
        try {
            const response = await base44.functions.invoke('validateEInvoiceData', {
                standard: invoiceData.standard,
                data: {
                    InvoiceNumber: invoiceData.invoiceNumber,
                    IssueDate: invoiceData.issueDate,
                    SellerTaxID: invoiceData.sellerTaxId,
                    BuyerTaxID: invoiceData.buyerTaxId,
                    TotalAmount: parseFloat(invoiceData.amount),
                    TaxAmount: calculatedTax?.tax_amount || 0,
                    Currency: invoiceData.currency
                }
            });
            setValidationResult(response.data);
            setActiveTab('validation');
        } catch (error) {
            console.error('Validation error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const submitInvoice = async () => {
        setProcessing(true);
        try {
            const response = await base44.functions.invoke('submitEInvoice', {
                standard: invoiceData.standard,
                invoice_data: {
                    ...invoiceData,
                    tax_calculation: calculatedTax,
                    validation_result: validationResult
                }
            });
            setSubmissionResult(response.data);
            setActiveTab('submission');
        } catch (error) {
            console.error('Submission error:', error);
            setSubmissionResult({ 
                success: false, 
                error: error.message 
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="EInvoiceGenerator"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">E-Invoice Generator</h1>
                        <p className="text-slate-600 mt-1">Generate compliant e-invoices with automatic tax calculation and validation</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="input">1. Invoice Details</TabsTrigger>
                            <TabsTrigger value="tax" disabled={!calculatedTax}>2. Tax Calculation</TabsTrigger>
                            <TabsTrigger value="validation" disabled={!validationResult}>3. Validation</TabsTrigger>
                            <TabsTrigger value="submission" disabled={!submissionResult}>4. Submission</TabsTrigger>
                        </TabsList>

                        {/* Input Tab */}
                        <TabsContent value="input">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoice Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>E-Invoicing Standard *</Label>
                                            <Select value={invoiceData.standard} onValueChange={(v) => handleInputChange('standard', v)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select standard" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EINVOICING_STANDARDS.map(std => (
                                                        <SelectItem key={std.code} value={std.code}>
                                                            {std.name} ({std.format})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Invoice Number *</Label>
                                            <Input 
                                                value={invoiceData.invoiceNumber}
                                                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                                placeholder="INV-2026-001"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Issue Date *</Label>
                                            <Input 
                                                type="date"
                                                value={invoiceData.issueDate}
                                                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Currency *</Label>
                                            <Select value={invoiceData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="EUR">EUR</SelectItem>
                                                    <SelectItem value="GBP">GBP</SelectItem>
                                                    <SelectItem value="SAR">SAR</SelectItem>
                                                    <SelectItem value="INR">INR</SelectItem>
                                                    <SelectItem value="MYR">MYR</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Seller Country *</Label>
                                            <Input 
                                                value={invoiceData.sellerCountry}
                                                onChange={(e) => handleInputChange('sellerCountry', e.target.value)}
                                                placeholder="US"
                                                maxLength={2}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Buyer Country *</Label>
                                            <Input 
                                                value={invoiceData.buyerCountry}
                                                onChange={(e) => handleInputChange('buyerCountry', e.target.value)}
                                                placeholder="SA"
                                                maxLength={2}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Seller Tax ID *</Label>
                                            <Input 
                                                value={invoiceData.sellerTaxId}
                                                onChange={(e) => handleInputChange('sellerTaxId', e.target.value)}
                                                placeholder="Tax ID"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Buyer Tax ID *</Label>
                                            <Input 
                                                value={invoiceData.buyerTaxId}
                                                onChange={(e) => handleInputChange('buyerTaxId', e.target.value)}
                                                placeholder="Tax ID"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Amount *</Label>
                                            <Input 
                                                type="number"
                                                value={invoiceData.amount}
                                                onChange={(e) => handleInputChange('amount', e.target.value)}
                                                placeholder="1000.00"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Buyer Type *</Label>
                                            <Select value={invoiceData.buyerType} onValueChange={(v) => handleInputChange('buyerType', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="B2B">B2B (Business)</SelectItem>
                                                    <SelectItem value="B2C">B2C (Consumer)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea 
                                            value={invoiceData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Invoice description..."
                                            rows={3}
                                        />
                                    </div>

                                    <Button 
                                        onClick={calculateTax}
                                        disabled={processing || !invoiceData.standard || !invoiceData.amount}
                                        className="w-full"
                                    >
                                        {processing ? (
                                            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Calculating...</>
                                        ) : (
                                            <><Calculator className="h-4 w-4 mr-2" /> Calculate Tax & Continue</>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Tax Calculation Tab */}
                        <TabsContent value="tax">
                            {calculatedTax && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tax Calculation Results</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <div className="text-sm text-slate-600">Tax Type</div>
                                                <div className="text-xl font-bold">{calculatedTax.tax_type}</div>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <div className="text-sm text-slate-600">Tax Rate</div>
                                                <div className="text-xl font-bold">{calculatedTax.tax_rate}%</div>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <div className="text-sm text-slate-600">Tax Amount</div>
                                                <div className="text-xl font-bold">{calculatedTax.tax_amount} {calculatedTax.currency}</div>
                                            </div>
                                            <div className="p-4 bg-orange-50 rounded-lg">
                                                <div className="text-sm text-slate-600">Total Amount</div>
                                                <div className="text-xl font-bold">{calculatedTax.total_amount} {calculatedTax.currency}</div>
                                            </div>
                                        </div>

                                        <Alert>
                                            <AlertDescription>
                                                <strong>Tax Treatment:</strong> {calculatedTax.tax_treatment}
                                            </AlertDescription>
                                        </Alert>

                                        <Button 
                                            onClick={validateInvoice}
                                            disabled={processing}
                                            className="w-full"
                                        >
                                            {processing ? (
                                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Validating...</>
                                            ) : (
                                                <><FileText className="h-4 w-4 mr-2" /> Validate Invoice</>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Validation Tab */}
                        <TabsContent value="validation">
                            {validationResult && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {validationResult.valid ? (
                                                <><CheckCircle className="h-6 w-6 text-green-600" /> Validation Passed</>
                                            ) : (
                                                <><AlertTriangle className="h-6 w-6 text-red-600" /> Validation Failed</>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {validationResult.errors?.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="font-semibold text-red-600">Errors:</div>
                                                {validationResult.errors.map((error, idx) => (
                                                    <Alert key={idx} variant="destructive">
                                                        <AlertDescription>{error}</AlertDescription>
                                                    </Alert>
                                                ))}
                                            </div>
                                        )}

                                        {validationResult.warnings?.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="font-semibold text-orange-600">Warnings:</div>
                                                {validationResult.warnings.map((warning, idx) => (
                                                    <Alert key={idx}>
                                                        <AlertDescription>{warning}</AlertDescription>
                                                    </Alert>
                                                ))}
                                            </div>
                                        )}

                                        {validationResult.valid && (
                                            <Button 
                                                onClick={submitInvoice}
                                                disabled={processing}
                                                className="w-full bg-green-600 hover:bg-green-700"
                                            >
                                                {processing ? (
                                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                                                ) : (
                                                    <><Send className="h-4 w-4 mr-2" /> Submit E-Invoice</>
                                                )}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Submission Tab */}
                        <TabsContent value="submission">
                            {submissionResult && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            {submissionResult.success ? (
                                                <><CheckCircle className="h-6 w-6 text-green-600" /> Submission Successful</>
                                            ) : (
                                                <><AlertTriangle className="h-6 w-6 text-red-600" /> Submission Failed</>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {submissionResult.success ? (
                                            <>
                                                <Alert className="bg-green-50 border-green-200">
                                                    <AlertDescription>
                                                        Your e-invoice has been successfully submitted to {invoiceData.standard}
                                                    </AlertDescription>
                                                </Alert>

                                                {submissionResult.reference_number && (
                                                    <div className="p-4 bg-slate-50 rounded-lg">
                                                        <div className="text-sm text-slate-600">Reference Number</div>
                                                        <div className="text-lg font-mono font-bold">{submissionResult.reference_number}</div>
                                                    </div>
                                                )}

                                                {submissionResult.qr_code && (
                                                    <div className="p-4 bg-slate-50 rounded-lg">
                                                        <div className="text-sm text-slate-600 mb-2">QR Code</div>
                                                        <div className="font-mono text-xs break-all">{submissionResult.qr_code}</div>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <Alert variant="destructive">
                                                <AlertDescription>{submissionResult.error}</AlertDescription>
                                            </Alert>
                                        )}

                                        <Button 
                                            onClick={() => {
                                                setInvoiceData({
                                                    standard: '',
                                                    invoiceNumber: '',
                                                    issueDate: new Date().toISOString().split('T')[0],
                                                    sellerCountry: '',
                                                    buyerCountry: '',
                                                    sellerTaxId: '',
                                                    buyerTaxId: '',
                                                    amount: '',
                                                    currency: 'USD',
                                                    buyerType: 'B2B',
                                                    description: '',
                                                    lineItems: []
                                                });
                                                setCalculatedTax(null);
                                                setValidationResult(null);
                                                setSubmissionResult(null);
                                                setActiveTab('input');
                                            }}
                                            className="w-full"
                                            variant="outline"
                                        >
                                            Create New Invoice
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}