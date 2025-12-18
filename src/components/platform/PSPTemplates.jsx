// Reusable PSP Configuration Templates - 4 Commercial Tiers
// Based on market research: White-label PSP pricing (2025)

export const PSP_TEMPLATES = {
    starter: {
        id: 'starter',
        name: 'Starter',
        description: 'Perfect for solo developers and MVPs',
        icon: 'Zap',
        badge: 'Free to start',
        pricing: {
            setup_fee: 0,
            monthly_hosting_fee: 0,
            overage_fee_per_merchant: 5,
            note: 'Pay as you grow - $5/merchant after 100'
        },
        config: {
            instance_name: '',
            psp_code: '',
            subscription_tier: 'free',
            branding: {
                company_name: '',
                primary_color: '#10b981',
                secondary_color: '#3b82f6',
                logo_url: ''
            },
            enabled_modules: [
                'core_dashboard',
                'core_transactions',
                'core_merchants',
                'core_system'
            ],
            features: {
                multi_currency: false,
                crypto_payments: false,
                instant_payouts: false,
                smart_routing: false,
                fraud_detection: false,
                compliance_tools: true,
                merchant_portal: false,
                white_label: false,
                api_access: true,
                webhooks: false,
                reporting: true,
                reconciliation: false
            },
            merchant_onboarding: {
                auto_approve: true,
                kyb_required: false,
                aml_screening: false,
                document_verification: false,
                risk_assessment: false
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
            },
            support_level: 'email',
            sla_uptime: 99.5
        }
    },
    growth: {
        id: 'growth',
        name: 'Growth',
        description: 'Scale your payment infrastructure',
        icon: 'TrendingUp',
        badge: 'Most Popular',
        pricing: {
            setup_fee: 999,
            monthly_hosting_fee: 299,
            note: 'Best value for growing businesses'
        },
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
                crypto_payments: false,
                instant_payouts: false,
                smart_routing: false,
                fraud_detection: true,
                compliance_tools: true,
                merchant_portal: false,
                white_label: false,
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
                monthly_fee: 299,
                setup_fee: 999
            },
            limits: {
                max_merchants: 500,
                max_transactions_per_month: 100000,
                max_transaction_amount: 50000,
                max_api_calls_per_minute: 500
            },
            integrations: {
                payment_gateways: ['stripe', 'adyen', 'checkout'],
                crypto_exchanges: [],
                banks: [],
                alternative_payment_methods: ['paypal', 'apple_pay', 'google_pay']
            },
            support_level: 'priority',
            sla_uptime: 99.9
        }
    },
    professional: {
        id: 'professional',
        name: 'Professional',
        description: 'Enterprise-grade features at mid-market pricing',
        icon: 'Building2',
        badge: 'Best Value',
        pricing: {
            setup_fee: 4999,
            monthly_hosting_fee: 999,
            note: 'Advanced features + Priority support'
        },
        config: {
            instance_name: '',
            psp_code: '',
            subscription_tier: 'professional',
            branding: {
                company_name: '',
                primary_color: '#8b5cf6',
                secondary_color: '#ec4899',
                logo_url: ''
            },
            enabled_modules: [
                'core_dashboard',
                'core_transactions',
                'core_merchants',
                'core_system',
                'payment_gateways',
                'alternative_payments',
                'crypto_payments',
                'smart_routing',
                'mid_routing',
                'fraud_prevention',
                'compliance_suite',
                'chargeback_management',
                'payout_management',
                'pricing_engine',
                'merchant_portal',
                'customer_management',
                'products_subscriptions',
                'virtual_terminal',
                'physical_terminals',
                'api_management',
                'merchant_onboarding_workflow'
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
                advanced_analytics: true
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
                transaction_fee_percentage: 2.5,
                transaction_fee_fixed: 0.25,
                monthly_fee: 999,
                setup_fee: 4999
            },
            limits: {
                max_merchants: 2500,
                max_transactions_per_month: 500000,
                max_transaction_amount: 250000,
                max_api_calls_per_minute: 2000
            },
            integrations: {
                payment_gateways: ['stripe', 'adyen', 'checkout', 'braintree'],
                crypto_exchanges: ['coinbase', 'binance'],
                banks: ['acquiring_bank_integration'],
                alternative_payment_methods: ['paypal', 'apple_pay', 'google_pay', 'klarna']
            },
            support_level: 'priority',
            sla_uptime: 99.95
        }
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Unlimited scale with dedicated support',
        icon: 'Building',
        badge: 'Custom',
        pricing: {
            setup_fee: 'Custom',
            monthly_hosting_fee: 'Starting at $5,000',
            note: 'White-glove onboarding + Dedicated account manager'
        },
        config: {
            instance_name: '',
            psp_code: '',
            subscription_tier: 'enterprise',
            branding: {
                company_name: '',
                primary_color: '#1e40af',
                secondary_color: '#0891b2',
                logo_url: ''
            },
            enabled_modules: [
                'core_dashboard',
                'core_transactions',
                'core_merchants',
                'core_system',
                'payment_gateways',
                'alternative_payments',
                'crypto_payments',
                'smart_routing',
                'mid_routing',
                'fraud_prevention',
                'compliance_suite',
                'chargeback_management',
                'payout_management',
                'payout_orchestration',
                'crypto_payouts',
                'pricing_engine',
                'usage_metering',
                'merchant_portal',
                'sub_merchants',
                'customer_management',
                'products_subscriptions',
                'virtual_terminal',
                'physical_terminals',
                'api_management',
                'advanced_features',
                'merchant_onboarding_workflow'
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
                advanced_analytics: true,
                dedicated_support: true
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
                monthly_fee: 5000,
                setup_fee: 15000
            },
            limits: {
                max_merchants: null,
                max_transactions_per_month: null,
                max_transaction_amount: null,
                max_api_calls_per_minute: 10000
            },
            integrations: {
                payment_gateways: ['stripe', 'adyen', 'checkout', 'braintree', 'worldpay'],
                crypto_exchanges: ['coinbase', 'binance', 'kraken', 'gemini'],
                banks: ['acquiring_bank_integration', 'multi_bank_connections'],
                alternative_payment_methods: ['paypal', 'apple_pay', 'google_pay', 'klarna', 'afterpay', 'alipay', 'wechat_pay']
            },
            support_level: 'dedicated',
            sla_uptime: 99.99
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