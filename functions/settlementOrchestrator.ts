import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Settlement Orchestrator
 * Creates settlement batches based on merchant cycles
 * Handles hold periods, minimum amounts, scheduling
 */
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { psp_code, trigger = 'manual' } = await req.json();

        console.log(`🔄 Settlement Orchestrator: Running for ${psp_code} (${trigger})`);

        // 1. Get all active merchants for this PSP
        const merchants = await base44.asServiceRole.entities.Merchant.filter({
            psp_code,
            status: 'active'
        });

        console.log(`📋 Found ${merchants.length} merchants`);

        const settlements = [];

        // 2. For each merchant, check if settlement is due
        for (const merchant of merchants) {
            try {
                // Get merchant's settlement config
                const configRecords = await base44.asServiceRole.entities.MerchantSettlementConfig.filter({
                    merchant_id: merchant.id,
                    psp_code
                });

                const config = configRecords?.[0] || {
                    settlement_frequency: merchant.settlement_period || 'T+1',
                    auto_payout_enabled: true
                };

                // Check if settlement is due
                const isDue = checkIfSettlementDue(config);

                if (!isDue && trigger === 'manual') {
                    console.log(`⏭️ Settlement not due for merchant ${merchant.id}`);
                    continue;
                }

                console.log(`✓ Settlement due for merchant ${merchant.id}`);

                // Get approved transactions since last settlement
                const lastSettlement = await getLastSettlement(base44, merchant.id, psp_code);
                const since = lastSettlement?.settlement_date ? new Date(lastSettlement.settlement_date) : new Date(0);

                const transactions = await base44.asServiceRole.entities.Transaction.filter({
                    merchant_id: merchant.id,
                    psp_code,
                    status: 'approved'
                });

                const unsettled = transactions.filter(t => new Date(t.created_date) > since);

                if (unsettled.length === 0) {
                    console.log(`  No new transactions for settlement`);
                    continue;
                }

                // Calculate totals
                const grossAmount = unsettled.reduce((sum, t) => sum + t.amount, 0);
                const totalFees = unsettled.reduce((sum, t) => sum + (t.fee || 0), 0);
                const chargebacks = unsettled.filter(t => t.type === 'chargeback').reduce((sum, t) => sum + t.amount, 0);
                const refunds = unsettled.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0);

                const netAmount = grossAmount - totalFees - chargebacks - refunds;

                // Check minimum amount threshold
                const minAmount = config.minimum_settlement_amount || 0;
                if (netAmount < minAmount) {
                    console.log(`  Net amount ${netAmount} below minimum ${minAmount}`);
                    continue;
                }

                // Create settlement batch
                const batch = await base44.asServiceRole.entities.ReconciliationBatch.create({
                    psp_code,
                    merchant_id: merchant.id,
                    batch_id: `SETTLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    settlement_period_start: since.toISOString().split('T')[0],
                    settlement_period_end: new Date().toISOString().split('T')[0],
                    status: config.hold_period_days > 0 ? 'hold' : 'pending',
                    gross_amount: grossAmount,
                    fees: totalFees,
                    chargebacks,
                    refunds,
                    net_amount: netAmount,
                    currency: merchant.currency || 'USD',
                    transaction_count: unsettled.length,
                    hold_period_days: config.hold_period_days || 0,
                    payout_method: config.payout_method || 'bank_transfer',
                    reconciliation_status: 'pending'
                });

                console.log(`✅ Settlement created: ${batch.batch_id}`);

                settlements.push({
                    batch_id: batch.batch_id,
                    merchant_id: merchant.id,
                    amount: netAmount,
                    transactions: unsettled.length
                });

                // Create reconciliation items
                for (const txn of unsettled) {
                    await base44.asServiceRole.entities.ReconciliationItem.create({
                        psp_code,
                        reconciliation_batch_id: batch.id,
                        transaction_id: txn.id,
                        amount: txn.amount,
                        currency: txn.currency,
                        posted_date: new Date().toISOString().split('T')[0],
                        status: 'pending',
                        match_type: 'exact'
                    });
                }

            } catch (merchantError) {
                console.error(`Error processing merchant ${merchant.id}:`, merchantError);
            }
        }

        console.log(`🎉 Settlement orchestration complete: ${settlements.length} batches created`);

        return Response.json({
            success: true,
            settlements_created: settlements.length,
            settlements,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Orchestration error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});

function checkIfSettlementDue(config) {
    // Simplified - in production, calculate based on settlement_frequency, day_of_week, etc.
    const now = new Date();
    const hour = now.getHours();
    return hour === 0; // Due at midnight
}

async function getLastSettlement(base44, merchantId, pspCode) {
    const batches = await base44.asServiceRole.entities.ReconciliationBatch.filter({
        merchant_id: merchantId,
        psp_code: pspCode,
        status: 'completed'
    });

    return batches?.[0];
}