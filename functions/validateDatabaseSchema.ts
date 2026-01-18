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

        // Check critical PostgreSQL tables
        const criticalTables = [
            'ProvisionedPSP',
            'Merchant',
            'Transaction',
            'ProcessorConnectorConfig',
            'MerchantMID'
        ];

        const tableChecks = [];
        for (const table of criticalTables) {
            try {
                await client.queryObject(`SELECT 1 FROM "${table}" LIMIT 1`);
                tableChecks.push({ table, exists: true });
            } catch (error) {
                tableChecks.push({ table, exists: false, error: error.message });
            }
        }

        await client.end();

        const allValid = tableChecks.every(check => check.exists);

        return Response.json({
            valid: allValid,
            tables: tableChecks.filter(c => c.exists).map(c => c.table),
            issues: tableChecks.filter(c => !c.exists),
            message: allValid ? `All ${tableChecks.filter(c => c.exists).length} critical PostgreSQL tables validated` : 'Some tables are missing or inaccessible'
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