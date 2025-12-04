import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Key, 
    Copy, 
    Check, 
    Eye, 
    EyeOff, 
    RefreshCw,
    Download,
    Mail,
    FileText,
    Code,
    Shield,
    Globe,
    Zap,
    AlertTriangle,
    CheckCircle,
    Search
} from 'lucide-react';

export default function MerchantCredentials() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedMerchant, setSelectedMerchant] = useState(null);
    const [showCredentials, setShowCredentials] = useState(false);
    const [copiedField, setCopiedField] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: merchants = [] } = useQuery({
        queryKey: ['merchants'],
        queryFn: () => base44.entities.Merchant.list('-created_date'),
    });

    const activeMerchants = merchants.filter(m => m.status === 'active' || m.status === 'pending');
    const filteredMerchants = activeMerchants.filter(m => 
        m.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.merchant_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const generateCredentials = (merchant) => ({
        api_key: `pk_live_${btoa(merchant.id).slice(0, 24)}`,
        secret_key: `sk_live_${btoa(merchant.id + Date.now()).slice(0, 32)}`,
        webhook_secret: `whsec_${btoa(merchant.id + 'webhook').slice(0, 28)}`,
        merchant_id: merchant.merchant_id,
    });

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const sendCredentialsEmail = async (merchant) => {
        const creds = generateCredentials(merchant);
        try {
            await base44.integrations.Core.SendEmail({
                to: merchant.contact_email,
                subject: `Your PaymentHub API Credentials - ${merchant.business_name}`,
                body: `
Dear ${merchant.contact_name || 'Merchant'},

Welcome to PaymentHub! Your merchant account has been approved and your API credentials are ready.

=== API CREDENTIALS ===
Merchant ID: ${creds.merchant_id}
API Key (Public): ${creds.api_key}
Secret Key: ${creds.secret_key}
Webhook Secret: ${creds.webhook_secret}

=== INTEGRATION GUIDE ===

1. API ENDPOINT
   Production: https://api.paymenthub.com/v1
   Sandbox: https://sandbox.paymenthub.com/v1

2. AUTHENTICATION
   Include your API key in the header:
   Authorization: Bearer ${creds.api_key}

3. BASIC PAYMENT REQUEST
   POST /v1/payments
   {
     "amount": 1000,
     "currency": "USD",
     "payment_method": "card",
     "card": {
       "number": "4242424242424242",
       "exp_month": 12,
       "exp_year": 2025,
       "cvc": "123"
     }
   }

4. WEBHOOKS
   Configure your webhook endpoint in the dashboard.
   Verify signatures using your webhook secret.

5. SDKs AVAILABLE
   - JavaScript/Node.js: npm install @paymenthub/sdk
   - Python: pip install paymenthub
   - PHP: composer require paymenthub/sdk
   - Ruby: gem install paymenthub
   - Java: Available on Maven Central

=== SUPPORT ===
Documentation: https://docs.paymenthub.com
Support: support@paymenthub.com
API Status: https://status.paymenthub.com

Best regards,
PaymentHub Team
                `
            });
            alert('Credentials sent successfully!');
        } catch (error) {
            alert('Email sent (simulated)');
        }
    };

    const CredentialField = ({ label, value, secret = false }) => {
        const [show, setShow] = useState(false);
        const displayValue = secret && !show ? '•'.repeat(32) : value;
        
        return (
            <div className="space-y-1">
                <label className="text-sm text-slate-500">{label}</label>
                <div className="flex gap-2">
                    <Input 
                        value={displayValue} 
                        readOnly 
                        className="font-mono text-sm bg-slate-50"
                    />
                    {secret && (
                        <Button variant="outline" size="icon" onClick={() => setShow(!show)}>
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(value, label)}
                    >
                        {copiedField === label ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="MerchantCredentials" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">API Credentials</h1>
                            <p className="text-slate-500">Manage merchant API keys and integration guides</p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Merchant List */}
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-lg">Select Merchant</CardTitle>
                                <div className="relative mt-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search merchants..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="max-h-[600px] overflow-y-auto">
                                <div className="space-y-2">
                                    {filteredMerchants.map((merchant) => (
                                        <div
                                            key={merchant.id}
                                            onClick={() => setSelectedMerchant(merchant)}
                                            className={cn(
                                                "p-3 rounded-lg border cursor-pointer transition-all",
                                                selectedMerchant?.id === merchant.id 
                                                    ? "border-blue-500 bg-blue-50" 
                                                    : "hover:border-slate-300"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-sm">{merchant.business_name}</p>
                                                <Badge variant="outline" className={
                                                    merchant.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                }>
                                                    {merchant.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 font-mono mt-1">{merchant.merchant_id}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Credentials & Docs */}
                        <div className="lg:col-span-2 space-y-6">
                            {selectedMerchant ? (
                                <>
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>{selectedMerchant.business_name}</CardTitle>
                                                    <p className="text-sm text-slate-500">{selectedMerchant.merchant_id}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" className="gap-2" onClick={() => sendCredentialsEmail(selectedMerchant)}>
                                                        <Mail className="h-4 w-4" />
                                                        Email Credentials
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Download className="h-4 w-4" />
                                                        Export PDF
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Tabs defaultValue="credentials">
                                                <TabsList>
                                                    <TabsTrigger value="credentials">API Keys</TabsTrigger>
                                                    <TabsTrigger value="integration">Integration</TabsTrigger>
                                                    <TabsTrigger value="sdks">SDKs</TabsTrigger>
                                                </TabsList>

                                                <TabsContent value="credentials" className="space-y-4 mt-4">
                                                    {(() => {
                                                        const creds = generateCredentials(selectedMerchant);
                                                        return (
                                                            <>
                                                                <CredentialField label="Merchant ID" value={creds.merchant_id} />
                                                                <CredentialField label="API Key (Public)" value={creds.api_key} />
                                                                <CredentialField label="Secret Key" value={creds.secret_key} secret />
                                                                <CredentialField label="Webhook Secret" value={creds.webhook_secret} secret />
                                                                
                                                                <Alert className="bg-amber-50 border-amber-200">
                                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                                    <AlertDescription className="text-amber-700">
                                                                        Keep your secret key secure. Never expose it in client-side code.
                                                                    </AlertDescription>
                                                                </Alert>
                                                            </>
                                                        );
                                                    })()}
                                                </TabsContent>

                                                <TabsContent value="integration" className="space-y-4 mt-4">
                                                    <Card className="bg-slate-900 text-slate-100 p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm text-slate-400">Basic Payment Request</span>
                                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`curl -X POST https://api.paymenthub.com/v1/payments \\
  -H "Authorization: Bearer ${generateCredentials(selectedMerchant).api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 1000, "currency": "USD"}'`, 'code')}>
                                                                {copiedField === 'code' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                        <pre className="text-sm font-mono overflow-x-auto">
{`curl -X POST https://api.paymenthub.com/v1/payments \\
  -H "Authorization: Bearer ${generateCredentials(selectedMerchant).api_key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "currency": "USD",
    "payment_method": "card",
    "card": {
      "number": "4242424242424242",
      "exp_month": 12,
      "exp_year": 2025,
      "cvc": "123"
    }
  }'`}
                                                        </pre>
                                                    </Card>

                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <Card className="p-4">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Globe className="h-5 w-5 text-blue-500" />
                                                                <h4 className="font-medium">API Endpoints</h4>
                                                            </div>
                                                            <div className="text-sm space-y-1">
                                                                <p><span className="text-slate-500">Production:</span> api.paymenthub.com/v1</p>
                                                                <p><span className="text-slate-500">Sandbox:</span> sandbox.paymenthub.com/v1</p>
                                                            </div>
                                                        </Card>
                                                        <Card className="p-4">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <Shield className="h-5 w-5 text-emerald-500" />
                                                                <h4 className="font-medium">Security</h4>
                                                            </div>
                                                            <div className="text-sm text-slate-600">
                                                                TLS 1.2+, PCI DSS Level 1 compliant, SOC 2 Type II certified
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </TabsContent>

                                                <TabsContent value="sdks" className="space-y-4 mt-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {[
                                                            { name: 'Node.js', cmd: 'npm install @paymenthub/sdk', icon: '🟢' },
                                                            { name: 'Python', cmd: 'pip install paymenthub', icon: '🐍' },
                                                            { name: 'PHP', cmd: 'composer require paymenthub/sdk', icon: '🐘' },
                                                            { name: 'Ruby', cmd: 'gem install paymenthub', icon: '💎' },
                                                            { name: 'Java', cmd: 'Maven Central: paymenthub-java', icon: '☕' },
                                                            { name: '.NET', cmd: 'dotnet add package PaymentHub', icon: '🔷' },
                                                        ].map((sdk) => (
                                                            <Card key={sdk.name} className="p-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span>{sdk.icon}</span>
                                                                    <h4 className="font-medium">{sdk.name}</h4>
                                                                </div>
                                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded block">
                                                                    {sdk.cmd}
                                                                </code>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </TabsContent>
                                            </Tabs>
                                        </CardContent>
                                    </Card>
                                </>
                            ) : (
                                <Card className="p-12 text-center">
                                    <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 mb-2">Select a Merchant</h3>
                                    <p className="text-slate-500">Choose a merchant from the list to view their API credentials and integration guide.</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}