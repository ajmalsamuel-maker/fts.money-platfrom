import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Sync all existing PSPs with module-based enabled_features
 * Run this once to migrate existing PSPs to the new module system
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all PSPs
        const psps = await base44.asServiceRole.entities.ProvisionedPSP.list();
        
        const results = [];

        for (const psp of psps) {
            const moduleIds = new Set([
                'core_dashboard',
                'core_transactions',
                'core_merchants',
                'core_system'
            ]);

            // Map orchestration features
            const orchFeatures = psp.advanced_features || {};
            if (orchFeatures.smart_routing) moduleIds.add('smart_routing');
            if (orchFeatures.crypto_payments) moduleIds.add('crypto_payments');
            if (orchFeatures.network_tokenization || orchFeatures.account_updater || orchFeatures.smart_retry) {
                moduleIds.add('advanced_features');
            }

            // Map services
            if (psp.enabled_services && psp.enabled_services.length > 0) {
                moduleIds.add('payment_gateways');
            }

            // Map payment methods
            const paymentMethods = psp.enabled_payment_methods || [];
            if (paymentMethods.some(m => m.includes('bitcoin') || m.includes('ethereum') || m.includes('crypto'))) {
                moduleIds.add('crypto_payments');
            }
            if (paymentMethods.some(m => m.includes('alipay') || m.includes('wechat') || m.includes('wallet'))) {
                moduleIds.add('alternative_payments');
            }

            // Payout features
            if (psp.enabled_payout_methods && psp.enabled_payout_methods.length > 0) {
                moduleIds.add('payout_management');
                if (orchFeatures.instant_settlements) {
                    moduleIds.add('payout_orchestration');
                }
                if (psp.enabled_payout_methods.some(m => m.includes('bitcoin') || m.includes('crypto'))) {
                    moduleIds.add('crypto_payouts');
                }
            }

            // Fraud/compliance
            if (orchFeatures.ai_fraud_detection) {
                moduleIds.add('fraud_prevention');
            }

            const complianceFeatures = psp.compliance_features || {};
            if (complianceFeatures.pci_dss || complianceFeatures.aml_screening) {
                moduleIds.add('compliance_suite');
            }

            // Standard modules
            moduleIds.add('chargeback_management');
            moduleIds.add('virtual_terminal');
            moduleIds.add('api_management');
            moduleIds.add('merchant_onboarding_workflow');

            // Tier-based features
            if (psp.tier === 'enterprise' || psp.tier === 'custom') {
                moduleIds.add('sub_merchants');
                moduleIds.add('usage_metering');
            }

            if (psp.tier !== 'starter') {
                moduleIds.add('merchant_portal');
                moduleIds.add('pricing_engine');
            }

            // MID routing
            if (orchFeatures.load_balancing || orchFeatures.cascade_logic) {
                moduleIds.add('mid_routing');
            }

            // Physical terminals (if tier allows)
            if (psp.tier === 'professional' || psp.tier === 'enterprise') {
                moduleIds.add('physical_terminals');
            }

            // Update PSP
            await base44.asServiceRole.entities.ProvisionedPSP.update(psp.id, {
                enabled_features: Array.from(moduleIds)
            });

            results.push({
                psp_code: psp.psp_code,
                psp_name: psp.psp_name,
                tier: psp.tier,
                modules_count: moduleIds.size,
                modules: Array.from(moduleIds)
            });
        }

        return Response.json({
            success: true,
            total_psps: psps.length,
            results
        });

    } catch (error) {
        console.error('Error in syncPSPModules:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});