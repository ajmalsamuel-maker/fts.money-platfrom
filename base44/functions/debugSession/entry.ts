import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

// Debug endpoint to check user/PSP data
Deno.serve(async (req) => {
    try {
        const { email } = await req.json();

        // Get user from all PSP schemas
        const pspSchemas = await pool.query(`
            SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'psp_%'
        `);
        
        const users = [];
        for (const schema of pspSchemas.rows) {
            try {
                const result = await pool.query(
                    `SELECT * FROM ${schema.schema_name}.psp_staff_users WHERE email = $1`,
                    [email]
                );
                if (result.rows.length > 0) {
                    users.push({ ...result.rows[0], schema: schema.schema_name });
                }
            } catch (err) {
                // Schema might not have psp_staff_users table yet
            }
        }
        const userResult = { rows: users };

        // Get all PSP settings
        const pspResult = await pool.query('SELECT psp_code, psp_name FROM psp_settings');

        return Response.json({
            success: true,
            users: userResult.rows,
            available_psps: pspResult.rows,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});