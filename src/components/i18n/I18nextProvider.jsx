/**
 * I18next Provider Wrapper
 * Drop-in replacement for EnhancedLanguageProvider
 */
import React from 'react';
import { I18nextProvider as ReactI18nextProvider } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from './i18nConfig';

export function I18nextProvider({ children }) {
    return (
        <ReactI18nextProvider i18n={i18n}>
            {children}
        </ReactI18nextProvider>
    );
}

/**
 * Backwards compatibility hook
 * Wraps react-i18next's useTranslation for existing code
 */
export function useI18n() {
    const currentLanguage = i18n.language;
    const isRTL = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.rtl || false;
    
    return {
        language: currentLanguage,
        setLanguage: (lng) => i18n.changeLanguage(lng),
        t: (key, options) => {
            // Support both "namespace:key" and namespace parameter formats
            if (key.includes(':')) {
                const [ns, actualKey] = key.split(':');
                return i18n.t(actualKey, { ns, ...options });
            }
            return i18n.t(key, options);
        },
        supportedLanguages: SUPPORTED_LANGUAGES,
        rtl: isRTL
    };
}

export { SUPPORTED_LANGUAGES };