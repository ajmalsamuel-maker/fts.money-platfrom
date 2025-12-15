import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code } = await req.json();

        if (!psp_code) {
            return Response.json({ error: 'PSP code required' }, { status: 400 });
        }

        const schemaName = `psp_${psp_code.toLowerCase()}`;
        const client = await pool.connect();

        try {
            // 1. Check if schema exists
            const schemaCheck = await client.query(`
                SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1
            `, [schemaName]);

            // 2. Check psp_settings
            const settingsCheck = await client.query(`
                SELECT * FROM psp_settings WHERE UPPER(psp_code) = UPPER($1)
            `, [psp_code]);

            // 3. Check ProvisionedPSP
            const pspCheck = await client.query(`
                SELECT * FROM "ProvisionedPSP" WHERE UPPER(psp_code) = UPPER($1)
            `, [psp_code]);

            // 4. Try to query from isolated schema
            let schemaData = null;
            if (schemaCheck.rows.length > 0) {
                await client.query(`SET search_path TO ${schemaName}`);
                
                const usersResult = await client.query('SELECT COUNT(*) as count FROM app_users');
                const merchantsResult = await client.query('SELECT COUNT(*) as count FROM merchants');
                const txnResult = await client.query('SELECT COUNT(*) as count FROM transactions');
                
                schemaData = {
                    users: parseInt(usersResult.rows[0].count),
                    merchants: parseInt(merchantsResult.rows[0].count),
                    transactions: parseInt(txnResult.rows[0].count)
                };
            }

            return Response.json({
                success: true,
                psp_code,
                schema_name: schemaName,
                schema_exists: schemaCheck.rows.length > 0,
                psp_settings_exists: settingsCheck.rows.length > 0,
                psp_settings: settingsCheck.rows[0] || null,
                provisioned_psp_exists: pspCheck.rows.length > 0,
                provisioned_psp: pspCheck.rows[0] || null,
                schema_data: schemaData
            });

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Debug error:', error);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});