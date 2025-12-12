import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

// Public endpoint - no authentication required
Deno.serve(async (req) => {
    // Set CORS headers for public access
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    }

    try {
        const body = await req.json();
        const { action, email, password, user_id, new_password, merchant_code } = body;

        if (action === 'login') {
            console.log('Login attempt for:', email, 'with merchant code:', merchant_code);
            
            // Query PostgreSQL for merchant user directly
            const result = await pool.query(`
                SELECT id, merchant_id, merchant_code, merchant_name, email, full_name, role, status, 
                       temp_password, password_hash, must_change_password, two_factor_enabled, last_login, last_login_ip,
                       permissions, allowed_terminals, phone
                FROM merchant_users 
                WHERE email = $1 AND merchant_code = $2 AND status = 'active'
            `, [email, merchant_code]);

            console.log('DB Query result:', result.rows.length, 'rows');

            if (!result.rows || result.rows.length === 0) {
                console.log('User not found in database');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            const user = result.rows[0];
            console.log('User found:', user.email);

            // Check password - try both temp_password and password_hash
            const storedPassword = user.temp_password || user.password_hash;
            if (storedPassword !== password) {
                console.log('Password mismatch');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            // Get client IP address
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                       req.headers.get('x-real-ip') || 
                       'unknown';

            // Update last login with IP
            await pool.query(
                'UPDATE merchant_users SET last_login = NOW(), last_login_ip = $1 WHERE id = $2', 
                [ip, user.id]
            );

            // Create session token
            const session = {
                user_id: user.id,
                merchant_id: user.merchant_id,
                merchant_code: user.merchant_code,
                merchant_name: user.merchant_name,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                permissions: user.permissions,
                must_change_password: user.must_change_password,
                two_factor_enabled: user.two_factor_enabled,
                timestamp: Date.now()
            };

            return Response.json({
                success: true,
                session,
                must_change_password: user.must_change_password
            });
        }

        if (action === 'validate') {
            // Validate session by email and merchant_code
            const { email: session_email, merchant_code: session_merchant_code } = body;
            const result = await pool.query(`
                SELECT id, merchant_id, merchant_code, merchant_name, email, full_name, role, status,
                       permissions, must_change_password
                FROM merchant_users 
                WHERE email = $1 AND merchant_code = $2 AND status = 'active'
            `, [session_email || user_id, session_merchant_code]);

            if (!result.rows || result.rows.length === 0) {
                return Response.json({ 
                    success: false, 
                    error: 'Session expired' 
                }, { status: 401 });
            }

            return Response.json({
                success: true,
                user: result.rows[0]
            });
        }

        if (action === 'change_password') {
            // Update password and clear must_change_password flag
            await pool.query(`
                UPDATE merchant_users 
                SET temp_password = $1, must_change_password = false 
                WHERE id = $2
            `, [new_password, user_id]);

            return Response.json({ success: true });
        }

        return Response.json({ 
            success: false, 
            error: 'Invalid action' 
        }, { status: 400 });

    } catch (error) {
        console.error('Merchant auth error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});