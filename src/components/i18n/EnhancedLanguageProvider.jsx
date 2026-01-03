/**
 * Enhanced Language Provider with Multi-Tenant Support
 * Enterprise-grade i18n for FTS.Money Platform
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
    SUPPORTED_LANGUAGES, 
    TRANSLATION_NAMESPACES,
    detectUserLanguage,
    isRTL,
    formatCurrency,
    formatDateTime,
    formatNumber 
} from './GlobalLanguageStandard';

const EnhancedLanguageContext = createContext();

export function EnhancedLanguageProvider({ children, tenantType = 'platform', tenantCode = null }) {
    const [language, setLanguage] = useState(() => detectUserLanguage());
    const [translations, setTranslations] = useState({});
    const [loading, setLoading] = useState(true);
    const [namespaces, setNamespaces] = useState(['common', tenantType]);

    // RTL support
    const rtl = useMemo(() => isRTL(language), [language]);

    // Apply RTL to document when language changes
    useEffect(() => {
        if (rtl) {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', language);
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', language);
        }
    }, [language, rtl]);

    // Load translations dynamically
    useEffect(() => {
        const loadTranslations = async () => {
            setLoading(true);
            try {
                const loadedTranslations = {};
                
                // Static imports for better bundler compatibility
                const translationModules = {
                    common: {
                        en: () => import('./translations/common/en.json'),
                        fr: () => import('./translations/common/fr.json'),
                        es: () => import('./translations/common/es.json'),
                        de: () => import('./translations/common/de.json'),
                        zh: () => import('./translations/common/zh.json')
                    },
                    platform: {
                        en: () => import('./translations/platform/en.json'),
                        fr: () => import('./translations/platform/fr.json'),
                        es: () => import('./translations/platform/es.json'),
                        de: () => import('./translations/platform/de.json'),
                        zh: () => import('./translations/platform/zh.json')
                    }
                };
                
                // Load all required namespaces
                for (const ns of namespaces) {
                    try {
                        const nsModules = translationModules[ns];
                        if (nsModules && nsModules[language]) {
                            const module = await nsModules[language]();
                            loadedTranslations[ns] = module.default;
                            console.log(`✓ Loaded ${ns}/${language}.json:`, module.default);
                        } else {
                            console.warn(`Translation not found: ${ns}/${language}.json, falling back to English`);
                            if (nsModules && nsModules['en']) {
                                const fallback = await nsModules['en']();
                                loadedTranslations[ns] = fallback.default;
                            } else {
                                console.error(`No fallback translation for namespace: ${ns}`);
                                loadedTranslations[ns] = {};
                            }
                        }
                    } catch (error) {
                        console.error(`Error loading translation ${ns}/${language}:`, error);
                        loadedTranslations[ns] = {};
                    }
                }

                // Load tenant-specific overrides if applicable
                if (tenantCode) {
                    try {
                        const tenantOverrides = await import(`./translations/tenants/${tenantCode}/${language}.json`);
                        Object.keys(tenantOverrides.default).forEach(ns => {
                            loadedTranslations[ns] = {
                                ...loadedTranslations[ns],
                                ...tenantOverrides.default[ns]
                            };
                        });
                    } catch {
                        // No tenant-specific overrides, that's okay
                    }
                }

                setTranslations(loadedTranslations);
            } catch (error) {
                console.error('Failed to load translations:', error);
            } finally {
                setLoading(false);
            }
        };

        loadTranslations();
    }, [language, namespaces, tenantCode]);

    // Persist language preference
    useEffect(() => {
        localStorage.setItem('user_language', language);
        
        // If user is authenticated, save to user profile
        try {
            const userSession = localStorage.getItem('platform_admin_session') || 
                               localStorage.getItem('merchantSession') ||
                               localStorage.getItem('crypto_gateway_session');
            if (userSession) {
                // TODO: Update user profile with language preference
                // await base44.auth.updateMe({ preferred_language: language });
            }
        } catch (error) {
            console.warn('Could not save language preference to profile:', error);
        }
    }, [language]);

    /**
     * Translation function with namespace support
     * Usage: t('common:save') or t('dashboard.total_transactions', { namespace: 'merchant' })
     */
    const t = (key, options = {}) => {
        let namespace = 'common';
        let translationKey = key;

        // Check if key contains namespace prefix (common:save)
        if (key.includes(':')) {
            [namespace, translationKey] = key.split(':');
        } else if (options.namespace) {
            namespace = options.namespace;
        }

        // Nested key support (dashboard.stats.total_volume)
        const keys = translationKey.split('.');
        let value = translations[namespace];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                break;
            }
        }

        // If not found, try common namespace as fallback
        if (!value && namespace !== 'common') {
            let fallbackValue = translations.common;
            for (const k of keys) {
                if (fallbackValue && typeof fallbackValue === 'object') {
                    fallbackValue = fallbackValue[k];
                } else {
                    break;
                }
            }
            if (fallbackValue && typeof fallbackValue === 'string') {
                value = fallbackValue;
            }
        }

        // Variable interpolation
        if (value && typeof value === 'string' && options.variables) {
            Object.keys(options.variables).forEach(variable => {
                value = value.replace(`{{${variable}}}`, options.variables[variable]);
            });
        }

        // Pluralization support
        if (value && typeof value === 'object' && options.count !== undefined) {
            if (options.count === 0 && value.zero) return value.zero;
            if (options.count === 1 && value.one) return value.one;
            if (value.other) return value.other.replace('{{count}}', options.count);
        }

        return value || translationKey;
    };

    /**
     * Change language with optional callback
     */
    const changeLanguage = (newLanguage, callback) => {
        const langExists = SUPPORTED_LANGUAGES.find(l => l.code === newLanguage);
        if (langExists) {
            setLanguage(newLanguage);
            if (callback) callback();
        } else {
            console.error(`Language ${newLanguage} is not supported`);
        }
    };

    /**
     * Add additional namespaces dynamically
     */
    const addNamespace = (namespace) => {
        if (!namespaces.includes(namespace)) {
            setNamespaces([...namespaces, namespace]);
        }
    };

    const value = {
        language,
        setLanguage: changeLanguage,
        t,
        rtl,
        loading,
        supportedLanguages: SUPPORTED_LANGUAGES,
        addNamespace,
        
        // Formatting utilities
        formatCurrency: (amount, currency) => formatCurrency(amount, currency, language),
        formatDateTime: (date, options) => formatDateTime(date, language, options),
        formatNumber: (number) => formatNumber(number, language)
    };

    return (
        <EnhancedLanguageContext.Provider value={value}>
            {children}
        </EnhancedLanguageContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(EnhancedLanguageContext);
    if (!context) {
        throw new Error('useI18n must be used within EnhancedLanguageProvider');
    }
    return context;
}

export function useTranslation(namespace = 'common') {
    const { t, ...rest } = useI18n();
    return {
        t: (key, options) => t(key, { ...options, namespace }),
        ...rest
    };
}