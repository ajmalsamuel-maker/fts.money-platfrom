import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const client = await pool.connect();
        const results = {
            schemas_fixed: [],
            constraints_removed: [],
            indexes_removed: [],
            errors: []
        };

        try {
            // Find all PSP schemas
            const schemasResult = await client.query(`
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name LIKE 'psp_%'
                ORDER BY schema_name
            `);

            for (const schemaRow of schemasResult.rows) {
                const schemaName = schemaRow.schema_name;
                
                try {
                    // Check if psp_staff_users table exists
                    const tableCheck = await client.query(`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = $1 AND table_name = 'psp_staff_users'
                        )
                    `, [schemaName]);

                    if (!tableCheck.rows[0].exists) {
                        continue;
                    }

                    // psp_staff_users doesn't need unique email constraints since emails can be shared across PSPs
                    // Just ensure performance index exists
                    await client.query(`
                        CREATE INDEX IF NOT EXISTS idx_psp_staff_users_email 
                        ON ${schemaName}.psp_staff_users(email)
                    `);

                    results.schemas_fixed.push(schemaName);

                } catch (schemaError) {
                    results.errors.push({
                        schema: schemaName,
                        action: 'process_schema',
                        error: schemaError.message
                    });
                }
            }

            return Response.json({
                success: true,
                message: 'Multi-tenant constraints fixed',
                summary: {
                    schemas_processed: results.schemas_fixed.length,
                    constraints_removed: results.constraints_removed.length,
                    indexes_removed: results.indexes_removed.length,
                    errors: results.errors.length
                },
                details: results
            });

        } finally {
            client.release();
        }

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});