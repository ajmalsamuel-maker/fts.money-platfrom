import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

/**
 * Settlement Orchestrator
 * Creates settlement batches based on merchant cycles
 * Handles hold periods, minimum amounts, scheduling
 */
Deno.serve(async (req) => {
    try {
        const { psp_code, trigger = 'manual' } = await req.json();

        console.log(`🔄 Settlement Orchestrator: Running for ${psp_code} (${trigger})`);

        // 1. Get all active merchants for this PSP
        const merchants = await query(
            `SELECT * FROM merchant WHERE psp_code = $1 AND status = 'active'`,
            [psp_code]
        );

        console.log(`📋 Found ${merchants.length} merchants`);

        const settlements = [];

        // 2. For each merchant, check if settlement is due
        for (const merchant of merchants) {
            try {
                // Get merchant's settlement config
                const config = await queryOne(
                    `SELECT * FROM merchant_settlement_config WHERE merchant_id = $1 AND psp_code = $2`,
                    [merchant.id, psp_code]
                );

                const settlementConfig = config || {
                    settlement_frequency: merchant.settlement_period || 'T+1',
                    auto_payout_enabled: true,
                    hold_period_days: 0,
                    payout_method: 'bank_transfer',
                    minimum_settlement_amount: 0
                };

                // Check if settlement is due
                const isDue = checkIfSettlementDue(settlementConfig);

                if (!isDue && trigger === 'manual') {
                    console.log(`⏭️ Settlement not due for merchant ${merchant.id}`);
                    continue;
                }

                console.log(`✓ Settlement due for merchant ${merchant.id}`);

                // Get last settlement date
                const lastBatch = await queryOne(
                    `SELECT settlement_date FROM reconciliation_batch WHERE merchant_id = $1 AND psp_code = $2 AND reconciliation_status = 'reconciled' ORDER BY created_date DESC LIMIT 1`,
                    [merchant.id, psp_code]
                );

                const since = lastBatch?.settlement_date ? new Date(lastBatch.settlement_date) : new Date(0);

                // Get approved transactions since last settlement
                const unsettled = await query(
                    `SELECT * FROM transaction WHERE merchant_id = $1 AND psp_code = $2 AND status = 'approved' AND created_date > $3`,
                    [merchant.id, psp_code, since.toISOString()]
                );

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
                if (netAmount < settlementConfig.minimum_settlement_amount) {
                    console.log(`  Net amount ${netAmount} below minimum ${settlementConfig.minimum_settlement_amount}`);
                    continue;
                }

                // Create settlement batch
                const batchId = `SETTLE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const periodStart = since.toISOString().split('T')[0];
                const periodEnd = new Date().toISOString().split('T')[0];

                await execute(
                    `INSERT INTO reconciliation_batch (psp_code, merchant_id, batch_id, settlement_period_start, settlement_period_end, status, gross_amount, fees, chargebacks, refunds, net_amount, currency, transaction_count, hold_period_days, payout_method, reconciliation_status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                    [psp_code, merchant.id, batchId, periodStart, periodEnd, settlementConfig.hold_period_days > 0 ? 'hold' : 'pending', grossAmount, totalFees, chargebacks, refunds, netAmount, merchant.currency || 'USD', unsettled.length, settlementConfig.hold_period_days || 0, settlementConfig.payout_method || 'bank_transfer', 'pending']
                );

                console.log(`✅ Settlement created: ${batchId}`);

                settlements.push({
                    batch_id: batchId,
                    merchant_id: merchant.id,
                    amount: netAmount,
                    transactions: unsettled.length
                });

                // Create reconciliation items
                for (const txn of unsettled) {
                    await execute(
                        `INSERT INTO reconciliation_item (psp_code, transaction_id, amount, currency, posted_date, status, match_type)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [psp_code, txn.id, txn.amount, txn.currency, new Date().toISOString().split('T')[0], 'pending', 'exact']
                    );
                }

            } catch (merchantError) {
                console.error(`Error processing merchant ${merchant.id}:`, merchantError);
            }
        }

        await closeConnection();
        console.log(`🎉 Settlement orchestration complete: ${settlements.length} batches created`);

        return Response.json({
            success: true,
            settlements_created: settlements.length,
            settlements,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        await closeConnection();
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