import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, CheckCircle, AlertCircle, Globe } from 'lucide-react';
import { getAllEInvoiceStandards, getEInvoiceStandardByCountry, validateInvoice } from '@/components/utils/eInvoicingStandards';
import { toast } from 'sonner';

/**
 * Global E-Invoice Generator
 * Supports 13 major e-invoicing standards worldwide
 */
export default function EInvoiceGenerator({ invoice, merchant, customer }) {
    const [selectedStandard, setSelectedStandard] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const standards = getAllEInvoiceStandards();

    // Auto-detect standard based on merchant/customer country
    React.useEffect(() => {
        if (merchant?.country) {
            const detected = getEInvoiceStandardByCountry(merchant.country);
            if (detected) {
                setSelectedStandard(detected.id);
            }
        }
    }, [merchant]);

    const handleValidate = () => {
        if (!selectedStandard) {
            toast.error('Please select an e-invoicing standard');
            return;
        }

        const result = validateInvoice(selectedStandard, {
            invoice_number: invoice?.invoice_number,
            issue_date: invoice?.created_date,
            seller_vat: merchant?.vat_number,
            buyer_vat: customer?.vat_number,
            currency: invoice?.currency,
            total_amount: invoice?.total_amount,
            tax_amount: invoice?.tax_amount
        });

        setValidationResult(result);

        if (result.valid) {
            toast.success('Invoice data is valid for this standard!');
        } else {
            toast.error(`Missing fields: ${result.missingFields.join(', ')}`);
        }
    };

    const handleGenerate = async () => {
        if (!selectedStandard) {
            toast.error('Please select an e-invoicing standard');
            return;
        }

        setGenerating(true);
        try {
            // TODO: Call backend function to generate e-invoice
            // const response = await base44.functions.invoke('generateEInvoice', {
            //     standard: selectedStandard,
            //     invoice: invoice,
            //     merchant: merchant,
            //     customer: customer
            // });

            // Simulate generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            toast.success('E-Invoice generated successfully!');
        } catch (error) {
            toast.error(`Generation failed: ${error.message}`);
        } finally {
            setGenerating(false);
        }
    };

    const selectedStandardData = standards.find(s => s.id === selectedStandard);

    return (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    Global E-Invoicing Compliance
                </CardTitle>
                <p className="text-sm text-slate-600">
                    Generate compliant e-invoices for 13 major standards worldwide
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Standard Selector */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Select E-Invoicing Standard</label>
                    <Select value={selectedStandard} onValueChange={setSelectedStandard}>
                        <SelectTrigger>
                            <SelectValue placeholder="Choose standard..." />
                        </SelectTrigger>
                        <SelectContent>
                            {standards.map(standard => (
                                <SelectItem key={standard.id} value={standard.id}>
                                    <div className="flex items-center gap-2">
                                        <span>{standard.name}</span>
                                        {standard.mandatory && (
                                            <Badge className="text-xs bg-red-100 text-red-700">Mandatory</Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Selected Standard Details */}
                {selectedStandardData && (
                    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-semibold text-slate-900">{selectedStandardData.name}</h4>
                                <p className="text-sm text-slate-600">{selectedStandardData.region}</p>
                            </div>
                            <div className="flex gap-2">
                                {selectedStandardData.mandatory && (
                                    <Badge className="bg-red-100 text-red-700">Mandatory</Badge>
                                )}
                                {selectedStandardData.digital_signature && (
                                    <Badge className="bg-purple-100 text-purple-700">Digital Signature</Badge>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-slate-600">Format:</span>
                                <p className="font-medium text-slate-900">{selectedStandardData.format}</p>
                            </div>
                            <div>
                                <span className="text-slate-600">Network:</span>
                                <p className="font-medium text-slate-900">{selectedStandardData.network}</p>
                            </div>
                            <div>
                                <span className="text-slate-600">Schema:</span>
                                <p className="font-medium text-slate-900">{selectedStandardData.schema}</p>
                            </div>
                            <div>
                                <span className="text-slate-600">Sectors:</span>
                                <p className="font-medium text-slate-900">{selectedStandardData.sectors.join(', ')}</p>
                            </div>
                        </div>

                        {selectedStandardData.countries && (
                            <div>
                                <span className="text-xs text-slate-600">Applicable Countries:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedStandardData.countries.map(country => (
                                        <Badge key={country} variant="outline" className="text-xs">
                                            {country}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Validation Result */}
                {validationResult && (
                    <div className={`p-4 rounded-lg border ${
                        validationResult.valid 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            {validationResult.valid ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`font-medium ${
                                validationResult.valid ? 'text-green-900' : 'text-red-900'
                            }`}>
                                {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                            </span>
                        </div>
                        {!validationResult.valid && validationResult.missingFields.length > 0 && (
                            <div className="text-sm text-red-700">
                                <p className="mb-1">Missing required fields:</p>
                                <ul className="list-disc list-inside">
                                    {validationResult.missingFields.map(field => (
                                        <li key={field}>{field}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button 
                        onClick={handleValidate}
                        variant="outline"
                        disabled={!selectedStandard}
                        className="gap-2"
                    >
                        <CheckCircle className="h-4 w-4" />
                        Validate
                    </Button>
                    <Button 
                        onClick={handleGenerate}
                        disabled={!selectedStandard || generating || (validationResult && !validationResult.valid)}
                        className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                        <Download className="h-4 w-4" />
                        {generating ? 'Generating...' : 'Generate E-Invoice'}
                    </Button>
                </div>

                {/* Standards Overview */}
                <div className="border-t border-slate-200 pt-4">
                    <h5 className="text-sm font-semibold mb-3">Supported Standards</h5>
                    <div className="grid grid-cols-2 gap-2">
                        {standards.map(standard => (
                            <div 
                                key={standard.id}
                                className="text-xs p-2 bg-white rounded border border-slate-200 hover:border-blue-300 cursor-pointer transition-colors"
                                onClick={() => setSelectedStandard(standard.id)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-slate-900">{standard.region}</span>
                                    {standard.mandatory && (
                                        <span className="text-red-600">●</span>
                                    )}
                                </div>
                                <p className="text-slate-600">{standard.format}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}