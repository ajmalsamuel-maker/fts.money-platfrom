import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { user } = await req.json();

        if (!user.merchant_code) {
            // Fetch merchant_code from Merchant entity if not present
            const merchantQuery = await pool.query(
                'SELECT merchant_code FROM merchants WHERE id = $1',
                [user.merchant_id]
            );
            
            if (merchantQuery.rows.length === 0 || !merchantQuery.rows[0].merchant_code) {
                console.warn(`No merchant_code found for merchant_id: ${user.merchant_id}, skipping sync`);
                return Response.json({ 
                    success: false, 
                    error: `Merchant code not set for merchant: ${user.merchant_id}` 
                }, { status: 400 });
            }
            
            user.merchant_code = merchantQuery.rows[0].merchant_code;
        }

        // Insert or update merchant user in PostgreSQL
        await pool.query(`
            INSERT INTO merchant_users (
                merchant_id, merchant_code, merchant_name, email, full_name, role, status,
                temp_password, must_change_password, two_factor_enabled, phone, permissions, allowed_terminals
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (email, merchant_code) 
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
            user.merchant_id,
            user.merchant_code,
            user.merchant_name,
            user.email,
            user.full_name,
            user.role,
            user.status,
            user.temp_password || null,
            user.must_change_password || true,
            user.two_factor_enabled || false,
            user.phone || null,
            JSON.stringify(user.permissions || []),
            JSON.stringify(user.allowed_terminals || [])
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