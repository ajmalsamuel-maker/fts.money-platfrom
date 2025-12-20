import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { email, password } = await req.json();

        // Update password in PSP staff users (must specify PSP code)
        const { psp_code } = await req.json();
        if (!psp_code) {
            return Response.json({
                success: false,
                error: 'PSP code is required'
            }, { status: 400 });
        }
        
        const schemaName = `psp_${psp_code.toLowerCase()}`;
        const result = await pool.query(
            `UPDATE ${schemaName}.psp_staff_users SET password_hash = $1 WHERE email = $2 RETURNING id, email, full_name, role`,
            [password, email]
        );

        if (result.rows.length === 0) {
            return Response.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: 'Password set successfully',
            user: result.rows[0]
        });

    } catch (error) {
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});