/**
 * react-i18next Configuration
 * Migrated from custom EnhancedLanguageProvider
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all translation files - Common
import commonEn from './translations/common/en';
import commonEs from './translations/common/es';
import commonFr from './translations/common/fr';
import commonDe from './translations/common/de';
import commonZh from './translations/common/zh';
import commonAr from './translations/common/ar';
import commonHe from './translations/common/he';
import commonJa from './translations/common/ja';
import commonKo from './translations/common/ko';
import commonPt from './translations/common/pt';
import commonPtBR from './translations/common/pt-BR';
import commonRu from './translations/common/ru';
import commonIt from './translations/common/it';
import commonNl from './translations/common/nl';
import commonPl from './translations/common/pl';
import commonTr from './translations/common/tr';
import commonSv from './translations/common/sv';
import commonNo from './translations/common/no';
import commonDa from './translations/common/da';
import commonFi from './translations/common/fi';
import commonHi from './translations/common/hi';
import commonTh from './translations/common/th';
import commonVi from './translations/common/vi';
import commonId from './translations/common/id';
import commonZhTW from './translations/common/zh-TW';

// Platform translations
import platformEn from './translations/platform/en';
import platformEs from './translations/platform/es';
import platformFr from './translations/platform/fr';
import platformDe from './translations/platform/de';
import platformZh from './translations/platform/zh';
import platformJa from './translations/platform/ja';
import platformKo from './translations/platform/ko';
import platformPt from './translations/platform/pt';
import platformPtBR from './translations/platform/pt-BR';
import platformRu from './translations/platform/ru';
import platformIt from './translations/platform/it';
import platformNl from './translations/platform/nl';
import platformPl from './translations/platform/pl';
import platformTr from './translations/platform/tr';
import platformAr from './translations/platform/ar';
import platformHe from './translations/platform/he';
import platformSv from './translations/platform/sv';
import platformNo from './translations/platform/no';
import platformDa from './translations/platform/da';
import platformFi from './translations/platform/fi';
import platformHi from './translations/platform/hi';
import platformTh from './translations/platform/th';
import platformVi from './translations/platform/vi';
import platformId from './translations/platform/id';
import platformZhTW from './translations/platform/zh-TW';

// Other namespaces
import merchantEn from './translations/merchant/en';
import merchantZh from './translations/merchant/zh';
import merchantJa from './translations/merchant/ja';

import pspEn from './translations/psp/en';
import pspZh from './translations/psp/zh';
import pspJa from './translations/psp/ja';

import cryptoEn from './translations/crypto/en';
import cryptoZh from './translations/crypto/zh';
import cryptoJa from './translations/crypto/ja';

import isoEn from './translations/iso/en';
import isoZh from './translations/iso/zh';
import isoJa from './translations/iso/ja';

import orchestrationEn from './translations/orchestration/en';
import orchestrationZh from './translations/orchestration/zh';
import orchestrationJa from './translations/orchestration/ja';

import rwaEn from './translations/rwa/en';
import rwaZh from './translations/rwa/zh';
import rwaJa from './translations/rwa/ja';

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
        merchant: merchantEn,
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
        merchant: merchantJa,
        psp: pspJa,
        crypto: cryptoJa,
        iso: isoJa,
        orchestration: orchestrationJa,
        rwa: rwaJa
    },
    ko: {
        common: commonKo,
        platform: platformKo,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    pt: {
        common: commonPt,
        platform: platformPt,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    'pt-BR': {
        common: commonPtBR,
        platform: platformPtBR,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    ru: {
        common: commonRu,
        platform: platformRu,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    it: {
        common: commonIt,
        platform: platformIt,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    nl: {
        common: commonNl,
        platform: platformNl,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    pl: {
        common: commonPl,
        platform: platformPl,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    tr: {
        common: commonTr,
        platform: platformTr,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    ar: {
        common: commonAr,
        platform: platformAr,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    he: {
        common: commonHe,
        platform: platformHe,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    sv: {
        common: commonSv,
        platform: platformSv,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    no: {
        common: commonNo,
        platform: platformNo,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    da: {
        common: commonDa,
        platform: platformDa,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    fi: {
        common: commonFi,
        platform: platformFi,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    hi: {
        common: commonHi,
        platform: platformHi,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    th: {
        common: commonTh,
        platform: platformTh,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    vi: {
        common: commonVi,
        platform: platformVi,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    id: {
        common: commonId,
        platform: platformId,
        merchant: merchantEn,
        psp: pspEn,
        crypto: cryptoEn,
        iso: isoEn,
        orchestration: orchestrationEn,
        rwa: rwaEn
    },
    'zh-TW': {
        common: commonZhTW,
        platform: platformZhTW,
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