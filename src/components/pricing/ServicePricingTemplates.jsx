/**
 * Service-Specific Pricing Templates
 * Based on market research and competitor analysis
 */

export const SERVICE_PRICING_TEMPLATES = {
    psp_payment_processing: {
        service_name: "PSP Payment Processing",
        pricing_model: "merchant_based",
        parameters: [
            { key: "max_merchants", label: "Max Merchants", type: "number" },
            { key: "max_transactions_per_month", label: "Max Transactions/Month", type: "number" },
            { key: "transaction_fee_percentage", label: "Transaction Fee %", type: "percentage" },
            { key: "transaction_fee_fixed", label: "Fixed Fee per Transaction", type: "currency" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_hosting_fee", label: "Monthly Hosting", type: "currency" }
        ],
        tiers: {
            starter: {
                setup_fee: 2500,
                monthly_hosting_fee: 299,
                max_merchants: 10,
                max_transactions_per_month: 10000,
                transaction_fee_percentage: 0.5,
                transaction_fee_fixed: 0.10
            },
            growth: {
                setup_fee: 5000,
                monthly_hosting_fee: 999,
                max_merchants: 50,
                max_transactions_per_month: 100000,
                transaction_fee_percentage: 0.3,
                transaction_fee_fixed: 0.08
            },
            professional: {
                setup_fee: 12500,
                monthly_hosting_fee: 2499,
                max_merchants: 250,
                max_transactions_per_month: 500000,
                transaction_fee_percentage: 0.2,
                transaction_fee_fixed: 0.05
            },
            enterprise: {
                setup_fee: 25000,
                monthly_hosting_fee: 4999,
                max_merchants: -1,
                max_transactions_per_month: -1,
                transaction_fee_percentage: 0.15,
                transaction_fee_fixed: 0.03
            }
        }
    },

    iso_gateway: {
        service_name: "ISO Gateway (20022/8583)",
        pricing_model: "message_based",
        parameters: [
            { key: "messages_per_month", label: "Messages per Month", type: "number" },
            { key: "message_translation_fee", label: "Fee per Message Translation", type: "currency" },
            { key: "routing_fee", label: "Routing Fee per Message", type: "currency" },
            { key: "max_connections", label: "Max Bank/PSP Connections", type: "number" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_base_fee", label: "Monthly Base Fee", type: "currency" },
            { key: "included_messages", label: "Included Messages", type: "number" }
        ],
        tiers: {
            starter: {
                setup_fee: 10000,
                monthly_base_fee: 1499,
                included_messages: 50000,
                message_translation_fee: 0.02,
                routing_fee: 0.01,
                messages_per_month: 100000,
                max_connections: 5
            },
            growth: {
                setup_fee: 20000,
                monthly_base_fee: 3999,
                included_messages: 200000,
                message_translation_fee: 0.015,
                routing_fee: 0.008,
                messages_per_month: 500000,
                max_connections: 15
            },
            professional: {
                setup_fee: 40000,
                monthly_base_fee: 8999,
                included_messages: 1000000,
                message_translation_fee: 0.01,
                routing_fee: 0.005,
                messages_per_month: 2000000,
                max_connections: 50
            },
            enterprise: {
                setup_fee: 75000,
                monthly_base_fee: 19999,
                included_messages: 5000000,
                message_translation_fee: 0.005,
                routing_fee: 0.003,
                messages_per_month: -1,
                max_connections: -1
            }
        }
    },

    orchestration: {
        service_name: "Payment Orchestration",
        pricing_model: "transaction_volume",
        parameters: [
            { key: "transactions_per_month", label: "Transactions per Month", type: "number" },
            { key: "orchestration_fee_percentage", label: "Orchestration Fee %", type: "percentage" },
            { key: "max_payment_providers", label: "Max Payment Providers", type: "number" },
            { key: "max_routing_rules", label: "Max Routing Rules", type: "number" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_platform_fee", label: "Monthly Platform Fee", type: "currency" },
            { key: "smart_routing_enabled", label: "AI Smart Routing", type: "boolean" }
        ],
        tiers: {
            starter: {
                setup_fee: 5000,
                monthly_platform_fee: 999,
                transactions_per_month: 50000,
                orchestration_fee_percentage: 0.15,
                max_payment_providers: 3,
                max_routing_rules: 10,
                smart_routing_enabled: false
            },
            growth: {
                setup_fee: 12500,
                monthly_platform_fee: 2999,
                transactions_per_month: 250000,
                orchestration_fee_percentage: 0.10,
                max_payment_providers: 10,
                max_routing_rules: 50,
                smart_routing_enabled: true
            },
            professional: {
                setup_fee: 25000,
                monthly_platform_fee: 6999,
                transactions_per_month: 1000000,
                orchestration_fee_percentage: 0.07,
                max_payment_providers: 25,
                max_routing_rules: 200,
                smart_routing_enabled: true
            },
            enterprise: {
                setup_fee: 50000,
                monthly_platform_fee: 14999,
                transactions_per_month: -1,
                orchestration_fee_percentage: 0.05,
                max_payment_providers: -1,
                max_routing_rules: -1,
                smart_routing_enabled: true
            }
        }
    },

    crypto_vasp: {
        service_name: "Crypto Banking / VASP",
        pricing_model: "wallet_and_transaction",
        parameters: [
            { key: "max_wallets", label: "Max Wallets", type: "number" },
            { key: "wallet_creation_fee", label: "Wallet Creation Fee", type: "currency" },
            { key: "kyc_verification_fee", label: "KYC Verification Fee", type: "currency" },
            { key: "card_issuance_fee", label: "Card Issuance Fee", type: "currency" },
            { key: "transaction_fee_percentage", label: "Transaction Fee %", type: "percentage" },
            { key: "iban_issuance_fee", label: "IBAN Issuance Fee", type: "currency" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_compliance_fee", label: "Monthly Compliance Fee", type: "currency" },
            { key: "travel_rule_included", label: "Travel Rule Compliance", type: "boolean" }
        ],
        tiers: {
            starter: {
                setup_fee: 15000,
                monthly_compliance_fee: 1999,
                max_wallets: 1000,
                wallet_creation_fee: 2.50,
                kyc_verification_fee: 5.00,
                card_issuance_fee: 10.00,
                iban_issuance_fee: 15.00,
                transaction_fee_percentage: 0.5,
                travel_rule_included: false
            },
            growth: {
                setup_fee: 30000,
                monthly_compliance_fee: 4999,
                max_wallets: 10000,
                wallet_creation_fee: 1.50,
                kyc_verification_fee: 3.00,
                card_issuance_fee: 7.50,
                iban_issuance_fee: 10.00,
                transaction_fee_percentage: 0.35,
                travel_rule_included: true
            },
            professional: {
                setup_fee: 60000,
                monthly_compliance_fee: 9999,
                max_wallets: 50000,
                wallet_creation_fee: 0.75,
                kyc_verification_fee: 2.00,
                card_issuance_fee: 5.00,
                iban_issuance_fee: 7.50,
                transaction_fee_percentage: 0.25,
                travel_rule_included: true
            },
            enterprise: {
                setup_fee: 120000,
                monthly_compliance_fee: 19999,
                max_wallets: -1,
                wallet_creation_fee: 0.50,
                kyc_verification_fee: 1.50,
                card_issuance_fee: 3.00,
                iban_issuance_fee: 5.00,
                transaction_fee_percentage: 0.15,
                travel_rule_included: true
            }
        }
    },

    rwa_tokenization: {
        service_name: "RWA Tokenization Platform",
        pricing_model: "asset_based",
        parameters: [
            { key: "max_asset_issuers", label: "Max Asset Issuers", type: "number" },
            { key: "max_investors", label: "Max Investors", type: "number" },
            { key: "token_deployment_fee", label: "Token Deployment Fee", type: "currency" },
            { key: "custody_fee_percentage", label: "Custody Fee % (Annual)", type: "percentage" },
            { key: "compliance_verification_fee", label: "Compliance Check Fee", type: "currency" },
            { key: "dividend_distribution_fee", label: "Dividend Distribution Fee", type: "currency" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_platform_fee", label: "Monthly Platform Fee", type: "currency" },
            { key: "blockchain_networks", label: "Blockchain Networks", type: "array" }
        ],
        tiers: {
            starter: {
                setup_fee: 25000,
                monthly_platform_fee: 2999,
                max_asset_issuers: 5,
                max_investors: 500,
                token_deployment_fee: 2500,
                custody_fee_percentage: 0.50,
                compliance_verification_fee: 500,
                dividend_distribution_fee: 250,
                blockchain_networks: ["polygon"]
            },
            growth: {
                setup_fee: 50000,
                monthly_platform_fee: 6999,
                max_asset_issuers: 25,
                max_investors: 5000,
                token_deployment_fee: 1500,
                custody_fee_percentage: 0.35,
                compliance_verification_fee: 300,
                dividend_distribution_fee: 150,
                blockchain_networks: ["ethereum", "polygon", "avalanche"]
            },
            professional: {
                setup_fee: 100000,
                monthly_platform_fee: 14999,
                max_asset_issuers: 100,
                max_investors: 25000,
                token_deployment_fee: 1000,
                custody_fee_percentage: 0.25,
                compliance_verification_fee: 200,
                dividend_distribution_fee: 100,
                blockchain_networks: ["ethereum", "polygon", "base", "avalanche"]
            },
            enterprise: {
                setup_fee: 250000,
                monthly_platform_fee: 29999,
                max_asset_issuers: -1,
                max_investors: -1,
                token_deployment_fee: 500,
                custody_fee_percentage: 0.15,
                compliance_verification_fee: 100,
                dividend_distribution_fee: 50,
                blockchain_networks: ["all"]
            }
        }
    },

    tax_management: {
        service_name: "Tax Management & Calculation",
        pricing_model: "transaction_volume",
        parameters: [
            { key: "transactions_per_month", label: "Tax Calculations per Month", type: "number" },
            { key: "tax_calculation_fee", label: "Fee per Calculation", type: "currency" },
            { key: "jurisdictions_covered", label: "Jurisdictions Covered", type: "number" },
            { key: "auto_rate_updates", label: "Automatic Rate Updates", type: "boolean" },
            { key: "compliance_reporting", label: "Compliance Reporting", type: "boolean" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_subscription_fee", label: "Monthly Subscription", type: "currency" }
        ],
        tiers: {
            starter: {
                setup_fee: 1000,
                monthly_subscription_fee: 299,
                transactions_per_month: 10000,
                tax_calculation_fee: 0.01,
                jurisdictions_covered: 50,
                auto_rate_updates: true,
                compliance_reporting: false
            },
            growth: {
                setup_fee: 2500,
                monthly_subscription_fee: 899,
                transactions_per_month: 100000,
                tax_calculation_fee: 0.005,
                jurisdictions_covered: 150,
                auto_rate_updates: true,
                compliance_reporting: true
            },
            professional: {
                setup_fee: 5000,
                monthly_subscription_fee: 1999,
                transactions_per_month: 500000,
                tax_calculation_fee: 0.003,
                jurisdictions_covered: 200,
                auto_rate_updates: true,
                compliance_reporting: true
            },
            enterprise: {
                setup_fee: 10000,
                monthly_subscription_fee: 4999,
                transactions_per_month: -1,
                tax_calculation_fee: 0.001,
                jurisdictions_covered: -1,
                auto_rate_updates: true,
                compliance_reporting: true
            }
        }
    },

    einvoicing: {
        service_name: "E-Invoicing & Compliance",
        pricing_model: "invoice_volume",
        parameters: [
            { key: "invoices_per_month", label: "Invoices per Month", type: "number" },
            { key: "invoice_processing_fee", label: "Fee per Invoice", type: "currency" },
            { key: "peppol_access_point", label: "Peppol Access Point", type: "boolean" },
            { key: "countries_supported", label: "Countries Supported", type: "number" },
            { key: "mandate_compliance", label: "Mandate Compliance Monitoring", type: "boolean" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_subscription_fee", label: "Monthly Subscription", type: "currency" }
        ],
        tiers: {
            starter: {
                setup_fee: 500,
                monthly_subscription_fee: 199,
                invoices_per_month: 1000,
                invoice_processing_fee: 0.10,
                peppol_access_point: false,
                countries_supported: 10,
                mandate_compliance: false
            },
            growth: {
                setup_fee: 1500,
                monthly_subscription_fee: 599,
                invoices_per_month: 10000,
                invoice_processing_fee: 0.05,
                peppol_access_point: true,
                countries_supported: 50,
                mandate_compliance: true
            },
            professional: {
                setup_fee: 3000,
                monthly_subscription_fee: 1499,
                invoices_per_month: 50000,
                invoice_processing_fee: 0.03,
                peppol_access_point: true,
                countries_supported: 100,
                mandate_compliance: true
            },
            enterprise: {
                setup_fee: 7500,
                monthly_subscription_fee: 3999,
                invoices_per_month: -1,
                invoice_processing_fee: 0.01,
                peppol_access_point: true,
                countries_supported: -1,
                mandate_compliance: true
            }
        }
    },

    pci_compliance: {
        service_name: "PCI DSS Compliance",
        pricing_model: "entity_based",
        parameters: [
            { key: "entities_covered", label: "Entities/Merchants Covered", type: "number" },
            { key: "continuous_monitoring", label: "Continuous Monitoring", type: "boolean" },
            { key: "predictive_analytics", label: "Predictive Analytics", type: "boolean" },
            { key: "qsa_access", label: "QSA Portal Access", type: "boolean" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_compliance_fee", label: "Monthly Compliance Fee", type: "currency" }
        ],
        tiers: {
            starter: {
                setup_fee: 2000,
                monthly_compliance_fee: 499,
                entities_covered: 5,
                continuous_monitoring: false,
                predictive_analytics: false,
                qsa_access: false
            },
            growth: {
                setup_fee: 5000,
                monthly_compliance_fee: 1299,
                entities_covered: 25,
                continuous_monitoring: true,
                predictive_analytics: false,
                qsa_access: true
            },
            professional: {
                setup_fee: 10000,
                monthly_compliance_fee: 2999,
                entities_covered: 100,
                continuous_monitoring: true,
                predictive_analytics: true,
                qsa_access: true
            },
            enterprise: {
                setup_fee: 25000,
                monthly_compliance_fee: 6999,
                entities_covered: -1,
                continuous_monitoring: true,
                predictive_analytics: true,
                qsa_access: true
            }
        }
    },

    lei_compliance: {
        service_name: "LEI Compliance & Identity",
        pricing_model: "entity_based",
        parameters: [
            { key: "lei_verifications_per_month", label: "LEI Verifications per Month", type: "number" },
            { key: "vlei_credential_issuance", label: "vLEI Credential Issuance", type: "boolean" },
            { key: "verification_fee", label: "Fee per Verification", type: "currency" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_subscription_fee", label: "Monthly Subscription", type: "currency" }
        ],
        tiers: {
            starter: {
                setup_fee: 1000,
                monthly_subscription_fee: 299,
                lei_verifications_per_month: 100,
                vlei_credential_issuance: false,
                verification_fee: 2.50
            },
            growth: {
                setup_fee: 2500,
                monthly_subscription_fee: 799,
                lei_verifications_per_month: 500,
                vlei_credential_issuance: true,
                verification_fee: 1.50
            },
            professional: {
                setup_fee: 5000,
                monthly_subscription_fee: 1499,
                lei_verifications_per_month: 2500,
                vlei_credential_issuance: true,
                verification_fee: 1.00
            },
            enterprise: {
                setup_fee: 10000,
                monthly_subscription_fee: 2999,
                lei_verifications_per_month: -1,
                vlei_credential_issuance: true,
                verification_fee: 0.50
            }
        }
    },

    digital_identity: {
        service_name: "Digital Identity & Credentials",
        pricing_model: "credential_based",
        parameters: [
            { key: "credentials_per_month", label: "Credentials per Month", type: "number" },
            { key: "credential_issuance_fee", label: "Fee per Credential", type: "currency" },
            { key: "verification_fee", label: "Fee per Verification", type: "currency" },
            { key: "w3c_did_support", label: "W3C DID Support", type: "boolean" },
            { key: "setup_fee", label: "Setup Fee", type: "currency" },
            { key: "monthly_subscription_fee", label: "Monthly Subscription", type: "currency" }
        ],
        tiers: {
            starter: {
                setup_fee: 1500,
                monthly_subscription_fee: 399,
                credentials_per_month: 500,
                credential_issuance_fee: 0.50,
                verification_fee: 0.10,
                w3c_did_support: true
            },
            growth: {
                setup_fee: 3000,
                monthly_subscription_fee: 999,
                credentials_per_month: 5000,
                credential_issuance_fee: 0.25,
                verification_fee: 0.05,
                w3c_did_support: true
            },
            professional: {
                setup_fee: 6000,
                monthly_subscription_fee: 2499,
                credentials_per_month: 25000,
                credential_issuance_fee: 0.15,
                verification_fee: 0.03,
                w3c_did_support: true
            },
            enterprise: {
                setup_fee: 12000,
                monthly_subscription_fee: 5999,
                credentials_per_month: -1,
                credential_issuance_fee: 0.10,
                verification_fee: 0.01,
                w3c_did_support: true
            }
        }
    }
};

export function getServicePricingTemplate(serviceType) {
    return SERVICE_PRICING_TEMPLATES[serviceType] || null;
}

export function getServiceParameters(serviceType) {
    const template = SERVICE_PRICING_TEMPLATES[serviceType];
    return template ? template.parameters : [];
}

export function getServiceTierDefaults(serviceType, tierName) {
    const template = SERVICE_PRICING_TEMPLATES[serviceType];
    return template?.tiers?.[tierName] || null;
}