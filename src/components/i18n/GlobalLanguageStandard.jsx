/**
 * FTS.Money Global Multilingual Standard
 * @version 1.1.2
 * 
 * Enterprise-grade internationalization (i18n) system for all portals and services
 * Based on:
 * - ISO 639-1/639-2 (Language codes)
 * - ISO 3166-1 (Country codes)
 * - BCP 47 (Language tags)
 * - Unicode CLDR (Common Locale Data Repository)
 * - React i18next industry standard
 */

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', iso639_2: 'eng', rtl: false, flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', iso639_2: 'spa', rtl: false, flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', iso639_2: 'fra', rtl: false, flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', iso639_2: 'deu', rtl: false, flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', iso639_2: 'zho', rtl: false, flag: '🇨🇳' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', iso639_2: 'zho', rtl: false, flag: '🇹🇼' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', iso639_2: 'jpn', rtl: false, flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', iso639_2: 'kor', rtl: false, flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', iso639_2: 'ara', rtl: true, flag: '🇸🇦' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', iso639_2: 'por', rtl: false, flag: '🇵🇹' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', iso639_2: 'por', rtl: false, flag: '🇧🇷' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', iso639_2: 'rus', rtl: false, flag: '🇷🇺' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', iso639_2: 'ita', rtl: false, flag: '🇮🇹' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', iso639_2: 'nld', rtl: false, flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', iso639_2: 'pol', rtl: false, flag: '🇵🇱' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', iso639_2: 'tur', rtl: false, flag: '🇹🇷' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', iso639_2: 'hin', rtl: false, flag: '🇮🇳' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', iso639_2: 'ind', rtl: false, flag: '🇮🇩' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', iso639_2: 'tha', rtl: false, flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', iso639_2: 'vie', rtl: false, flag: '🇻🇳' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', iso639_2: 'heb', rtl: true, flag: '🇮🇱' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', iso639_2: 'swe', rtl: false, flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', iso639_2: 'nor', rtl: false, flag: '🇳🇴' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', iso639_2: 'dan', rtl: false, flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', iso639_2: 'fin', rtl: false, flag: '🇫🇮' }
];

export const FINANCIAL_SERVICES_LANGUAGES = {
    TIER_1: ['en', 'zh', 'es', 'ar', 'fr'], // Global financial hubs
    TIER_2: ['de', 'ja', 'pt', 'ru', 'it', 'ko'], // Major markets
    TIER_3: ['nl', 'pl', 'tr', 'hi', 'id', 'th', 'vi', 'he', 'sv', 'no', 'da', 'fi'] // Regional markets
};

/**
 * Regional language preferences for financial services
 */
export const REGIONAL_LANGUAGE_PREFERENCES = {
    'APAC': ['en', 'zh', 'ja', 'ko', 'id', 'th', 'vi', 'hi'],
    'EU': ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'sv', 'no', 'da', 'fi'],
    'NA': ['en', 'es', 'fr'],
    'LATAM': ['es', 'pt', 'pt-BR', 'en'],
    'MENA': ['ar', 'en', 'fr', 'he'],
    'CIS': ['ru', 'en']
};

/**
 * Translation namespace structure for multi-tenant architecture
 */
export const TRANSLATION_NAMESPACES = {
    COMMON: 'common', // Shared UI elements
    PLATFORM: 'platform', // Platform control panel
    PSP: 'psp', // PSP portal
    MERCHANT: 'merchant', // Merchant portal
    CRYPTO: 'crypto', // Crypto gateway
    ISO: 'iso', // ISO gateway
    ORCHESTRATION: 'orchestration', // Orchestration portal
    RWA: 'rwa', // RWA platform
    COMMUNITY: 'community', // Community portal
    TERMINAL: 'terminal', // Virtual terminal
    COMPLIANCE: 'compliance', // Compliance & legal
    FINANCIAL: 'financial', // Financial terms
    TECHNICAL: 'technical' // Technical/API docs
};

/**
 * Language detection strategy (BCP 47 compliant)
 */
export const detectUserLanguage = () => {
    // Priority order:
    // 1. User profile preference (database)
    // 2. PSP instance default
    // 3. Browser language
    // 4. IP-based geolocation
    // 5. Platform default (English)
    
    const storedLang = localStorage.getItem('user_language');
    if (storedLang && SUPPORTED_LANGUAGES.find(l => l.code === storedLang)) {
        return storedLang;
    }
    
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    if (SUPPORTED_LANGUAGES.find(l => l.code === langCode)) {
        return langCode;
    }
    
    return 'en'; // Fallback
};

/**
 * RTL (Right-to-Left) language detection
 */
export const isRTL = (languageCode) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);
    return lang?.rtl || false;
};

/**
 * Get language by ISO 639-2 code
 */
export const getLanguageByISO639_2 = (iso639_2Code) => {
    return SUPPORTED_LANGUAGES.find(l => l.iso639_2 === iso639_2Code);
};

/**
 * Currency formatting per language locale
 */
export const formatCurrency = (amount, currencyCode, languageCode) => {
    try {
        return new Intl.NumberFormat(languageCode, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    } catch {
        return `${currencyCode} ${amount.toFixed(2)}`;
    }
};

/**
 * Date/Time formatting per language locale
 */
export const formatDateTime = (date, languageCode, options = {}) => {
    try {
        return new Intl.DateTimeFormat(languageCode, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        }).format(new Date(date));
    } catch {
        return new Date(date).toLocaleString('en-US');
    }
};

/**
 * Number formatting per language locale
 */
export const formatNumber = (number, languageCode) => {
    try {
        return new Intl.NumberFormat(languageCode).format(number);
    } catch {
        return number.toString();
    }
};

/**
 * PSP-specific language configuration
 */
export const getPSPLanguageConfig = async (pspCode) => {
    // This would fetch from database:
    // - PSP default language
    // - Enabled languages for this PSP
    // - Custom translations overrides
    // - Regional compliance requirements
    
    return {
        defaultLanguage: 'en',
        enabledLanguages: ['en', 'es', 'fr', 'de', 'zh'],
        requireMultilingual: false, // EU/APAC compliance
        customTranslations: {}
    };
};

/**
 * Compliance requirements per region
 */
export const COMPLIANCE_LANGUAGE_REQUIREMENTS = {
    EU: {
        required: true,
        minLanguages: 2,
        mustInclude: ['en'],
        preferredAdditional: ['de', 'fr', 'es', 'it']
    },
    APAC: {
        required: false,
        minLanguages: 1,
        mustInclude: ['en'],
        preferredAdditional: ['zh', 'ja', 'ko']
    },
    MENA: {
        required: true,
        minLanguages: 2,
        mustInclude: ['ar', 'en'],
        preferredAdditional: ['fr']
    }
};

/**
 * Translation key naming convention (standardized)
 * Format: namespace.category.specific_key
 * Example: merchant.dashboard.total_transactions
 */
export const generateTranslationKey = (namespace, category, key) => {
    return `${namespace}.${category}.${key}`;
};

/**
 * Export utilities for components
 */
export default {
    SUPPORTED_LANGUAGES,
    FINANCIAL_SERVICES_LANGUAGES,
    REGIONAL_LANGUAGE_PREFERENCES,
    TRANSLATION_NAMESPACES,
    detectUserLanguage,
    isRTL,
    getLanguageByISO639_2,
    formatCurrency,
    formatDateTime,
    formatNumber,
    getPSPLanguageConfig,
    COMPLIANCE_LANGUAGE_REQUIREMENTS,
    generateTranslationKey
};