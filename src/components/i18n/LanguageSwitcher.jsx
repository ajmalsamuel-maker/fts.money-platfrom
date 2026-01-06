/**
 * Language Switcher Component
 * Can be embedded in any portal header/settings
 */

import React from 'react';
import { useI18n, SUPPORTED_LANGUAGES } from './I18nextProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function LanguageSwitcher({ variant = 'select', showLabel = true }) {
    const { language, setLanguage, supportedLanguages, rtl } = useI18n();

    const currentLanguage = supportedLanguages.find(l => l.code === language);

    if (variant === 'select') {
        return (
            <div className="flex items-center gap-2">
                {showLabel && (
                    <Globe className="h-4 w-4 text-slate-600 hidden sm:block" />
                )}
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[140px] sm:w-[180px] md:w-[200px]">
                        <SelectValue>
                            <div className="flex items-center gap-2">
                                <span>{currentLanguage?.flag}</span>
                                <span>{currentLanguage?.nativeName}</span>
                                {rtl && <Badge variant="outline" className="text-[10px] px-1 py-0">RTL</Badge>}
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                        {supportedLanguages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                                <div className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.nativeName}</span>
                                    <span className="text-xs text-slate-500">({lang.name})</span>
                                    {lang.rtl && <Badge variant="outline" className="text-[10px] px-1 py-0 ml-auto">RTL</Badge>}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    const currentIndex = supportedLanguages.findIndex(l => l.code === language);
                    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
                    setLanguage(supportedLanguages[nextIndex].code);
                }}
                className="gap-2"
            >
                <span>{currentLanguage?.flag}</span>
                <span className="text-xs">{currentLanguage?.code.toUpperCase()}</span>
            </Button>
        );
    }

    // Grid variant for settings page
    return (
        <div className="grid grid-cols-4 gap-3">
            {supportedLanguages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`
                        flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all
                        ${language === lang.code 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-slate-200 hover:border-blue-300'
                        }
                    `}
                >
                    <span className="text-3xl">{lang.flag}</span>
                    <span className="font-medium text-sm">{lang.nativeName}</span>
                    <span className="text-xs text-slate-600">{lang.name}</span>
                    {lang.rtl && (
                        <Badge variant="outline" className="text-[10px]">RTL</Badge>
                    )}
                </button>
            ))}
        </div>
    );
}

/**
 * Language Badge for displaying current language
 */
export function LanguageBadge() {
    const { language, supportedLanguages } = useI18n();
    const currentLanguage = supportedLanguages.find(l => l.code === language);

    return (
        <Badge variant="outline" className="gap-1">
            <span>{currentLanguage?.flag}</span>
            <span>{currentLanguage?.nativeName}</span>
        </Badge>
    );
}