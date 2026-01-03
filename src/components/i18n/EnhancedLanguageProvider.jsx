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

    // Embedded translations
    const allTranslations = useMemo(() => ({
        common: {
            en: { actions: { save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add", search: "Search" }, status: { active: "Active", inactive: "Inactive", pending: "Pending" } },
            fr: { actions: { save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", edit: "Modifier", add: "Ajouter", search: "Rechercher" }, status: { active: "Actif", inactive: "Inactif", pending: "En attente" } },
            es: { actions: { save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar", add: "Agregar", search: "Buscar" }, status: { active: "Activo", inactive: "Inactivo", pending: "Pendiente" } },
            de: { actions: { save: "Speichern", cancel: "Abbrechen", delete: "Löschen", edit: "Bearbeiten", add: "Hinzufügen", search: "Suchen" }, status: { active: "Aktiv", inactive: "Inaktiv", pending: "Ausstehend" } },
            zh: { actions: { save: "保存", cancel: "取消", delete: "删除", edit: "编辑", add: "添加", search: "搜索" }, status: { active: "活跃", inactive: "不活跃", pending: "待处理" } }
        },
        platform: {
            en: { dashboard: { title: "Control Panel Dashboard", subtitle: "Unified management for all PSP instances and global configurations" }, services: { title: "Platform Services" } },
            fr: { dashboard: { title: "Tableau de bord du panneau de contrôle", subtitle: "Gestion unifiée de toutes les instances PSP et des configurations globales" }, services: { title: "Services de plateforme" } },
            es: { dashboard: { title: "Panel de control", subtitle: "Gestión unificada de todas las instancias PSP y configuraciones globales" }, services: { title: "Servicios de plataforma" } },
            de: { dashboard: { title: "Kontrollzentrum Dashboard", subtitle: "Einheitliche Verwaltung aller PSP-Instanzen und globalen Konfigurationen" }, services: { title: "Plattformdienste" } },
            zh: { dashboard: { title: "控制面板仪表板", subtitle: "统一管理所有PSP实例和全局配置" }, services: { title: "平台服务" } }
        }
    }), []);

    // Load translations based on language
    useEffect(() => {
        setLoading(true);
        const loadedTranslations = {};
        
        namespaces.forEach(ns => {
            if (allTranslations[ns] && allTranslations[ns][language]) {
                loadedTranslations[ns] = allTranslations[ns][language];
            } else if (allTranslations[ns] && allTranslations[ns]['en']) {
                loadedTranslations[ns] = allTranslations[ns]['en'];
            } else {
                loadedTranslations[ns] = {};
            }
        });

        setTranslations(loadedTranslations);
        setLoading(false);
    }, [language, namespaces, allTranslations]);

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