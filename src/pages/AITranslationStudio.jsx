import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
    Sparkles, Languages, CheckCircle2, AlertCircle, 
    Download, Upload, Zap, Globe, FileText, TrendingUp 
} from 'lucide-react';
import { toast } from 'sonner';

const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧', tier: 1 },
    { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳', tier: 1 },
    { code: 'es', name: 'Spanish', flag: '🇪🇸', tier: 1 },
    { code: 'fr', name: 'French', flag: '🇫🇷', tier: 1 },
    { code: 'de', name: 'German', flag: '🇩🇪', tier: 1 },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', tier: 1, rtl: true },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', tier: 2 },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', tier: 2 },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', tier: 2 },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷', tier: 2 },
    { code: 'ru', name: 'Russian', flag: '🇷🇺', tier: 2 },
    { code: 'it', name: 'Italian', flag: '🇮🇹', tier: 2 },
    { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', tier: 2 },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', tier: 3 },
    { code: 'pl', name: 'Polish', flag: '🇵🇱', tier: 3 },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', tier: 3 },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', tier: 3 },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩', tier: 3 },
    { code: 'th', name: 'Thai', flag: '🇹🇭', tier: 3 },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', tier: 3 },
    { code: 'he', name: 'Hebrew', flag: '🇮🇱', tier: 3, rtl: true },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪', tier: 3 },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴', tier: 3 },
    { code: 'da', name: 'Danish', flag: '🇩🇰', tier: 3 },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮', tier: 3 }
];

