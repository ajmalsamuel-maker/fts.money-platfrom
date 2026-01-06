import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Key, Zap, Copy, CheckCircle } from 'lucide-react';

export default function PSPAPIDocumentation() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const copyToClipboard = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(id);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const CodeBlock = ({ code, language = 'javascript', id }) => (
        <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{code}</code>
            </pre>
            <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-slate-400 hover:text-white"
                onClick={() => copyToClipboard(code, id)}
            >
                {copiedCode === id ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="PSPAPIDocumentation" />
            
            <div className={cn("transition-all duration-300", "lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6 max-w-6xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Code className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-slate-900">API Documentation</h1>
                        </div>
                        <p className="text-slate-600">RESTful API for payment processing and merchant management</p>
                    </div>

                    <Tabs defaultValue="authentication" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 lg:w-auto">
                            <TabsTrigger value="authentication">Authentication</TabsTrigger>
                            <TabsTrigger value="payments">Payments</TabsTrigger>
                            <TabsTrigger value="merchants">Merchants</TabsTrigger>
                            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                            <TabsTrigger value="errors">Errors</TabsTrigger>
                        </TabsList>

                        <TabsContent value="authentication" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-blue-600" />
                                        API Authentication
                                    </CardTitle>
                                    <CardDescription>Secure your API requests with API keys</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Getting Your API Key</h4>
                                        <p className="text-sm text-slate-600 mb-3">Navigate to Developers → API Keys to generate your production and test API keys.</p>
                                        <Badge>API Key Format: psp_live_xxxxxxxxxxxxxxxx</Badge>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Making Authenticated Requests</h4>
                                        <p className="text-sm text-slate-600 mb-3">Include your API key in the Authorization header:</p>
                                        <CodeBlock id="auth-header" code={`Authorization: Bearer psp_live_xxxxxxxxxxxxxxxx`} />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Example Request</h4>
                                        <CodeBlock 
                                            id="auth-example"
                                            code={`curl https://api.ftsmoney.com/v1/transactions \\
  -H "Authorization: Bearer psp_live_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json"`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="payments" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-green-600" />
                                        Payment Processing
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-50">POST</Badge>
                                            Create Payment
                                        </h4>
                                        <p className="text-sm text-slate-600 mb-3">Process a new payment transaction</p>
                                        <CodeBlock
                                            id="create-payment"
                                            code={`POST /v1/payments

{
  "amount": 10000,
  "currency": "USD",
  "merchant_id": "merch_abc123",
  "payment_method": {
    "type": "card",
    "card_number": "4111111111111111",
    "exp_month": "12",
    "exp_year": "2025",
    "cvv": "123"
  },
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "description": "Order #12345"
}`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-50">GET</Badge>
                                            Retrieve Transaction
                                        </h4>
                                        <CodeBlock
                                            id="get-transaction"
                                            code={`GET /v1/transactions/{transaction_id}

Response:
{
  "id": "txn_xyz789",
  "amount": 10000,
  "currency": "USD",
  "status": "approved",
  "merchant_id": "merch_abc123",
  "created_date": "2026-01-06T10:30:00Z"
}`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-50">POST</Badge>
                                            Refund Transaction
                                        </h4>
                                        <CodeBlock
                                            id="refund-payment"
                                            code={`POST /v1/transactions/{transaction_id}/refund

{
  "amount": 10000,
  "reason": "customer_request"
}`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="merchants" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        Merchant Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-50">GET</Badge>
                                            List Merchants
                                        </h4>
                                        <CodeBlock
                                            id="list-merchants"
                                            code={`GET /v1/merchants?status=active&limit=50

Response:
{
  "data": [
    {
      "id": "merch_abc123",
      "business_name": "TechCorp Ltd",
      "status": "active",
      "total_volume": 250000,
      "created_date": "2025-12-01T00:00:00Z"
    }
  ],
  "total": 156,
  "page": 1
}`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-50">POST</Badge>
                                            Create Merchant
                                        </h4>
                                        <CodeBlock
                                            id="create-merchant"
                                            code={`POST /v1/merchants

{
  "business_name": "New Store Ltd",
  "contact_email": "contact@newstore.com",
  "contact_name": "Jane Smith",
  "country": "US",
  "mcc_code": "5411",
  "pricing": {
    "percentage_rate": 2.9,
    "fixed_fee": 0.30
  }
}`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="webhooks" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-600" />
                                        Webhook Events
                                    </CardTitle>
                                    <CardDescription>Real-time notifications for payment events</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Available Events</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Badge>transaction.approved</Badge>
                                                <span className="text-sm text-slate-600">Payment successfully approved</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge>transaction.declined</Badge>
                                                <span className="text-sm text-slate-600">Payment declined</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge>transaction.refunded</Badge>
                                                <span className="text-sm text-slate-600">Refund processed</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge>chargeback.received</Badge>
                                                <span className="text-sm text-slate-600">New chargeback notification</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge>settlement.completed</Badge>
                                                <span className="text-sm text-slate-600">Settlement processed</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Webhook Payload Example</h4>
                                        <CodeBlock
                                            id="webhook-payload"
                                            code={`{
  "event": "transaction.approved",
  "data": {
    "id": "txn_xyz789",
    "amount": 10000,
    "currency": "USD",
    "merchant_id": "merch_abc123",
    "status": "approved",
    "created_at": "2026-01-06T10:30:00Z"
  },
  "timestamp": "2026-01-06T10:30:01Z"
}`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Webhook Security</h4>
                                        <p className="text-sm text-slate-600 mb-3">Verify webhook signatures using HMAC-SHA256:</p>
                                        <CodeBlock
                                            id="webhook-verify"
                                            code={`const crypto = require('crypto');

const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const secret = 'your_webhook_secret';

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

if (signature === expectedSignature) {
  // Webhook is authentic
}`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="errors" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-red-600" />
                                        Error Codes & Handling
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">HTTP Status Codes</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                                <Badge className="bg-green-600">200</Badge>
                                                <div>
                                                    <p className="font-medium text-sm">OK</p>
                                                    <p className="text-xs text-slate-600">Request successful</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                                <Badge className="bg-blue-600">201</Badge>
                                                <div>
                                                    <p className="font-medium text-sm">Created</p>
                                                    <p className="text-xs text-slate-600">Resource created successfully</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                <Badge className="bg-amber-600">400</Badge>
                                                <div>
                                                    <p className="font-medium text-sm">Bad Request</p>
                                                    <p className="text-xs text-slate-600">Invalid request parameters</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                                <Badge className="bg-red-600">401</Badge>
                                                <div>
                                                    <p className="font-medium text-sm">Unauthorized</p>
                                                    <p className="text-xs text-slate-600">Invalid or missing API key</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                                                <Badge className="bg-purple-600">429</Badge>
                                                <div>
                                                    <p className="font-medium text-sm">Too Many Requests</p>
                                                    <p className="text-xs text-slate-600">Rate limit exceeded</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-slate-100 rounded-lg">
                                                <Badge className="bg-slate-600">500</Badge>
                                                <div>
                                                    <p className="font-medium text-sm">Internal Server Error</p>
                                                    <p className="text-xs text-slate-600">Something went wrong on our end</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Error Response Format</h4>
                                        <CodeBlock
                                            id="error-format"
                                            code={`{
  "error": {
    "type": "invalid_request",
    "code": "invalid_card_number",
    "message": "The card number is invalid",
    "param": "payment_method.card_number"
  }
}`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Common Error Codes</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <code className="text-xs font-mono">invalid_card_number</code>
                                                <span className="text-slate-600">Card number format is invalid</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <code className="text-xs font-mono">insufficient_funds</code>
                                                <span className="text-slate-600">Card has insufficient balance</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <code className="text-xs font-mono">expired_card</code>
                                                <span className="text-slate-600">Card expiration date has passed</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <code className="text-xs font-mono">merchant_not_found</code>
                                                <span className="text-slate-600">Merchant ID does not exist</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <code className="text-xs font-mono">rate_limit_exceeded</code>
                                                <span className="text-slate-600">Too many requests in time period</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="merchants" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Merchant API Endpoints</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-50">GET</Badge>
                                            List All Merchants
                                        </h4>
                                        <CodeBlock
                                            id="list-merchants-api"
                                            code={`GET /v1/merchants?status=active&limit=50&page=1`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-50">POST</Badge>
                                            Create Merchant
                                        </h4>
                                        <CodeBlock
                                            id="create-merchant-api"
                                            code={`POST /v1/merchants

{
  "business_name": "Coffee Shop Inc",
  "contact_email": "owner@coffeeshop.com",
  "contact_name": "Sarah Johnson",
  "country": "US",
  "currency": "USD",
  "mcc_code": "5814",
  "category": "retail"
}`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Badge variant="outline" className="bg-amber-50">PUT</Badge>
                                            Update Merchant
                                        </h4>
                                        <CodeBlock
                                            id="update-merchant-api"
                                            code={`PUT /v1/merchants/{merchant_id}

{
  "status": "active",
  "processing_volume": 500000
}`}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="webhooks" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-600" />
                                        Webhook Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">Register Webhook Endpoint</h4>
                                        <CodeBlock
                                            id="register-webhook"
                                            code={`POST /v1/webhooks

{
  "url": "https://yourserver.com/webhooks",
  "events": [
    "transaction.approved",
    "transaction.declined",
    "settlement.completed"
  ],
  "secret": "whsec_xxxxxxxxxxxxxxxx"
}`}
                                        />
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Webhook Retry Logic</h4>
                                        <p className="text-sm text-slate-600 mb-3">If your endpoint fails to respond with a 2xx status code:</p>
                                        <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                                            <li>1st retry: After 5 seconds</li>
                                            <li>2nd retry: After 30 seconds</li>
                                            <li>3rd retry: After 5 minutes</li>
                                            <li>4th retry: After 30 minutes</li>
                                            <li>5th retry: After 2 hours</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}