import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
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
        const { action, email, password, user_id, new_password } = body;

        if (action === 'login') {
            console.log('VT Login attempt for:', email);
            
            const result = await pool.query(`
                SELECT id, terminal_id, merchant_id, email, full_name, role, status,
                       temp_password, must_change_password, last_login, permissions
                FROM virtual_terminal_users 
                WHERE email = $1 AND status = 'active'
            `, [email]);

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

            if (user.temp_password !== password) {
                console.log('Password mismatch');
                return Response.json({ 
                    success: false, 
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            await pool.query('UPDATE virtual_terminal_users SET last_login = NOW() WHERE id = $1', [user.id]);

            const session = {
                user_id: user.id,
                terminal_id: user.terminal_id,
                merchant_id: user.merchant_id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                permissions: user.permissions,
                must_change_password: user.must_change_password,
                timestamp: Date.now()
            };

            return Response.json({
                success: true,
                session,
                must_change_password: user.must_change_password
            });
        }

        if (action === 'validate') {
            const { email: session_email } = body;
            const result = await pool.query(`
                SELECT id, terminal_id, merchant_id, email, full_name, role, status, permissions, must_change_password
                FROM virtual_terminal_users 
                WHERE email = $1 AND status = 'active'
            `, [session_email || user_id]);

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
            await pool.query(`
                UPDATE virtual_terminal_users 
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
        console.error('VT auth error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
});