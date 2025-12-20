import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const client = await pool.connect();
        
        try {
            // Find all PSP schemas with app_users tables
            const appUsersTables = await client.query(`
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_name = 'app_users' AND table_schema LIKE 'psp_%'
            `);

            const results = {
                schemas_cleaned: [],
                errors: []
            };

            // Drop app_users table from each PSP schema
            for (const table of appUsersTables.rows) {
                try {
                    console.log(`Dropping ${table.table_schema}.app_users...`);
                    await client.query(`DROP TABLE IF EXISTS ${table.table_schema}.app_users CASCADE`);
                    results.schemas_cleaned.push(table.table_schema);
                    console.log(`✓ Dropped ${table.table_schema}.app_users`);
                } catch (err) {
                    results.errors.push({
                        schema: table.table_schema,
                        error: err.message
                    });
                    console.error(`✗ Failed to drop ${table.table_schema}.app_users:`, err.message);
                }
            }

            return Response.json({
                success: true,
                message: `Cleaned ${results.schemas_cleaned.length} schemas`,
                results
            });

        } finally {
            client.release();
        }

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});