import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { psp_code } = await req.json();
        const schemaName = `psp_${psp_code.toLowerCase()}`;
        
        const client = await pool.connect();
        try {
            // Check if schema exists
            const schemaCheck = await client.query(`
                SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1
            `, [schemaName]);

            if (schemaCheck.rows.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Schema does not exist'
                });
            }

            // Check if psp_staff_users table exists
            const tableCheck = await client.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = $1 AND table_name = 'psp_staff_users'
            `, [schemaName]);

            // Check for existing users
            let users = [];
            if (tableCheck.rows.length > 0) {
                const usersResult = await client.query(`
                    SELECT id, email, role, status FROM ${schemaName}.psp_staff_users
                `);
                users = usersResult.rows;
            }

            // Check constraints
            const constraints = await client.query(`
                SELECT constraint_name, constraint_type 
                FROM information_schema.table_constraints 
                WHERE table_schema = $1 AND table_name = 'psp_staff_users'
            `, [schemaName]);

            return Response.json({
                success: true,
                schema_exists: true,
                table_exists: tableCheck.rows.length > 0,
                users: users,
                constraints: constraints.rows
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