import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { email } = await req.json();

        // Check app_users
        const appUserResult = await pool.query(
            'SELECT id, email, full_name, role, status FROM app_users WHERE email = $1',
            [email]
        );

        // Check merchant_users
        const merchantUserResult = await pool.query(
            'SELECT id, email, full_name, merchant_code, role, status FROM merchant_users WHERE email = $1',
            [email]
        );

        return Response.json({
            success: true,
            email,
            app_user: appUserResult.rows[0] || null,
            merchant_users: merchantUserResult.rows || []
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});