import React, { useState } from 'react';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Code, Copy, Key, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';

const apiEndpoints = [
    {
        category: 'Payment Processing',
        endpoints: [
            {
                method: 'POST',
                path: '/api/v1/payments',
                description: 'Process a payment transaction',
                params: [
                    { name: 'amount', type: 'number', required: true, description: 'Transaction amount in cents' },
                    { name: 'currency', type: 'string', required: true, description: 'ISO currency code (e.g., USD)' },
                    { name: 'card_number', type: 'string', required: true, description: 'Card number' },
                    { name: 'cvv', type: 'string', required: true, description: 'Card CVV' },
                    { name: 'exp_month', type: 'string', required: true, description: 'Expiry month (MM)' },
                    { name: 'exp_year', type: 'string', required: true, description: 'Expiry year (YYYY)' },
                    { name: 'customer_email', type: 'string', required: false, description: 'Customer email' }
                ],
                example: `{
  "amount": 10000,
  "currency": "USD",
  "card_number": "4242424242424242",
  "cvv": "123",
  "exp_month": "12",
  "exp_year": "2025",
  "customer_email": "customer@example.com"
}`
            },
            {
                method: 'GET',
                path: '/api/v1/payments/{transaction_id}',
                description: 'Retrieve payment details',
                params: [
                    { name: 'transaction_id', type: 'string', required: true, description: 'Transaction ID' }
                ],
                example: `GET /api/v1/payments/txn_abc123`
            },
            {
                method: 'POST',
                path: '/api/v1/refunds',
                description: 'Process a refund',
                params: [
                    { name: 'transaction_id', type: 'string', required: true, description: 'Original transaction ID' },
                    { name: 'amount', type: 'number', required: false, description: 'Refund amount (full refund if not specified)' },
                    { name: 'reason', type: 'string', required: false, description: 'Refund reason' }
                ],
                example: `{
  "transaction_id": "txn_abc123",
  "amount": 5000,
  "reason": "Customer request"
}`
            }
        ]
    },
    {
        category: 'Transaction Management',
        endpoints: [
            {
                method: 'GET',
                path: '/api/v1/transactions',
                description: 'List all transactions',
                params: [
                    { name: 'status', type: 'string', required: false, description: 'Filter by status' },
                    { name: 'from_date', type: 'string', required: false, description: 'Start date (ISO 8601)' },
                    { name: 'to_date', type: 'string', required: false, description: 'End date (ISO 8601)' },
                    { name: 'limit', type: 'number', required: false, description: 'Number of results (max 100)' }
                ],
                example: `GET /api/v1/transactions?status=approved&limit=10`
            },
            {
                method: 'GET',
                path: '/api/v1/settlements',
                description: 'List settlement batches',
                params: [
                    { name: 'status', type: 'string', required: false, description: 'Filter by status' }
                ],
                example: `GET /api/v1/settlements?status=completed`
            }
        ]
    },
    {
        category: 'Webhooks',
        endpoints: [
            {
                method: 'POST',
                path: 'Your Webhook URL',
                description: 'Receive real-time transaction updates',
                params: [
                    { name: 'event_type', type: 'string', required: true, description: 'payment.succeeded, payment.failed, refund.created' },
                    { name: 'transaction', type: 'object', required: true, description: 'Transaction data' }
                ],
                example: `{
  "event_type": "payment.succeeded",
  "transaction": {
    "id": "txn_abc123",
    "amount": 10000,
    "status": "approved",
    "created_at": "2025-12-10T12:00:00Z"
  }
}`
            }
        ]
    }
];

export default function MerchantAPIDoc() {
    const { user, loading, logout } = useMerchantAuth();
    const [selectedMID, setSelectedMID] = React.useState('');

    const { data: merchant } = useQuery({
        queryKey: ['merchant', user?.merchant_id],
        queryFn: async () => {
            const merchants = await base44.entities.Merchant.filter({ merchant_id: user.merchant_id });
            return merchants[0];
        },
        enabled: !!user?.merchant_id
    });

    const { data: mids = [] } = useQuery({
        queryKey: ['merchantMIDs', user?.merchant_id],
        queryFn: async () => await base44.entities.MerchantMID.filter({ merchant_id: user.merchant_id }),
        enabled: !!user?.merchant_id
    });

    React.useEffect(() => {
        if (mids.length > 0 && !selectedMID) setSelectedMID(mids[0].mid);
    }, [mids, selectedMID]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (loading || !user) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar selectedMID={selectedMID} mids={mids} onMIDChange={setSelectedMID} currentPage="MerchantAPIDoc" />
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar user={user} merchant={merchant} onLogout={logout} />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">API Documentation</h1>
                            <p className="text-slate-500">Complete guide to integrate with our payment API</p>
                        </div>

                        {/* Authentication */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="h-5 w-5" />
                                    Authentication
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-slate-600">All API requests require authentication using your API key in the header:</p>
                                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm relative">
                                    <code>Authorization: Bearer YOUR_API_KEY</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY')}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-blue-900">Your API Key</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="bg-white px-3 py-1 rounded border text-sm flex-1">pk_live_abc123def456...</code>
                                        <Button variant="outline" size="sm" onClick={() => copyToClipboard('pk_live_abc123def456...')}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* API Endpoints */}
                        {apiEndpoints.map((category) => (
                            <Card key={category.category}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        {category.category}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {category.endpoints.map((endpoint, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Badge variant={endpoint.method === 'POST' ? 'default' : 'secondary'} className="font-mono">
                                                    {endpoint.method}
                                                </Badge>
                                                <code className="text-sm">{endpoint.path}</code>
                                            </div>
                                            <p className="text-sm text-slate-600">{endpoint.description}</p>
                                            
                                            {endpoint.params && endpoint.params.length > 0 && (
                                                <div>
                                                    <p className="text-sm font-semibold mb-2">Parameters:</p>
                                                    <div className="space-y-2">
                                                        {endpoint.params.map((param) => (
                                                            <div key={param.name} className="flex items-start gap-3 text-sm">
                                                                <code className="text-blue-600">{param.name}</code>
                                                                <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                                                {param.required && <Badge className="text-xs bg-red-100 text-red-800">required</Badge>}
                                                                <span className="text-slate-500 flex-1">{param.description}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {endpoint.example && (
                                                <div>
                                                    <p className="text-sm font-semibold mb-2">Example:</p>
                                                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm relative">
                                                        <pre className="overflow-x-auto">{endpoint.example}</pre>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => copyToClipboard(endpoint.example)}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Rate Limits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Rate Limits
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between p-3 bg-slate-50 rounded">
                                        <span className="font-medium">API Calls per Minute</span>
                                        <span>1000</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-slate-50 rounded">
                                        <span className="font-medium">API Calls per Hour</span>
                                        <span>50,000</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-slate-50 rounded">
                                        <span className="font-medium">API Calls per Day</span>
                                        <span>500,000</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}