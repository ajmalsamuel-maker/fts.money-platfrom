import { query, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, data_type, records } = await req.json();

        if (action === 'importMerchants') {
            let imported = 0;
            for (const merchant of records) {
                try {
                    await execute(
                        `INSERT INTO merchant (merchant_code, business_name, email, psp_code, status, country, currency)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         ON CONFLICT (merchant_code) DO NOTHING`,
                        [merchant.merchant_code, merchant.business_name, merchant.email, psp_code, 'pending', merchant.country || 'US', merchant.currency || 'USD']
                    );
                    imported++;
                } catch (err) {
                    console.error(`Failed to import merchant ${merchant.merchant_code}:`, err);
                }
            }

            await closeConnection();
            return Response.json({ success: true, imported, total: records.length });
        }

        if (action === 'importTransactions') {
            let imported = 0;
            for (const txn of records) {
                try {
                    await execute(
                        `INSERT INTO transaction (transaction_id, merchant_id, amount, currency, status, payment_method, psp_code)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         ON CONFLICT (transaction_id) DO NOTHING`,
                        [txn.transaction_id, txn.merchant_id, txn.amount, txn.currency || 'USD', txn.status || 'pending', txn.payment_method, psp_code]
                    );
                    imported++;
                } catch (err) {
                    console.error(`Failed to import transaction ${txn.transaction_id}:`, err);
                }
            }

            await closeConnection();
            return Response.json({ success: true, imported, total: records.length });
        }

        if (action === 'validateData') {
            const merchants = await query(`SELECT COUNT(*) as count FROM merchant WHERE psp_code = $1`, [psp_code]);
            const transactions = await query(`SELECT COUNT(*) as count FROM transaction WHERE psp_code = $1`, [psp_code]);

            await closeConnection();
            return Response.json({
                success: true,
                data_type,
                total_merchants: merchants[0]?.count || 0,
                total_transactions: transactions[0]?.count || 0
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Migration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});