import { query, execute, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const { action, source_data, entity_type, psp_code } = await req.json();

        if (action === 'migrateTransactions') {
            let migrated = 0;

            for (const txn of source_data || []) {
                try {
                    await execute(
                        `INSERT INTO transaction (transaction_id, merchant_id, psp_code, amount, type, status, created_date)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [txn.id, txn.merchant_id, psp_code, txn.amount, txn.type, 'approved', txn.created_date || new Date()]
                    );
                    migrated++;
                } catch (e) {
                    console.error(`Failed to migrate transaction ${txn.id}:`, e);
                }
            }

            await closeConnection();
            return Response.json({
                success: true,
                entity_type: 'transaction',
                total: source_data?.length || 0,
                migrated
            });
        }

        if (action === 'migrateMerchants') {
            let migrated = 0;

            for (const merchant of source_data || []) {
                try {
                    await execute(
                        `INSERT INTO merchant (merchant_id, psp_code, business_name, contact_email, status, created_date)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [merchant.id, psp_code, merchant.name, merchant.email, merchant.status || 'active', merchant.created_date || new Date()]
                    );
                    migrated++;
                } catch (e) {
                    console.error(`Failed to migrate merchant ${merchant.id}:`, e);
                }
            }

            await closeConnection();
            return Response.json({
                success: true,
                entity_type: 'merchant',
                total: source_data?.length || 0,
                migrated
            });
        }

        if (action === 'migrateMIDs') {
            let migrated = 0;

            for (const mid of source_data || []) {
                try {
                    await execute(
                        `INSERT INTO merchant_mid (merchant_id, psp_code, mid, status, created_date)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [mid.merchant_id, psp_code, mid.mid_number, mid.status || 'active', mid.created_date || new Date()]
                    );
                    migrated++;
                } catch (e) {
                    console.error(`Failed to migrate MID ${mid.id}:`, e);
                }
            }

            await closeConnection();
            return Response.json({
                success: true,
                entity_type: 'mid',
                total: source_data?.length || 0,
                migrated
            });
        }

        if (action === 'validateMigration') {
            const txn_count = await query(`SELECT COUNT(*) as count FROM transaction WHERE psp_code = $1`, [psp_code]);
            const merchant_count = await query(`SELECT COUNT(*) as count FROM merchant WHERE psp_code = $1`, [psp_code]);

            await closeConnection();
            return Response.json({
                success: true,
                transactions: txn_count[0]?.count || 0,
                merchants: merchant_count[0]?.count || 0
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