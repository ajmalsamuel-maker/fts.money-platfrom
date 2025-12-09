import React, { useState } from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Key, Zap, Book, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function MerchantAPIDocumentation() {
    const { user } = useMerchantAuth();
    const [copiedEndpoint, setCopiedEndpoint] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedEndpoint(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedEndpoint(null), 2000);
    };

    const apiKey = user?.merchant_id ? `pk_test_${user.merchant_id}_xxxxxxxxxxxxxx` : 'pk_test_your_key_here';

    const endpoints = [
        {
            category: 'Payment Processing',
            items: [
                {
                    id: 'create-payment',
                    method: 'POST',
                    path: '/api/payments',
                    description: 'Create a payment transaction',
                    params: {
                        amount: 'number (required) - Amount in smallest currency unit',
                        currency: 'string (default: USD)',
                        payment_method: 'string (required) - Payment method ID',
                        customer_email: 'string',
                        description: 'string',
                        metadata: 'object - Custom key-value pairs'
                    },
                    example: `{
  "amount": 9999,
  "currency": "USD",
  "payment_method": "pm_card_visa",
  "customer_email": "customer@example.com",
  "description": "Order #12345",
  "metadata": {
    "order_id": "12345",
    "customer_id": "cus_123"
  }
}`
                }
            ]
        },
        {
            category: 'Subscriptions',
            items: [
                {
                    id: 'create-subscription',
                    method: 'POST',
                    path: '/api/subscriptions',
                    description: 'Create a recurring subscription',
                    params: {
                        customer_email: 'string (required)',
                        customer_name: 'string (required)',
                        amount: 'number (required)',
                        currency: 'string (default: USD)',
                        frequency: 'string (monthly, yearly)',
                        payment_method: 'string (required)',
                    },
                    example: `{
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "amount": 29.99,
  "currency": "USD",
  "frequency": "monthly",
  "payment_method": "pm_card_visa"
}`
                }
            ]
        },
        {
            category: 'Webhooks',
            items: [
                {
                    id: 'webhooks',
                    method: 'POST',
                    path: 'Your configured endpoint',
                    description: 'Receive real-time payment events',
                    params: {},
                    example: `{
  "event": "payment.succeeded",
  "transaction_id": "txn_123456",
  "amount": 9999,
  "currency": "USD",
  "customer_email": "customer@example.com",
  "timestamp": "2025-01-15T10:30:00Z"
}`
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Code className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">API Documentation</h1>
                            <p className="text-sm text-slate-500">Integration Guide</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Book className="h-4 w-4" />
                        Full Documentation
                    </Button>
                </div>
            </header>

            <main className="p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Authentication */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5 text-blue-500" />
                                Authentication
                            </CardTitle>
                            <CardDescription>Use your API key to authenticate requests</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm text-slate-600">Your API Key</Label>
                                <div className="flex gap-2 mt-2">
                                    <code className="flex-1 bg-slate-900 text-green-400 px-4 py-2 rounded-lg text-sm font-mono">
                                        {apiKey}
                                    </code>
                                    <Button 
                                        variant="outline" 
                                        size="icon"
                                        onClick={() => copyToClipboard(apiKey, 'api-key')}
                                    >
                                        {copiedEndpoint === 'api-key' ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <p className="text-sm text-slate-600 mb-2">Usage in requests:</p>
                                <code className="text-sm bg-slate-900 text-green-400 px-3 py-1.5 rounded block">
                                    Authorization: Bearer {apiKey}
                                </code>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <p>Never share your API key publicly. Keep it secure on your server.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Endpoints */}
                    {endpoints.map((category, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="h-5 w-5 text-cyan-500" />
                                    {category.category}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {category.items.map((endpoint) => (
                                    <div key={endpoint.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Badge className={
                                                    endpoint.method === 'GET' ? 'bg-green-500' :
                                                    endpoint.method === 'POST' ? 'bg-blue-500' :
                                                    endpoint.method === 'PUT' ? 'bg-amber-500' :
                                                    'bg-red-500'
                                                }>
                                                    {endpoint.method}
                                                </Badge>
                                                <code className="text-sm font-mono text-slate-700">
                                                    {endpoint.path}
                                                </code>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(endpoint.path, endpoint.id)}
                                            >
                                                {copiedEndpoint === endpoint.id ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>

                                        <p className="text-sm text-slate-600 mb-4">{endpoint.description}</p>

                                        <Tabs defaultValue="params" className="w-full">
                                            <TabsList>
                                                <TabsTrigger value="params">Parameters</TabsTrigger>
                                                <TabsTrigger value="example">Example</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="params" className="mt-4">
                                                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                                    {Object.entries(endpoint.params).length > 0 ? (
                                                        Object.entries(endpoint.params).map(([key, value]) => (
                                                            <div key={key} className="flex items-start gap-2 text-sm">
                                                                <code className="font-mono text-blue-600">{key}</code>
                                                                <span className="text-slate-500">-</span>
                                                                <span className="text-slate-600">{value}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-slate-500">No parameters required</p>
                                                    )}
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="example" className="mt-4">
                                                <div className="bg-slate-900 rounded-lg p-4">
                                                    <pre className="text-sm text-green-400 overflow-x-auto">
                                                        <code>{endpoint.example}</code>
                                                    </pre>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}

                    {/* Rate Limits */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-amber-500" />
                                Rate Limits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <p><strong>Standard:</strong> 100 requests per minute</p>
                                <p><strong>Burst:</strong> 1,000 requests per hour</p>
                                <p className="text-slate-600 mt-4">
                                    Contact support if you need higher limits
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}