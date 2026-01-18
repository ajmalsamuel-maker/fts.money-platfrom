import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

Deno.serve(async (req) => {
    let client;
    try {
        const databaseUrl = Deno.env.get('DATABASE_URL');
        if (!databaseUrl) {
            return Response.json({ valid: false, error: 'DATABASE_URL environment variable not set' });
        }

        client = new Client(databaseUrl);
        await client.connect();

        // Get all existing tables
        const allTablesResult = await client.queryObject(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        
        const existingTables = allTablesResult.rows.map(r => r.table_name);

        // Check critical PostgreSQL tables (Base44 uses lowercase naming)
        const criticalTables = [
            'provisioned_psp',
            'merchant',
            'transaction',
            'processor_connector_config',
            'merchant_mid'
        ];

        const tableChecks = criticalTables.map(table => ({
            table,
            exists: existingTables.map(t => t.toLowerCase()).includes(table.toLowerCase())
        }));

        await client.end();

        const allValid = tableChecks.every(check => check.exists);

        return Response.json({
            valid: allValid,
            tables: tableChecks.filter(c => c.exists).map(c => c.table),
            issues: tableChecks.filter(c => !c.exists),
            all_tables: existingTables,
            message: allValid 
                ? `All ${tableChecks.filter(c => c.exists).length}/5 critical tables exist` 
                : `Missing tables - found ${existingTables.length} total tables in database`
        });

    } catch (error) {
        if (client) {
            try { await client.end(); } catch {}
        }
        return Response.json({ 
            valid: false, 
            error: `PostgreSQL schema validation failed: ${error.message}`
        });
    }
});