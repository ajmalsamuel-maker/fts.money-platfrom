import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import UniversalComplianceCheck from '@/components/onboarding/UniversalComplianceCheck';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { 
    Landmark, 
    Plus, 
    Globe, 
    CreditCard,
    Shield,
    Settings,
    CheckCircle,
    ArrowRight,
    Loader2,
    Building2,
    FileText
} from 'lucide-react';
import { ISO4217_CURRENCIES } from '@/components/utils/iso4217';
import { getAllCountries } from '@/components/utils/countries';
import { validateISO9362, validateIBANFormat } from '@/components/utils/isoValidator';

const cardNetworks = [
    { id: 'visa', name: 'Visa', logo: '💳' },
    { id: 'mastercard', name: 'Mastercard', logo: '💳' },
    { id: 'amex', name: 'American Express', logo: '💳' },
    { id: 'discover', name: 'Discover', logo: '💳' },
    { id: 'jcb', name: 'JCB', logo: '💳' },
    { id: 'unionpay', name: 'UnionPay', logo: '💳' },
];

export default function AcquirerOnboarding() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const queryClient = useQueryClient();
    
    const [formData, setFormData] = useState({
        name: '',
        legal_entity_name: '',
        lei: '',
        license_number: '',
        licensing_authority: '',
        type: 'acquirer',
        bin_sponsor: '',
        country: '',
        bic_swift: '',
        iban: '',
        networks: [],
        currencies: [],
        countries: [],
        api_endpoint: '',
        api_version: 'v1',
        auth_type: 'bearer',
        credentials: {
            api_key: '',
            secret_key: '',
            merchant_id: '',
        },
        features: {
            supports_3ds: true,
            supports_recurring: true,
            supports_refunds: true,
            supports_partial_capture: false,
        },
        fee_structure: {
            transaction_fee_percent: '',
            fixed_fee: '',
            chargeback_fee: '',
        },
        iso_20022_compliant: false,
        iso_8583_compliant: false,
        compliance: null
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...prev[parent], [field]: value }
        }));
    };

    const toggleArrayItem = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item) 
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    const createProcessor = useMutation({
        mutationFn: async (data) => {
            return base44.entities.PaymentProcessor.create({
                processor_id: `ACQ-${Date.now()}`,
                name: data.name,
                type: data.type,
                status: 'active',
                supported_networks: data.networks,
                supported_currencies: data.currencies,
                supported_countries: data.countries,
                base_fee_percentage: parseFloat(data.fee_structure.transaction_fee_percent) || 0,
                fixed_fee: parseFloat(data.fee_structure.fixed_fee) || 0,
                api_endpoint: data.api_endpoint,
                supports_3ds: data.features.supports_3ds,
                supports_recurring: data.features.supports_recurring,
                priority: 100,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processors'] });
            setStep(5);
        }
    });

    const handleSubmit = () => {
        setIsSubmitting(true);
        createProcessor.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="AcquirerOnboarding" />
            
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Acquirer / Payment Processor Onboarding</h1>
                        <p className="text-slate-500">Connect a new acquiring bank or payment processor</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-4 mb-8">
                        {['Basic Info', 'Networks & Coverage', 'Compliance', 'API Configuration', 'Complete'].map((s, idx) => (
                            <React.Fragment key={idx}>
                                <div className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-full",
                                    step > idx + 1 ? "bg-emerald-100 text-emerald-700" :
                                    step === idx + 1 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                                )}>
                                    {step > idx + 1 ? <CheckCircle className="h-4 w-4" /> : <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">{idx + 1}</span>}
                                    <span className="text-sm font-medium">{s}</span>
                                </div>
                                {idx < 4 && <ArrowRight className="h-4 w-4 text-slate-300" />}
                            </React.Fragment>
                        ))}
                    </div>

                    {step === 1 && (
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5" />
                                    Institution Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Processor Name *</Label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder="e.g., Chase Paymentech"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Legal Entity Name *</Label>
                                        <Input 
                                            value={formData.legal_entity_name} 
                                            onChange={(e) => handleChange('legal_entity_name', e.target.value)}
                                            placeholder="Full legal name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={formData.type} onValueChange={(val) => handleChange('type', val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="acquirer">Acquirer</SelectItem>
                                            <SelectItem value="gateway">Payment Gateway</SelectItem>
                                            <SelectItem value="psp">Payment Service Provider</SelectItem>
                                            <SelectItem value="network">Card Network</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Country (ISO 3166-1) *</Label>
                                        <Select value={formData.country} onValueChange={(val) => handleChange('country', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                                            <SelectContent>
                                                {getAllCountries().slice(0, 50).map(c => (
                                                    <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>LEI (Optional)</Label>
                                        <Input 
                                            value={formData.lei} 
                                            onChange={(e) => handleChange('lei', e.target.value)}
                                            placeholder="20-character LEI"
                                            maxLength={20}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>BIC/SWIFT (ISO 9362)</Label>
                                        <Input 
                                            value={formData.bic_swift} 
                                            onChange={(e) => handleChange('bic_swift', e.target.value.toUpperCase())}
                                            placeholder="8 or 11 characters"
                                            maxLength={11}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>IBAN (ISO 13616)</Label>
                                        <Input 
                                            value={formData.iban} 
                                            onChange={(e) => handleChange('iban', e.target.value.replace(/\s/g, '').toUpperCase())}
                                            placeholder="International Bank Account"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>BIN Sponsor (if applicable)</Label>
                                    <Input 
                                        value={formData.bin_sponsor} 
                                        onChange={(e) => handleChange('bin_sponsor', e.target.value)}
                                        placeholder="Sponsoring bank name"
                                    />
                                </div>
                                <Button onClick={() => setStep(2)} className="w-full gap-2" disabled={!formData.name || !formData.country}>
                                    Continue <ArrowRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {step === 2 && (
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Networks & Coverage
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Supported Card Networks</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {cardNetworks.map((network) => (
                                            <div
                                                key={network.id}
                                                onClick={() => toggleArrayItem('networks', network.id)}
                                                className={cn(
                                                    "p-3 rounded-lg border cursor-pointer transition-all text-center",
                                                    formData.networks.includes(network.id) ? "border-blue-500 bg-blue-50" : "hover:border-slate-300"
                                                )}
                                            >
                                                <span className="text-lg">{network.logo}</span>
                                                <p className="text-sm font-medium">{network.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Supported Currencies (ISO 4217)</Label>
                                    <Select onValueChange={(val) => toggleArrayItem('currencies', val)}>
                                        <SelectTrigger><SelectValue placeholder="Add currency" /></SelectTrigger>
                                        <SelectContent>
                                            {ISO4217_CURRENCIES.slice(0, 50).map(c => (
                                                <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.currencies.map((curr) => (
                                            <Badge
                                                key={curr}
                                                variant="default"
                                                className="cursor-pointer"
                                                onClick={() => toggleArrayItem('currencies', curr)}
                                            >
                                                {curr} ✕
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Supported Countries (ISO 3166-1)</Label>
                                    <Select onValueChange={(val) => toggleArrayItem('countries', val)}>
                                        <SelectTrigger><SelectValue placeholder="Add country" /></SelectTrigger>
                                        <SelectContent>
                                            {getAllCountries().slice(0, 50).map(c => (
                                                <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.countries.map((c) => (
                                            <Badge
                                                key={c}
                                                variant="default"
                                                className="cursor-pointer"
                                                onClick={() => toggleArrayItem('countries', c)}
                                            >
                                                {c} ✕
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={() => setStep(3)} className="flex-1 gap-2" disabled={formData.networks.length === 0}>
                                        Continue <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 3 && (
                        <UniversalComplianceCheck
                            entityData={{
                                name: formData.name,
                                business_name: formData.name,
                                country: formData.countries[0] || 'US',
                                business_type: 'acquirer',
                                id: `ACQ-TEMP-${Date.now()}`
                            }}
                            entityType="acquirer"
                            onComplete={(complianceResult) => {
                                handleChange('compliance', complianceResult);
                                setStep(4);
                            }}
                        />
                    )}

                    {step === 4 && (
                        <Card className="max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    API Configuration & Credentials
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>API Endpoint</Label>
                                    <Input 
                                        value={formData.api_endpoint} 
                                        onChange={(e) => handleChange('api_endpoint', e.target.value)}
                                        placeholder="https://api.processor.com/v1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>API Key</Label>
                                        <Input 
                                            value={formData.credentials.api_key} 
                                            onChange={(e) => handleNestedChange('credentials', 'api_key', e.target.value)}
                                            placeholder="API Key"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secret Key</Label>
                                        <Input 
                                            type="password"
                                            value={formData.credentials.secret_key} 
                                            onChange={(e) => handleNestedChange('credentials', 'secret_key', e.target.value)}
                                            placeholder="Secret Key"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Merchant ID</Label>
                                    <Input 
                                        value={formData.credentials.merchant_id} 
                                        onChange={(e) => handleNestedChange('credentials', 'merchant_id', e.target.value)}
                                        placeholder="Processor Merchant ID"
                                    />
                                </div>
                                <div className="space-y-3 pt-4 border-t">
                                    <Label>Features</Label>
                                    {[
                                        { key: 'supports_3ds', label: '3D Secure Support' },
                                        { key: 'supports_recurring', label: 'Recurring Payments' },
                                        { key: 'supports_refunds', label: 'Refunds' },
                                        { key: 'supports_partial_capture', label: 'Partial Capture' },
                                    ].map((feat) => (
                                        <div key={feat.key} className="flex items-center justify-between">
                                            <span className="text-sm">{feat.label}</span>
                                            <Switch 
                                                checked={formData.features[feat.key]}
                                                onCheckedChange={(checked) => handleNestedChange('features', feat.key, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-4 border-t">
                                    <Label className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        ISO Standards Compliance
                                    </Label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">ISO 20022 Messaging</span>
                                        <Switch 
                                            checked={formData.iso_20022_compliant}
                                            onCheckedChange={(checked) => handleChange('iso_20022_compliant', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">ISO 8583 Messaging</span>
                                        <Switch 
                                            checked={formData.iso_8583_compliant}
                                            onCheckedChange={(checked) => handleChange('iso_8583_compliant', checked)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                                    <Button onClick={handleSubmit} className="flex-1 gap-2" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                        Complete Setup
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {step === 4 && (
                        <Card className="max-w-2xl p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Acquirer Connected!</h2>
                            <p className="text-slate-500 mb-4">{formData.name} has been successfully onboarded and is ready for transaction routing.</p>
                            <div className="flex justify-center gap-2">
                                <Button variant="outline" onClick={() => { setStep(1); setFormData({ ...formData, name: '', credentials: { api_key: '', secret_key: '', merchant_id: '' } }); }}>
                                    Add Another
                                </Button>
                                <Button>View Payment Orchestration</Button>
                            </div>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}