import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { 
    Building2, 
    Save, 
    Loader2, 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    FileText,
    Shield,
    CheckCircle,
    DollarSign,
    Plus,
    X,
    Coins,
    UserCog,
    BookOpen,
    ExternalLink
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TimezoneSettings from '@/components/settings/TimezoneSettings';
import { ISO4217_CURRENCIES, getCurrencySymbol } from '@/components/utils/iso4217';
import { CRYPTO_ASSETS, isStablecoin } from '@/components/utils/cryptoRegistry';
import { generateCryptoAssetDTI } from '@/components/utils/iso24165';
import { getCryptoBlockchain } from '@/components/utils/cryptoRegistry';
import { ROLE_CONFIG } from '@/components/auth/permissions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Settings() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const queryClient = useQueryClient();
    const [userPspCode, setUserPspCode] = useState(null);

    // Get PSP code from staff session
    useEffect(() => {
        const sessionData = localStorage.getItem('staff_session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            console.log('⚙️ SETTINGS: PSP Code from session:', session?.psp_code);
            setUserPspCode(session.psp_code);
        } else {
            window.location.href = '/PSPLogin';
        }
    }, []);

    const { data: users = [] } = useQuery({
        queryKey: ['psp-users', userPspCode],
        queryFn: async () => {
            console.log('⚙️ SETTINGS: Fetching users for PSP:', userPspCode);
            const { data } = await base44.functions.invoke('managePSPUsers', {
                action: 'listUsers',
                psp_code: userPspCode
            });
            console.log('⚙️ SETTINGS: Users response:', data);
            return data.users || [];
        },
        enabled: !!userPspCode
    });

    const { data: pspSettings, isLoading } = useQuery({
        queryKey: ['psp-settings', userPspCode],
        queryFn: async () => {
            console.log('⚙️ SETTINGS: Fetching settings for PSP:', userPspCode);
            const { data } = await base44.functions.invoke('getPSPSettings', {
                psp_code: userPspCode
            });
            console.log('⚙️ SETTINGS: Settings response:', data);
            return data.success ? [data.settings] : [];
        },
        enabled: !!userPspCode
    });

    const savedSettings = pspSettings?.[0];

    const [searchQuery, setSearchQuery] = useState('');
    const [currencyType, setCurrencyType] = useState('fiat'); // 'fiat' or 'crypto'

    // Use ISO 4217 currencies
    const allCurrencies = ISO4217_CURRENCIES.map(curr => ({
        code: curr.code,
        name: curr.name,
        symbol: getCurrencySymbol(curr.code),
        minorUnit: curr.minorUnit,
        num: curr.num,
        type: 'fiat'
    }));

    // Add crypto assets (ISO 23257 & ISO 24165)
    const allCryptoAssets = CRYPTO_ASSETS.map(crypto => ({
        code: crypto.symbol,
        name: crypto.name,
        symbol: crypto.symbol,
        dti: generateCryptoAssetDTI(crypto.symbol),
        blockchain: getCryptoBlockchain(crypto.symbol),
        type: crypto.type,
        isStablecoin: isStablecoin(crypto.symbol)
    }));

    const [selectedCurrencies, setSelectedCurrencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD']);

    const [settings, setSettings] = useState({
        company_name: '',
        psp_code: '',
        legal_name: '',
        registration_number: '',
        vat_number: '',
        license_number: '',
        licensing_authority: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        support_email: '',
        support_phone: '',
        allow_psp_code_login: true,
        password_reset_enabled: true
    });

    const toggleCurrency = (code) => {
        setSelectedCurrencies(prev => 
            prev.includes(code) 
                ? prev.filter(c => c !== code)
                : [...prev, code]
        );
    };

    useEffect(() => {
        if (savedSettings) {
            setSettings({
                company_name: savedSettings.company_name || '',
                psp_code: savedSettings.psp_code || '',
                legal_name: savedSettings.legal_name || '',
                registration_number: savedSettings.registration_number || '',
                vat_number: savedSettings.vat_number || '',
                license_number: savedSettings.license_number || '',
                licensing_authority: savedSettings.licensing_authority || '',
                address_line1: savedSettings.address_line1 || '',
                address_line2: savedSettings.address_line2 || '',
                city: savedSettings.city || '',
                state: savedSettings.state || '',
                postal_code: savedSettings.postal_code || '',
                country: savedSettings.country || '',
                phone: savedSettings.phone || '',
                email: savedSettings.email || '',
                website: savedSettings.website || '',
                support_email: savedSettings.support_email || '',
                support_phone: savedSettings.support_phone || '',
                allow_psp_code_login: savedSettings.allow_psp_code_login ?? true,
                password_reset_enabled: savedSettings.password_reset_enabled ?? true
            });
        }
    }, [savedSettings]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            const { data: response } = await base44.functions.invoke('getPSPSettings', {
                action: 'update',
                psp_code: userPspCode,
                settings: data
            });
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psp-settings'] });
            toast.success('PSP settings saved successfully!');
        },
        onError: (error) => {
            toast.error('Failed to save settings: ' + error.message);
        }
    });

    const handleSave = () => {
        saveMutation.mutate(settings);
    };

    return (
        <div className="min-h-screen bg-slate-50">
                <Toaster position="top-right" />
                <Sidebar collapsed={sidebarCollapsed} currentPage="Settings" />
            <div className={cn("transition-all duration-300", "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                            <p className="text-slate-500">Configure your Payment Service Provider details</p>
                        </div>
                        <Button 
                            onClick={handleSave} 
                            disabled={saveMutation.isPending}
                            className="gap-2"
                        >
                            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>

                    <Tabs defaultValue="company" className="space-y-6">
                        <TabsList className="bg-white border">
                            <TabsTrigger value="company">Company Info</TabsTrigger>
                            <TabsTrigger value="address">Address</TabsTrigger>
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="licensing">Licensing</TabsTrigger>
                            <TabsTrigger value="login">Login & Security</TabsTrigger>
                            <TabsTrigger value="location">Location & Time</TabsTrigger>
                            <TabsTrigger value="currencies">Currencies</TabsTrigger>
                            <TabsTrigger value="documentation">Documentation</TabsTrigger>
                        </TabsList>

                        <TabsContent value="company">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        Company Information
                                    </CardTitle>
                                    <CardDescription>Basic details about your PSP</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">Company Name *</Label>
                                            <Input
                                                id="company_name"
                                                value={settings.company_name}
                                                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                                placeholder="e.g., PaymentHub Inc."
                                            />
                                            <p className="text-xs text-slate-500">This name will appear in the login page and throughout the app</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="psp_code">PSP Code *</Label>
                                            <Input
                                                id="psp_code"
                                                value={settings.psp_code}
                                                onChange={(e) => setSettings({ ...settings, psp_code: e.target.value.toUpperCase() })}
                                                placeholder="e.g., PSP001"
                                                className="font-mono font-bold"
                                            />
                                            <p className="text-xs text-slate-500">Unique identifier for your PSP organization</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="legal_name">Legal Entity Name</Label>
                                            <Input
                                                id="legal_name"
                                                value={settings.legal_name}
                                                onChange={(e) => setSettings({ ...settings, legal_name: e.target.value })}
                                                placeholder="e.g., PaymentHub Technologies Limited"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="registration_number">Registration Number</Label>
                                            <Input
                                                id="registration_number"
                                                value={settings.registration_number}
                                                onChange={(e) => setSettings({ ...settings, registration_number: e.target.value })}
                                                placeholder="e.g., 12345678"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="vat_number">VAT/Tax ID</Label>
                                            <Input
                                                id="vat_number"
                                                value={settings.vat_number}
                                                onChange={(e) => setSettings({ ...settings, vat_number: e.target.value })}
                                                placeholder="e.g., GB123456789"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="website"
                                                value={settings.website}
                                                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                                                placeholder="https://www.example.com"
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="address">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                        Corporate Address
                                    </CardTitle>
                                    <CardDescription>Registered business address</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address_line1">Address Line 1</Label>
                                        <Input
                                            id="address_line1"
                                            value={settings.address_line1}
                                            onChange={(e) => setSettings({ ...settings, address_line1: e.target.value })}
                                            placeholder="Street address"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address_line2">Address Line 2</Label>
                                        <Input
                                            id="address_line2"
                                            value={settings.address_line2}
                                            onChange={(e) => setSettings({ ...settings, address_line2: e.target.value })}
                                            placeholder="Suite, floor, etc."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={settings.city}
                                                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                                                placeholder="City"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State/Province</Label>
                                            <Input
                                                id="state"
                                                value={settings.state}
                                                onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                                                placeholder="State"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="postal_code">Postal Code</Label>
                                            <Input
                                                id="postal_code"
                                                value={settings.postal_code}
                                                onChange={(e) => setSettings({ ...settings, postal_code: e.target.value })}
                                                placeholder="Postal code"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={settings.country}
                                            onChange={(e) => setSettings({ ...settings, country: e.target.value })}
                                            placeholder="Country"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="contact">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                        Contact Information
                                    </CardTitle>
                                    <CardDescription>How merchants and partners can reach you</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Corporate Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={settings.email}
                                                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                                    placeholder="info@example.com"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Corporate Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="phone"
                                                    value={settings.phone}
                                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                                    placeholder="+1 (555) 123-4567"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="support_email">Support Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="support_email"
                                                    type="email"
                                                    value={settings.support_email}
                                                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                                    placeholder="support@example.com"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="support_phone">Support Phone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    id="support_phone"
                                                    value={settings.support_phone}
                                                    onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                                                    placeholder="+1 (555) 987-6543"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="licensing">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        Licensing & Regulatory
                                    </CardTitle>
                                    <CardDescription>Payment services licensing information</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="license_number">License Number</Label>
                                            <Input
                                                id="license_number"
                                                value={settings.license_number}
                                                onChange={(e) => setSettings({ ...settings, license_number: e.target.value })}
                                                placeholder="e.g., PSP-2024-001234"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="licensing_authority">Licensing Authority</Label>
                                            <Input
                                                id="licensing_authority"
                                                value={settings.licensing_authority}
                                                onChange={(e) => setSettings({ ...settings, licensing_authority: e.target.value })}
                                                placeholder="e.g., FCA, BaFin, MAS"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="login">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        Login & Security Settings
                                    </CardTitle>
                                    <CardDescription>Configure authentication and security options</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Login Methods */}
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-slate-900">Login Methods</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">PSP Code Login</p>
                                                    <p className="text-xs text-slate-500">Allow users to login with PSP code + email</p>
                                                </div>
                                                <Checkbox
                                                    checked={settings.allow_psp_code_login}
                                                    onCheckedChange={(checked) => setSettings({ ...settings, allow_psp_code_login: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">Password Reset</p>
                                                    <p className="text-xs text-slate-500">Enable forgot password functionality</p>
                                                </div>
                                                <Checkbox
                                                    checked={settings.password_reset_enabled}
                                                    onCheckedChange={(checked) => setSettings({ ...settings, password_reset_enabled: checked })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Active Users */}
                                    <div className="space-y-4 border-t pt-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-slate-900">Authorized Users</h3>
                                            <Badge variant="secondary">{users?.length || 0} active users</Badge>
                                        </div>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {users?.slice(0, 10).map(user => {
                                                const role = user.role || user.app_role || 'viewer';
                                                const config = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
                                                return (
                                                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
                                                                {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium">{user.full_name || 'No Name'}</p>
                                                                <p className="text-xs text-slate-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={cn(config.bgColor, config.textColor, "text-xs")}>
                                                                {config.label}
                                                            </Badge>
                                                            {user.two_factor_enabled && (
                                                                <Badge className="bg-green-100 text-green-700 text-xs">2FA</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/UserManagement'}>
                                            <UserCog className="h-4 w-4 mr-2" />
                                            Manage All Users
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="location">
                            <TimezoneSettings
                                currentCountry={savedSettings?.country || 'US'}
                                currentTimezone={savedSettings?.timezone || 'UTC'}
                                onSave={async ({ country, timezone }) => {
                                    await saveMutation.mutateAsync({
                                        ...settings,
                                        country,
                                        timezone
                                    });
                                }}
                            />
                        </TabsContent>

                        <TabsContent value="currencies">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-blue-600" />
                                        Supported Currencies & Crypto Assets
                                    </CardTitle>
                                    <CardDescription>
                                        ISO 4217 (Fiat), ISO 23257 (Blockchain), ISO 24165 (Digital Tokens)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Selected Currencies */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-medium text-slate-700">
                                                Selected ({selectedCurrencies.length})
                                            </p>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    ISO 4217
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    ISO 23257
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    ISO 24165
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCurrencies.map(code => {
                                                const currency = allCurrencies.find(c => c.code === code);
                                                const crypto = allCryptoAssets.find(c => c.code === code);
                                                const item = currency || crypto;
                                                const isCrypto = !!crypto;
                                                
                                                return (
                                                    <Badge key={code} className={cn(
                                                        "gap-2 px-3 py-1.5",
                                                        isCrypto ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                    )}>
                                                        <span className="font-mono font-semibold">{item?.symbol}</span>
                                                        <span>{code}</span>
                                                        {isCrypto && <span className="text-xs opacity-70">({crypto.blockchain})</span>}
                                                        <button 
                                                            onClick={() => toggleCurrency(code)}
                                                            className="ml-1 hover:text-red-600"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Type Toggle */}
                                    <div className="border-t pt-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Button
                                                variant={currencyType === 'fiat' ? 'default' : 'outline'}
                                                onClick={() => setCurrencyType('fiat')}
                                                size="sm"
                                            >
                                                <DollarSign className="h-4 w-4 mr-2" />
                                                Fiat (ISO 4217)
                                            </Button>
                                            <Button
                                                variant={currencyType === 'crypto' ? 'default' : 'outline'}
                                                onClick={() => setCurrencyType('crypto')}
                                                size="sm"
                                            >
                                                <Coins className="h-4 w-4 mr-2" />
                                                Crypto (ISO 23257/24165)
                                            </Button>
                                        </div>

                                        {/* Search */}
                                        <div className="mb-4">
                                            <Input
                                                placeholder={currencyType === 'fiat' ? "Search fiat currencies..." : "Search crypto assets..."}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        {/* Fiat Currency Grid */}
                                        {currencyType === 'fiat' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
                                                {allCurrencies
                                                    .filter(currency => {
                                                        if (!searchQuery) return true;
                                                        const query = searchQuery.toLowerCase();
                                                        return (
                                                            currency.code.toLowerCase().includes(query) ||
                                                            currency.name.toLowerCase().includes(query) ||
                                                            currency.num.includes(query)
                                                        );
                                                    })
                                                    .map(currency => {
                                                        const isSelected = selectedCurrencies.includes(currency.code);
                                                        return (
                                                            <div 
                                                                key={currency.code}
                                                                onClick={() => toggleCurrency(currency.code)}
                                                                className={cn(
                                                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                                                    isSelected 
                                                                        ? "border-blue-400 bg-blue-50" 
                                                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <Checkbox checked={isSelected} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono font-semibold text-sm">{currency.symbol}</span>
                                                                            <span className="font-medium text-slate-900">{currency.code}</span>
                                                                            <Badge variant="outline" className="text-xs px-1">
                                                                                {currency.num}
                                                                            </Badge>
                                                                        </div>
                                                                        <p className="text-xs text-slate-600 truncate">{currency.name}</p>
                                                                        <p className="text-xs text-slate-400">
                                                                            Decimals: {currency.minorUnit}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}

                                        {/* Crypto Asset Grid */}
                                        {currencyType === 'crypto' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
                                                {allCryptoAssets
                                                    .filter(crypto => {
                                                        if (!searchQuery) return true;
                                                        const query = searchQuery.toLowerCase();
                                                        return (
                                                            crypto.code.toLowerCase().includes(query) ||
                                                            crypto.name.toLowerCase().includes(query) ||
                                                            crypto.blockchain.toLowerCase().includes(query)
                                                        );
                                                    })
                                                    .map(crypto => {
                                                        const isSelected = selectedCurrencies.includes(crypto.code);
                                                        return (
                                                            <div 
                                                                key={crypto.code}
                                                                onClick={() => toggleCurrency(crypto.code)}
                                                                className={cn(
                                                                    "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                                                    isSelected 
                                                                        ? "border-purple-400 bg-purple-50" 
                                                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <Checkbox checked={isSelected} />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono font-semibold text-sm">{crypto.symbol}</span>
                                                                            <span className="font-medium text-slate-900">{crypto.code}</span>
                                                                            {crypto.isStablecoin && (
                                                                                <Badge variant="secondary" className="text-xs px-1">
                                                                                    Stable
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-slate-600 truncate">{crypto.name}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Badge variant="outline" className="text-xs">
                                                                                DTI: {crypto.dti}
                                                                            </Badge>
                                                                            <p className="text-xs text-slate-400">
                                                                                {crypto.blockchain}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className={cn(
                                        "p-4 rounded-lg border",
                                        currencyType === 'fiat' ? "bg-slate-50" : "bg-purple-50 border-purple-200"
                                    )}>
                                        <div className="flex items-start gap-3">
                                            {currencyType === 'fiat' ? (
                                                <DollarSign className="h-5 w-5 text-slate-600 mt-0.5" />
                                            ) : (
                                                <Coins className="h-5 w-5 text-purple-600 mt-0.5" />
                                            )}
                                            <div>
                                                {currencyType === 'fiat' ? (
                                                    <>
                                                        <h4 className="font-medium text-sm text-slate-900">ISO 4217 Standard</h4>
                                                        <p className="text-xs text-slate-600 mt-1">
                                                            {allCurrencies.length} fiat currencies from the official ISO 4217 standard, 
                                                            including currency codes, numeric codes, names, and decimal precision.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h4 className="font-medium text-sm text-purple-900">ISO 23257 & ISO 24165 Standards</h4>
                                                        <p className="text-xs text-purple-700 mt-1">
                                                            {allCryptoAssets.length} crypto assets with ISO 23257 (Blockchain/DLT) compliance and 
                                                            ISO 24165 Digital Token Identifiers (DTI). Includes blockchain network and asset type information.
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="documentation">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-blue-600" />
                                        System Documentation
                                    </CardTitle>
                                    <CardDescription>Comprehensive platform architecture and technical guides</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div 
                                        onClick={() => navigate(createPageUrl('SystemArchitectureDocumentation'))}
                                        className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-all">
                                                <FileText className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-1">System Architecture Documentation</h3>
                                                <p className="text-sm text-slate-600">
                                                    Complete technical documentation covering platform architecture, components, workflows, ISO standards, and compliance framework
                                                </p>
                                            </div>
                                        </div>
                                        <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-600" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <Layers className="h-4 w-4 text-blue-600" />
                                                Platform Components
                                            </h4>
                                            <p className="text-xs text-slate-600">Community Portal, FTS Platform, PSP Portal, Merchant Portal, Virtual Terminal</p>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-emerald-600" />
                                                Security Framework
                                            </h4>
                                            <p className="text-xs text-slate-600">Multi-tenant isolation, LEI/vLEI compliance, RBAC, PCI DSS Level 1</p>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-purple-600" />
                                                ISO Standards
                                            </h4>
                                            <p className="text-xs text-slate-600">ISO 20022, ISO 8583, ISO 4217, ISO 23257, ISO 17442</p>
                                        </div>
                                    </div>

                                    <Alert className="bg-blue-50 border-blue-200">
                                        <Info className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-sm text-blue-900">
                                            This documentation is designed for technical stakeholders, developers, compliance officers, and regulators. It provides a complete overview of the platform's architecture, security model, and operational workflows.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}