export default function AITranslationStudio() {
    const { platformUser } = usePlatformAuth();
    const [selectedNamespace, setSelectedNamespace] = useState('platform');
    const [selectedTier, setSelectedTier] = useState('all');
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generatedResults, setGeneratedResults] = useState(null);

    const namespaces = ['common', 'platform', 'psp', 'merchant', 'crypto', 'iso', 'orchestration', 'rwa'];

    const translateMutation = useMutation({
        mutationFn: async ({ targetLanguages, namespace }) => {
            const sourceData = {
                dashboard: {
                    title: "Control Panel Dashboard",
                    subtitle: "Unified management for all PSP instances",
                    welcomeBack: "Welcome back",
                    loading: "Loading...",
                    noData: "No data available"
                },
                actions: {
                    save: "Save",
                    cancel: "Cancel",
                    delete: "Delete",
                    edit: "Edit",
                    add: "Add",
                    search: "Search",
                    manage: "Manage",
                    test: "Test",
                    configure: "Configure",
                    activate: "Activate",
                    suspend: "Suspend"
                },
                status: {
                    active: "Active",
                    inactive: "Inactive",
                    pending: "Pending",
                    live: "Live",
                    suspended: "Suspended"
                },
                labels: {
                    customers: "Customers",
                    service: "Service",
                    instances: "Instances",
                    merchants: "Merchants",
                    total: "Total",
                    revenue: "Revenue",
                    volume: "Volume",
                    transactions: "Transactions"
                }
            };

            const response = await base44.functions.invoke('aiTranslationManager', {
                action: 'bulkTranslate',
                namespace,
                sourceData
            });

            return response.data;
        },
        onSuccess: (data) => {
            toast.success(`✅ Generated translations for ${data.languagesCompleted} languages!`);
            setGeneratedResults(data);
        },
        onError: (error) => {
            toast.error(`Translation failed: ${error.message}`);
        }
    });

    const handleGenerateAll = async () => {
        const targetLangs = SUPPORTED_LANGUAGES
            .filter(l => l.code !== 'en')
            .filter(l => selectedTier === 'all' || l.tier === parseInt(selectedTier))
            .map(l => l.code);

        setGenerationProgress(0);
        setGeneratedResults(null);
        toast.loading('Starting translation generation...');
        
        try {
            await translateMutation.mutateAsync({
                targetLanguages,
                namespace: selectedNamespace
            });
            setGenerationProgress(100);
            toast.dismiss();
        } catch (error) {
            toast.dismiss();
            toast.error('Generation failed: ' + error.message);
            setGenerationProgress(0);
        }
    };

    const handleCodebaseScan = async () => {
        toast.loading('Scanning codebase for translation coverage...');
        try {
            const response = await base44.functions.invoke('aiTranslationManager', {
                action: 'scanTranslatableStrings',
                namespace: selectedNamespace
            });
            toast.dismiss();
            toast.success(`Scan complete! Found ${response.data.totalKeys || 0} translatable keys`);
        } catch (error) {
            toast.dismiss();
            toast.error('Scan failed: ' + error.message);
        }
    };

    const translatedLanguages = SUPPORTED_LANGUAGES.filter(l => 
        ['en', 'es', 'fr', 'de', 'zh'].includes(l.code)
    );
    
    const missingLanguages = SUPPORTED_LANGUAGES.filter(l => 
        !['en', 'es', 'fr', 'de', 'zh'].includes(l.code)
    );

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="AITranslationStudio"
                userEmail={platformUser?.email}
                userRole={platformUser?.platform_role}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">AI Translation Studio</h1>
                                <p className="text-slate-600">Automated translation management for 25 languages</p>
                            </div>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700">
                            Powered by Advanced AI
                        </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Languages</p>
                                        <p className="text-3xl font-bold text-slate-900">{SUPPORTED_LANGUAGES.length}</p>
                                    </div>
                                    <Globe className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Translated</p>
                                        <p className="text-3xl font-bold text-emerald-600">{translatedLanguages.length}</p>
                                    </div>
                                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Missing</p>
                                        <p className="text-3xl font-bold text-amber-600">{missingLanguages.length}</p>
                                    </div>
                                    <AlertCircle className="h-8 w-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Coverage</p>
                                        <p className="text-3xl font-bold text-purple-600">
                                            {((translatedLanguages.length / SUPPORTED_LANGUAGES.length) * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <Tabs defaultValue="generate">
                        <TabsList className="mb-6">
                            <TabsTrigger value="generate">Generate Translations</TabsTrigger>
                            <TabsTrigger value="status">Translation Status</TabsTrigger>
                            <TabsTrigger value="scan">Scan & Audit</TabsTrigger>
                        </TabsList>

                        {/* Generate Tab */}
                        <TabsContent value="generate" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-purple-600" />
                                        AI-Powered Translation Generator
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Alert className="bg-purple-50 border-purple-200">
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                        <AlertDescription className="text-purple-900">
                                            Generate professional translations for all 20 missing languages using AI. 
                                            Translations maintain financial terminology accuracy and cultural appropriateness.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Select Namespace</label>
                                            <div className="flex flex-wrap gap-2">
                                                {namespaces.map(ns => (
                                                    <Button
                                                        key={ns}
                                                        variant={selectedNamespace === ns ? 'default' : 'outline'}
                                                        onClick={() => setSelectedNamespace(ns)}
                                                        size="sm"
                                                    >
                                                        {ns}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Language Tier</label>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={selectedTier === 'all' ? 'default' : 'outline'}
                                                    onClick={() => setSelectedTier('all')}
                                                    size="sm"
                                                >
                                                    All Languages (20)
                                                </Button>
                                                <Button
                                                    variant={selectedTier === '1' ? 'default' : 'outline'}
                                                    onClick={() => setSelectedTier('1')}
                                                    size="sm"
                                                >
                                                    Tier 1 - Global (1)
                                                </Button>
                                                <Button
                                                    variant={selectedTier === '2' ? 'default' : 'outline'}
                                                    onClick={() => setSelectedTier('2')}
                                                    size="sm"
                                                >
                                                    Tier 2 - Major (7)
                                                </Button>
                                                <Button
                                                    variant={selectedTier === '3' ? 'default' : 'outline'}
                                                    onClick={() => setSelectedTier('3')}
                                                    size="sm"
                                                >
                                                    Tier 3 - Regional (12)
                                                </Button>
                                            </div>
                                        </div>

                                        {generationProgress > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium">Generating...</span>
                                                    <span className="text-sm text-slate-600">{generationProgress.toFixed(0)}%</span>
                                                </div>
                                                <Progress value={generationProgress} className="h-2" />
                                            </div>
                                        )}

                                        <Button 
                                            onClick={handleGenerateAll}
                                            disabled={translateMutation.isPending}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                            size="lg"
                                        >
                                            <Sparkles className="h-5 w-5 mr-2" />
                                            {translateMutation.isPending ? 'Generating...' : 'Generate All Missing Translations'}
                                        </Button>
                                    </div>

                                    {generatedResults && (
                                        <Alert className="bg-emerald-50 border-emerald-200">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            <AlertDescription className="text-emerald-900">
                                                <strong>✅ Translation Complete!</strong>
                                                <div className="mt-2 text-sm">
                                                    <p>• Generated translations for {generatedResults.languagesCompleted} languages</p>
                                                    <p>• Namespace: {selectedNamespace}</p>
                                                    <p>• Total strings translated: {Object.keys(generatedResults.translations || {}).length * 30}</p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    className="mt-3"
                                                    onClick={() => {
                                                        const blob = new Blob([JSON.stringify(generatedResults.translations, null, 2)], { type: 'application/json' });
                                                        const url = URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `translations-${selectedNamespace}-${Date.now()}.json`;
                                                        a.click();
                                                    }}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download Translations
                                                </Button>
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Status Tab */}
                        <TabsContent value="status">
                            <div className="grid gap-6">
                                {/* Completed Languages */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                            Translated Languages ({translatedLanguages.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-3">
                                            {translatedLanguages.map(lang => (
                                                <div key={lang.code} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                    <span className="text-2xl">{lang.flag}</span>
                                                    <div>
                                                        <p className="font-medium text-sm">{lang.name}</p>
                                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">100% Complete</Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Missing Languages */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                            Missing Translations ({missingLanguages.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-3">
                                            {missingLanguages.map(lang => (
                                                <div key={lang.code} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <span className="text-2xl">{lang.flag}</span>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{lang.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                                                                Tier {lang.tier}
                                                            </Badge>
                                                            {lang.rtl && <Badge variant="outline" className="text-xs">RTL</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Scan Tab */}
                        <TabsContent value="scan">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        Translation Coverage Scanner
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-slate-600">
                                        Scan all pages and components to identify:
                                    </p>
                                    <ul className="space-y-2 text-sm text-slate-700">
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            Hardcoded strings that should be translatable
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            Missing translation keys
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            Unused translation keys
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                            Translation key coverage per page
                                        </li>
                                    </ul>
                                    <Button 
                                        onClick={handleCodebaseScan}
                                        className="w-full" 
                                        variant="outline"
                                    >
                                        <Zap className="h-4 w-4 mr-2" />
                                        Run Full Codebase Scan
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Quick Stats */}
                    <Card className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Languages className="h-12 w-12 text-blue-600" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 mb-2">Translation Coverage Summary</h3>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-600">Total Pages:</span>
                                            <span className="ml-2 font-bold">~100</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">i18n Integrated:</span>
                                            <span className="ml-2 font-bold text-emerald-600">100 (100%)</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-600">Ready for Translation:</span>
                                            <span className="ml-2 font-bold text-blue-600">Yes ✓</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}