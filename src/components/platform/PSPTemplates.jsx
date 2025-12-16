// Reusable PSP Configuration Templates based on NetXHub architecture

export const PSP_TEMPLATES = {
    netxhub_standard: {
        id: 'netxhub_standard',
        name: 'NetXHub Standard',
        description: 'Complete payment platform with all features (recommended)',
        icon: 'Building2',
        config: {
            instance_name: '',
            psp_code: '',
            branding: {
                company_name: '',
                primary_color: '#3b82f6',
                secondary_color: '#06b6d4',
                logo_url: ''
            },
            enabled_modules: [
                'transactions',
                'merchants',
                'payouts',
                'analytics',
                'fraud_prevention',
                'compliance',
                'api_gateway',
                'terminals',
                'crypto',
                'orchestration',
                'webhooks',
                'reconciliation',
                'invoicing',
                'subscriptions'
            ],
            features: {
                multi_currency: true,
                crypto_payments: true,
                instant_payouts: true,
                smart_routing: true,
                fraud_detection: true,
                compliance_tools: true,
                merchant_portal: true,
                white_label: true,
                api_access: true,
                webhooks: true,
                reporting: true,
                reconciliation: true
            },
            merchant_onboarding: {
                auto_approve: false,
                kyb_required: true,
                aml_screening: true,
                document_verification: true,
                risk_assessment: true
            },
            pricing_model: {
                type: 'hybrid',
                transaction_fee_percentage: 2.9,
                transaction_fee_fixed: 0.30,
                monthly_fee: 0,
                setup_fee: 0
            },
            limits: {
                max_merchants: 1000,
                max_transactions_per_month: 100000,
                max_transaction_amount: 100000,
                max_api_calls_per_minute: 1000
            },
            integrations: {
                payment_gateways: ['stripe', 'adyen', 'checkout'],
                crypto_exchanges: ['coinbase', 'binance'],
                banks: [],
                alternative_payment_methods: []
            }
        }
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise Platform',
        description: 'High-volume platform with advanced features',
        icon: 'Building',
        config: {
            instance_name: '',
            psp_code: '',
            branding: {
                company_name: '',
                primary_color: '#1e40af',
                secondary_color: '#0891b2',
                logo_url: ''
            },
            enabled_modules: [
                'transactions',
                'merchants',
                'payouts',
                'analytics',
                'fraud_prevention',
                'compliance',
                'api_gateway',
                'terminals',
                'crypto',
                'orchestration',
                'webhooks',
                'reconciliation',
                'invoicing',
                'subscriptions',
                'risk_management',
                'custom_reporting'
            ],
            features: {
                multi_currency: true,
                crypto_payments: true,
                instant_payouts: true,
                smart_routing: true,
                fraud_detection: true,
                compliance_tools: true,
                merchant_portal: true,
                white_label: true,
                api_access: true,
                webhooks: true,
                reporting: true,
                reconciliation: true,
                custom_workflows: true,
                advanced_analytics: true
            },
            merchant_onboarding: {
                auto_approve: false,
                kyb_required: true,
                aml_screening: true,
                document_verification: true,
                risk_assessment: true,
                custom_workflows: true
            },
            pricing_model: {
                type: 'custom',
                transaction_fee_percentage: 0,
                transaction_fee_fixed: 0,
                monthly_fee: 0,
                setup_fee: 0
            },
            limits: {
                max_merchants: 10000,
                max_transactions_per_month: 10000000,
                max_transaction_amount: 1000000,
                max_api_calls_per_minute: 10000
            },
            integrations: {
                payment_gateways: ['stripe', 'adyen', 'checkout', 'braintree'],
                crypto_exchanges: ['coinbase', 'binance', 'kraken'],
                banks: [],
                alternative_payment_methods: []
            }
        }
    },
    startup: {
        id: 'startup',
        name: 'Startup Edition',
        description: 'Essential features for growing businesses',
        icon: 'Zap',
        config: {
            instance_name: '',
            psp_code: '',
            branding: {
                company_name: '',
                primary_color: '#8b5cf6',
                secondary_color: '#ec4899',
                logo_url: ''
            },
            enabled_modules: [
                'transactions',
                'merchants',
                'payouts',
                'analytics',
                'api_gateway',
                'webhooks'
            ],
            features: {
                multi_currency: true,
                crypto_payments: false,
                instant_payouts: false,
                smart_routing: false,
                fraud_detection: true,
                compliance_tools: true,
                merchant_portal: true,
                white_label: false,
                api_access: true,
                webhooks: true,
                reporting: true,
                reconciliation: false
            },
            merchant_onboarding: {
                auto_approve: true,
                kyb_required: false,
                aml_screening: false,
                document_verification: false,
                risk_assessment: true
            },
            pricing_model: {
                type: 'percentage',
                transaction_fee_percentage: 3.5,
                transaction_fee_fixed: 0.50,
                monthly_fee: 0,
                setup_fee: 0
            },
            limits: {
                max_merchants: 100,
                max_transactions_per_month: 10000,
                max_transaction_amount: 10000,
                max_api_calls_per_minute: 100
            },
            integrations: {
                payment_gateways: ['stripe'],
                crypto_exchanges: [],
                banks: [],
                alternative_payment_methods: []
            }
        }
    },
    crypto_focused: {
        id: 'crypto_focused',
        name: 'Crypto-First Platform',
        description: 'Optimized for cryptocurrency payments',
        icon: 'Coins',
        config: {
            instance_name: '',
            psp_code: '',
            branding: {
                company_name: '',
                primary_color: '#f59e0b',
                secondary_color: '#10b981',
                logo_url: ''
            },
            enabled_modules: [
                'transactions',
                'merchants',
                'payouts',
                'analytics',
                'crypto',
                'api_gateway',
                'webhooks',
                'compliance'
            ],
            features: {
                multi_currency: true,
                crypto_payments: true,
                instant_payouts: true,
                smart_routing: false,
                fraud_detection: true,
                compliance_tools: true,
                merchant_portal: true,
                white_label: true,
                api_access: true,
                webhooks: true,
                reporting: true,
                reconciliation: true
            },
            merchant_onboarding: {
                auto_approve: false,
                kyb_required: true,
                aml_screening: true,
                document_verification: true,
                risk_assessment: true
            },
            pricing_model: {
                type: 'percentage',
                transaction_fee_percentage: 1.5,
                transaction_fee_fixed: 0,
                monthly_fee: 0,
                setup_fee: 0
            },
            limits: {
                max_merchants: 500,
                max_transactions_per_month: 50000,
                max_transaction_amount: 500000,
                max_api_calls_per_minute: 500
            },
            integrations: {
                payment_gateways: [],
                crypto_exchanges: ['coinbase', 'binance', 'kraken', 'gemini'],
                banks: [],
                alternative_payment_methods: []
            }
        }
    }
};

export function getPSPTemplate(templateId) {
    return PSP_TEMPLATES[templateId];
}

export function applyTemplate(template, customData) {
    return {
        ...template.config,
        instance_name: customData.instance_name,
        psp_code: customData.psp_code,
        branding: {
            ...template.config.branding,
            ...customData.branding
        }
    };
}