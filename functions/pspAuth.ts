import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

async function hashPassword(password, salt = 'fts_salt_2025') {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function verifyPassword(password, hash, salt = 'fts_salt_2025') {
    const computed = await hashPassword(password, salt);
    return computed === hash;
}

function getClientIP(req) {
    return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
           req.headers.get('x-real-ip') || 
           'unknown';
}

Deno.serve(async (req) => {
    let client = null;
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'login') {
            if (!psp_code || !email || !password) {
                return Response.json({
                    success: false,
                    error: 'PSP code, email, and password required'
                }, { status: 400 });
            }

            client = new Client(Deno.env.get('DATABASE_URL'));
            await client.connect();

            // Query psp_staff_users
            const result = await client.queryObject(
                'SELECT * FROM psp_staff_users WHERE email = $1 AND status = $2',
                [email, 'active']
            );

            if (result.rows.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            const user = result.rows[0];
            const isValid = await verifyPassword(password, user.password_hash);
            
            if (!isValid) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            // Update last login
            await client.queryObject(
                'UPDATE psp_staff_users SET last_login = NOW(), last_login_ip = $1 WHERE id = $2',
                [getClientIP(req), user.id]
            );

            return Response.json({
                success: true,
                session: {
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    user_id: user.id,
                    psp_code: psp_code.toUpperCase(),
                    timestamp: Date.now(),
                    expires: Date.now() + (24 * 60 * 60 * 1000)
                },
                two_factor_enabled: false
            });
        }

        return Response.json({
            success: false,
            error: 'Invalid action'
        }, { status: 400 });

    } catch (error) {
        console.error('PSP auth error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    } finally {
        if (client) {
            await client.end();
        }
    }
});