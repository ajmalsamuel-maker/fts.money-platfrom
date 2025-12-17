import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    const client = await pool.connect();
    try {
        const { psp_code } = await req.json();

        console.log('🔍 getPSPSettings called with psp_code:', psp_code);

        if (!psp_code) {
            return Response.json({
                success: false,
                error: 'PSP code is required'
            }, { status: 400 });
        }

        // CRITICAL: Set search path to PSP-isolated schema ONLY (PCI/GDPR compliance)
        const schemaName = `psp_${psp_code.toLowerCase()}`;
        console.log('📂 Setting schema to:', schemaName);
        await client.query(`SET search_path TO ${schemaName}`);

        // Query from isolated schema
        const result = await client.query(
            'SELECT * FROM psp_settings WHERE UPPER(psp_code) = UPPER($1) LIMIT 1',
            [psp_code]
        );

        console.log('📊 Query result rows:', result.rows.length);
        console.log('📊 Settings found:', result.rows[0]);

        const settings = result.rows[0];

        if (!settings) {
            return Response.json({
                success: false,
                error: 'PSP settings not found'
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            settings: settings
        });

    } catch (error) {
        console.error('❌ Error in getPSPSettings:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        client.release();
    }
});