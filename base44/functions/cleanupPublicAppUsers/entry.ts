import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, email } = await req.json();
        
        const client = await pool.connect();
        try {
            if (action === 'delete') {
                // This function is deprecated - psp_staff_users are in PSP-isolated schemas
                return Response.json({
                    success: false,
                    message: 'This function is deprecated. PSP staff users are now in isolated schemas (psp_staff_users table).'
                });
            }
            
            if (action === 'list') {
                // List all PSP staff users across all schemas
                const pspSchemas = await client.query(`
                    SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'psp_%'
                `);
                
                const allUsers = [];
                for (const schema of pspSchemas.rows) {
                    try {
                        const result = await client.query(`
                            SELECT id, email, full_name, role FROM ${schema.schema_name}.psp_staff_users ORDER BY id
                        `);
                        allUsers.push(...result.rows.map(u => ({ ...u, schema: schema.schema_name })));
                    } catch (err) {
                        // Schema might not have psp_staff_users table yet
                    }
                }
                
                return Response.json({
                    success: true,
                    users: allUsers
                });
            }
            
            return Response.json({
                success: false,
                error: 'Invalid action'
            }, { status: 400 });
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