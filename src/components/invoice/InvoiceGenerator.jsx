import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function InvoiceGenerator({ transaction, onSuccess }) {
    const [autoSend, setAutoSend] = useState(false);
    const [generatedInvoice, setGeneratedInvoice] = useState(null);

    const generateMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('generateVATInvoice', {
                transaction_id: transaction.id,
                merchant_id: transaction.merchant_id,
                customer_id: transaction.customer_id,
                psp_code: transaction.psp_code,
                service_type: 'psp',
                auto_send: autoSend
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                setGeneratedInvoice(data);
                onSuccess?.(data);
            }
        }
    });

    if (generatedInvoice?.success) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-green-900 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Invoice Generated
                        </CardTitle>
                        <Badge className="bg-green-600">
                            {generatedInvoice.invoice_number}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            Invoice successfully generated with VAT compliance.
                            {autoSend && ' Email sent to customer.'}
                        </AlertDescription>
                    </Alert>

                    {generatedInvoice.vat_compliance && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-slate-600">Format:</span>
                                <span className="ml-2 font-medium">{generatedInvoice.vat_compliance.format}</span>
                            </div>
                            <div>
                                <span className="text-slate-600">VAT Validated:</span>
                                <span className="ml-2 font-medium">
                                    {generatedInvoice.vat_compliance.vat_id_validated ? 'Yes' : 'N/A'}
                                </span>
                            </div>
                            {generatedInvoice.vat_compliance.reverse_charge && (
                                <div className="col-span-2">
                                    <Badge className="bg-amber-100 text-amber-800">
                                        Reverse Charge Applied
                                    </Badge>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Invoice
                        </Button>
                    </div>
                </CardContent>
            </Card>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generate VAT Invoice
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertDescription>
                        Generate a VAT-compliant invoice for this transaction. 
                        The invoice will include proper VAT breakdown and tax jurisdiction information.
                    </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between">
                    <Label htmlFor="auto-send">Send invoice via email</Label>
                    <Switch
                        id="auto-send"
                        checked={autoSend}
                        onCheckedChange={setAutoSend}
                        disabled={!transaction.customer_email}
                    />
                </div>

                {autoSend && !transaction.customer_email && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            Customer email is required to send the invoice automatically.
                        </AlertDescription>
                    </Alert>
                )}

                <Button 
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="w-full"
                >
                    {generateMutation.isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Invoice...
                        </>
                    ) : (
                        <>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Invoice
                        </>
                    )}
                </Button>

                {generateMutation.isError && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {generateMutation.error?.message || 'Failed to generate invoice'}
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}