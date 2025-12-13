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

        // Get user from database
        const userResult = await pool.query(
            'SELECT * FROM app_users WHERE email = $1',
            [email]
        );

        // Get all PSP settings
        const pspResult = await pool.query('SELECT psp_code, psp_name FROM psp_settings');

        return Response.json({
            success: true,
            user: userResult.rows[0] || null,
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