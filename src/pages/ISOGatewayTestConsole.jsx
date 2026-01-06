import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Play, Code, FileText, Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

export default function ISOGatewayTestConsole() {
    const [testApiKey, setTestApiKey] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Sample ISO 8583 message (base64)
    const sampleISO8583 = 'MDIwMDA3MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA=';
    
    // Sample ISO 20022 message
    const sampleISO20022 = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.01">
    <FIToFICstmrCdtTrf>
        <GrpHdr>
            <MsgId>TEST-${Date.now()}</MsgId>
            <CreDtTm>${new Date().toISOString()}</CreDtTm>
            <NbOfTxs>1</NbOfTxs>
        </GrpHdr>
        <CdtTrfTxInf>
            <PmtId>
                <EndToEndId>TEST-E2E-001</EndToEndId>
            </PmtId>
            <Amt Ccy="USD">
                <InstdAmt>100.00</InstdAmt>
            </Amt>
        </CdtTrfTxInf>
    </FIToFICstmrCdtTrf>
</Document>`;

    const { data: customers = [] } = useQuery({
        queryKey: ['iso-gateway-customers'],
        queryFn: async () => await base44.entities.ISOGatewayCustomer.list() || []
    });

    const { data: apiKeys = [] } = useQuery({
        queryKey: ['iso-gateway-apikeys'],
        queryFn: async () => await base44.entities.ISOGatewayAPIKey.list() || []
    });

    const testISO8583Mutation = useMutation({
        mutationFn: async ({ apiKey, message }) => {
            return await base44.functions.invoke('receiveISO8583', {
                api_key: apiKey,
                message: message
            });
        },
        onSuccess: (result) => {
            setTestResult({ success: true, data: result.data });
        },
        onError: (error) => {
            setTestResult({ success: false, error: error.message });
        }
    });

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {mobileSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}
            
            <div className={cn(
                "fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300",
                mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <FTSPlatformSidebar currentPage="ISOGatewayTestConsole" />
            </div>
            
            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden flex-shrink-0"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">ISO Gateway Test Console</h2>
                        </div>
                    </div>
                </header>
                <div className="p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">ISO Gateway Test Console</h1>
                        <p className="text-gray-600 mt-1">Test API endpoints and view integration docs</p>
                    </div>

                    <Tabs defaultValue="endpoints" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                            <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
                            <TabsTrigger value="test">Live Testing</TabsTrigger>
                            <TabsTrigger value="examples">Code Examples</TabsTrigger>
                            <TabsTrigger value="customers">Quick Start</TabsTrigger>
                        </TabsList>

                        {/* API Endpoints Tab */}
                        <TabsContent value="endpoints" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Real-Time Gateway Endpoints
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-medium text-sm">ISO 8583 Ingress</p>
                                            <Badge className="bg-green-600">POST</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-xs bg-white p-2 rounded border">
                                                https://iso-gateway.fts.money/api/receive/8583/{'{{api_key}}'}
                                            </code>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard('https://iso-gateway.fts.money/api/receive/8583/')}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            Content-Type: application/octet-stream or application/json (base64)
                                        </p>
                                    </div>

                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="font-medium text-sm">ISO 20022 Ingress</p>
                                            <Badge className="bg-green-600">POST</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-xs bg-white p-2 rounded border">
                                                https://iso-gateway.fts.money/api/receive/20022/{'{{api_key}}'}
                                            </code>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard('https://iso-gateway.fts.money/api/receive/20022/')}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            Content-Type: application/xml
                                        </p>
                                    </div>

                                    <Alert>
                                        <AlertDescription>
                                            Replace {'{{api_key}}'} with your actual API key. Messages are translated in real-time and routed to your configured destination endpoint.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Live Testing Tab */}
                        <TabsContent value="test" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Test ISO 8583 → ISO 20022 Translation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">API Key</label>
                                        <Select value={testApiKey} onValueChange={setTestApiKey}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select API key" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {apiKeys.map(key => (
                                                    <SelectItem key={key.id} value={key.api_key}>
                                                        {key.key_name} ({key.key_prefix}...)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-medium">ISO 8583 Message (base64)</label>
                                            <Button size="sm" variant="outline" onClick={() => setTestMessage(sampleISO8583)}>
                                                Load Sample
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={testMessage}
                                            onChange={(e) => setTestMessage(e.target.value)}
                                            placeholder="Paste base64-encoded ISO 8583 message"
                                            className="font-mono text-xs"
                                            rows={6}
                                        />
                                    </div>

                                    <Button 
                                        onClick={() => testISO8583Mutation.mutate({ apiKey: testApiKey, message: testMessage })}
                                        disabled={!testApiKey || !testMessage}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Play className="h-4 w-4 mr-2" />
                                        Test Translation
                                    </Button>

                                    {testResult && (
                                        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                            <p className="font-medium text-sm mb-2">
                                                {testResult.success ? '✓ Success' : '✗ Error'}
                                            </p>
                                            <pre className="text-xs bg-white p-3 rounded overflow-auto">
                                                {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Code Examples Tab */}
                        <TabsContent value="examples" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Integration Examples</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">cURL Example</p>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`curl -X POST https://iso-gateway.fts.money/api/receive/8583/YOUR_API_KEY \\
  -H "Content-Type: application/json" \\
  -d '{"message": "MDIwMDA3MDAwMDAwMDAwMDAwMDA..."}'`)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto">
{`curl -X POST https://iso-gateway.fts.money/api/receive/8583/YOUR_API_KEY \\
  -H "Content-Type: application/json" \\
  -d '{"message": "MDIwMDA3MDAwMDAwMDAwMDAwMDA..."}'`}
                                        </pre>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">Node.js Example</p>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`const axios = require('axios');

const response = await axios.post(
  'https://iso-gateway.fts.money/api/receive/8583/YOUR_API_KEY',
  { message: iso8583Base64 },
  { headers: { 'Content-Type': 'application/json' } }
);

console.log(response.data.translated_message);`)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg text-xs overflow-auto">
{`const axios = require('axios');

const response = await axios.post(
  'https://iso-gateway.fts.money/api/receive/8583/YOUR_API_KEY',
  { message: iso8583Base64 },
  { headers: { 'Content-Type': 'application/json' } }
);

console.log(response.data.translated_message);`}
                                        </pre>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="font-medium">Python Example</p>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`import requests

response = requests.post(
    'https://iso-gateway.fts.money/api/receive/20022/YOUR_API_KEY',
    data=iso20022_xml,
    headers={'Content-Type': 'application/xml'}
)

print(response.json()['translated_message'])`)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <pre className="bg-gray-900 text-yellow-400 p-4 rounded-lg text-xs overflow-auto">
{`import requests

response = requests.post(
    'https://iso-gateway.fts.money/api/receive/20022/YOUR_API_KEY',
    data=iso20022_xml,
    headers={'Content-Type': 'application/xml'}
)

print(response.json()['translated_message'])`}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Quick Start Tab */}
                        <TabsContent value="customers" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Start Guide</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                                                1
                                            </div>
                                            <div>
                                                <p className="font-medium">Create Customer</p>
                                                <p className="text-sm text-gray-600">Go to Customers tab and add a new customer</p>
                                                <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = '/ISOGatewayCustomers'}>
                                                    Create Customer
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                                                2
                                            </div>
                                            <div>
                                                <p className="font-medium">Configure Connection</p>
                                                <p className="text-sm text-gray-600">Set up translation direction and destination endpoint</p>
                                                <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = '/ISOGatewayConnections'}>
                                                    Add Connection
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                                                3
                                            </div>
                                            <div>
                                                <p className="font-medium">Get API Key</p>
                                                <p className="text-sm text-gray-600">API key is auto-generated with the connection</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                                                4
                                            </div>
                                            <div>
                                                <p className="font-medium">Start Sending Messages</p>
                                                <p className="text-sm text-gray-600">Use the API endpoints to send ISO 8583 or ISO 20022 messages</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-start">
                                            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                                                5
                                            </div>
                                            <div>
                                                <p className="font-medium">Monitor Real-Time</p>
                                                <p className="text-sm text-gray-600">Watch translations in the Message Monitor</p>
                                                <Button size="sm" variant="outline" className="mt-2" onClick={() => window.location.href = '/ISOMessageMonitor'}>
                                                    View Monitor
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {customers.length > 0 && (
                                        <Alert className="bg-green-50 border-green-200">
                                            <AlertDescription>
                                                ✓ You have {customers.length} customer{customers.length > 1 ? 's' : ''} configured
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            </div>
        </div>
    );
}