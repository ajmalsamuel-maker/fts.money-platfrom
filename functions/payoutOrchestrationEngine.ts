import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, schedule_type } = await req.json();

        if (action === 'processBatchPayouts') {
            const settlements = await query(
                `SELECT * FROM reconciliation_batch WHERE psp_code = $1 AND status = 'pending' AND settlement_date <= NOW()`,
                [psp_code]
            );

            let processed = 0;
            for (const settlement of settlements) {
                try {
                    const payoutId = `PAYOUT-${Date.now()}`;
                    await execute(
                        `INSERT INTO payout (payout_id, merchant_id, amount, currency, status, psp_code)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [payoutId, settlement.merchant_id, settlement.net_amount, settlement.currency || 'USD', 'initiated', psp_code]
                    );

                    await execute(
                        `UPDATE reconciliation_batch SET status = 'processing' WHERE id = $1`,
                        [settlement.id]
                    );

                    processed++;
                } catch (err) {
                    console.error(`Payout processing error for settlement ${settlement.batch_id}:`, err);
                }
            }

            await closeConnection();
            return Response.json({ success: true, processed });
        }

        if (action === 'getSchedule') {
            const config = await queryOne(
                `SELECT * FROM merchant_settlement_config WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true, schedule: config });
        }

        if (action === 'updateSchedule') {
            const { settlement_frequency, auto_payout_enabled } = await req.json();
            await execute(
                `UPDATE merchant_settlement_config SET settlement_frequency = $1, auto_payout_enabled = $2 WHERE merchant_id = $3 AND psp_code = $4`,
                [settlement_frequency, auto_payout_enabled, merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({ success: true });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Payout orchestration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});