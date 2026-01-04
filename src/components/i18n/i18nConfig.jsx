/**
 * react-i18next Configuration
 * Migrated from custom EnhancedLanguageProvider
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files
import commonEn from './translations/common/en';
import commonEs from './translations/common/es';
import commonFr from './translations/common/fr';
import commonDe from './translations/common/de';
import commonZh from './translations/common/zh';
import commonAr from './translations/common/ar';
import commonHe from './translations/common/he';
import commonJa from './translations/common/ja';

import platformEn from './translations/platform/en';
import platformEs from './translations/platform/es';
import platformFr from './translations/platform/fr';
import platformDe from './translations/platform/de';
import platformZh from './translations/platform/zh';
import platformJa from './translations/platform/ja';

import merchantEn from './translations/merchant/en';
import merchantZh from './translations/merchant/zh';

import pspEn from './translations/psp/en';
import pspZh from './translations/psp/zh';

import cryptoEn from './translations/crypto/en';
import cryptoZh from './translations/crypto/zh';

import isoEn from './translations/iso/en';
import isoZh from './translations/iso/zh';

import orchestrationEn from './translations/orchestration/en';
import orchestrationZh from './translations/orchestration/zh';

import rwaEn from './translations/rwa/en';
import rwaZh from './translations/rwa/zh';

// Supported languages configuration
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', rtl: false },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', rtl: false },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', rtl: false },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', rtl: false },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', rtl: false },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', rtl: false },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', rtl: false },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', rtl: false },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', rtl: false },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', rtl: false },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', rtl: false },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', rtl: false },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', rtl: false },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷', rtl: false },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', rtl: false }
];

// Translation resources
const resources = {
    en: {
        common: commonEn,
        platform: platformEn,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    es: {
        common: commonEs,
        platform: platformEs,
        merchant: merchantEn, // Fallback to English
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    fr: {
        common: commonFr,
        platform: platformFr,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    de: {
        common: commonDe,
        platform: platformDe,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    zh: {
        common: commonZh,
        platform: platformZh,
        merchant: merchantZh,
        psp: pspZh,
        crypto: cryptoZh,
        iso: isoZh,
        orchestration: orchestrationZh,
        rwa: rwaZh
    },
    ja: {
        common: commonJa,
        platform: platformJa,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    ar: {
        common: commonAr,
        platform: platformEn, // Fallback
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    he: {
        common: commonHe,
        platform: platformEn,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('app_language') || 'en',
        fallbackLng: 'en',
        
        // Namespace configuration
        defaultNS: 'common',
        ns: ['common', 'platform', 'merchant', 'psp', 'crypto', 'iso', 'orchestration', 'rwa'],
        
        // Interpolation
        interpolation: {
            escapeValue: false // React already escapes
        },
        
        // Return key if missing translation
        returnNull: false,
        returnEmptyString: false,
        
        // Debug in development
        debug: false,
        
        // React specific
        react: {
            useSuspense: false // Disable suspense to avoid loading issues
        }
    });

// Update localStorage when language changes
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('app_language', lng);
    
    // Update RTL direction
    const isRTL = SUPPORTED_LANGUAGES.find(l => l.code === lng)?.rtl;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

export default i18n;