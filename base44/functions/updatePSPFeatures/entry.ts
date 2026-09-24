import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Update PSP enabled features/modules
 * Maps orchestration features and services to module IDs
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { psp_code, action, features } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        // Get PSP record
        const psps = await base44.asServiceRole.entities.ProvisionedPSP.filter({ psp_code });
        if (!psps || psps.length === 0) {
            return Response.json({ error: 'PSP not found' }, { status: 404 });
        }

        const psp = psps[0];

        if (action === 'get') {
            return Response.json({
                success: true,
                enabled_features: psp.enabled_features || [],
                orchestration_features: psp.advanced_features || {},
                compliance_features: psp.compliance_features || {}
            });
        }

        if (action === 'update') {
            // Map features to module IDs
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
            const services = psp.enabled_services || [];
            if (services.length > 0) {
                moduleIds.add('payment_gateways');
            }

            // Map payment methods
            const paymentMethods = psp.enabled_payment_methods || [];
            if (paymentMethods.some(m => m.includes('bitcoin') || m.includes('ethereum') || m.includes('crypto'))) {
                moduleIds.add('crypto_payments');
            }

            // Check for payout features
            if (psp.enabled_payout_methods && psp.enabled_payout_methods.length > 0) {
                moduleIds.add('payout_management');
                if (orchFeatures.instant_settlements) {
                    moduleIds.add('payout_orchestration');
                }
                if (psp.enabled_payout_methods.some(m => m.includes('bitcoin') || m.includes('crypto'))) {
                    moduleIds.add('crypto_payouts');
                }
            }

            // Check for fraud/compliance features
            if (orchFeatures.ai_fraud_detection) {
                moduleIds.add('fraud_prevention');
            }

            // Check for compliance
            const complianceFeatures = psp.compliance_features || {};
            if (complianceFeatures.pci_dss || complianceFeatures.aml_screening || complianceFeatures.fatf_compliance) {
                moduleIds.add('compliance_suite');
            }

            // Check for chargeback
            moduleIds.add('chargeback_management'); // Usually always included

            // MID routing
            if (orchFeatures.load_balancing || orchFeatures.cascade_logic) {
                moduleIds.add('mid_routing');
            }

            // Terminals
            moduleIds.add('virtual_terminal'); // Usually included

            // API management
            moduleIds.add('api_management'); // Usually included

            // Merchant onboarding
            moduleIds.add('merchant_onboarding_workflow');

            // Sub-merchants (if enterprise tier)
            if (psp.tier === 'enterprise' || psp.tier === 'custom') {
                moduleIds.add('sub_merchants');
            }

            // Merchant portal builder (professional+)
            if (psp.tier !== 'starter') {
                moduleIds.add('merchant_portal');
            }

            // Pricing engine
            moduleIds.add('pricing_engine');

            // Update PSP record
            await base44.asServiceRole.entities.ProvisionedPSP.update(psp.id, {
                enabled_features: Array.from(moduleIds)
            });

            return Response.json({
                success: true,
                enabled_features: Array.from(moduleIds),
                message: 'Features updated successfully'
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error in updatePSPFeatures:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});