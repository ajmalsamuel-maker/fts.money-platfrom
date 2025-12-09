import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

// Debug endpoint to check merchant users in database
Deno.serve(async (req) => {
    try {
        const { email } = await req.json();

        // Query for the user
        const result = await pool.query(`
            SELECT id, merchant_id, merchant_name, email, full_name, role, status, 
                   temp_password, must_change_password, last_login
            FROM merchant_users 
            WHERE email = $1
        `, [email]);

        if (result.rows.length === 0) {
            return Response.json({ 
                found: false,
                message: 'User not found in database',
                email: email
            });
        }

        const user = result.rows[0];

        return Response.json({
            found: true,
            user: {
                id: user.id,
                merchant_id: user.merchant_id,
                merchant_name: user.merchant_name,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                status: user.status,
                temp_password: user.temp_password,
                must_change_password: user.must_change_password,
                last_login: user.last_login
            }
        });

    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});