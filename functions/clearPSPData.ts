import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
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
        const schemaName = `psp_${psp_code.toLowerCase()}`;
        console.log('📂 Setting schema to:', schemaName);
        await client.query(`SET search_path TO ${schemaName}`);

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

        return Response.json({
            success: true,
            schema: schemaName,
            results
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