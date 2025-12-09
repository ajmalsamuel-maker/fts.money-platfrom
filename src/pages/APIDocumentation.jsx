import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Code, Key, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function APIDocumentation() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [copiedEndpoint, setCopiedEndpoint] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedEndpoint(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedEndpoint(null), 2000);
    };

    const endpoints = [
        {
            category: 'Payment Processing',
            items: [
                {
                    id: 'process-payment',
                    method: 'POST',
                    path: '/api/functions/processPayment',
                    description: 'Process a payment transaction',
                    params: {
                        merchant_id: 'string (required)',
                        amount: 'number (required)',
                        currency: 'string (default: USD)',
                        payment_method: 'string (required)',
                        customer_email: 'string',
                        description: 'string',
                        metadata: 'object'
                    },
                    example: `{
  "merchant_id": "mer_123",
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "pm_card_visa",
  "customer_email": "customer@example.com",
  "description": "Product purchase"
}`
                }
            ]
        },
        {
            category: 'Merchant Onboarding',
            items: [
                {
                    id: 'kyb-verification',
                    method: 'POST',
                    path: '/api/functions/kybVerification',
                    description: 'Verify business information',
                    params: {
                        company_name: 'string (required)',
                        registration_number: 'string',
                        country: 'string (required)',
                        business_type: 'string',
                        merchant_id: 'string'
                    },
                    example: `{
  "company_name": "Acme Corp",
  "registration_number": "12345678",
  "country": "US",
  "merchant_id": "mer_123"
}`
                },
                {
                    id: 'aml-screening',
                    method: 'POST',
                    path: '/api/functions/amlScreening',
                    description: 'Perform AML screening',
                    params: {
                        name: 'string (required)',
                        entity_type: 'string (default: Company)',
                        country: 'array',
                        ongoing_monitoring: 'boolean',
                        merchant_id: 'string'
                    },
                    example: `{
  "name": "Acme Corp",
  "entity_type": "Company",
  "country": ["US"],
  "ongoing_monitoring": true
}`
                },
                {
                    id: 'lei-verification',
                    method: 'POST',
                    path: '/api/functions/leiVerification',
                    description: 'Verify Legal Entity Identifier',
                    params: {
                        lei: 'string',
                        company_name: 'string',
                        action: 'string (verify|search)',
                        merchant_id: 'string'
                    },
                    example: `{
  "lei": "254900OPPU84GM83MG36",
  "action": "verify",
  "merchant_id": "mer_123"
}`
                }
            ]
        },
        {
            category: 'Transaction Management',
            items: [
                {
                    id: 'routing-engine',
                    method: 'POST',
                    path: '/api/functions/routingEngine',
                    description: 'Determine optimal payment routing',
                    params: {
                        merchant_id: 'string (required)',
                        amount: 'number (required)',
                        currency: 'string',
                        card_type: 'string',
                        country: 'string',
                        transaction_type: 'string'
                    },
                    example: `{
  "merchant_id": "mer_123",
  "amount": 100.00,
  "currency": "USD",
  "card_type": "visa"
}`
                }
            ]
        },
        {
            category: 'Webhooks',
            items: [
                {
                    id: 'stripe-webhook',
                    method: 'POST',
                    path: '/api/functions/stripeWebhook',
                    description: 'Handle Stripe webhook events',
                    params: {},
                    example: 'Webhook payload from Stripe'
                },
                {
                    id: 'acquirer-webhook',
                    method: 'POST',
                    path: '/api/functions/acquirerWebhook',
                    description: 'Handle acquirer webhook events',
                    params: {},
                    example: 'Webhook payload from acquirer'
                }
            ]
        }
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                currentPage="APIDocumentation"
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">API Documentation</h1>
                            <p className="text-slate-600 mt-2">Complete reference for PSP Platform APIs</p>
                        </div>

                        {/* Authentication */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5 text-blue-500" />
                                    Authentication
                                </CardTitle>
                                <CardDescription>All API requests require authentication</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-slate-900 rounded-lg p-4 text-sm">
                                    <code className="text-green-400">Authorization: Bearer YOUR_API_KEY</code>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Get your API key from Settings → API Credentials
                                </p>
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
                                                        {Object.entries(endpoint.params).map(([key, value]) => (
                                                            <div key={key} className="flex items-start gap-2 text-sm">
                                                                <code className="font-mono text-blue-600">{key}</code>
                                                                <span className="text-slate-500">-</span>
                                                                <span className="text-slate-600">{value}</span>
                                                            </div>
                                                        ))}
                                                        {Object.keys(endpoint.params).length === 0 && (
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
                                    <p><strong>Standard:</strong> 1,000 requests per minute</p>
                                    <p><strong>Burst:</strong> 10,000 requests per hour</p>
                                    <p className="text-slate-600 mt-4">
                                        Contact support for higher limits
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}