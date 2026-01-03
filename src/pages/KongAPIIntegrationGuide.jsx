import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Key, Zap, Shield, Globe, Book } from 'lucide-react';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function KongAPIIntegrationGuide() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionData = localStorage.getItem('platform_admin_session');
        if (!sessionData) {
            navigate(createPageUrl('PlatformAdminLogin'));
            return;
        }
        setSession(JSON.parse(sessionData));
        setLoading(false);
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="KongAPIIntegrationGuide"
                userRole={session.role}
                userEmail={session.email}
                isSuperAdmin={session.role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.kongAPIIntegration')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:subMenuItems.kongAPIIntegrationDesc')}</p>
                    </div>
                </header>

                <div className="p-6 max-w-6xl space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription>
                            <strong>For External Developers:</strong> This guide shows how to integrate with FTS.Money services through Kong Gateway. 
                            All external API traffic must go through Kong for authentication, rate limiting, and security.
                        </AlertDescription>
                    </Alert>

                    {/* Quick Start */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-blue-600" />
                                Quick Start
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">1. Get Your API Key</h4>
                                <p className="text-sm text-slate-600 mb-2">Contact your FTS account manager to provision an API key for your organization.</p>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <code className="text-xs">apikey: FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH</code>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">2. Choose Your Service Endpoint</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Badge>PSP</Badge>
                                        <code className="text-xs">http://188.166.207.82:8000/api/v1/psp</code>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>ISO Gateway</Badge>
                                        <code className="text-xs">http://188.166.207.82:8000/api/v1/iso</code>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>Orchestration</Badge>
                                        <code className="text-xs">http://188.166.207.82:8000/api/v1/orchestration</code>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>Crypto Banking</Badge>
                                        <code className="text-xs">http://188.166.207.82:8000/api/v1/crypto</code>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>RWA Platform</Badge>
                                        <code className="text-xs">http://188.166.207.82:8000/api/v1/rwa</code>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">3. Make Your First API Call</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`curl -X POST http://188.166.207.82:8000/api/v1/psp/transactions \\
  -H "apikey: FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH" \\
  -H "Content-Type: application/json" \\
  -d '{
    "merchant_id": "your-merchant-id",
    "amount": 100.00,
    "currency": "USD",
    "payment_method": "visa"
  }'`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service-Specific Integration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Code className="h-5 w-5 text-purple-600" />
                                Service Integration Examples
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="psp">
                                <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="psp">PSP</TabsTrigger>
                                    <TabsTrigger value="iso">ISO Gateway</TabsTrigger>
                                    <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
                                    <TabsTrigger value="crypto">Crypto Banking</TabsTrigger>
                                    <TabsTrigger value="rwa">RWA Platform</TabsTrigger>
                                </TabsList>

                                <TabsContent value="psp" className="space-y-4">
                                    <h4 className="font-semibold">PSP Service - Payment Processing</h4>
                                    <p className="text-sm text-slate-600">Process payments through your PSP instance or connect to other PSPs.</p>
                                    
                                    <div>
                                        <h5 className="font-semibold text-sm mb-2">Node.js Example:</h5>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`const axios = require('axios');

const createTransaction = async () => {
  try {
    const response = await axios.post(
      'http://188.166.207.82:8000/api/v1/psp/transactions',
      {
        merchant_id: 'MERCH123',
        amount: 100.00,
        currency: 'USD',
        payment_method: 'visa',
        card_number: '4111111111111111',
        cvv: '123',
        expiry: '12/25'
      },
      {
        headers: {
          'apikey': 'FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Transaction created:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

createTransaction();`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h5 className="font-semibold text-sm mb-2">Python Example:</h5>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`import requests

url = "http://188.166.207.82:8000/api/v1/psp/transactions"
headers = {
    "apikey": "FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH",
    "Content-Type": "application/json"
}
data = {
    "merchant_id": "MERCH123",
    "amount": 100.00,
    "currency": "USD",
    "payment_method": "visa"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}
                                        </pre>
                                    </div>
                                </TabsContent>

                                <TabsContent value="iso" className="space-y-4">
                                    <h4 className="font-semibold">ISO Gateway - Financial Messaging</h4>
                                    <p className="text-sm text-slate-600">Send ISO 8583 or ISO 20022 messages for financial transactions.</p>
                                    
                                    <div>
                                        <h5 className="font-semibold text-sm mb-2">ISO 8583 Message Example:</h5>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`const axios = require('axios');

