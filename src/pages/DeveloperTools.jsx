import React, { useState } from 'react';
import PSPPageWrapper from '@/components/layout/PSPPageWrapper';
import APITestConsole from '@/components/developer/APITestConsole';
import WebhookTester from '@/components/developer/WebhookTester';
import ErrorCodeReference from '@/components/developer/ErrorCodeReference';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code2, Webhook, AlertTriangle, FileText } from 'lucide-react';

export default function DeveloperTools() {
  const [activeTab, setActiveTab] = useState('api-console');

  const tools = [
    { id: 'api-console', label: 'API Console', icon: Code2, description: 'Test API endpoints' },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook, description: 'Test webhook delivery' },
    { id: 'errors', label: 'Error Codes', icon: AlertTriangle, description: 'Error reference' },
    { id: 'docs', label: 'API Docs', icon: FileText, description: 'API documentation' },
  ];

  return (
    <PSPPageWrapper>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Developer Tools</h1>
          <p className="text-slate-600 mt-1">Debug, test, and monitor your integration</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  activeTab === tool.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <p className="font-medium text-sm">{tool.label}</p>
                <p className="text-xs text-slate-600 mt-1">{tool.description}</p>
              </button>
            );
          })}
        </div>

        {/* Tools Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* API Console */}
          <TabsContent value="api-console" className="space-y-4">
            <APITestConsole />
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-4">
            <WebhookTester />
          </TabsContent>

          {/* Error Codes */}
          <TabsContent value="errors" className="space-y-4">
            <ErrorCodeReference />
          </TabsContent>

          {/* API Docs */}
          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2">Base URL</Badge>
                    <p className="font-mono text-sm">https://api.fts.money/v1</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2">Authentication</Badge>
                    <p className="font-mono text-sm">Bearer {'{api_key}'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className="mb-2">Rate Limit</Badge>
                    <p className="font-mono text-sm">1000 req/min</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">POST /transactions</h3>
                    <p className="text-sm text-slate-600 mb-2">Process a new transaction</p>
                    <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-xs overflow-auto">
                      <pre>{`{
  "amount": 100,
  "currency": "USD",
  "payment_method": "card",
  "merchant_id": "mer_abc123",
  "order_id": "ord_xyz789"
}`}</pre>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">GET /transactions/{'{transaction_id}'}</h3>
                    <p className="text-sm text-slate-600 mb-2">Retrieve transaction details</p>
                    <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-xs">Response includes all transaction details and status</div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">POST /refunds</h3>
                    <p className="text-sm text-slate-600 mb-2">Refund a completed transaction</p>
                    <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-xs">
                      <pre>{`{
  "transaction_id": "txn_abc123",
  "amount": 50
}`}</pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PSPPageWrapper>
  );
}