/**
 * Enhanced Language Provider with Multi-Tenant Support
 * Enterprise-grade i18n for FTS.Money Platform
 * @version 1.2.0 - Dynamic translation loading for all portals
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
                pages: {
                  analytics: {
                    title: "Platform Analytics",
                    subtitle: "Comprehensive performance metrics and insights",
                    allServices: "All Services",
                    volumeTrend: "Transaction Volume Trend",
                    platformVolume: "Platform Volume (6M)",
                    growth: "growth",
                    totalRevenue: "Total Revenue",
                    totalEndUsers: "Total End Users",
                    acrossServices: "Across all services"
                  },
                  revenue: {
                    title: "Revenue Management",
                    subtitle: "Track revenue share and billing across all PSPs",
                    totalMonthly: "Total Monthly Revenue",
                    allServices: "All services",
                    annualRunRate: "Annual Run Rate",
                    projected: "Projected",
                    activeCustomers: "Active Customers",
                    allPlatforms: "All platforms",
                    vsLastMonth: "vs last month",
                    revenueByService: "Revenue by Service Type",
                    topPSPCustomers: "Top PSP Customers"
                  },
                  systemHealth: {
                    title: "System Health Monitor",
                    subtitle: "Real-time platform status and metrics",
                    systemHealthy: "System healthy",
                    totalServices: "Total Services",
                    infrastructureStatus: "Infrastructure Status",
                    compute: "Compute",
                    database: "Database",
                    storage: "Storage",
                    healthy: "Healthy",
                    operational: "Operational",
                    online: "Online"
                  },
                  pspProvisioning: {
                    title: "PSP Instances",
                    subtitle: "Manage white-label PSP infrastructure",
                    provisionNew: "Provision New PSP",
                    searchPlaceholder: "Search by PSP name or code...",
                    allInstances: "All PSP Instances",
                    noPSPs: "No PSPs provisioned yet",
                    isoCompliant: "ISO Compliant"
                  }
                }, 
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
                subMenuItems: {
                    pspManagement: "PSP Management",
                    pspManagementDesc: "Manage all PSPs",
                    provisioningQueue: "Provisioning Queue",
                    provisioningQueueDesc: "Deploy & monitor",
                    pspAdministrators: "PSP Administrators",
                    pspAdministratorsDesc: "PSP staff",
                    resourceOrchestration: "Resource Orchestration",
                    resourceOrchestrationDesc: "Auto-scaling",
                    gatewayDashboard: "Gateway Dashboard",
                    gatewayDashboardDesc: "Crypto overview",
                    cryptoCustomers: "Crypto Customers",
                    cryptoCustomersDesc: "White-label clients",
                    cryptoTransactions: "Crypto Transactions",
                    cryptoTransactionsDesc: "Transaction monitor",
                    walletsIBANs: "Wallets & IBANs",
                    walletsIBANsDesc: "Wallet management",
                    complianceKYC: "Compliance/KYC",
                    complianceKYCDesc: "KYC management",
                    strigaSettings: "Striga Settings",
                    strigaSettingsDesc: "Integration config",
                    rwaDashboard: "RWA Dashboard",
                    rwaDashboardDesc: "RWA overview",
                    rwaProviders: "RWA Providers",
                    rwaProvidersDesc: "White-label customers",
                    assetIssuers: "Asset Issuers",
                    assetIssuersDesc: "Issuer management",
                    tokenizedAssets: "Tokenized Assets",
                    tokenizedAssetsDesc: "Asset catalog",
                    investors: "Investors",
                    investorsDesc: "Investor base",
                    rwaAnalytics: "RWA Analytics",
                    rwaAnalyticsDesc: "Performance metrics",
                    serviceCatalog: "Service Catalog",
                    serviceCatalogDesc: "All services",
                    paymentProviders: "Payment Providers",
                    paymentProvidersDesc: "Provider setup & pricing",
                    globalStandards: "Global Standards Registry",
                    globalStandardsDesc: "ISO, EMVCo, SWIFT",
                    isoGateway: "ISO Gateway",
                    isoGatewayDesc: "ISO customers",
                    isoConnections: "ISO Connections",
                    isoConnectionsDesc: "Translation routing",
                    isoTestConsole: "ISO Test Console",
                    isoTestConsoleDesc: "API testing",
                    isoMessageMonitor: "ISO Message Monitor",
                    isoMessageMonitorDesc: "Real-time logs",
                    orchestration: "Orchestration",
                    orchestrationDesc: "Routing customers",
                    payoutRoutes: "Payout Routes",
                    payoutRoutesDesc: "Payout methods",
                    serviceProviders: "Service Providers",
                    serviceProvidersDesc: "Vendors",
                    wholesaleMarketplace: "Wholesale Marketplace",
                    wholesaleMarketplaceDesc: "PSP-to-PSP",
                    platformAdmins: "Platform Admins",
                    platformAdminsDesc: "FTS administrators",
                    communityUsers: "Community Users",
                    communityUsersDesc: "Portal users",
                    isoGatewayUsers: "ISO Gateway Users",
                    isoGatewayUsersDesc: "ISO RBAC",
                    orchestrationUsers: "Orchestration Users",
                    orchestrationUsersDesc: "Orch RBAC",
                    cryptoBankingUsers: "Crypto Banking Users",
                    cryptoBankingUsersDesc: "Crypto RBAC",
                    rwaPlatformUsers: "RWA Platform Users",
                    rwaPlatformUsersDesc: "RWA RBAC",
                    rolePermissions: "Role & Permissions",
                    rolePermissionsDesc: "Edit matrix",
                    clientAccounts: "Client Accounts",
                    clientAccountsDesc: "Client management",
                    tenantManagement: "Tenant Management",
                    tenantManagementDesc: "Multi-tenancy",
                    serviceBilling: "Service Billing",
                    serviceBillingDesc: "ISO & Orchestration",
                    masterPricing: "Master Pricing",
                    masterPricingDesc: "All pricing control",
                    platformPricing: "Platform Pricing",
                    platformPricingDesc: "PSP tier pricing",
                    customReports: "Custom Reports",
                    customReportsDesc: "Report builder",
                    accounting: "Accounting",
                    accountingDesc: "Xero integration",
                    leiDashboard: "LEI/vLEI Dashboard",
                    leiDashboardDesc: "Credentials",
                    complianceTesting: "Compliance Testing",
                    complianceTestingDesc: "Validation",
                    platformAuditLogs: "Platform Audit Logs",
                    platformAuditLogsDesc: "Complete audit trail",
                    accessLogs: "Access Logs",
                    accessLogsDesc: "Access analytics",
                    policyManagement: "Policy Management",
                    policyManagementDesc: "Policies",
                    workflows: "Workflows",
                    workflowsDesc: "ISO processes",
                    dataRetention: "Data Retention",
                    dataRetentionDesc: "GDPR",
                    kongGatewaySetup: "Kong Gateway Setup",
                    kongGatewaySetupDesc: "Deploy API Gateway",
                    kongAPIKeys: "Kong API Keys",
                    kongAPIKeysDesc: "Multi-tenant API keys",
                    kongAPIIntegration: "Kong API Integration",
                    kongAPIIntegrationDesc: "External API docs",
                    domainManagement: "Domain Management",
                    domainManagementDesc: "SSL & DNS",
                    apiGatewayConfig: "API Gateway Config",
                    apiGatewayConfigDesc: "Gateway settings",
                    blockchain: "Blockchain",
                    blockchainDesc: "Blockchain integrations",
                    documentationHub: "Documentation Hub",
                    documentationHubDesc: "Complete platform docs",
                    architectureDocs: "Architecture Docs",
                    architectureDocsDesc: "System design",
                    platformConfig: "Platform Config",
                    platformConfigDesc: "System settings",
                    multilingualSystem: "Multilingual System",
                    multilingualSystemDesc: "i18n management",
                    productEcosystem: "Product Ecosystem",
                    productEcosystemDesc: "Products & models",
                    verticalSolutions: "Vertical Solutions",
                    verticalSolutionsDesc: "Industry offerings",
                    advancedTools: "Advanced Tools",
                    advancedToolsDesc: "Module testing",
                    leiPhase1Testing: "LEI Phase 1 Testing",
                    leiPhase1TestingDesc: "Test LEI integration"
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
                subMenuItems: {
                    pspManagement: "Gestion PSP",
                    pspManagementDesc: "Gérer tous les PSP",
                    provisioningQueue: "File de provisionnement",
                    provisioningQueueDesc: "Déployer et surveiller",
                    pspAdministrators: "Administrateurs PSP",
                    pspAdministratorsDesc: "Personnel PSP",
                    resourceOrchestration: "Orchestration de ressources",
                    resourceOrchestrationDesc: "Auto-scaling",
                    gatewayDashboard: "Tableau de bord passerelle",
                    gatewayDashboardDesc: "Aperçu crypto",
                    cryptoCustomers: "Clients crypto",
                    cryptoCustomersDesc: "Clients en marque blanche",
                    cryptoTransactions: "Transactions crypto",
                    cryptoTransactionsDesc: "Moniteur de transactions",
                    walletsIBANs: "Portefeuilles et IBAN",
                    walletsIBANsDesc: "Gestion de portefeuilles",
                    complianceKYC: "Conformité/KYC",
                    complianceKYCDesc: "Gestion KYC",
                    strigaSettings: "Paramètres Striga",
                    strigaSettingsDesc: "Configuration d'intégration",
                    rwaDashboard: "Tableau de bord RWA",
                    rwaDashboardDesc: "Aperçu RWA",
                    rwaProviders: "Fournisseurs RWA",
                    rwaProvidersDesc: "Clients en marque blanche",
                    assetIssuers: "Émetteurs d'actifs",
                    assetIssuersDesc: "Gestion des émetteurs",
                    tokenizedAssets: "Actifs tokenisés",
                    tokenizedAssetsDesc: "Catalogue d'actifs",
                    investors: "Investisseurs",
                    investorsDesc: "Base d'investisseurs",
                    rwaAnalytics: "Analytique RWA",
                    rwaAnalyticsDesc: "Métriques de performance"
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
                subMenuItems: {
                    pspManagement: "Gestión PSP",
                    pspManagementDesc: "Gestionar todos los PSP",
                    provisioningQueue: "Cola de aprovisionamiento",
                    provisioningQueueDesc: "Desplegar y monitorear",
                    pspAdministrators: "Administradores PSP",
                    pspAdministratorsDesc: "Personal PSP",
                    resourceOrchestration: "Orquestación de recursos",
                    resourceOrchestrationDesc: "Auto-escalado",
                    gatewayDashboard: "Panel de pasarela",
                    gatewayDashboardDesc: "Resumen cripto",
                    cryptoCustomers: "Clientes cripto",
                    cryptoCustomersDesc: "Clientes marca blanca",
                    cryptoTransactions: "Transacciones cripto",
                    cryptoTransactionsDesc: "Monitor de transacciones",
                    walletsIBANs: "Carteras e IBAN",
                    walletsIBANsDesc: "Gestión de carteras",
                    complianceKYC: "Cumplimiento/KYC",
                    complianceKYCDesc: "Gestión KYC",
                    strigaSettings: "Configuración Striga",
                    strigaSettingsDesc: "Configuración de integración",
                    rwaDashboard: "Panel RWA",
                    rwaDashboardDesc: "Resumen RWA",
                    rwaProviders: "Proveedores RWA",
                    rwaProvidersDesc: "Clientes marca blanca",
                    assetIssuers: "Emisores de activos",
                    assetIssuersDesc: "Gestión de emisores",
                    tokenizedAssets: "Activos tokenizados",
                    tokenizedAssetsDesc: "Catálogo de activos",
                    investors: "Inversores",
                    investorsDesc: "Base de inversores",
                    rwaAnalytics: "Analítica RWA",
                    rwaAnalyticsDesc: "Métricas de rendimiento"
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
                subMenuItems: {
                    pspManagement: "PSP-Verwaltung",
                    pspManagementDesc: "Alle PSPs verwalten",
                    provisioningQueue: "Bereitstellungswarteschlange",
                    provisioningQueueDesc: "Bereitstellen und überwachen",
                    pspAdministrators: "PSP-Administratoren",
                    pspAdministratorsDesc: "PSP-Personal",
                    resourceOrchestration: "Ressourcen-Orchestrierung",
                    resourceOrchestrationDesc: "Auto-Skalierung",
                    gatewayDashboard: "Gateway-Dashboard",
                    gatewayDashboardDesc: "Krypto-Übersicht",
                    cryptoCustomers: "Krypto-Kunden",
                    cryptoCustomersDesc: "White-Label-Kunden",
                    cryptoTransactions: "Krypto-Transaktionen",
                    cryptoTransactionsDesc: "Transaktionsmonitor",
                    walletsIBANs: "Wallets und IBANs",
                    walletsIBANsDesc: "Wallet-Verwaltung",
                    complianceKYC: "Compliance/KYC",
                    complianceKYCDesc: "KYC-Verwaltung",
                    strigaSettings: "Striga-Einstellungen",
                    strigaSettingsDesc: "Integrationskonfiguration",
                    rwaDashboard: "RWA-Dashboard",
                    rwaDashboardDesc: "RWA-Übersicht",
                    rwaProviders: "RWA-Anbieter",
                    rwaProvidersDesc: "White-Label-Kunden",
                    assetIssuers: "Asset-Emittenten",
                    assetIssuersDesc: "Emittenten-Verwaltung",
                    tokenizedAssets: "Tokenisierte Assets",
                    tokenizedAssetsDesc: "Asset-Katalog",
                    investors: "Investoren",
                    investorsDesc: "Investorenbasis",
                    rwaAnalytics: "RWA-Analytics",
                    rwaAnalyticsDesc: "Leistungsmetriken"
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
                pages: {
                  analytics: {
                    title: "平台分析",
                    subtitle: "全面的性能指标和洞察",
                    allServices: "所有服务",
                    volumeTrend: "交易量趋势",
                    platformVolume: "平台交易量（6个月）",
                    growth: "增长",
                    totalRevenue: "总收入",
                    totalEndUsers: "总终端用户",
                    acrossServices: "跨所有服务"
                  },
                  revenue: {
                    title: "收入管理",
                    subtitle: "跟踪所有PSP的收入分成和账单",
                    totalMonthly: "月总收入",
                    allServices: "所有服务",
                    annualRunRate: "年运行率",
                    projected: "预计",
                    activeCustomers: "活跃客户",
                    allPlatforms: "所有平台",
                    vsLastMonth: "与上月相比",
                    revenueByService: "按服务类型的收入",
                    topPSPCustomers: "顶级PSP客户"
                  },
                  systemHealth: {
                    title: "系统健康监控",
                    subtitle: "实时平台状态和指标",
                    systemHealthy: "系统健康",
                    totalServices: "总服务",
                    infrastructureStatus: "基础设施状态",
                    compute: "计算",
                    database: "数据库",
                    storage: "存储",
                    healthy: "健康",
                    operational: "正常运行",
                    online: "在线"
                  },
                  pspProvisioning: {
                    title: "PSP实例",
                    subtitle: "管理白标PSP基础设施",
                    provisionNew: "配置新PSP",
                    searchPlaceholder: "按PSP名称或代码搜索...",
                    allInstances: "所有PSP实例",
                    noPSPs: "尚未配置PSP",
                    isoCompliant: "ISO合规"
                  }
                },
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
                subMenuItems: {
                    pspManagement: "PSP管理",
                    pspManagementDesc: "管理所有PSP",
                    provisioningQueue: "配置队列",
                    provisioningQueueDesc: "部署和监控",
                    pspAdministrators: "PSP管理员",
                    pspAdministratorsDesc: "PSP员工",
                    resourceOrchestration: "资源编排",
                    resourceOrchestrationDesc: "自动扩展",
                    gatewayDashboard: "网关仪表板",
                    gatewayDashboardDesc: "加密概览",
                    cryptoCustomers: "加密客户",
                    cryptoCustomersDesc: "白标客户",
                    cryptoTransactions: "加密交易",
                    cryptoTransactionsDesc: "交易监控",
                    walletsIBANs: "钱包和IBAN",
                    walletsIBANsDesc: "钱包管理",
                    complianceKYC: "合规/KYC",
                    complianceKYCDesc: "KYC管理",
                    strigaSettings: "Striga设置",
                    strigaSettingsDesc: "集成配置",
                    rwaDashboard: "RWA仪表板",
                    rwaDashboardDesc: "RWA概览",
                    rwaProviders: "RWA提供商",
                    rwaProvidersDesc: "白标客户",
                    assetIssuers: "资产发行人",
                    assetIssuersDesc: "发行人管理",
                    tokenizedAssets: "代币化资产",
                    tokenizedAssetsDesc: "资产目录",
                    investors: "投资者",
                    investorsDesc: "投资者基础",
                    rwaAnalytics: "RWA分析",
                    rwaAnalyticsDesc: "性能指标"
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

    // Dynamically load external translations
    const loadExternalTranslations = async (lang, ns) => {
        try {
            const module = await import(`./translations/${ns}/${lang}`);
            return module.default || {};
        } catch {
            // Fallback to English
            try {
                const module = await import(`./translations/${ns}/en`);
                return module.default || {};
            } catch {
                return {};
            }
        }
    };

    // Load translations based on language
    useEffect(() => {
        const loadAllTranslations = async () => {
            setLoading(true);
            const loadedTranslations = {};
            const externalNamespaces = ['psp', 'merchant', 'crypto', 'iso', 'orchestration', 'rwa'];
            
            // Load embedded translations first
            namespaces.forEach(ns => {
                if (allTranslations[ns] && allTranslations[ns][language]) {
                    loadedTranslations[ns] = allTranslations[ns][language];
                } else if (allTranslations[ns] && allTranslations[ns]['en']) {
                    loadedTranslations[ns] = allTranslations[ns]['en'];
                } else {
                    loadedTranslations[ns] = {};
                }
            });

            // Load external portal translations
            for (const ns of externalNamespaces) {
                const externalTrans = await loadExternalTranslations(language, ns);
                if (Object.keys(externalTrans).length > 0) {
                    loadedTranslations[ns] = externalTrans;
                }
            }

            setTranslations(loadedTranslations);
            setLoading(false);
        };

        loadAllTranslations();
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