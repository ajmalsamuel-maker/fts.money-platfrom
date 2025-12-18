import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { email } = await req.json();
        
        const client = await pool.connect();
        try {
            // Check if email exists in public.app_users
            const publicCheck = await client.query(`
                SELECT * FROM pg_tables WHERE tablename = 'app_users' AND schemaname = 'public'
            `);
            
            let publicUsers = null;
            if (publicCheck.rows.length > 0) {
                const usersResult = await client.query(`
                    SELECT * FROM public.app_users WHERE email = $1
                `, [email]);
                publicUsers = usersResult.rows;
            }
            
            // Check PSP schemas
            const pspSchemas = await client.query(`
                SELECT schema_name FROM information_schema.schemata 
                WHERE schema_name LIKE 'psp_%'
            `);
            
            const pspUsers = [];
            for (const schema of pspSchemas.rows) {
                try {
                    const result = await client.query(`
                        SELECT * FROM ${schema.schema_name}.app_users WHERE email = $1
                    `, [email]);
                    if (result.rows.length > 0) {
                        pspUsers.push({
                            schema: schema.schema_name,
                            users: result.rows
                        });
                    }
                } catch (err) {
                    // Schema might not have app_users table
                }
            }
            
            // Get all constraints on app_users tables
            const constraints = await client.query(`
                SELECT 
                    tc.table_schema,
                    tc.table_name,
                    tc.constraint_name,
                    tc.constraint_type
                FROM information_schema.table_constraints tc
                WHERE tc.table_name = 'app_users'
                AND tc.constraint_type = 'UNIQUE'
            `);
            
            return Response.json({
                success: true,
                email: email,
                publicTableExists: publicCheck.rows.length > 0,
                publicUsers: publicUsers,
                pspUsers: pspUsers,
                constraints: constraints.rows
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