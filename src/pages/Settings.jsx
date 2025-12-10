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
    X
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TimezoneSettings from '@/components/settings/TimezoneSettings';

export default function Settings() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const queryClient = useQueryClient();

    const { data: pspSettings, isLoading } = useQuery({
        queryKey: ['psp-settings'],
        queryFn: () => base44.entities.PSPSettings.list(),
    });

    const savedSettings = pspSettings?.[0];

    const allCurrencies = [
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
        { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
        { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
        { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
        { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
        { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
        { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
        { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
        { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
        { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
        { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
        { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
        { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
        { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
        { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
        { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱' },
        { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
        { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
        { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
    ];

    const [selectedCurrencies, setSelectedCurrencies] = useState(['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD']);

    const [settings, setSettings] = useState({
        company_name: '',
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
        support_phone: ''
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
                support_phone: savedSettings.support_phone || ''
            });
        }
    }, [savedSettings]);

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (savedSettings?.id) {
                return base44.entities.PSPSettings.update(savedSettings.id, data);
            }
            return base44.entities.PSPSettings.create(data);
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
                            <TabsTrigger value="location">Location & Time</TabsTrigger>
                            <TabsTrigger value="currencies">Currencies</TabsTrigger>
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
                                            <p className="text-xs text-slate-500">This name will appear in the sidebar and throughout the app</p>
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
                                        Dashboard Currencies
                                    </CardTitle>
                                    <CardDescription>Select currencies to display on the dashboard exchange rates widget</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <p className="text-sm text-slate-600 mb-2">
                                            Selected: <span className="font-medium">{selectedCurrencies.length}</span> currencies
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCurrencies.map(code => {
                                                const currency = allCurrencies.find(c => c.code === code);
                                                return (
                                                    <Badge key={code} className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                                                        {currency?.flag} {code}
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

                                    <div className="border-t pt-4">
                                        <p className="text-sm font-medium text-slate-700 mb-3">Available Currencies</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {allCurrencies.map(currency => {
                                                const isSelected = selectedCurrencies.includes(currency.code);
                                                return (
                                                    <div 
                                                        key={currency.code}
                                                        onClick={() => toggleCurrency(currency.code)}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                                            isSelected 
                                                                ? "border-blue-300 bg-blue-50" 
                                                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <Checkbox checked={isSelected} />
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{currency.flag}</span>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{currency.code}</p>
                                                                <p className="text-xs text-slate-500">{currency.name}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
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