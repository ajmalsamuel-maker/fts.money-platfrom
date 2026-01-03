/**
 * ISO Standards Compliance Report
 * Documents adherence to international standards
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink, Globe, Calendar, DollarSign, Languages } from 'lucide-react';

export default function ISOComplianceReport() {
    const standards = [
        {
            standard: "ISO 639-1 / ISO 639-2",
            name: "Language Codes",
            icon: Languages,
            status: "Implemented",
            color: "text-emerald-600",
            description: "Two-letter and three-letter language codes for internationalization",
            implementation: [
                "SUPPORTED_LANGUAGES array with both ISO 639-1 (code) and ISO 639-2 (iso639_2) fields",
                "25+ languages with native names and display names",
                "RTL (Right-to-Left) language support for Arabic, Hebrew",
                "Language detection and validation utilities"
            ],
            location: "components/i18n/GlobalLanguageStandard.js"
        },
        {
            standard: "ISO 3166-1",
            name: "Country Codes",
            icon: Globe,
            status: "Implemented",
            color: "text-emerald-600",
            description: "Two-letter country codes for geographic regions",
            implementation: [
                "Country code utilities in components/utils/countries.js",
                "Used in merchant onboarding, PSP provisioning, regional preferences",
                "Regional language preferences mapped to ISO 3166 country codes",
                "Compliance requirements per region (EU, APAC, MENA, etc.)"
            ],
            location: "components/utils/countries.js, components/i18n/GlobalLanguageStandard.js"
        },
        {
            standard: "ISO 8601",
            name: "Date and Time Formats",
            icon: Calendar,
            status: "Implemented",
            color: "text-emerald-600",
            description: "International standard for date and time representation",
            implementation: [
                "formatDateTime() utility using Intl.DateTimeFormat with locale support",
                "All database timestamps in ISO 8601 format (date-time)",
                "Entity schemas use 'date-time' and 'date' formats",
                "Timezone-aware formatting with IANA timezone identifiers"
            ],
            location: "components/i18n/GlobalLanguageStandard.js, entities/*.json"
        },
        {
            standard: "ISO 4217",
            name: "Currency Codes",
            icon: DollarSign,
            status: "Implemented",
            color: "text-emerald-600",
            description: "Three-letter currency codes for financial systems",
            implementation: [
                "Currency utilities in components/utils/iso4217.js",
                "formatCurrency() using Intl.NumberFormat with currency and locale",
                "Used across all payment processing, transactions, settlements",
                "Multi-currency support with proper formatting per locale"
            ],
            location: "components/utils/iso4217.js, components/i18n/GlobalLanguageStandard.js"
        },
        {
            standard: "Unicode CLDR",
            name: "Common Locale Data Repository",
            icon: Globe,
            status: "Implemented",
            color: "text-emerald-600",
            description: "Cultural formatting rules for dates, numbers, currencies",
            implementation: [
                "JavaScript Intl API (CLDR-based) for all formatting",
                "formatNumber() for locale-specific number formatting",
                "formatCurrency() with proper decimal separators and symbols",
                "formatDateTime() with locale-specific date/time patterns"
            ],
            location: "components/i18n/GlobalLanguageStandard.js"
        },
        {
            standard: "BCP 47",
            name: "Language Tags",
            icon: Languages,
            status: "Implemented",
            color: "text-emerald-600",
            description: "IETF Best Current Practice for language identification",
            implementation: [
                "Language codes follow BCP 47 format (e.g., en, zh-TW, pt-BR)",
                "detectUserLanguage() uses navigator.language (BCP 47 compliant)",
                "Support for language variants (Simplified/Traditional Chinese, Brazilian Portuguese)",
                "Proper language tag parsing and fallback mechanisms"
            ],
            location: "components/i18n/GlobalLanguageStandard.js"
        },
        {
            standard: "W3C I18N",
            name: "Web Internationalization Best Practices",
            icon: Globe,
            status: "Implemented",
            color: "text-emerald-600",
            description: "W3C guidelines for multilingual web applications",
            implementation: [
                "EnhancedLanguageProvider with React Context for i18n state",
                "RTL support with automatic dir='rtl' and text-align adjustments",
                "Language switcher components with proper ARIA labels",
                "Translation namespaces for code organization",
                "Dynamic translation loading based on language and context"
            ],
            location: "components/i18n/EnhancedLanguageProvider.jsx, components/i18n/LanguageSwitcher.jsx"
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    International Standards Compliance
                </CardTitle>
                <CardDescription>
                    FTS.Money Platform adherence to ISO and W3C internationalization standards
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {standards.map((std, index) => {
                        const Icon = std.icon;
                        return (
                            <div key={index} className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <Icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-900">{std.standard}</h3>
                                                <Badge className="bg-emerald-600 text-white text-[10px]">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    {std.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">{std.name}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-slate-700 mb-3">{std.description}</p>
                                
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-900">Implementation Details:</p>
                                    <ul className="space-y-1 text-xs text-slate-700">
                                        {std.implementation.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-emerald-600 mt-0.5">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <p className="text-xs text-slate-500">
                                        <code className="bg-slate-100 px-2 py-0.5 rounded">{std.location}</code>
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Banner */}
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                        <div>
                            <p className="font-semibold text-emerald-900 mb-1">Full Standards Compliance</p>
                            <p className="text-sm text-emerald-800">
                                The FTS.Money Platform implements all major international standards for multilingual financial services, 
                                including ISO 639 (languages), ISO 3166 (countries), ISO 8601 (dates), ISO 4217 (currencies), 
                                Unicode CLDR (cultural formatting), BCP 47 (language tags), and W3C I18N best practices.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}