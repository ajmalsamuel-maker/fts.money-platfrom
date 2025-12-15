import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

// Comprehensive NetXHub service catalog
const NETXHUB_SERVICES = [
    // Payment Processing Core
    {
        service_id: 'card_processing',
        service_name: 'Card Payment Processing',
        service_category: 'payment_rail',
        description: 'Accept all major card brands (Visa, Mastercard, Amex, etc.)',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.029,
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'crypto_processing',
        service_name: 'Cryptocurrency Processing',
        service_category: 'payment_rail',
        description: 'Accept Bitcoin, Ethereum, USDT, USDC, and other cryptocurrencies',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.01,
        base_price: 0,
        tier_requirement: 'professional'
    },
    {
        service_id: 'apm_processing',
        service_name: 'Alternative Payment Methods',
        service_category: 'payment_rail',
        description: 'PayPal, Apple Pay, Google Pay, Alipay, WeChat Pay, and more',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.035,
        base_price: 0,
        tier_requirement: 'professional'
    },
    {
        service_id: 'bank_transfer',
        service_name: 'Bank Transfer Processing',
        service_category: 'payment_rail',
        description: 'ACH, SEPA, SWIFT, and instant bank transfers',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.008,
        base_price: 0,
        tier_requirement: 'starter'
    },

    // Smart Orchestration
    {
        service_id: 'smart_routing',
        service_name: 'AI Smart Routing',
        service_category: 'orchestration',
        description: 'ML-powered payment routing for optimal success rates',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.005,
        base_price: 99,
        tier_requirement: 'professional'
    },
    {
        service_id: 'load_balancing',
        service_name: 'Load Balancing',
        service_category: 'orchestration',
        description: 'Distribute transactions across multiple providers',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.002,
        base_price: 49,
        tier_requirement: 'professional'
    },
    {
        service_id: 'failover_routing',
        service_name: 'Automatic Failover',
        service_category: 'orchestration',
        description: 'Automatic fallback to backup providers',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.001,
        base_price: 29,
        tier_requirement: 'starter'
    },
    {
        service_id: 'cascading',
        service_name: 'Cascading Logic',
        service_category: 'orchestration',
        description: 'Retry failed transactions through alternative routes',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.003,
        base_price: 39,
        tier_requirement: 'professional'
    },

    // Fraud & Risk Management
    {
        service_id: 'fraud_detection',
        service_name: 'AI Fraud Detection',
        service_category: 'fraud_detection',
        description: 'Real-time ML-based fraud screening',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.01,
        base_price: 199,
        tier_requirement: 'professional'
    },
    {
        service_id: '3ds_authentication',
        service_name: '3D Secure 2.0',
        service_category: 'fraud_detection',
        description: 'Strong customer authentication for online payments',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.005,
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'velocity_checks',
        service_name: 'Velocity Checks',
        service_category: 'fraud_detection',
        description: 'Monitor transaction frequency and patterns',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.002,
        base_price: 49,
        tier_requirement: 'starter'
    },
    {
        service_id: 'device_fingerprinting',
        service_name: 'Device Fingerprinting',
        service_category: 'fraud_detection',
        description: 'Identify and track devices for fraud prevention',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.003,
        base_price: 79,
        tier_requirement: 'professional'
    },
    {
        service_id: 'geo_blocking',
        service_name: 'Geo-Blocking',
        service_category: 'fraud_detection',
        description: 'Block transactions from high-risk countries',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 29,
        tier_requirement: 'starter'
    },

    // Compliance & Verification
    {
        service_id: 'kyb_verification',
        service_name: 'KYB Verification',
        service_category: 'compliance',
        description: 'Know Your Business verification for merchant onboarding',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 5.00,
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'aml_screening',
        service_name: 'AML/CFT Screening',
        service_category: 'compliance',
        description: 'Anti-money laundering and sanctions screening',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 2.50,
        base_price: 99,
        tier_requirement: 'professional'
    },
    {
        service_id: 'lei_issuance',
        service_name: 'LEI Verification & Issuance',
        service_category: 'compliance',
        description: 'Legal Entity Identifier verification and registration',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 75.00,
        base_price: 0,
        tier_requirement: 'enterprise'
    },
    {
        service_id: 'pci_compliance',
        service_name: 'PCI DSS Compliance',
        service_category: 'compliance',
        description: 'PCI Level 1 compliance infrastructure',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 499,
        tier_requirement: 'starter'
    },
    {
        service_id: 'gdpr_compliance',
        service_name: 'GDPR Data Protection',
        service_category: 'compliance',
        description: 'GDPR-compliant data handling and privacy',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 199,
        tier_requirement: 'starter'
    },

    // Tokenization & Security
    {
        service_id: 'network_tokenization',
        service_name: 'Network Tokenization',
        service_category: 'developer_tools',
        description: 'Visa, Mastercard, and Amex network tokens',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.01,
        base_price: 149,
        tier_requirement: 'professional'
    },
    {
        service_id: 'vault_tokenization',
        service_name: 'Card Vault & Tokenization',
        service_category: 'developer_tools',
        description: 'Secure card storage and PCI-compliant tokenization',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 99,
        tier_requirement: 'starter'
    },
    {
        service_id: 'encryption_hsm',
        service_name: 'HSM Encryption',
        service_category: 'developer_tools',
        description: 'Hardware security module encryption',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 299,
        tier_requirement: 'enterprise'
    },

    // Account Optimization
    {
        service_id: 'account_updater',
        service_name: 'Account Updater',
        service_category: 'payment_rail',
        description: 'Automatic card credential updates',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.15,
        base_price: 49,
        tier_requirement: 'professional'
    },
    {
        service_id: 'smart_retry',
        service_name: 'Smart Retry Logic',
        service_category: 'orchestration',
        description: 'AI-optimized retry timing for failed transactions',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.02,
        base_price: 79,
        tier_requirement: 'professional'
    },

    // Payout Services
    {
        service_id: 'fiat_payouts',
        service_name: 'Fiat Payouts',
        service_category: 'payout',
        description: 'Bank transfers, cards, and instant payouts',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.5,
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'crypto_payouts',
        service_name: 'Crypto Payouts',
        service_category: 'payout',
        description: 'Cryptocurrency disbursements',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.1,
        base_price: 0,
        tier_requirement: 'professional'
    },
    {
        service_id: 'instant_payouts',
        service_name: 'Instant Payouts',
        service_category: 'payout',
        description: 'Real-time money movement',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 1.0,
        base_price: 199,
        tier_requirement: 'professional'
    },
    {
        service_id: 'split_payments',
        service_name: 'Split Payments',
        service_category: 'payout',
        description: 'Marketplace and platform payment splitting',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.02,
        base_price: 99,
        tier_requirement: 'professional'
    },

    // Analytics & Reporting
    {
        service_id: 'real_time_analytics',
        service_name: 'Real-Time Analytics',
        service_category: 'analytics',
        description: 'Live transaction monitoring and dashboards',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 149,
        tier_requirement: 'professional'
    },
    {
        service_id: 'custom_reports',
        service_name: 'Custom Reports',
        service_category: 'analytics',
        description: 'Configurable reporting and data exports',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 99,
        tier_requirement: 'professional'
    },
    {
        service_id: 'reconciliation',
        service_name: 'Automated Reconciliation',
        service_category: 'analytics',
        description: 'Automatic settlement reconciliation',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 199,
        tier_requirement: 'professional'
    },

    // Merchant Tools
    {
        service_id: 'merchant_portal',
        service_name: 'Merchant Portal',
        service_category: 'developer_tools',
        description: 'White-label merchant dashboard',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'virtual_terminal',
        service_name: 'Virtual Terminal',
        service_category: 'developer_tools',
        description: 'Browser-based payment terminal',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 29,
        tier_requirement: 'starter'
    },
    {
        service_id: 'payment_links',
        service_name: 'Payment Links',
        service_category: 'developer_tools',
        description: 'Generate shareable payment links',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'invoicing',
        service_name: 'Invoicing System',
        service_category: 'developer_tools',
        description: 'Create and manage invoices',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 49,
        tier_requirement: 'starter'
    },
    {
        service_id: 'subscriptions',
        service_name: 'Subscription Management',
        service_category: 'developer_tools',
        description: 'Recurring billing and subscription handling',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.015,
        base_price: 99,
        tier_requirement: 'professional'
    },

    // Developer Tools
    {
        service_id: 'rest_api',
        service_name: 'REST API',
        service_category: 'developer_tools',
        description: 'Full-featured payment API',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'webhooks',
        service_name: 'Webhooks',
        service_category: 'developer_tools',
        description: 'Real-time event notifications',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'checkout_components',
        service_name: 'Checkout Components',
        service_category: 'developer_tools',
        description: 'Embeddable payment forms and UI components',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 0,
        tier_requirement: 'starter'
    },
    {
        service_id: 'sandbox_testing',
        service_name: 'Sandbox Environment',
        service_category: 'developer_tools',
        description: 'Testing environment with mock transactions',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 0,
        tier_requirement: 'starter'
    },

    // Advanced Features
    {
        service_id: 'multi_currency',
        service_name: 'Multi-Currency Support',
        service_category: 'payment_rail',
        description: 'Process payments in 150+ currencies',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.005,
        base_price: 99,
        tier_requirement: 'professional'
    },
    {
        service_id: 'dynamic_currency',
        service_name: 'Dynamic Currency Conversion',
        service_category: 'payment_rail',
        description: 'Real-time currency conversion at checkout',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.02,
        base_price: 149,
        tier_requirement: 'professional'
    },
    {
        service_id: 'dispute_management',
        service_name: 'Dispute Management',
        service_category: 'analytics',
        description: 'Chargeback handling and dispute resolution',
        is_fts_owned: true,
        pricing_model: 'fixed',
        base_price: 149,
        tier_requirement: 'professional'
    },
    {
        service_id: 'risk_scoring',
        service_name: 'Transaction Risk Scoring',
        service_category: 'fraud_detection',
        description: 'ML-based risk assessment for each transaction',
        is_fts_owned: true,
        pricing_model: 'per_transaction',
        variable_price: 0.005,
        base_price: 99,
        tier_requirement: 'professional'
    }
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin access
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action } = await req.json();

        if (action === 'seed') {
            // Delete existing services first
            const existing = await base44.asServiceRole.entities.ServiceCatalog.list();
            for (const service of existing) {
                await base44.asServiceRole.entities.ServiceCatalog.delete(service.id);
            }

            // Create all NetXHub services
            for (const service of NETXHUB_SERVICES) {
                await base44.asServiceRole.entities.ServiceCatalog.create({
                    ...service,
                    provider_id: 'fts_money',
                    provider_name: 'FTS.Money',
                    status: 'active',
                    trial_available: true,
                    trial_duration_days: 30,
                    features: [],
                    tags: [service.service_category, service.tier_requirement]
                });
            }

            return Response.json({ 
                success: true, 
                message: `Seeded ${NETXHUB_SERVICES.length} services`,
                count: NETXHUB_SERVICES.length
            });
        }

        if (action === 'list') {
            return Response.json({ 
                success: true, 
                services: NETXHUB_SERVICES 
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Seed error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});