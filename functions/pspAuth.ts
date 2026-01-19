import postgres from 'npm:postgres@3.4.4';

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
    let sql = null;
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'login') {
            if (!psp_code || !email || !password) {
                return Response.json({
                    success: false,
                    error: 'PSP code, email, and password required'
                }, { status: 400 });
            }

            sql = postgres(Deno.env.get('DATABASE_URL'), { ssl: 'require' });

            // Query psp_staff_users
            const result = await sql`
                SELECT * FROM psp_staff_users 
                WHERE psp_code = ${psp_code.toUpperCase()} 
                AND email = ${email} 
                AND status = ${'active'}
            `;

            if (result.length === 0) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            const user = result[0];
            const isValid = await verifyPassword(password, user.password_hash);
            
            if (!isValid) {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                }, { status: 401 });
            }

            // Update last login
            await sql`
                UPDATE psp_staff_users 
                SET last_login = NOW(), last_login_ip = ${getClientIP(req)} 
                WHERE id = ${user.id}
            `;

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
        if (sql) {
            await sql.end();
        }
    }
});