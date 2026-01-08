import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Calculator, FileText, Send, Loader2, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { getStandardsArray } from '@/components/utils/globalEInvoicingRegistry';

export default function BusinessInvoiceCreate() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [taxResult, setTaxResult] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [submissionResult, setSubmissionResult] = useState(null);

    const [formData, setFormData] = useState({
        standard: '',
        invoice_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        customer_name: '',
        customer_country: '',
        customer_tax_id: '',
        amount: '',
        currency: 'USD',
        description: ''
    });

    const standards = getStandardsArray();

    const calculateTax = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('globalTaxCalculationEngine', {
                seller_country: 'US',
                buyer_country: formData.customer_country,
                amount: parseFloat(formData.amount),
                currency: formData.currency,
                buyer_type: 'B2B'
            });
            setTaxResult(response.data);
            setStep(2);
        } catch (error) {
            console.error('Tax calculation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateInvoice = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('validateEInvoiceData', {
                standard: formData.standard,
                data: {
                    InvoiceNumber: formData.invoice_number,
                    IssueDate: formData.issue_date,
                    BuyerTaxID: formData.customer_tax_id,
                    TotalAmount: parseFloat(formData.amount),
                    TaxAmount: taxResult?.tax_amount || 0,
                    Currency: formData.currency
                }
            });
            setValidationResult(response.data);
            setStep(3);
        } catch (error) {
            console.error('Validation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitInvoice = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('submitEInvoice', {
                standard: formData.standard,
                invoice_data: { ...formData, tax_calculation: taxResult }
            });
            setSubmissionResult(response.data);
            setStep(4);
        } catch (error) {
            setSubmissionResult({ success: false, error: error.message });
            setStep(4);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => window.location.href = createPageUrl('BusinessEInvoicePortal')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Portal
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Create E-Invoice</h1>
                        <p className="text-slate-600 mt-1">Step {step} of 4</p>
                    </div>
                </div>

                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>E-Invoicing Standard *</Label>
                                    <Select value={formData.standard} onValueChange={(v) => setFormData({...formData, standard: v})}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select standard" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {standards.map(std => (
                                                <SelectItem key={std.code} value={std.code}>
                                                    {std.name} • {std.format}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Invoice Number *</Label>
                                    <Input 
                                        value={formData.invoice_number}
                                        onChange={(e) => setFormData({...formData, invoice_number: e.target.value})}
                                        placeholder="INV-2026-001"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Issue Date *</Label>
                                    <Input 
                                        type="date"
                                        value={formData.issue_date}
                                        onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Customer Name *</Label>
                                    <Input 
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                                        placeholder="Customer Company"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Customer Country *</Label>
                                    <Input 
                                        value={formData.customer_country}
                                        onChange={(e) => setFormData({...formData, customer_country: e.target.value})}
                                        placeholder="SA"
                                        maxLength={2}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Customer Tax ID *</Label>
                                    <Input 
                                        value={formData.customer_tax_id}
                                        onChange={(e) => setFormData({...formData, customer_tax_id: e.target.value})}
                                        placeholder="Tax ID"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Amount *</Label>
                                    <Input 
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        placeholder="1000.00"
                                        step="0.01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Currency *</Label>
                                    <Select value={formData.currency} onValueChange={(v) => setFormData({...formData, currency: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="SAR">SAR</SelectItem>
                                            <SelectItem value="INR">INR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Invoice description..."
                                    rows={3}
                                />
                            </div>

                            <Button onClick={calculateTax} disabled={loading || !formData.standard} className="w-full">
                                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Calculating...</> : <><Calculator className="h-4 w-4 mr-2" /> Calculate Tax</>}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && taxResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tax Calculation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-slate-600">Tax Rate</div>
                                    <div className="text-2xl font-bold">{taxResult.tax_rate}%</div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="text-sm text-slate-600">Tax Amount</div>
                                    <div className="text-2xl font-bold">{taxResult.tax_amount} {taxResult.currency}</div>
                                </div>
                            </div>
                            <Button onClick={validateInvoice} disabled={loading} className="w-full">
                                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Validating...</> : <><FileText className="h-4 w-4 mr-2" /> Validate Invoice</>}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && validationResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {validationResult.valid ? <CheckCircle className="h-6 w-6 text-green-600" /> : null}
                                Validation {validationResult.valid ? 'Passed' : 'Failed'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {validationResult.valid && (
                                <Button onClick={submitInvoice} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4 mr-2" /> Submit Invoice</>}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {step === 4 && submissionResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {submissionResult.success ? <CheckCircle className="h-6 w-6 text-green-600" /> : null}
                                {submissionResult.success ? 'Submitted Successfully' : 'Submission Failed'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {submissionResult.success ? (
                                <>
                                    <Alert className="bg-green-50 border-green-200">
                                        <AlertDescription className="text-green-800">
                                            Invoice submitted to {formData.standard}
                                        </AlertDescription>
                                    </Alert>
                                    {submissionResult.reference_number && (
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <div className="text-sm text-slate-600">Reference Number</div>
                                            <div className="text-lg font-mono font-bold">{submissionResult.reference_number}</div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertDescription>{submissionResult.error}</AlertDescription>
                                </Alert>
                            )}
                            <Button variant="outline" className="w-full" onClick={() => window.location.href = createPageUrl('BusinessEInvoicePortal')}>
                                Back to Portal
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}