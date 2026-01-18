import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, from_currency, to_currency, amount } = await req.json();

        if (action === 'convertCurrency') {
            // Get FX rate
            const rate = await queryOne(
                `SELECT rate FROM fx_rates WHERE from_currency = $1 AND to_currency = $2 AND date = CURRENT_DATE`,
                [from_currency, to_currency]
            );

            const converted = rate ? amount * rate.rate : amount;

            // Log conversion
            await execute(
                `INSERT INTO fx_conversion_log (from_currency, to_currency, from_amount, to_amount, rate, psp_code)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [from_currency, to_currency, amount, converted, rate?.rate || 1, psp_code]
            );

            await closeConnection();
            return Response.json({
                success: true,
                from_amount: amount,
                from_currency,
                to_amount: Math.round(converted * 100) / 100,
                to_currency,
                rate: rate?.rate || 1
            });
        }

        if (action === 'optimizeSettlement') {
            // Group settlements by currency
            const settlements = await query(
                `SELECT currency, COUNT(*) as count, SUM(net_amount) as total 
                 FROM reconciliation_batch WHERE psp_code = $1 AND status = 'pending'
                 GROUP BY currency`,
                [psp_code]
            );

            const optimized = [];
            for (const settlement of settlements) {
                // Find best rate
                const bestRate = await queryOne(
                    `SELECT * FROM fx_rates WHERE from_currency = $1 AND date = CURRENT_DATE
                     ORDER BY rate DESC LIMIT 1`,
                    [settlement.currency]
                );

                optimized.push({
                    currency: settlement.currency,
                    total: settlement.total,
                    count: settlement.count,
                    best_rate: bestRate?.rate
                });
            }

            await closeConnection();
            return Response.json({ success: true, optimized });
        }

        if (action === 'updateFXRates') {
            const rates = [
                { from: 'USD', to: 'EUR', rate: 0.92 },
                { from: 'USD', to: 'GBP', rate: 0.79 },
                { from: 'USD', to: 'JPY', rate: 150.5 }
            ];

            for (const r of rates) {
                await execute(
                    `INSERT INTO fx_rates (from_currency, to_currency, rate, date) 
                     VALUES ($1, $2, $3, CURRENT_DATE)
                     ON CONFLICT DO NOTHING`,
                    [r.from, r.to, r.rate]
                );
            }

            await closeConnection();
            return Response.json({ success: true, rates_updated: rates.length });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Multi-currency error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});