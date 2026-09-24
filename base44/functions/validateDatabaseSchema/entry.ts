import { listTables, closeConnection } from './db/postgresClient.js';

Deno.serve(async (req) => {
    try {
        const existingTables = await listTables();

        // Check critical PostgreSQL tables (match actual database table names)
        const criticalTables = [
            'provisioned_psp',
            'merchants',
            'transactions',
            'processor_connector_config',
            'merchant_mids'
        ];

        const tableChecks = criticalTables.map(table => ({
            table,
            exists: existingTables.includes(table)
        }));

        await closeConnection();

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
        await closeConnection();
        return Response.json({ 
            valid: false, 
            error: `PostgreSQL schema validation failed: ${error.message}`
        });
    }
});