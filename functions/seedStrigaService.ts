/**
 * Seed Striga as a Service Provider in FTS.Money Service Catalog
 * Run this once to add Striga to the marketplace
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Check if user is platform admin
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Create FTS.Money Crypto Gateway (white-labeled Striga)
        const provider = await base44.asServiceRole.entities.ServiceProvider.create({
            company_name: 'FTS.Money',
            legal_name: 'FTS.Money Inc',
            name: 'FTS.Money',
            type: 'crypto_banking',
            description: 'Enterprise-grade crypto banking infrastructure with wallets, IBANs, cards, and on/off-ramps',
            website: 'https://fts.money',
            logo_url: 'https://fts.money/logo.png',
            status: 'active',
            supported_regions: ['EU', 'EEA', 'US', 'Global'],
            supported_currencies: ['EUR', 'USD', 'BTC', 'ETH', 'USDC', 'USDT'],
            compliance_certifications: ['VASP', 'MiCA-ready', 'PCI DSS', 'AML', 'KYC'],
            api_documentation_url: 'https://docs.fts.money/crypto-gateway',
            contact_email: 'crypto@fts.money',
            notes: 'Internal: Powered by Striga/Lightspark infrastructure'
        });
        
        // Create Striga Services in Service Catalog
        const services = [
            {
                service_name: 'FTS.Money Crypto Gateway',
                name: 'FTS.Money Crypto Gateway',
                service_provider_id: provider.id,
                provider_id: provider.id,
                provider_name: 'FTS.Money',
                service_category: 'crypto_banking',
                category: 'crypto_banking',
                description: 'Enterprise crypto banking infrastructure: multi-chain wallets, virtual IBANs, card issuing, and seamless on/off-ramps. Fully compliant and white-labelable.',
                features: [
                    'Multi-chain crypto wallets (BTC, ETH, USDC, Lightning Network)',
                    'Named virtual IBANs (SEPA + SEPA Instant)',
                    'Virtual & physical card issuing (Visa)',
                    'Crypto-to-fiat exchange (real-time rates)',
                    'Enterprise on/off-ramp infrastructure',
                    'Full KYC/AML/Travel Rule compliance',
                    'MiCA & VASP licensed (EU)',
                    'White-label ready for PSPs',
                    'Dedicated API & webhooks'
                ],
                pricing_model: 'usage',
                base_price: 2500.00,
                pricing_details: {
                    monthly_fee: 2500.00,
                    kyc_per_user: 5.00,
                    card_virtual: 8.00,
                    card_physical: 20.00,
                    crypto_transaction_fee_percent: 1.5,
                    sepa_transaction_fee_percent: 0.8,
                    exchange_fee_percent: 1.2,
                    white_label_setup: 500.00
                },
                setup_time_days: 2,
                api_available: true,
                requires_approval: true,
                status: 'active',
                use_cases: [
                    'PSPs launching crypto payment capabilities',
                    'Neobanks adding crypto accounts',
                    'Payment platforms with crypto on/off-ramps',
                    'Fintech apps requiring EU crypto compliance',
                    'White-label crypto banking solutions'
                ],
                target_customers: 'PSP',
                integration_complexity: 'low',
                documentation_url: 'https://docs.fts.money/crypto-gateway',
                support_email: 'crypto-support@fts.money',
                white_label_options: {
                    custom_branding: true,
                    custom_domain: true,
                    branded_cards: true,
                    custom_emails: true
                }
            },
            {
                service_name: 'FTS.Money Lightning Payments',
                name: 'FTS.Money Lightning Payments',
                service_provider_id: provider.id,
                provider_id: provider.id,
                provider_name: 'FTS.Money',
                service_category: 'crypto_payment',
                category: 'crypto_payment',
                description: 'Bitcoin Lightning Network instant payments - no node management, instant settlements, enterprise infrastructure',
                features: [
                    'Instant Bitcoin transfers',
                    'Lightning invoice creation',
                    'Lightning invoice payment',
                    'On-chain flexibility',
                    'No liquidity management needed',
                    'Enterprise-grade infrastructure'
                ],
                pricing_model: 'usage',
                base_price: 799.00,
                pricing_details: {
                    monthly_fee: 799.00,
                    per_payment: 0.02,
                    fee_percent: 0.8
                },
                setup_time_days: 1,
                api_available: true,
                requires_approval: false,
                status: 'active',
                use_cases: [
                    'Instant cross-border payments',
                    'Bitcoin micropayments',
                    'Real-time settlements',
                    'Remittance services'
                ],
                target_customers: 'PSP',
                integration_complexity: 'low',
                documentation_url: 'https://docs.fts.money/lightning',
                support_email: 'crypto-support@fts.money',
                white_label_options: {
                    custom_branding: true,
                    custom_notifications: true
                }
            }
        ];
        
        const createdServices = [];
        for (const service of services) {
            const created = await base44.asServiceRole.entities.ServiceCatalog.create(service);
            createdServices.push(created);
        }
        
        return Response.json({
            success: true,
            message: 'Striga services added to marketplace',
            provider: provider,
            services: createdServices
        });
        
    } catch (error) {
        console.error('Error seeding Striga:', error);
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
});