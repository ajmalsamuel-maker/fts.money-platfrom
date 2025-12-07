import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        // Common
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        transactions: 'Transactions',
        merchants: 'Merchants',
        settings: 'Settings',
        logout: 'Logout',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        view: 'View',
        refresh: 'Refresh',
        
        // Dashboard
        todaysVolume: "Today's Volume",
        totalTransactions: 'Total Transactions',
        successRate: 'Success Rate',
        activeMerchants: 'Active Merchants',
        monthlyRecurringRevenue: 'Monthly Recurring Revenue',
        activeSubscriptions: 'Active Subscriptions',
        aiDecisionsToday: 'AI Decisions Today',
        churnRate: 'Churn Rate',
        
        // Transactions
        transactionId: 'Transaction ID',
        date: 'Date',
        merchant: 'Merchant',
        customer: 'Customer',
        amount: 'Amount',
        status: 'Status',
        type: 'Type',
        
        // Statuses
        approved: 'Approved',
        declined: 'Declined',
        pending: 'Pending',
        active: 'Active',
        inactive: 'Inactive',
        
        // Menu Groups
        overview: 'Overview',
        onboarding: 'Onboarding',
        finance: 'Finance',
        risk: 'Risk',
        configuration: 'Configuration',
        resources: 'Resources',
    },
    es: {
        // Common
        dashboard: 'Panel',
        analytics: 'Análisis',
        transactions: 'Transacciones',
        merchants: 'Comerciantes',
        settings: 'Configuración',
        logout: 'Cerrar Sesión',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        save: 'Guardar',
        cancel: 'Cancelar',
        edit: 'Editar',
        delete: 'Eliminar',
        view: 'Ver',
        refresh: 'Actualizar',
        
        // Dashboard
        todaysVolume: 'Volumen de Hoy',
        totalTransactions: 'Transacciones Totales',
        successRate: 'Tasa de Éxito',
        activeMerchants: 'Comerciantes Activos',
        monthlyRecurringRevenue: 'Ingresos Recurrentes Mensuales',
        activeSubscriptions: 'Suscripciones Activas',
        aiDecisionsToday: 'Decisiones IA Hoy',
        churnRate: 'Tasa de Cancelación',
        
        // Transactions
        transactionId: 'ID de Transacción',
        date: 'Fecha',
        merchant: 'Comerciante',
        customer: 'Cliente',
        amount: 'Cantidad',
        status: 'Estado',
        type: 'Tipo',
        
        // Statuses
        approved: 'Aprobado',
        declined: 'Rechazado',
        pending: 'Pendiente',
        active: 'Activo',
        inactive: 'Inactivo',
        
        // Menu Groups
        overview: 'Resumen',
        onboarding: 'Incorporación',
        finance: 'Finanzas',
        risk: 'Riesgo',
        configuration: 'Configuración',
        resources: 'Recursos',
    },
    fr: {
        // Common
        dashboard: 'Tableau de Bord',
        analytics: 'Analyses',
        transactions: 'Transactions',
        merchants: 'Marchands',
        settings: 'Paramètres',
        logout: 'Déconnexion',
        search: 'Rechercher',
        filter: 'Filtrer',
        export: 'Exporter',
        save: 'Enregistrer',
        cancel: 'Annuler',
        edit: 'Modifier',
        delete: 'Supprimer',
        view: 'Voir',
        refresh: 'Actualiser',
        
        // Dashboard
        todaysVolume: "Volume d'Aujourd'hui",
        totalTransactions: 'Total des Transactions',
        successRate: 'Taux de Réussite',
        activeMerchants: 'Marchands Actifs',
        monthlyRecurringRevenue: 'Revenus Récurrents Mensuels',
        activeSubscriptions: 'Abonnements Actifs',
        aiDecisionsToday: "Décisions IA Aujourd'hui",
        churnRate: "Taux d'Attrition",
        
        // Transactions
        transactionId: 'ID Transaction',
        date: 'Date',
        merchant: 'Marchand',
        customer: 'Client',
        amount: 'Montant',
        status: 'Statut',
        type: 'Type',
        
        // Statuses
        approved: 'Approuvé',
        declined: 'Refusé',
        pending: 'En Attente',
        active: 'Actif',
        inactive: 'Inactif',
        
        // Menu Groups
        overview: 'Aperçu',
        onboarding: 'Intégration',
        finance: 'Finance',
        risk: 'Risque',
        configuration: 'Configuration',
        resources: 'Ressources',
    },
    zh: {
        // Common
        dashboard: '仪表板',
        analytics: '分析',
        transactions: '交易',
        merchants: '商户',
        settings: '设置',
        logout: '登出',
        search: '搜索',
        filter: '筛选',
        export: '导出',
        save: '保存',
        cancel: '取消',
        edit: '编辑',
        delete: '删除',
        view: '查看',
        refresh: '刷新',
        
        // Dashboard
        todaysVolume: '今日交易量',
        totalTransactions: '总交易数',
        successRate: '成功率',
        activeMerchants: '活跃商户',
        monthlyRecurringRevenue: '月度经常性收入',
        activeSubscriptions: '活跃订阅',
        aiDecisionsToday: '今日AI决策',
        churnRate: '流失率',
        
        // Transactions
        transactionId: '交易ID',
        date: '日期',
        merchant: '商户',
        customer: '客户',
        amount: '金额',
        status: '状态',
        type: '类型',
        
        // Statuses
        approved: '已批准',
        declined: '已拒绝',
        pending: '待处理',
        active: '活跃',
        inactive: '未活跃',
        
        // Menu Groups
        overview: '概览',
        onboarding: '入驻',
        finance: '财务',
        risk: '风险',
        configuration: '配置',
        resources: '资源',
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || translations.en[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within LanguageProvider');
    }
    return context;
}