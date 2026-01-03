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
import { 
    Globe, 
    Languages, 
    CheckCircle, 
    AlertCircle, 
    Upload,
    Download,
    Settings,
    Shield,
    FileText
} from 'lucide-react';
import { toast } from 'sonner';
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

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
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
                            <TabsTrigger value="psp">PSP Configuration</TabsTrigger>
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

                        {/* PSP Configuration Tab */}
                        <TabsContent value="psp">
                            <Card>
                                <CardHeader>
                                    <CardTitle>PSP Instance Language Configuration</CardTitle>
                                    <CardDescription>Enable/disable languages for each PSP instance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {psps.map(psp => (
                                            <div key={psp.id} className="p-4 border border-slate-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold">{psp.psp_name}</h3>
                                                        <p className="text-xs text-slate-600">Code: {psp.psp_code} • Region: {psp.country}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Configure Languages
                                                    </Button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline">English</Badge>
                                                    <Badge variant="outline">Spanish</Badge>
                                                    <Badge variant="outline">French</Badge>
                                                    <span className="text-xs text-slate-500">+2 more</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

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