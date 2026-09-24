import pg from 'npm:pg@8.11.3';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const client = await pool.connect();
    try {
        const { psp_code, confirm } = await req.json();

        console.log('🧹 clearPSPData called for:', psp_code);

        if (!psp_code || confirm !== true) {
            return Response.json({
                success: false,
                error: 'PSP code and confirmation required'
            }, { status: 400 });
        }

        // CRITICAL: Set search path to PSP-isolated schema
        const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
        console.log('📂 Setting schema to:', schemaName);
        await client.query(`SET search_path TO "${schemaName}"`);

        // Clear all transactional data (keep settings and users)
        const tablesToClear = [
            'transactions',
            'merchants', 
            'settlements',
            'chargebacks',
            'disputes',
            'refunds',
            'payouts',
            'invoices',
            'customers',
            'saved_cards',
            'payment_links',
            'subscriptions',
            'terminals',
            'webhooks',
            'api_keys'
        ];

        const results = [];
        for (const table of tablesToClear) {
            try {
                const result = await client.query(`DELETE FROM ${table}`);
                results.push({
                    table,
                    deleted: result.rowCount,
                    success: true
                });
                console.log(`✅ Cleared ${result.rowCount} rows from ${table}`);
            } catch (err) {
                // Table might not exist - that's OK
                results.push({
                    table,
                    error: err.message,
                    success: false
                });
                console.log(`⚠️ Could not clear ${table}:`, err.message);
            }
        }

        // Also delete from Base44 entities (Merchant, Transaction, etc.)
        console.log('🗑️ Clearing Base44 entity records for', psp_code);
        const entityResults = [];
        
        try {
            const merchants = await base44.asServiceRole.entities.Merchant.filter({ psp_code });
            for (const merchant of merchants) {
                await base44.asServiceRole.entities.Merchant.delete(merchant.id);
            }
            entityResults.push({ entity: 'Merchant', deleted: merchants.length });
            console.log(`✅ Deleted ${merchants.length} Merchant entities`);
        } catch (err) {
            entityResults.push({ entity: 'Merchant', error: err.message });
            console.log('⚠️ Error deleting Merchant entities:', err.message);
        }

        try {
            const transactions = await base44.asServiceRole.entities.Transaction.filter({ psp_code });
            for (const txn of transactions) {
                await base44.asServiceRole.entities.Transaction.delete(txn.id);
            }
            entityResults.push({ entity: 'Transaction', deleted: transactions.length });
            console.log(`✅ Deleted ${transactions.length} Transaction entities`);
        } catch (err) {
            entityResults.push({ entity: 'Transaction', error: err.message });
            console.log('⚠️ Error deleting Transaction entities:', err.message);
        }

        return Response.json({
            success: true,
            schema: schemaName,
            postgres_results: results,
            entity_results: entityResults
        });

    } catch (error) {
        console.error('❌ Error clearing PSP data:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
});