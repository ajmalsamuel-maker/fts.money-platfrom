import { query, queryOne, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, psp_code, transaction_id, wallet_address } = await req.json();

        if (action === 'recordOnChain') {
            const chain_tx = `0x${Math.random().toString(16).slice(2)}`; // Mock chain TX
            
            await execute(
                `INSERT INTO blockchain_transaction (transaction_id, psp_code, wallet_address, chain_tx_hash, status, created_date)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [transaction_id, psp_code, wallet_address, chain_tx, 'pending']
            );

            await closeConnection();
            return Response.json({ success: true, chain_tx_hash: chain_tx });
        }

        if (action === 'verifyOnChain') {
            const blockchain_txn = await queryOne(
                `SELECT * FROM blockchain_transaction WHERE transaction_id = $1`,
                [transaction_id]
            );

            // Mock verification
            const verified = true;

            if (verified) {
                await execute(
                    `UPDATE blockchain_transaction SET status = 'confirmed' WHERE transaction_id = $1`,
                    [transaction_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, verified });
        }

        if (action === 'getChainStatus') {
            const status = await queryOne(
                `SELECT * FROM blockchain_transaction WHERE transaction_id = $1`,
                [transaction_id]
            );

            await closeConnection();
            return Response.json({ success: true, chain_status: status });
        }

        if (action === 'batchSettlement') {
            const pending = await query(
                `SELECT * FROM reconciliation_batch WHERE psp_code = $1 AND status = 'pending' LIMIT 10`,
                [psp_code]
            );

            for (const batch of pending) {
                const chain_tx = `0xbatch${Math.random().toString(16).slice(2)}`;
                await execute(
                    `UPDATE reconciliation_batch SET chain_tx_hash = $1 WHERE batch_id = $2`,
                    [chain_tx, batch.batch_id]
                );
            }

            await closeConnection();
            return Response.json({ success: true, batches_recorded: pending.length });
        }

        await closeConnection();
        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        await closeConnection();
        console.error('Blockchain integration error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});