import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    Smartphone, 
    Globe, 
    CheckCircle,
    Loader2,
    Search,
    ExternalLink,
    Settings,
    Key,
    Shield
} from 'lucide-react';

const apmProviders = [
    { id: 'alipay', name: 'Alipay', region: 'China', logo: '🅰️', color: 'bg-blue-500' },
    { id: 'wechat_pay', name: 'WeChat Pay', region: 'China', logo: '💬', color: 'bg-green-500' },
    { id: 'paypal', name: 'PayPal', region: 'Global', logo: '🅿️', color: 'bg-blue-600' },
    { id: 'apple_pay', name: 'Apple Pay', region: 'Global', logo: '🍎', color: 'bg-slate-900' },
    { id: 'google_pay', name: 'Google Pay', region: 'Global', logo: '🔵', color: 'bg-white border' },
    { id: 'klarna', name: 'Klarna', region: 'Europe', logo: '🟣', color: 'bg-pink-500' },
    { id: 'afterpay', name: 'Afterpay', region: 'Global', logo: '🟢', color: 'bg-teal-500' },
    { id: 'grab_pay', name: 'GrabPay', region: 'Southeast Asia', logo: '🟢', color: 'bg-green-600' },
    { id: 'paynow', name: 'PayNow', region: 'Singapore', logo: '🔴', color: 'bg-red-500' },
    { id: 'ideal', name: 'iDEAL', region: 'Netherlands', logo: '🏦', color: 'bg-pink-600' },
    { id: 'giropay', name: 'Giropay', region: 'Germany', logo: '🏦', color: 'bg-blue-800' },
    { id: 'sofort', name: 'Sofort', region: 'Europe', logo: '🏦', color: 'bg-pink-400' },
    { id: 'pix', name: 'PIX', region: 'Brazil', logo: '🇧🇷', color: 'bg-teal-400' },
    { id: 'upi', name: 'UPI', region: 'India', logo: '🇮🇳', color: 'bg-green-700' },
    { id: 'paytm', name: 'Paytm', region: 'India', logo: '💳', color: 'bg-blue-400' },
    { id: 'promptpay', name: 'PromptPay', region: 'Thailand', logo: '🇹🇭', color: 'bg-blue-700' },
];

export default function APMOnboarding() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedAPM, setSelectedAPM] = useState(null);
    const [configuring, setConfiguring] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [credentials, setCredentials] = useState({
        app_id: '',
        app_secret: '',
        merchant_id: '',
        public_key: '',
        private_key: '',
        webhook_url: '',
    });
    const queryClient = useQueryClient();

    const filteredProviders = apmProviders.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || 
            (activeTab === 'wallets' && ['alipay', 'wechat_pay', 'apple_pay', 'google_pay', 'paypal', 'grab_pay'].includes(p.id)) ||
            (activeTab === 'bnpl' && ['klarna', 'afterpay'].includes(p.id)) ||
            (activeTab === 'bank' && ['ideal', 'giropay', 'sofort', 'pix', 'upi', 'paynow', 'promptpay'].includes(p.id));
        return matchesSearch && matchesTab;
    });

    const connectAPM = useMutation({
        mutationFn: async () => {
            return base44.entities.PaymentProcessor.create({
                processor_id: `APM-${selectedAPM.id.toUpperCase()}-${Date.now()}`,
                name: selectedAPM.name,
                type: 'psp',
                status: 'active',
                supported_networks: [selectedAPM.id],
                supported_currencies: ['USD', 'EUR', 'GBP', 'CNY', 'SGD'],
                supported_countries: ['Global'],
                supports_3ds: false,
                supports_recurring: ['paypal', 'klarna', 'afterpay'].includes(selectedAPM.id),
                priority: 50,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processors'] });
            setConfiguring(false);
            setSelectedAPM(null);
        }
    });

    const getCredentialFields = (apmId) => {
        const commonFields = ['app_id', 'app_secret', 'merchant_id'];
        const fieldsByAPM = {
            alipay: [...commonFields, 'public_key', 'private_key'],
            wechat_pay: [...commonFields, 'api_key'],
            paypal: ['client_id', 'client_secret', 'webhook_id'],
            apple_pay: ['merchant_id', 'certificate', 'private_key'],
            google_pay: ['merchant_id', 'gateway_merchant_id'],
            klarna: ['username', 'password', 'api_key'],
        };
        return fieldsByAPM[apmId] || commonFields;
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="APMOnboarding" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Alternative Payment Methods</h1>
                        <p className="text-slate-500">Connect digital wallets, BNPL providers, and local payment methods</p>
                    </div>

                    {!configuring ? (
                        <>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search payment methods..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList>
                                        <TabsTrigger value="all">All</TabsTrigger>
                                        <TabsTrigger value="wallets">Wallets</TabsTrigger>
                                        <TabsTrigger value="bnpl">BNPL</TabsTrigger>
                                        <TabsTrigger value="bank">Bank Transfers</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProviders.map((apm) => (
                                    <Card 
                                        key={apm.id} 
                                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => { setSelectedAPM(apm); setConfiguring(true); }}
                                    >
                                        <div className={cn("h-2", apm.color)} />
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{apm.logo}</span>
                                                    <div>
                                                        <h3 className="font-semibold">{apm.name}</h3>
                                                        <p className="text-xs text-slate-500">{apm.region}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full gap-2" size="sm">
                                                <Settings className="h-4 w-4" />
                                                Configure
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{selectedAPM.logo}</span>
                                    <div>
                                        <CardTitle>{selectedAPM.name} Configuration</CardTitle>
                                        <p className="text-sm text-slate-500">Enter your {selectedAPM.name} API credentials</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-medium text-blue-800">Get your API credentials</p>
                                            <p className="text-blue-600">
                                                Visit the {selectedAPM.name} developer portal to obtain your API keys.
                                            </p>
                                            <Button variant="link" className="p-0 h-auto text-blue-700" asChild>
                                                <a href="#" target="_blank" rel="noopener noreferrer">
                                                    Open Developer Portal <ExternalLink className="h-3 w-3 ml-1" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {getCredentialFields(selectedAPM.id).map((field) => (
                                    <div key={field} className="space-y-2">
                                        <Label className="capitalize">{field.replace(/_/g, ' ')}</Label>
                                        <Input
                                            type={field.includes('secret') || field.includes('key') || field.includes('password') ? 'password' : 'text'}
                                            value={credentials[field] || ''}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, [field]: e.target.value }))}
                                            placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                                        />
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <Label>Webhook URL</Label>
                                    <Input
                                        value={`https://api.paymenthub.com/webhooks/${selectedAPM.id}`}
                                        readOnly
                                        className="bg-slate-50 font-mono text-sm"
                                    />
                                    <p className="text-xs text-slate-500">Configure this URL in your {selectedAPM.name} dashboard</p>
                                </div>

                                <div className="space-y-3 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Enable in production</span>
                                        <Switch defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Enable for all merchants</span>
                                        <Switch />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button variant="outline" onClick={() => { setConfiguring(false); setSelectedAPM(null); }}>
                                        Cancel
                                    </Button>
                                    <Button 
                                        className="flex-1 gap-2" 
                                        onClick={() => connectAPM.mutate()}
                                        disabled={connectAPM.isPending}
                                    >
                                        {connectAPM.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        Connect {selectedAPM.name}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}