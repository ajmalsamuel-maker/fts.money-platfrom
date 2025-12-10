import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { user } = await req.json();

        // Insert or update merchant user in PostgreSQL
        await pool.query(`
            INSERT INTO merchant_users (
                id, merchant_id, merchant_name, email, full_name, role, status,
                temp_password, must_change_password, two_factor_enabled, phone, permissions, allowed_terminals
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (email) 
            DO UPDATE SET
                merchant_id = EXCLUDED.merchant_id,
                merchant_name = EXCLUDED.merchant_name,
                full_name = EXCLUDED.full_name,
                role = EXCLUDED.role,
                status = EXCLUDED.status,
                temp_password = EXCLUDED.temp_password,
                must_change_password = EXCLUDED.must_change_password,
                two_factor_enabled = EXCLUDED.two_factor_enabled,
                phone = EXCLUDED.phone,
                permissions = EXCLUDED.permissions,
                allowed_terminals = EXCLUDED.allowed_terminals
        `, [
            user.id,
            user.merchant_id,
            user.merchant_name,
            user.email,
            user.full_name,
            user.role,
            user.status,
            user.temp_password,
            user.must_change_password,
            user.two_factor_enabled || false,
            user.phone || null,
            user.permissions || null,
            user.allowed_terminals || null
        ]);

        return Response.json({ success: true });

    } catch (error) {
        console.error('Sync merchant user error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});