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
            en: { 
                actions: { save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", add: "Add", search: "Search", manage: "Manage", test: "Test" }, 
                status: { active: "Active", inactive: "Inactive", pending: "Pending", live: "Live" },
                labels: { customers: "Customers", service: "Service", instances: "Instances", merchants: "Merchants", total: "Total", revenue: "Revenue", volume: "Volume" }
            },
            fr: { 
                actions: { save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", edit: "Modifier", add: "Ajouter", search: "Rechercher", manage: "Gérer", test: "Tester" }, 
                status: { active: "Actif", inactive: "Inactif", pending: "En attente", live: "En direct" },
                labels: { customers: "Clients", service: "Service", instances: "Instances", merchants: "Marchands", total: "Total", revenue: "Revenus", volume: "Volume" }
            },
            es: { 
                actions: { save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar", add: "Agregar", search: "Buscar", manage: "Gestionar", test: "Probar" }, 
                status: { active: "Activo", inactive: "Inactivo", pending: "Pendiente", live: "En vivo" },
                labels: { customers: "Clientes", service: "Servicio", instances: "Instancias", merchants: "Comerciantes", total: "Total", revenue: "Ingresos", volume: "Volumen" }
            },
            de: { 
                actions: { save: "Speichern", cancel: "Abbrechen", delete: "Löschen", edit: "Bearbeiten", add: "Hinzufügen", search: "Suchen", manage: "Verwalten", test: "Testen" }, 
                status: { active: "Aktiv", inactive: "Inaktiv", pending: "Ausstehend", live: "Live" },
                labels: { customers: "Kunden", service: "Dienst", instances: "Instanzen", merchants: "Händler", total: "Gesamt", revenue: "Umsatz", volume: "Volumen" }
            },
            zh: { 
                actions: { save: "保存", cancel: "取消", delete: "删除", edit: "编辑", add: "添加", search: "搜索", manage: "管理", test: "测试" }, 
                status: { active: "活跃", inactive: "不活跃", pending: "待处理", live: "在线" },
                labels: { customers: "客户", service: "服务", instances: "实例", merchants: "商户", total: "总计", revenue: "收入", volume: "交易量" }
            }
        },
        platform: {
            en: { 
                dashboard: { title: "Control Panel Dashboard", subtitle: "Unified management for all PSP instances and global configurations" }, 
                services: { 
                    title: "Platform Services",
                    psp: "PSP Platform",
                    iso: "ISO Gateway",
                    orchestration: "Orchestration",
                    crypto: "Crypto Banking",
                    rwa: "RWA Platform"
                },
                quickActions: "Quick Actions",
                performance: "Platform Performance & Resources",
                activePSPs: "Active PSP Instances",
                addService: "Add Service",
                stats: {
                    pspInstances: "PSP Instances",
                    totalMerchants: "Total Merchants",
                    paymentProviders: "Payment Providers",
                    payoutRoutes: "Payout Routes",
                    platformRevenue: "Platform Revenue"
                },
                quickActionItems: {
                    pspInstances: "PSP Instances",
                    isoGateway: "ISO Gateway",
                    serviceCatalog: "Service Catalog",
                    providerPool: "Provider Pool",
                    payoutRoutes: "Payout Routes",
                    analytics: "Analytics",
                    revenue: "Revenue"
                },
                menuItems: {
                    platformDashboard: "Platform Dashboard",
                    platformDashboardDesc: "Platform overview",
                    systemHealth: "System Health",
                    systemHealthDesc: "Real-time monitoring",
                    revenueDashboard: "Revenue Dashboard",
                    revenueDashboardDesc: "Financial overview",
                    platformAnalytics: "Platform Analytics",
                    platformAnalyticsDesc: "Cross-platform insights",
                    setupGuide: "Setup Guide",
                    setupGuideDesc: "Quick start guide"
                },
                performanceCards: {
                    platformTPS: "Platform TPS",
                    transactionsPerSec: "Transactions/sec",
                    cloudInstances: "Cloud Instances",
                    regions: "regions",
                    cpuCores: "CPU Cores",
                    ram: "GB RAM",
                    storage: "Storage",
                    tbAllocated: "TB allocated"
                },
                sidebar: {
                    "overview": "Overview & Insights",
                    "psp-operations": "PSP Operations",
                    "crypto-gateway": "Crypto Banking Gateway",
                    "rwa-platform": "RWA Tokenization Platform",
                    "services-marketplace": "Services & Marketplace",
                    "user-management": "User & Access Management",
                    "financial": "Financial Operations",
                    "compliance": "Compliance & Security",
                    "infrastructure": "Infrastructure",
                    "documentation": "Documentation",
                    "resources": "Settings & Resources"
                }
            },
            fr: { 
                dashboard: { title: "Tableau de bord du panneau de contrôle", subtitle: "Gestion unifiée de toutes les instances PSP et des configurations globales" }, 
                services: { 
                    title: "Services de plateforme",
                    psp: "Plateforme PSP",
                    iso: "Passerelle ISO",
                    orchestration: "Orchestration",
                    crypto: "Banque crypto",
                    rwa: "Plateforme RWA"
                },
                quickActions: "Actions rapides",
                performance: "Performances et ressources de la plateforme",
                activePSPs: "Instances PSP actives",
                addService: "Ajouter un service",
                stats: {
                    pspInstances: "Instances PSP",
                    totalMerchants: "Total marchands",
                    paymentProviders: "Fournisseurs de paiement",
                    payoutRoutes: "Routes de paiement",
                    platformRevenue: "Revenus de la plateforme"
                },
                quickActionItems: {
                    pspInstances: "Instances PSP",
                    isoGateway: "Passerelle ISO",
                    serviceCatalog: "Catalogue de services",
                    providerPool: "Pool de fournisseurs",
                    payoutRoutes: "Routes de paiement",
                    analytics: "Analytique",
                    revenue: "Revenus"
                },
                menuItems: {
                    platformDashboard: "Tableau de bord plateforme",
                    platformDashboardDesc: "Aperçu de la plateforme",
                    systemHealth: "État du système",
                    systemHealthDesc: "Surveillance en temps réel",
                    revenueDashboard: "Tableau de bord des revenus",
                    revenueDashboardDesc: "Aperçu financier",
                    platformAnalytics: "Analytique plateforme",
                    platformAnalyticsDesc: "Informations multi-plateformes",
                    setupGuide: "Guide de configuration",
                    setupGuideDesc: "Guide de démarrage rapide"
                },
                performanceCards: {
                    platformTPS: "TPS plateforme",
                    transactionsPerSec: "Transactions/sec",
                    cloudInstances: "Instances cloud",
                    regions: "régions",
                    cpuCores: "Cœurs CPU",
                    ram: "Go RAM",
                    storage: "Stockage",
                    tbAllocated: "To alloués"
                },
                sidebar: {
                    "overview": "Aperçu et informations",
                    "psp-operations": "Opérations PSP",
                    "crypto-gateway": "Passerelle bancaire crypto",
                    "rwa-platform": "Plateforme de tokenisation RWA",
                    "services-marketplace": "Services et marché",
                    "user-management": "Gestion des utilisateurs et accès",
                    "financial": "Opérations financières",
                    "compliance": "Conformité et sécurité",
                    "infrastructure": "Infrastructure",
                    "documentation": "Documentation",
                    "resources": "Paramètres et ressources"
                }
            },
            es: { 
                dashboard: { title: "Panel de control", subtitle: "Gestión unificada de todas las instancias PSP y configuraciones globales" }, 
                services: { 
                    title: "Servicios de plataforma",
                    psp: "Plataforma PSP",
                    iso: "Puerta de enlace ISO",
                    orchestration: "Orquestación",
                    crypto: "Banca cripto",
                    rwa: "Plataforma RWA"
                },
                quickActions: "Acciones rápidas",
                performance: "Rendimiento y recursos de la plataforma",
                activePSPs: "Instancias PSP activas",
                addService: "Agregar servicio",
                stats: {
                    pspInstances: "Instancias PSP",
                    totalMerchants: "Total comerciantes",
                    paymentProviders: "Proveedores de pago",
                    payoutRoutes: "Rutas de pago",
                    platformRevenue: "Ingresos de plataforma"
                },
                quickActionItems: {
                    pspInstances: "Instancias PSP",
                    isoGateway: "Puerta de enlace ISO",
                    serviceCatalog: "Catálogo de servicios",
                    providerPool: "Pool de proveedores",
                    payoutRoutes: "Rutas de pago",
                    analytics: "Analítica",
                    revenue: "Ingresos"
                },
                menuItems: {
                    platformDashboard: "Panel de plataforma",
                    platformDashboardDesc: "Resumen de plataforma",
                    systemHealth: "Estado del sistema",
                    systemHealthDesc: "Monitoreo en tiempo real",
                    revenueDashboard: "Panel de ingresos",
                    revenueDashboardDesc: "Resumen financiero",
                    platformAnalytics: "Analítica de plataforma",
                    platformAnalyticsDesc: "Información multiplataforma",
                    setupGuide: "Guía de configuración",
                    setupGuideDesc: "Guía de inicio rápido"
                },
                performanceCards: {
                    platformTPS: "TPS plataforma",
                    transactionsPerSec: "Transacciones/seg",
                    cloudInstances: "Instancias cloud",
                    regions: "regiones",
                    cpuCores: "Núcleos CPU",
                    ram: "GB RAM",
                    storage: "Almacenamiento",
                    tbAllocated: "TB asignados"
                },
                sidebar: {
                    "overview": "Resumen e información",
                    "psp-operations": "Operaciones PSP",
                    "crypto-gateway": "Puerta de enlace bancaria cripto",
                    "rwa-platform": "Plataforma de tokenización RWA",
                    "services-marketplace": "Servicios y mercado",
                    "user-management": "Gestión de usuarios y acceso",
                    "financial": "Operaciones financieras",
                    "compliance": "Cumplimiento y seguridad",
                    "infrastructure": "Infraestructura",
                    "documentation": "Documentación",
                    "resources": "Configuración y recursos"
                }
            },
            de: { 
                dashboard: { title: "Kontrollzentrum Dashboard", subtitle: "Einheitliche Verwaltung aller PSP-Instanzen und globalen Konfigurationen" }, 
                services: { 
                    title: "Plattformdienste",
                    psp: "PSP-Plattform",
                    iso: "ISO-Gateway",
                    orchestration: "Orchestrierung",
                    crypto: "Krypto-Banking",
                    rwa: "RWA-Plattform"
                },
                quickActions: "Schnellaktionen",
                performance: "Plattformleistung und Ressourcen",
                activePSPs: "Aktive PSP-Instanzen",
                addService: "Dienst hinzufügen",
                stats: {
                    pspInstances: "PSP-Instanzen",
                    totalMerchants: "Händler gesamt",
                    paymentProviders: "Zahlungsanbieter",
                    payoutRoutes: "Auszahlungsrouten",
                    platformRevenue: "Plattformumsatz"
                },
                quickActionItems: {
                    pspInstances: "PSP-Instanzen",
                    isoGateway: "ISO-Gateway",
                    serviceCatalog: "Dienstkatalog",
                    providerPool: "Anbieter-Pool",
                    payoutRoutes: "Auszahlungsrouten",
                    analytics: "Analytics",
                    revenue: "Umsatz"
                },
                menuItems: {
                    platformDashboard: "Plattform-Dashboard",
                    platformDashboardDesc: "Plattformübersicht",
                    systemHealth: "Systemzustand",
                    systemHealthDesc: "Echtzeitüberwachung",
                    revenueDashboard: "Umsatz-Dashboard",
                    revenueDashboardDesc: "Finanzübersicht",
                    platformAnalytics: "Plattform-Analytics",
                    platformAnalyticsDesc: "Plattformübergreifende Einblicke",
                    setupGuide: "Einrichtungsanleitung",
                    setupGuideDesc: "Schnellstartanleitung"
                },
                performanceCards: {
                    platformTPS: "Plattform-TPS",
                    transactionsPerSec: "Transaktionen/Sek",
                    cloudInstances: "Cloud-Instanzen",
                    regions: "Regionen",
                    cpuCores: "CPU-Kerne",
                    ram: "GB RAM",
                    storage: "Speicher",
                    tbAllocated: "TB zugewiesen"
                },
                sidebar: {
                    "overview": "Übersicht und Einblicke",
                    "psp-operations": "PSP-Betrieb",
                    "crypto-gateway": "Krypto-Banking-Gateway",
                    "rwa-platform": "RWA-Tokenisierungsplattform",
                    "services-marketplace": "Dienste und Marktplatz",
                    "user-management": "Benutzer- und Zugriffsverwaltung",
                    "financial": "Finanzoperationen",
                    "compliance": "Compliance und Sicherheit",
                    "infrastructure": "Infrastruktur",
                    "documentation": "Dokumentation",
                    "resources": "Einstellungen und Ressourcen"
                }
            },
            zh: { 
                dashboard: { title: "控制面板仪表板", subtitle: "统一管理所有PSP实例和全局配置" }, 
                services: { 
                    title: "平台服务",
                    psp: "PSP平台",
                    iso: "ISO网关",
                    orchestration: "编排",
                    crypto: "加密银行",
                    rwa: "RWA平台"
                },
                quickActions: "快速操作",
                performance: "平台性能和资源",
                activePSPs: "活跃PSP实例",
                addService: "添加服务",
                stats: {
                    pspInstances: "PSP实例",
                    totalMerchants: "总商户",
                    paymentProviders: "支付提供商",
                    payoutRoutes: "支付路由",
                    platformRevenue: "平台收入"
                },
                quickActionItems: {
                    pspInstances: "PSP实例",
                    isoGateway: "ISO网关",
                    serviceCatalog: "服务目录",
                    providerPool: "提供商池",
                    payoutRoutes: "支付路由",
                    analytics: "分析",
                    revenue: "收入"
                },
                menuItems: {
                    platformDashboard: "平台仪表板",
                    platformDashboardDesc: "平台概览",
                    systemHealth: "系统健康",
                    systemHealthDesc: "实时监控",
                    revenueDashboard: "收入仪表板",
                    revenueDashboardDesc: "财务概览",
                    platformAnalytics: "平台分析",
                    platformAnalyticsDesc: "跨平台洞察",
                    setupGuide: "设置指南",
                    setupGuideDesc: "快速入门指南"
                },
                performanceCards: {
                    platformTPS: "平台TPS",
                    transactionsPerSec: "交易/秒",
                    cloudInstances: "云实例",
                    regions: "地区",
                    cpuCores: "CPU核心",
                    ram: "GB内存",
                    storage: "存储",
                    tbAllocated: "TB已分配"
                },
                sidebar: {
                    "overview": "概览和洞察",
                    "psp-operations": "PSP操作",
                    "crypto-gateway": "加密银行网关",
                    "rwa-platform": "RWA代币化平台",
                    "services-marketplace": "服务和市场",
                    "user-management": "用户和访问管理",
                    "financial": "财务操作",
                    "compliance": "合规和安全",
                    "infrastructure": "基础设施",
                    "documentation": "文档",
                    "resources": "设置和资源"
                }
            }
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