const sendISO8583 = async () => {
  const response = await axios.post(
    'http://188.166.207.82:8000/api/v1/iso/messages',
    {
      message_type: '0200',
      fields: {
        '2': '4111111111111111',
        '3': '000000',
        '4': '000000010000',
        '7': '0630123456',
        '11': '123456',
        '41': 'TERM0001',
        '42': 'MERCH001'
      }
    },
    {
      headers: {
        'apikey': 'FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH',
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log('ISO Response:', response.data);
};`}
                                        </pre>
                                    </div>

                                    <Alert className="bg-yellow-50 border-yellow-200">
                                        <AlertDescription className="text-xs">
                                            <strong>Rate Limit:</strong> 2,000 messages/minute, 100,000 messages/hour
                                        </AlertDescription>
                                    </Alert>
                                </TabsContent>

                                <TabsContent value="orchestration" className="space-y-4">
                                    <h4 className="font-semibold">Orchestration Service - Smart Routing</h4>
                                    <p className="text-sm text-slate-600">Route payments intelligently across multiple processors.</p>
                                    
                                    <div>
                                        <h5 className="font-semibold text-sm mb-2">Create Orchestration Rule:</h5>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`const createRoutingRule = async () => {
  const response = await axios.post(
    'http://188.166.207.82:8000/api/v1/orchestration/rules',
    {
      name: "Route High-Value Transactions",
      conditions: {
        amount_gte: 1000,
        currency: "USD"
      },
      primary_processor: "stripe",
      fallback_processors: ["adyen", "checkout"],
      retry_attempts: 3
    },
    {
      headers: {
        'apikey': 'FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH',
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
};`}
                                        </pre>
                                    </div>
                                </TabsContent>

                                <TabsContent value="crypto" className="space-y-4">
                                    <h4 className="font-semibold">Crypto Banking - Digital Assets</h4>
                                    <p className="text-sm text-slate-600">Manage crypto wallets, IBANs, and digital asset transactions.</p>
                                    
                                    <div>
                                        <h5 className="font-semibold text-sm mb-2">Create Crypto Wallet:</h5>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`const createWallet = async () => {
  const response = await axios.post(
    'http://188.166.207.82:8000/api/v1/crypto/wallets',
    {
      customer_id: "CUST123",
      blockchain_network: "ethereum",
      asset_type: "ETH"
    },
    {
      headers: {
        'apikey': 'FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH',
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log('Wallet created:', response.data);
};`}
                                        </pre>
                                    </div>

                                    <Alert className="bg-yellow-50 border-yellow-200">
                                        <AlertDescription className="text-xs">
                                            <strong>Rate Limit:</strong> 500 requests/minute, 25,000 requests/hour
                                        </AlertDescription>
                                    </Alert>
                                </TabsContent>

                                <TabsContent value="rwa" className="space-y-4">
                                    <h4 className="font-semibold">RWA Platform - Asset Tokenization</h4>
                                    <p className="text-sm text-slate-600">Tokenize real-world assets and manage digital securities.</p>
                                    
                                    <div>
                                        <h5 className="font-semibold text-sm mb-2">Tokenize Asset:</h5>
                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`const tokenizeAsset = async () => {
  const response = await axios.post(
    'http://188.166.207.82:8000/api/v1/rwa/assets/tokenize',
    {
      asset_name: "Commercial Property ABC",
      asset_type: "real_estate",
      total_value: 5000000,
      token_supply: 5000,
      blockchain_network: "ethereum",
      issuer_lei: "123456789012ABCDEFGH"
    },
    {
      headers: {
        'apikey': 'FqeDDx9H0dJdWV3d8B4g2vMG2XJGgRrH',
        'Content-Type': 'application/json'
      }
    }
  );
  
  console.log('Asset tokenized:', response.data);
};`}
                                        </pre>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Authentication & Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                Authentication & Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">API Key Authentication</h4>
                                <p className="text-sm text-slate-600 mb-2">All requests must include your API key in the header:</p>
                                <pre className="bg-slate-50 p-3 rounded-lg text-xs">
{`Authorization: apikey YOUR_API_KEY
# OR
apikey: YOUR_API_KEY`}
                                </pre>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Rate Limits by Service</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                        <span className="font-medium">PSP Service</span>
                                        <span className="text-slate-600">1,000/min • 50,000/hour</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                        <span className="font-medium">ISO Gateway</span>
                                        <span className="text-slate-600">2,000/min • 100,000/hour</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                        <span className="font-medium">Orchestration</span>
                                        <span className="text-slate-600">1,500/min • 75,000/hour</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                        <span className="font-medium">Crypto Banking</span>
                                        <span className="text-slate-600">500/min • 25,000/hour</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                        <span className="font-medium">RWA Platform</span>
                                        <span className="text-slate-600">1,000/min • 50,000/hour</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Rate Limit Headers</h4>
                                <p className="text-sm text-slate-600 mb-2">Kong returns rate limit information in response headers:</p>
                                <pre className="bg-slate-50 p-3 rounded-lg text-xs">
{`X-RateLimit-Limit-Minute: 1000
X-RateLimit-Remaining-Minute: 950
X-RateLimit-Limit-Hour: 50000
X-RateLimit-Remaining-Hour: 49500`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Handling */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-red-600" />
                                Error Handling
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Common HTTP Status Codes</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">401 Unauthorized</span>
                                            <Badge variant="destructive">AUTH ERROR</Badge>
                                        </div>
                                        <p className="text-xs text-slate-600">Missing or invalid API key</p>
                                        <pre className="text-xs mt-1 bg-red-100 p-2 rounded">
{`{"message": "No API key found in request"}`}
                                        </pre>
                                    </div>

                                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">429 Too Many Requests</span>
                                            <Badge className="bg-yellow-600">RATE LIMIT</Badge>
                                        </div>
                                        <p className="text-xs text-slate-600">Rate limit exceeded</p>
                                        <pre className="text-xs mt-1 bg-yellow-100 p-2 rounded">
{`{"message": "API rate limit exceeded"}`}
                                        </pre>
                                    </div>

                                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">404 Not Found</span>
                                            <Badge className="bg-blue-600">NOT FOUND</Badge>
                                        </div>
                                        <p className="text-xs text-slate-600">Endpoint or resource doesn't exist</p>
                                    </div>

                                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">200 OK</span>
                                            <Badge className="bg-green-600">SUCCESS</Badge>
                                        </div>
                                        <p className="text-xs text-slate-600">Request successful</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Error Handling Example</h4>
                                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto">
{`const makeAPICall = async () => {
  try {
    const response = await axios.post(url, data, {
      headers: { 'apikey': 'YOUR_KEY' }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Authentication failed - check API key');
          break;
        case 429:
          console.error('Rate limit exceeded - wait before retry');
          break;
        case 404:
          console.error('Endpoint not found');
          break;
        default:
          console.error('API error:', error.response.data);
      }
    }
    throw error;
  }
};`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Book className="h-5 w-5 text-blue-600" />
                                Need Help?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm">
                                <p className="font-medium mb-2">Support Resources:</p>
                                <ul className="space-y-1 text-slate-700">
                                    <li>• <strong>Documentation:</strong> https://docs.fts.money</li>
                                    <li>• <strong>API Status:</strong> https://status.fts.money</li>
                                    <li>• <strong>Support Email:</strong> api-support@fts.money</li>
                                    <li>• <strong>Developer Forum:</strong> https://community.fts.money</li>
                                </ul>
                            </div>

                            <Alert>
                                <AlertDescription className="text-xs">
                                    <strong>Production Migration:</strong> Once you're ready for production, contact your account manager to:
                                    <br/>• Upgrade to custom domain (api.yourdomain.com)
                                    <br/>• Enable SSL/TLS certificates
                                    <br/>• Increase rate limits
                                    <br/>• Setup dedicated Kong instance
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}