/**
 * Translation Editor
 * View and edit translations with progress tracking
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
    Search, 
    AlertCircle, 
    CheckCircle, 
    Globe, 
    Save,
    RefreshCw,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES, TRANSLATION_NAMESPACES } from './GlobalLanguageStandard';

export default function TranslationEditor({ onTranslate }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('es');
    const [selectedNamespace, setSelectedNamespace] = useState('common');
    const [filterStatus, setFilterStatus] = useState('all'); // all, missing, incomplete, complete

    // Mock translation data - would come from database
    const [translations, setTranslations] = useState({
        en: {
            common: {
                welcome: "Welcome",
                dashboard: "Dashboard",
                logout: "Logout",
                settings: "Settings",
                save: "Save",
                cancel: "Cancel",
                search: "Search",
                filter: "Filter",
                export: "Export",
                import: "Import"
            }
        },
        es: {
            common: {
                welcome: "Bienvenido",
                dashboard: "Panel de control",
                logout: "Cerrar sesión",
                settings: "", // Missing
                save: "Guardar",
                cancel: "Cancelar",
                search: "", // Missing
                filter: "Filtrar",
                export: "", // Missing
                import: "" // Missing
            }
        }
    });

    const baseTranslations = translations.en[selectedNamespace] || {};
    const currentTranslations = translations[selectedLanguage]?.[selectedNamespace] || {};

    const getTranslationStatus = (key) => {
        const value = currentTranslations[key];
        if (!value || value === '') return 'missing';
        if (value === baseTranslations[key]) return 'incomplete'; // Same as base language
        return 'complete';
    };

    const getProgress = () => {
        const keys = Object.keys(baseTranslations);
        const completed = keys.filter(key => getTranslationStatus(key) === 'complete').length;
        return { completed, total: keys.length, percentage: Math.round((completed / keys.length) * 100) };
    };

    const progress = getProgress();

    const filteredKeys = Object.keys(baseTranslations).filter(key => {
        const matchesSearch = key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            baseTranslations[key].toLowerCase().includes(searchQuery.toLowerCase());
        const status = getTranslationStatus(key);
        const matchesFilter = filterStatus === 'all' || status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleUpdateTranslation = (key, value) => {
        setTranslations(prev => ({
            ...prev,
            [selectedLanguage]: {
                ...prev[selectedLanguage],
                [selectedNamespace]: {
                    ...prev[selectedLanguage]?.[selectedNamespace],
                    [key]: value
                }
            }
        }));
    };

    const handleAutoTranslate = async (key) => {
        const sourceText = baseTranslations[key];
        toast.info('Requesting translation...');
        // Would call backend function here
        onTranslate?.(sourceText, 'en', selectedLanguage, (translated) => {
            handleUpdateTranslation(key, translated);
            toast.success('Translation added');
        });
    };

    const handleSaveAll = () => {
        // Would save to database
        toast.success('Translations saved successfully');
    };

    return (
        <div className="space-y-6">
            {/* Progress Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Translation Progress</CardTitle>
                            <CardDescription>
                                {SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.nativeName} • {selectedNamespace}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-4">
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUPPORTED_LANGUAGES.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            <div className="flex items-center gap-2">
                                                <span>{lang.flag}</span>
                                                <span>{lang.nativeName}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TRANSLATION_NAMESPACES).map(([key, value]) => (
                                        <SelectItem key={value} value={value}>
                                            {key}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Completion</span>
                            <span className="text-sm text-slate-600">
                                {progress.completed} / {progress.total} keys
                            </span>
                        </div>
                        <Progress value={progress.percentage} className="h-3" />
                        <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <span>{progress.completed} Complete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <span>{Object.keys(baseTranslations).filter(k => getTranslationStatus(k) === 'incomplete').length} Incomplete</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span>{Object.keys(baseTranslations).filter(k => getTranslationStatus(k) === 'missing').length} Missing</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editor Controls */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Translation Keys</CardTitle>
                        <Button onClick={handleSaveAll} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Save All Changes
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and Filter */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search translation keys..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="missing">Missing</SelectItem>
                                <SelectItem value="incomplete">Incomplete</SelectItem>
                                <SelectItem value="complete">Complete</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Translation List */}
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-3">
                            {filteredKeys.map(key => {
                                const status = getTranslationStatus(key);
                                return (
                                    <div key={key} className="p-4 border border-slate-200 rounded-lg space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">{key}</code>
                                                <Badge 
                                                    variant="outline"
                                                    className={
                                                        status === 'complete' ? 'border-emerald-600 text-emerald-600' :
                                                        status === 'incomplete' ? 'border-orange-600 text-orange-600' :
                                                        'border-red-600 text-red-600'
                                                    }
                                                >
                                                    {status === 'complete' && <CheckCircle className="h-3 w-3 mr-1" />}
                                                    {status !== 'complete' && <AlertCircle className="h-3 w-3 mr-1" />}
                                                    {status}
                                                </Badge>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => handleAutoTranslate(key)}
                                                className="flex items-center gap-2"
                                            >
                                                <Globe className="h-3 w-3" />
                                                Auto-translate
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-slate-600 mb-1 block">Base (English)</label>
                                                <div className="p-2 bg-slate-50 rounded text-sm">
                                                    {baseTranslations[key]}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-600 mb-1 block">Translation ({selectedLanguage.toUpperCase()})</label>
                                                <Input
                                                    value={currentTranslations[key] || ''}
                                                    onChange={(e) => handleUpdateTranslation(key, e.target.value)}
                                                    placeholder="Enter translation..."
                                                    className="text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}