/**
 * Platform Language Management
 * Control panel for managing multilingual support across all PSP instances and services
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { 
    Globe, 
    Languages, 
    CheckCircle, 
    AlertCircle, 
    Upload,
    Download,
    Settings,
    Shield,
    FileText,
    Building2,
    Code,
    Workflow,
    Wallet,
    Briefcase
} from 'lucide-react';
import { 
    SUPPORTED_LANGUAGES, 
    FINANCIAL_SERVICES_LANGUAGES,
    REGIONAL_LANGUAGE_PREFERENCES,
    TRANSLATION_NAMESPACES,
    COMPLIANCE_LANGUAGE_REQUIREMENTS
} from '@/components/i18n/GlobalLanguageStandard';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

export default function PlatformLanguageManagement() {
    const [platformUser] = useState(() => JSON.parse(localStorage.getItem('platform_admin_session') || '{}'));
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPSP, setSelectedPSP] = useState(null);
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [selectedServiceType, setSelectedServiceType] = useState(null);
    const [pspLanguageConfig, setPspLanguageConfig] = useState({
        enabled_languages: ['en'],
        default_language: 'en'
    });

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const { data: isoCustomers = [] } = useQuery({
        queryKey: ['iso-customers'],
        queryFn: () => base44.entities.ISOGatewayCustomer.list()
    });

    const { data: orchestrationCustomers = [] } = useQuery({
        queryKey: ['orchestration-customers'],
        queryFn: () => base44.entities.OrchestrationCustomer.list()
    });

    const { data: cryptoCustomers = [] } = useQuery({
        queryKey: ['crypto-customers'],
        queryFn: () => base44.entities.CryptoGatewayCustomer.list()
    });

    const { data: rwaProviders = [] } = useQuery({
        queryKey: ['rwa-providers'],
        queryFn: () => base44.entities.RWAProvider.list()
    });

    // Mock translation status - would come from database
    const translationStatus = {
        common: { en: 100, es: 95, fr: 90, de: 85, zh: 80, ar: 75 },
        platform: { en: 100, es: 90, fr: 85, de: 80, zh: 70, ar: 60 },
        merchant: { en: 100, es: 85, fr: 80, de: 75, zh: 65, ar: 55 },
        crypto: { en: 100, es: 80, fr: 75, de: 70, zh: 60, ar: 50 }
    };

    const getTierColor = (tier) => {
        if (tier === 'TIER_1') return 'bg-emerald-600';
        if (tier === 'TIER_2') return 'bg-blue-600';
        return 'bg-slate-600';
    };

    const updateLanguagesMutation = useMutation({
        mutationFn: async ({ serviceId, serviceType, languageConfig }) => {
            const updateData = {
                enabled_languages: languageConfig.enabled_languages,
                default_language: languageConfig.default_language
            };

            switch (serviceType) {
                case 'psp':
                    return await base44.entities.ProvisionedPSP.update(serviceId, {
                        branding: { ...(selectedPSP?.branding || {}), ...updateData }
                    });
                case 'iso':
                    return await base44.entities.ISOGatewayCustomer.update(serviceId, updateData);
                case 'orchestration':
                    return await base44.entities.OrchestrationCustomer.update(serviceId, updateData);
                case 'crypto':
                    return await base44.entities.CryptoGatewayCustomer.update(serviceId, updateData);
                case 'rwa':
                    return await base44.entities.RWAProvider.update(serviceId, updateData);
                default:
                    throw new Error('Unknown service type');
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['provisioned-psps']);
            queryClient.invalidateQueries(['iso-customers']);
            queryClient.invalidateQueries(['orchestration-customers']);
            queryClient.invalidateQueries(['crypto-customers']);
            queryClient.invalidateQueries(['rwa-providers']);
            setConfigDialogOpen(false);
            toast.success('Language configuration saved!');
        },
        onError: (error) => {
            toast.error(`Failed to save: ${error.message}`);
        }
    });

    const openLanguageConfig = (service, serviceType) => {
        setSelectedPSP(service);
        setSelectedServiceType(serviceType);
        
        let enabledLangs = ['en'];
        let defaultLang = 'en';
        
        if (serviceType === 'psp') {
            enabledLangs = service.branding?.enabled_languages || ['en'];
            defaultLang = service.branding?.default_language || 'en';
        } else {
            enabledLangs = service.enabled_languages || ['en'];
            defaultLang = service.default_language || 'en';
        }
        
        setPspLanguageConfig({
            enabled_languages: enabledLangs,
            default_language: defaultLang
        });
        setConfigDialogOpen(true);
    };

    const toggleLanguage = (langCode) => {
        const isEnabled = pspLanguageConfig.enabled_languages.includes(langCode);
        if (isEnabled && pspLanguageConfig.enabled_languages.length === 1) {
            toast.error('At least one language must be enabled');
            return;
        }
        
        const newLanguages = isEnabled
            ? pspLanguageConfig.enabled_languages.filter(l => l !== langCode)
            : [...pspLanguageConfig.enabled_languages, langCode];
        
        setPspLanguageConfig({
            ...pspLanguageConfig,
            enabled_languages: newLanguages,
            // If we disabled the default language, switch to first enabled
            default_language: !newLanguages.includes(pspLanguageConfig.default_language) 
                ? newLanguages[0] 
                : pspLanguageConfig.default_language
        });
    };

    const handleSaveLanguageConfig = () => {
        updateLanguagesMutation.mutate({
            serviceId: selectedPSP.id,
            serviceType: selectedServiceType,
            languageConfig: pspLanguageConfig
        });
    };

    const getServiceName = (service, type) => {
        switch (type) {
            case 'psp': return service.psp_name;
            case 'iso': return service.company_name;
            case 'orchestration': return service.company_name;
            case 'crypto': return service.company_name;
            case 'rwa': return service.company_name;
            default: return 'Unknown';
        }
    };

    const getServiceCode = (service, type) => {
        switch (type) {
            case 'psp': return service.psp_code;
            case 'iso': return service.customer_code;
            case 'orchestration': return service.customer_code;
            case 'crypto': return service.customer_code;
            case 'rwa': return service.provider_code;
            default: return '';
        }
    };

    const getEnabledLanguages = (service, type) => {
        if (type === 'psp') {
            return service.branding?.enabled_languages || ['en'];
        }
        return service.enabled_languages || ['en'];
    };

    const getDefaultLanguage = (service, type) => {
        if (type === 'psp') {
            return service.branding?.default_language || 'en';
        }
        return service.default_language || 'en';
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="PlatformLanguageManagement"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <div className="bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Languages className="h-6 w-6 text-blue-600" />
                                Multilingual Platform Management
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">
                                Enterprise i18n system for all portals and services • ISO 639-1/639-2 compliant
                            </p>
                        </div>
                        <LanguageSwitcher variant="select" />
                    </div>
                </div>

                <div className="p-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Supported Languages</p>
                                        <p className="text-2xl font-bold text-slate-900">{SUPPORTED_LANGUAGES.length}</p>
                                    </div>
                                    <Globe className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Translation Namespaces</p>
                                        <p className="text-2xl font-bold text-slate-900">{Object.keys(TRANSLATION_NAMESPACES).length}</p>
                                    </div>
                                    <FileText className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">RTL Languages</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {SUPPORTED_LANGUAGES.filter(l => l.rtl).length}
                                        </p>
                                    </div>
                                    <Languages className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Compliance Regions</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {Object.keys(COMPLIANCE_LANGUAGE_REQUIREMENTS).length}
                                        </p>
                                    </div>
                                    <Shield className="h-8 w-8 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-white border border-slate-200 mb-6">
                            <TabsTrigger value="overview">Language Overview</TabsTrigger>
                            <TabsTrigger value="psp">Service Configuration</TabsTrigger>
                            <TabsTrigger value="translations">Translation Status</TabsTrigger>
                            <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            <div className="space-y-6">
                                {/* Financial Services Language Tiers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Financial Services Language Tiers</CardTitle>
                                        <CardDescription>Prioritization based on global financial markets</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {Object.entries(FINANCIAL_SERVICES_LANGUAGES).map(([tier, languages]) => (
                                            <div key={tier}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className={getTierColor(tier)}>{tier.replace('_', ' ')}</Badge>
                                                    <span className="text-sm text-slate-600">
                                                        {tier === 'TIER_1' && 'Global Financial Hubs'}
                                                        {tier === 'TIER_2' && 'Major Markets'}
                                                        {tier === 'TIER_3' && 'Regional Markets'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {languages.map(code => {
                                                        const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                        return (
                                                            <div key={code} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                                                <span>{lang?.flag}</span>
                                                                <span className="text-sm font-medium">{lang?.nativeName}</span>
                                                                {lang?.rtl && <Badge variant="outline" className="text-[10px]">RTL</Badge>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Regional Preferences */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Regional Language Preferences</CardTitle>
                                        <CardDescription>Recommended languages by geographic region</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(REGIONAL_LANGUAGE_PREFERENCES).map(([region, languages]) => (
                                                <div key={region} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                    <h3 className="font-semibold text-sm mb-2">{region}</h3>
                                                    <div className="flex flex-wrap gap-1">
                                                        {languages.map(code => {
                                                            const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                            return (
                                                                <span key={code} title={lang?.name} className="text-lg">
                                                                    {lang?.flag}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Service Configuration Tab */}
                        <TabsContent value="psp">
                            <div className="space-y-6">
                                {/* PSP Services */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building2 className="h-5 w-5" />
                                            PSP Instances
                                        </CardTitle>
                                        <CardDescription>Configure languages for Payment Service Providers</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {psps.map(psp => {
                                                const enabledLangs = getEnabledLanguages(psp, 'psp');
                                                const defaultLang = getDefaultLanguage(psp, 'psp');
                                                return (
                                                    <div key={psp.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h3 className="font-semibold">{getServiceName(psp, 'psp')}</h3>
                                                                <p className="text-xs text-slate-600">Code: {getServiceCode(psp, 'psp')} • Region: {psp.country}</p>
                                                            </div>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => openLanguageConfig(psp, 'psp')}
                                                            >
                                                                Configure
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {enabledLangs.map(code => {
                                                                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                                return (
                                                                    <Badge key={code} variant="outline" className="gap-1">
                                                                        <span>{lang?.flag}</span>
                                                                        <span>{lang?.nativeName}</span>
                                                                        {code === defaultLang && <span className="text-emerald-600">✓</span>}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* ISO Gateway Customers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Code className="h-5 w-5" />
                                            ISO Gateway Customers
                                        </CardTitle>
                                        <CardDescription>Configure languages for ISO Gateway clients</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {isoCustomers.map(customer => {
                                                const enabledLangs = getEnabledLanguages(customer, 'iso');
                                                const defaultLang = getDefaultLanguage(customer, 'iso');
                                                return (
                                                    <div key={customer.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h3 className="font-semibold">{getServiceName(customer, 'iso')}</h3>
                                                                <p className="text-xs text-slate-600">Code: {getServiceCode(customer, 'iso')}</p>
                                                            </div>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => openLanguageConfig(customer, 'iso')}
                                                            >
                                                                Configure
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {enabledLangs.map(code => {
                                                                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                                return (
                                                                    <Badge key={code} variant="outline" className="gap-1">
                                                                        <span>{lang?.flag}</span>
                                                                        <span>{lang?.nativeName}</span>
                                                                        {code === defaultLang && <span className="text-emerald-600">✓</span>}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Orchestration Customers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Workflow className="h-5 w-5" />
                                            Orchestration Customers
                                        </CardTitle>
                                        <CardDescription>Configure languages for Orchestration clients</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {orchestrationCustomers.map(customer => {
                                                const enabledLangs = getEnabledLanguages(customer, 'orchestration');
                                                const defaultLang = getDefaultLanguage(customer, 'orchestration');
                                                return (
                                                    <div key={customer.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h3 className="font-semibold">{getServiceName(customer, 'orchestration')}</h3>
                                                                <p className="text-xs text-slate-600">Code: {getServiceCode(customer, 'orchestration')}</p>
                                                            </div>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => openLanguageConfig(customer, 'orchestration')}
                                                            >
                                                                Configure
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {enabledLangs.map(code => {
                                                                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                                return (
                                                                    <Badge key={code} variant="outline" className="gap-1">
                                                                        <span>{lang?.flag}</span>
                                                                        <span>{lang?.nativeName}</span>
                                                                        {code === defaultLang && <span className="text-emerald-600">✓</span>}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Crypto Gateway Customers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Wallet className="h-5 w-5" />
                                            Crypto Banking Customers
                                        </CardTitle>
                                        <CardDescription>Configure languages for Crypto Gateway clients</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {cryptoCustomers.map(customer => {
                                                const enabledLangs = getEnabledLanguages(customer, 'crypto');
                                                const defaultLang = getDefaultLanguage(customer, 'crypto');
                                                return (
                                                    <div key={customer.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h3 className="font-semibold">{getServiceName(customer, 'crypto')}</h3>
                                                                <p className="text-xs text-slate-600">Code: {getServiceCode(customer, 'crypto')}</p>
                                                            </div>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => openLanguageConfig(customer, 'crypto')}
                                                            >
                                                                Configure
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {enabledLangs.map(code => {
                                                                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                                return (
                                                                    <Badge key={code} variant="outline" className="gap-1">
                                                                        <span>{lang?.flag}</span>
                                                                        <span>{lang?.nativeName}</span>
                                                                        {code === defaultLang && <span className="text-emerald-600">✓</span>}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* RWA Providers */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            RWA Platform Providers
                                        </CardTitle>
                                        <CardDescription>Configure languages for RWA tokenization providers</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {rwaProviders.map(provider => {
                                                const enabledLangs = getEnabledLanguages(provider, 'rwa');
                                                const defaultLang = getDefaultLanguage(provider, 'rwa');
                                                return (
                                                    <div key={provider.id} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h3 className="font-semibold">{getServiceName(provider, 'rwa')}</h3>
                                                                <p className="text-xs text-slate-600">Code: {getServiceCode(provider, 'rwa')}</p>
                                                            </div>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => openLanguageConfig(provider, 'rwa')}
                                                            >
                                                                Configure
                                                            </Button>
                                                        </div>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {enabledLangs.map(code => {
                                                                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                                return (
                                                                    <Badge key={code} variant="outline" className="gap-1">
                                                                        <span>{lang?.flag}</span>
                                                                        <span>{lang?.nativeName}</span>
                                                                        {code === defaultLang && <span className="text-emerald-600">✓</span>}
                                                                    </Badge>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Language Configuration Dialog */}
                        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                                <DialogHeader>
                                    <DialogTitle>
                                        Configure Languages - {selectedPSP && getServiceName(selectedPSP, selectedServiceType)}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6">
                                    {/* Default Language */}
                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Default Language</Label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {pspLanguageConfig.enabled_languages.map(code => {
                                                const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
                                                return (
                                                    <button
                                                        key={code}
                                                        onClick={() => setPspLanguageConfig({...pspLanguageConfig, default_language: code})}
                                                        className={`
                                                            flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                                                            ${pspLanguageConfig.default_language === code 
                                                                ? 'border-emerald-500 bg-emerald-50' 
                                                                : 'border-slate-200 hover:border-emerald-300'
                                                            }
                                                        `}
                                                    >
                                                        <span className="text-2xl">{lang?.flag}</span>
                                                        <span className="text-xs font-medium">{lang?.nativeName}</span>
                                                        {pspLanguageConfig.default_language === code && (
                                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* All Languages */}
                                    <div>
                                        <Label className="text-sm font-semibold mb-2 block">Enabled Languages</Label>
                                        <ScrollArea className="h-[400px] pr-4">
                                            <div className="grid grid-cols-3 gap-3">
                                                {SUPPORTED_LANGUAGES.map(lang => {
                                                    const isEnabled = pspLanguageConfig.enabled_languages.includes(lang.code);
                                                    return (
                                                        <div
                                                            key={lang.code}
                                                            onClick={() => toggleLanguage(lang.code)}
                                                            className={`
                                                                flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all
                                                                ${isEnabled 
                                                                    ? 'border-blue-500 bg-blue-50' 
                                                                    : 'border-slate-200 hover:border-blue-300'
                                                                }
                                                            `}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">{lang.flag}</span>
                                                                <div>
                                                                    <p className="text-sm font-medium">{lang.nativeName}</p>
                                                                    <p className="text-xs text-slate-600">{lang.name}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                {lang.rtl && <Badge variant="outline" className="text-[9px] px-1 py-0">RTL</Badge>}
                                                                {isEnabled && <CheckCircle className="h-4 w-4 text-blue-600" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    {/* Summary */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>{pspLanguageConfig.enabled_languages.length}</strong> languages enabled •
                                            Default: <strong>{SUPPORTED_LANGUAGES.find(l => l.code === pspLanguageConfig.default_language)?.nativeName}</strong>
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3">
                                        <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleSaveLanguageConfig}
                                            disabled={updateLanguagesMutation.isPending}
                                        >
                                            {updateLanguagesMutation.isPending ? 'Saving...' : 'Save Configuration'}
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Translation Status Tab */}
                        <TabsContent value="translations">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Translation Completion Status</CardTitle>
                                    <CardDescription>Track translation progress across all namespaces</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {Object.entries(translationStatus).map(([namespace, languages]) => (
                                            <div key={namespace}>
                                                <h3 className="font-semibold text-sm mb-3 capitalize">{namespace} Namespace</h3>
                                                <div className="grid grid-cols-6 gap-3">
                                                    {Object.entries(languages).map(([lang, percentage]) => {
                                                        const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === lang);
                                                        return (
                                                            <div key={lang} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                                                                <span className="text-2xl">{langInfo?.flag}</span>
                                                                <p className="text-xs font-medium mt-1">{langInfo?.code.toUpperCase()}</p>
                                                                <div className="mt-2">
                                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                                        <div 
                                                                            className={`h-2 rounded-full ${percentage === 100 ? 'bg-emerald-600' : percentage >= 80 ? 'bg-blue-600' : 'bg-orange-600'}`}
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                    <p className="text-xs text-slate-600 mt-1">{percentage}%</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Compliance Tab */}
                        <TabsContent value="compliance">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Regional Compliance Requirements</CardTitle>
                                    <CardDescription>Language requirements for financial services compliance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(COMPLIANCE_LANGUAGE_REQUIREMENTS).map(([region, requirements]) => (
                                            <div key={region} className="p-4 border-2 border-slate-200 rounded-lg">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <h3 className="font-semibold">{region}</h3>
                                                    {requirements.required ? (
                                                        <Badge className="bg-red-600">Required</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Optional</Badge>
                                                    )}
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-blue-600" />
                                                        <span className="text-slate-600">Minimum Languages:</span>
                                                        <span className="font-medium">{requirements.minLanguages}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        <span className="text-slate-600">Must Include:</span>
                                                        <div className="flex gap-1">
                                                            {requirements.mustInclude.map(lang => (
                                                                <Badge key={lang} variant="outline">{lang}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-purple-600" />
                                                        <span className="text-slate-600">Recommended:</span>
                                                        <div className="flex gap-1">
                                                            {requirements.preferredAdditional.map(lang => (
                                                                <Badge key={lang} variant="outline">{lang}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}