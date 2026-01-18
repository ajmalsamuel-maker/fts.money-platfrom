import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, merchant_id, transaction_id, amount, account_type } = await req.json();

        if (action === 'postEntry') {
            const entry_id = `ENTRY-${Date.now()}`;
            
            // Debit
            await execute(
                `INSERT INTO ledger_entry (entry_id, psp_code, merchant_id, account, debit, credit, posted_date)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [entry_id, psp_code, merchant_id, `${account_type}_debit`, amount, 0]
            );

            // Credit
            await execute(
                `INSERT INTO ledger_entry (entry_id, psp_code, merchant_id, account, debit, credit, posted_date)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                [entry_id, psp_code, merchant_id, 'income_credit', 0, amount]
            );

            await closeConnection();
            return Response.json({ success: true, entry_id });
        }

        if (action === 'getBalance') {
            const balance = await queryOne(
                `SELECT 
                    COALESCE(SUM(CASE WHEN account LIKE '%debit%' THEN debit ELSE 0 END), 0) as debits,
                    COALESCE(SUM(CASE WHEN account LIKE '%credit%' THEN credit ELSE 0 END), 0) as credits
                 FROM ledger_entry WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            await closeConnection();
            return Response.json({
                success: true,
                debits: balance.debits,
                credits: balance.credits,
                net: balance.debits - balance.credits
            });
        }

        if (action === 'reconcile') {
            const txn_total = await queryOne(
                `SELECT COALESCE(SUM(amount), 0) as total FROM transaction WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            const ledger_total = await queryOne(
                `SELECT COALESCE(SUM(debit - credit), 0) as total FROM ledger_entry WHERE merchant_id = $1 AND psp_code = $2`,
                [merchant_id, psp_code]
            );

            const reconciled = txn_total.total === ledger_total.total;

            await closeConnection();
            return Response.json({
                success: true,
                reconciled,
                transaction_total: txn_total.total,
                ledger_total: ledger_total.total
            });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Ledger error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});