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
        
        // Create Striga as a Service Provider
        const provider = await base44.asServiceRole.entities.ServiceProvider.create({
            name: 'Striga (Lightspark)',
            type: 'crypto_banking',
            description: 'EU-compliant crypto banking infrastructure with wallets, IBANs, cards, and on/off-ramps',
            website: 'https://striga.com',
            logo_url: 'https://striga.com/logo.png',
            status: 'active',
            supported_regions: ['EU', 'EEA'],
            supported_currencies: ['EUR', 'BTC', 'ETH', 'USDC', 'USDT'],
            compliance_certifications: ['VASP', 'MiCA-ready', 'AML', 'KYC'],
            api_documentation_url: 'https://docs.striga.com',
            contact_email: 'partnerships@striga.com'
        });
        
        // Create Striga Services in Service Catalog
        const services = [
            {
                name: 'Striga Crypto Banking Platform',
                service_provider_id: provider.id,
                provider_name: 'Striga (Lightspark)',
                category: 'crypto_banking',
                description: 'Complete crypto banking infrastructure: wallets, virtual IBANs, card issuing, and on/off-ramps',
                features: [
                    'Multi-chain crypto wallets (BTC, ETH, USDC, Lightning)',
                    'Named virtual IBANs (SEPA)',
                    'Virtual & physical card issuing',
                    'Crypto-to-fiat exchange',
                    'On/off-ramp infrastructure',
                    'KYC/AML compliance built-in',
                    'MiCA & VASP licensed',
                    'Travel Rule compliant'
                ],
                pricing_model: 'usage',
                base_price: 1500.00,
                pricing_details: {
                    monthly_fee: 1500.00,
                    kyc_per_user: 3.00,
                    card_virtual: 5.00,
                    card_physical: 15.00,
                    crypto_transaction_fee_percent: 1.0,
                    sepa_transaction_fee_percent: 0.5,
                    exchange_fee_percent: 0.8
                },
                setup_time_days: 3,
                api_available: true,
                requires_approval: true,
                status: 'active',
                use_cases: [
                    'PSPs wanting EU crypto capabilities',
                    'Neobanks with crypto features',
                    'Crypto exchanges needing fiat rails',
                    'DeFi platforms requiring compliance'
                ],
                target_customers: 'PSP',
                integration_complexity: 'medium',
                documentation_url: 'https://docs.striga.com',
                support_email: 'support@striga.com'
            },
            {
                name: 'Striga Lightning Network',
                service_provider_id: provider.id,
                provider_name: 'Striga (Lightspark)',
                category: 'crypto_payment',
                description: 'Bitcoin Lightning Network instant payments with no node management overhead',
                features: [
                    'Instant Bitcoin transfers',
                    'Lightning invoice creation',
                    'Lightning invoice payment',
                    'On-chain flexibility',
                    'No liquidity management needed',
                    'Enterprise-grade infrastructure'
                ],
                pricing_model: 'usage',
                base_price: 500.00,
                pricing_details: {
                    monthly_fee: 500.00,
                    per_payment: 0.01,
                    fee_percent: 0.5
                },
                setup_time_days: 1,
                api_available: true,
                requires_approval: false,
                status: 'active',
                use_cases: [
                    'Cross-border remittances',
                    'Micropayments',
                    'Instant settlements'
                ],
                target_customers: 'PSP',
                integration_complexity: 'low',
                documentation_url: 'https://docs.striga.com/lightning',
                support_email: 'support@striga.com'
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