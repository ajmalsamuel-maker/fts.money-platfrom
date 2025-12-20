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
                    // Check if app_users table exists
                    const tableCheck = await client.query(`
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = $1 AND table_name = 'app_users'
                        )
                    `, [schemaName]);

                    if (!tableCheck.rows[0].exists) {
                        continue;
                    }

                    // Drop ALL unique constraints on email column
                    const constraintsResult = await client.query(`
                        SELECT conname 
                        FROM pg_constraint 
                        WHERE conrelid = $1::regclass 
                        AND contype = 'u'
                    `, [`${schemaName}.app_users`]);

                    for (const constraint of constraintsResult.rows) {
                        try {
                            await client.query(`
                                ALTER TABLE ${schemaName}.app_users 
                                DROP CONSTRAINT IF EXISTS ${constraint.conname} CASCADE
                            `);
                            results.constraints_removed.push({
                                schema: schemaName,
                                constraint: constraint.conname
                            });
                        } catch (err) {
                            results.errors.push({
                                schema: schemaName,
                                action: 'drop_constraint',
                                constraint: constraint.conname,
                                error: err.message
                            });
                        }
                    }

                    // Drop ALL unique indexes on email column
                    const indexesResult = await client.query(`
                        SELECT indexname, indexdef
                        FROM pg_indexes
                        WHERE schemaname = $1 
                        AND tablename = 'app_users'
                        AND indexdef LIKE '%UNIQUE%'
                    `, [schemaName]);

                    for (const index of indexesResult.rows) {
                        try {
                            await client.query(`
                                DROP INDEX IF EXISTS ${schemaName}.${index.indexname} CASCADE
                            `);
                            results.indexes_removed.push({
                                schema: schemaName,
                                index: index.indexname
                            });
                        } catch (err) {
                            results.errors.push({
                                schema: schemaName,
                                action: 'drop_index',
                                index: index.indexname,
                                error: err.message
                            });
                        }
                    }

                    // Create non-unique index for performance (not for uniqueness)
                    await client.query(`
                        CREATE INDEX IF NOT EXISTS idx_app_users_email 
                        ON ${schemaName}.app_users(email)
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