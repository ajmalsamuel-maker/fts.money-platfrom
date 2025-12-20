import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { email } = await req.json();

        // Check psp_staff_users with password info (searches across all PSP schemas)
        const pspSchemas = await pool.query(`
            SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'psp_%'
        `);
        
        const pspStaffUsers = [];
        for (const schema of pspSchemas.rows) {
            try {
                const result = await pool.query(
                    `SELECT id, email, full_name, role, status, password_hash, length(password_hash) as pwd_length 
                     FROM ${schema.schema_name}.psp_staff_users WHERE email = $1`,
                    [email]
                );
                if (result.rows.length > 0) {
                    pspStaffUsers.push({ ...result.rows[0], schema: schema.schema_name });
                }
            } catch (err) {
                // Schema might not have psp_staff_users table yet
            }
        }

        // Check merchant_users with password info
        const merchantUserResult = await pool.query(
            'SELECT id, email, full_name, merchant_code, role, status, temp_password, password_hash FROM merchant_users WHERE email = $1',
            [email]
        );

        return Response.json({
            success: true,
            email,
            psp_staff_users: pspStaffUsers,
            merchant_users: merchantUserResult.rows || []
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});