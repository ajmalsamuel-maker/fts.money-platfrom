import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageSquare, Loader2, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function NLPPaymentProcessor({ merchants }) {
    const [instruction, setInstruction] = useState('');
    const [parsedResult, setParsedResult] = useState(null);

    const parseInstructionMutation = useMutation({
        mutationFn: async (text) => {
            const response = await base44.integrations.Core.InvokeLLM({
                prompt: `You are a payment processing AI. Parse the following natural language payment instruction and extract structured data.

Payment Instruction: "${text}"

Extract and return ONLY a JSON object with these fields:
- action: "payment" | "refund" | "subscription" | "invoice"
- amount: number (extracted from text)
- currency: string (USD, EUR, GBP, or inferred)
- recipient: string (customer name or email)
- description: string (payment purpose)
- frequency: string (for subscriptions: "daily", "weekly", "monthly", "yearly", or null)
- confidence: number (0-1, how confident you are in this parsing)
- requires_review: boolean (true if ambiguous or high-value)
- extracted_entities: object with any other relevant details

Examples:
"Send $500 to john@example.com for consulting services" -> {action: "payment", amount: 500, currency: "USD", recipient: "john@example.com", description: "consulting services", confidence: 0.95, requires_review: false}
"Charge Sarah $29.99 monthly for premium subscription" -> {action: "subscription", amount: 29.99, currency: "USD", recipient: "Sarah", frequency: "monthly", description: "premium subscription", confidence: 0.92, requires_review: false}`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        action: { type: "string" },
                        amount: { type: "number" },
                        currency: { type: "string" },
                        recipient: { type: "string" },
                        description: { type: "string" },
                        frequency: { type: "string" },
                        confidence: { type: "number" },
                        requires_review: { type: "boolean" },
                        extracted_entities: { type: "object" }
                    }
                }
            });
            return response;
        },
        onSuccess: (result) => {
            setParsedResult(result);
            if (result.confidence < 0.7) {
                toast.warning('Low confidence - manual review recommended');
            }
        },
        onError: () => {
            toast.error('Failed to parse instruction');
        }
    });

    const executePaymentMutation = useMutation({
        mutationFn: async (data) => {
            const merchant = merchants[0];
            
            if (data.action === 'payment') {
                return await base44.entities.Transaction.create({
                    transaction_id: `TXN-NLP-${Date.now()}`,
                    merchant_id: merchant.id,
                    merchant_name: merchant.business_name,
                    type: 'sale',
                    status: data.requires_review ? 'pending' : 'approved',
                    amount: data.amount,
                    currency: data.currency,
                    customer_email: data.recipient,
                    description: data.description,
                    payment_method: 'ai_processed'
                });
            } else if (data.action === 'subscription') {
                return await base44.entities.RecurringPayment.create({
                    recurring_id: `REC-NLP-${Date.now()}`,
                    merchant_id: merchant.id,
                    customer_email: data.recipient,
                    amount: data.amount,
                    currency: data.currency,
                    frequency: data.frequency,
                    status: data.requires_review ? 'pending' : 'active',
                    description: data.description,
                    ai_managed: true
                });
            }
        },
        onSuccess: () => {
            toast.success('Payment instruction executed successfully');
            setParsedResult(null);
            setInstruction('');
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Natural Language Payment Instructions
                </h3>
                <p className="text-sm text-slate-500">
                    Describe payment instructions in plain English, and AI will parse and execute them
                </p>
            </div>

            <Card className="p-6">
                <div className="space-y-4">
                    <div>
                        <Textarea
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            placeholder="e.g., Send $500 to john@example.com for web design work&#10;Charge Sarah $29.99 monthly for premium subscription&#10;Refund $150 to customer@example.com for order #12345"
                            className="min-h-32 text-base"
                        />
                    </div>

                    <Button 
                        onClick={() => parseInstructionMutation.mutate(instruction)}
                        disabled={!instruction || parseInstructionMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {parseInstructionMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Parsing instruction...
                            </>
                        ) : (
                            <>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Parse & Preview
                            </>
                        )}
                    </Button>
                </div>
            </Card>

            {parsedResult && (
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900">Parsed Payment Instruction</h4>
                            <Badge className={
                                parsedResult.confidence >= 0.9 ? 'bg-emerald-100 text-emerald-700' :
                                parsedResult.confidence >= 0.7 ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }>
                                {(parsedResult.confidence * 100).toFixed(0)}% Confidence
                            </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Action</p>
                                <p className="font-semibold capitalize">{parsedResult.action}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Amount</p>
                                <p className="font-semibold">{parsedResult.amount} {parsedResult.currency}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Recipient</p>
                                <p className="font-semibold">{parsedResult.recipient}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-600 mb-1">Description</p>
                                <p className="font-semibold">{parsedResult.description}</p>
                            </div>
                            {parsedResult.frequency && (
                                <div>
                                    <p className="text-xs text-slate-600 mb-1">Frequency</p>
                                    <p className="font-semibold capitalize">{parsedResult.frequency}</p>
                                </div>
                            )}
                        </div>

                        {parsedResult.requires_review && (
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    This transaction requires human review due to high value or ambiguity
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setParsedResult(null)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={() => executePaymentMutation.mutate(parsedResult)}
                                disabled={executePaymentMutation.isPending}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {executePaymentMutation.isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Executing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Execute Payment
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="bg-slate-50 rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">Example Instructions:</h5>
                <div className="space-y-1 text-xs text-slate-600">
                    <p>• "Send $500 to john@example.com for consulting services"</p>
                    <p>• "Charge Sarah $29.99 monthly for premium subscription starting next week"</p>
                    <p>• "Issue a refund of $150 to customer@example.com for order #12345"</p>
                    <p>• "Set up quarterly payments of €1000 to vendor@company.com for licensing"</p>
                </div>
            </div>
        </div>
    );
}