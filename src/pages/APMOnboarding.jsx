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
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { 
    Smartphone, 
    Globe, 
    CheckCircle,
    Loader2,
    Search,
    ExternalLink,
    Settings,
    Key,
    Shield,
    Plus,
    Upload
} from 'lucide-react';

const apmProviders = [
    // Digital Wallets
    { id: 'alipay', name: 'Alipay', region: 'China', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Alipay_logo.svg/120px-Alipay_logo.svg.png', color: 'bg-blue-500', category: 'wallets' },
    { id: 'wechat_pay', name: 'WeChat Pay', region: 'China', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/WeChat_Pay_logo.svg/120px-WeChat_Pay_logo.svg.png', color: 'bg-green-500', category: 'wallets' },
    { id: 'paypal', name: 'PayPal', region: 'Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/120px-PayPal.svg.png', color: 'bg-blue-600', category: 'wallets' },
    { id: 'apple_pay', name: 'Apple Pay', region: 'Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/120px-Apple_Pay_logo.svg.png', color: 'bg-slate-900', category: 'wallets' },
    { id: 'google_pay', name: 'Google Pay', region: 'Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/120px-Google_Pay_Logo.svg.png', color: 'bg-white border', category: 'wallets' },
    { id: 'samsung_pay', name: 'Samsung Pay', region: 'Global', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Samsung_Pay_Logo.svg/120px-Samsung_Pay_Logo.svg.png', color: 'bg-blue-700', category: 'wallets' },
    { id: 'grab_pay', name: 'GrabPay', region: 'Southeast Asia', logo: '🟢', color: 'bg-green-600', category: 'wallets' },
    // BNPL
    { id: 'klarna', name: 'Klarna', region: 'Europe', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Klarna_Logo_black.svg/120px-Klarna_Logo_black.svg.png', color: 'bg-pink-500', category: 'bnpl' },
    { id: 'afterpay', name: 'Afterpay', region: 'Global', logo: '🟢', color: 'bg-teal-500', category: 'bnpl' },
    { id: 'affirm', name: 'Affirm', region: 'US', logo: '💳', color: 'bg-blue-600', category: 'bnpl' },
    { id: 'clearpay', name: 'Clearpay', region: 'UK', logo: '💳', color: 'bg-teal-600', category: 'bnpl' },
    // Bank Transfers
    { id: 'ideal', name: 'iDEAL', region: 'Netherlands', logo: '🏦', color: 'bg-pink-600', category: 'bank' },
    { id: 'giropay', name: 'Giropay', region: 'Germany', logo: '🏦', color: 'bg-blue-800', category: 'bank' },
    { id: 'sofort', name: 'Sofort', region: 'Europe', logo: '🏦', color: 'bg-pink-400', category: 'bank' },
    { id: 'pix', name: 'PIX', region: 'Brazil', logo: '🇧🇷', color: 'bg-teal-400', category: 'bank' },
    { id: 'upi', name: 'UPI', region: 'India', logo: '🇮🇳', color: 'bg-green-700', category: 'bank' },
    { id: 'paynow', name: 'PayNow', region: 'Singapore', logo: '🔴', color: 'bg-red-500', category: 'bank' },
    { id: 'promptpay', name: 'PromptPay', region: 'Thailand', logo: '🇹🇭', color: 'bg-blue-700', category: 'bank' },
    { id: 'bancontact', name: 'Bancontact', region: 'Belgium', logo: '🏦', color: 'bg-blue-500', category: 'bank' },
    { id: 'eps', name: 'EPS', region: 'Austria', logo: '🏦', color: 'bg-red-600', category: 'bank' },
    // Crypto
    { id: 'usdt', name: 'USDT (Tether)', region: 'Global', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=026', color: 'bg-emerald-500', category: 'crypto' },
    { id: 'usdc', name: 'USDC', region: 'Global', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026', color: 'bg-blue-500', category: 'crypto' },
    { id: 'btc', name: 'Bitcoin (BTC)', region: 'Global', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=026', color: 'bg-orange-500', category: 'crypto' },
    { id: 'eth', name: 'Ethereum (ETH)', region: 'Global', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026', color: 'bg-purple-500', category: 'crypto' },
    { id: 'bnb', name: 'BNB', region: 'Global', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png?v=026', color: 'bg-yellow-500', category: 'crypto' },
    { id: 'sol', name: 'Solana (SOL)', region: 'Global', logo: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=026', color: 'bg-gradient-to-r from-purple-500 to-cyan-500', category: 'crypto' },
    { id: 'xrp', name: 'XRP', region: 'Global', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.png?v=026', color: 'bg-slate-700', category: 'crypto' },
    { id: 'dai', name: 'DAI', region: 'Global', logo: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=026', color: 'bg-amber-500', category: 'crypto' },
    { id: 'busd', name: 'BUSD', region: 'Global', logo: 'https://cryptologos.cc/logos/binance-usd-busd-logo.png?v=026', color: 'bg-yellow-400', category: 'crypto' },
    // Local Methods
    { id: 'paytm', name: 'Paytm', region: 'India', logo: '💳', color: 'bg-blue-400', category: 'local' },
    { id: 'gcash', name: 'GCash', region: 'Philippines', logo: '💳', color: 'bg-blue-600', category: 'local' },
    { id: 'maya', name: 'Maya', region: 'Philippines', logo: '💳', color: 'bg-green-500', category: 'local' },
    { id: 'dana', name: 'DANA', region: 'Indonesia', logo: '💳', color: 'bg-blue-500', category: 'local' },
    { id: 'ovo', name: 'OVO', region: 'Indonesia', logo: '💳', color: 'bg-purple-600', category: 'local' },
    { id: 'truemoney', name: 'TrueMoney', region: 'Thailand', logo: '💳', color: 'bg-orange-500', category: 'local' },
];

export default function APMOnboarding() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedAPM, setSelectedAPM] = useState(null);
    const [configuring, setConfiguring] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [showAddCustom, setShowAddCustom] = useState(false);
    const [customProviders, setCustomProviders] = useState([]);
    const [newProvider, setNewProvider] = useState({ name: '', region: '', category: 'local', logo: '', color: 'bg-slate-500' });
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [credentials, setCredentials] = useState({
        app_id: '',
        app_secret: '',
        merchant_id: '',
        public_key: '',
        private_key: '',
        webhook_url: '',
    });
    const queryClient = useQueryClient();
    
    const allProviders = [...apmProviders, ...customProviders];

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingLogo(true);
            try {
                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                setNewProvider(p => ({ ...p, logo: file_url }));
            } catch (error) {
                console.error('Upload failed');
            }
            setUploadingLogo(false);
        }
    };

    const addCustomProvider = () => {
        if (newProvider.name) {
            setCustomProviders(prev => [...prev, { ...newProvider, id: `custom_${Date.now()}` }]);
            setShowAddCustom(false);
            setNewProvider({ name: '', region: '', category: 'local', logo: '', color: 'bg-slate-500' });
        }
    };

    const filteredProviders = allProviders.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' || p.category === activeTab;
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
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Alternative Payment Methods</h1>
                            <p className="text-slate-500">Connect digital wallets, BNPL, crypto, and local payment methods</p>
                        </div>
                        <Button onClick={() => setShowAddCustom(true)} className="gap-2"><Plus className="h-4 w-4" />Add Custom APM</Button>
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
                                        <TabsTrigger value="bank">Bank</TabsTrigger>
                                        <TabsTrigger value="crypto">Crypto</TabsTrigger>
                                        <TabsTrigger value="local">Local</TabsTrigger>
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
                                                    {apm.logo?.startsWith('http') ? (
                                                        <img src={apm.logo} alt={apm.name} className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                    ) : null}
                                                    <span className={cn("text-2xl", apm.logo?.startsWith('http') && "hidden")}>{apm.logo?.startsWith('http') ? '💳' : apm.logo}</span>
                                                    <div>
                                                        <h3 className="font-semibold">{apm.name}</h3>
                                                        <p className="text-xs text-slate-500">{apm.region}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="text-xs">{apm.category}</Badge>
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
                    {/* Add Custom APM Dialog */}
                    <Dialog open={showAddCustom} onOpenChange={setShowAddCustom}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Custom Payment Method</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Provider Name *</Label>
                                    <Input value={newProvider.name} onChange={(e) => setNewProvider(p => ({ ...p, name: e.target.value }))} placeholder="e.g., LocalPay" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Region</Label>
                                        <Input value={newProvider.region} onChange={(e) => setNewProvider(p => ({ ...p, region: e.target.value }))} placeholder="e.g., Asia" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <select value={newProvider.category} onChange={(e) => setNewProvider(p => ({ ...p, category: e.target.value }))} className="w-full border rounded-md p-2">
                                            <option value="wallets">Wallets</option>
                                            <option value="bnpl">BNPL</option>
                                            <option value="bank">Bank Transfer</option>
                                            <option value="crypto">Crypto</option>
                                            <option value="local">Local</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Logo</Label>
                                    {newProvider.logo && (
                                        <div className="mb-2"><img src={newProvider.logo} alt="Logo preview" className="h-12 object-contain" /></div>
                                    )}
                                    <div className="flex gap-2">
                                        <Input value={newProvider.logo} onChange={(e) => setNewProvider(p => ({ ...p, logo: e.target.value }))} placeholder="Logo URL" />
                                        <label className="cursor-pointer">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                            <Button variant="outline" size="icon" disabled={uploadingLogo} asChild>
                                                <span>{uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                                            </Button>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAddCustom(false)}>Cancel</Button>
                                <Button onClick={addCustomProvider} disabled={!newProvider.name}>Add Provider</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}