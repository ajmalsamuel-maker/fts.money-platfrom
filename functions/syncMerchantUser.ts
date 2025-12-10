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
                    success: true,
                    skipped: true,
                    message: `Merchant code not yet set, sync skipped` 
                });
            }
            
            user.merchant_code = merchantQuery.rows[0].merchant_code;
        }

        // Check if user exists
        const checkResult = await pool.query(
            'SELECT id FROM merchant_users WHERE email = $1',
            [user.email]
        );

        if (checkResult.rows.length > 0) {
            // Update existing user
            await pool.query(`
                UPDATE merchant_users SET
                    merchant_id = $1,
                    merchant_code = $2,
                    merchant_name = $3,
                    full_name = $4,
                    role = $5,
                    status = $6,
                    temp_password = $7,
                    must_change_password = $8,
                    two_factor_enabled = $9,
                    phone = $10,
                    permissions = $11,
                    allowed_terminals = $12
                WHERE email = $13
            `, [
                user.merchant_id,
                user.merchant_code,
                user.merchant_name,
                user.full_name,
                user.role,
                user.status,
                user.temp_password || null,
                user.must_change_password || true,
                user.two_factor_enabled || false,
                user.phone || null,
                user.permissions || [],
                user.allowed_terminals || [],
                user.email
            ]);
        } else {
            // Insert new user
            await pool.query(`
                INSERT INTO merchant_users (
                    merchant_id, merchant_code, merchant_name, email, full_name, role, status,
                    temp_password, must_change_password, two_factor_enabled, phone, permissions, allowed_terminals
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
                user.permissions || [],
                user.allowed_terminals || []
            ]);
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error('Sync merchant user error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});