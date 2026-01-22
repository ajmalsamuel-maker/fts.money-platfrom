import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

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
    const client = await pool.connect();
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'login') {
            if (!psp_code || !email || !password) {
                return Response.json({
                    success: false,
                    error: 'PSP code, email, and password required'
                }, { status: 400 });
            }

            // Set search path to the PSP's isolated schema
            const schemaName = `psp_${psp_code.toLowerCase().replace(/-/g, '_')}`;
            
            // Check if schema exists
            const schemaCheck = await client.query(
                `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
                [schemaName]
            );
            
            if (schemaCheck.rows.length === 0) {
                return Response.json({
                    success: false,
                    error: `PSP ${psp_code} not found`
                }, { status: 404 });
            }

            // Set schema and query psp_staff_users from isolated schema
            await client.query(`SET search_path TO "${schemaName}"`);
            
            const result = await client.query(
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
            await client.query(
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
                    schema: schemaName,
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
        client.release();
    }
});