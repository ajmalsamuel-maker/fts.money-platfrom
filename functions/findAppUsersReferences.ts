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
            const results = {
                tables: [],
                views: [],
                constraints: [],
                triggers: [],
                functions: [],
                indexes: []
            };

            // Check for tables named app_users
            const tables = await client.query(`
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_name LIKE '%app_users%'
            `);
            results.tables = tables.rows;

            // Check for views referencing app_users
            const views = await client.query(`
                SELECT table_schema, table_name, view_definition 
                FROM information_schema.views 
                WHERE view_definition LIKE '%app_users%'
            `);
            results.views = views.rows;

            // Check for constraints referencing app_users
            const constraints = await client.query(`
                SELECT 
                    tc.table_schema,
                    tc.table_name,
                    tc.constraint_name,
                    tc.constraint_type,
                    pg_get_constraintdef(pgc.oid) as constraint_definition
                FROM information_schema.table_constraints tc
                JOIN pg_catalog.pg_constraint pgc 
                    ON tc.constraint_name = pgc.conname
                WHERE pg_get_constraintdef(pgc.oid) LIKE '%app_users%'
            `);
            results.constraints = constraints.rows;

            // Check for triggers referencing app_users
            const triggers = await client.query(`
                SELECT 
                    trigger_schema,
                    trigger_name,
                    event_object_table,
                    action_statement
                FROM information_schema.triggers 
                WHERE action_statement LIKE '%app_users%'
            `);
            results.triggers = triggers.rows;

            // Check for functions/procedures referencing app_users
            const functions = await client.query(`
                SELECT 
                    n.nspname as schema,
                    p.proname as function_name,
                    pg_get_functiondef(p.oid) as definition
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE pg_get_functiondef(p.oid) LIKE '%app_users%'
            `);
            results.functions = functions.rows;

            // Check for indexes
            const indexes = await client.query(`
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    indexdef
                FROM pg_indexes
                WHERE tablename LIKE '%app_users%' OR indexdef LIKE '%app_users%'
            `);
            results.indexes = indexes.rows;

            return Response.json({
                success: true,
                message: 'Scan complete',
                results,
                summary: {
                    tables_found: results.tables.length,
                    views_found: results.views.length,
                    constraints_found: results.constraints.length,
                    triggers_found: results.triggers.length,
                    functions_found: results.functions.length,
                    indexes_found: results.indexes.length
                }
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