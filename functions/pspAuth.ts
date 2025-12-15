import pg from 'npm:pg@8.11.3';

const { Pool } = pg;

const pool = new Pool({
    connectionString: Deno.env.get("DATABASE_URL"),
    ssl: { rejectUnauthorized: false }
});

Deno.serve(async (req) => {
    try {
        const { action, psp_code, email, password } = await req.json();

        if (action === 'verifyPSP') {
            console.log('Verifying PSP code:', psp_code);
            const result = await pool.query('SELECT * FROM psp_settings WHERE UPPER(psp_code) = UPPER($1) LIMIT 1', [psp_code]);
            console.log('Query result:', result.rows);
            
            const psp = result.rows[0];
            
            return Response.json({
                success: !!psp,
                psp: psp ? {
                    id: psp.id,
                    psp_code: psp.psp_code,
                    psp_name: psp.psp_name,
                    branding: psp.branding
                } : null,
                error: !psp ? 'Invalid PSP code' : null
            });
        }

        if (action === 'verifyEmail') {
            const result = await pool.query(`
                SELECT id, email, full_name, role, status, psp_code
                FROM app_users 
                WHERE email = $1 AND UPPER(COALESCE(psp_code, '')) = UPPER($2)
                LIMIT 1
            `, [email, psp_code]);
            
            const user = result.rows[0];
            
            if (!user) {
                return Response.json({
                    success: false,
                    error: 'No account found with this email for this PSP'
                });
            }

            if (user.status !== 'active') {
                return Response.json({
                    success: false,
                    error: 'Account is not active'
                });
            }

            return Response.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    psp_code: user.psp_code
                }
            });
        }

        if (action === 'login') {
            const result = await pool.query(`
                SELECT id, email, full_name, role, status, password_hash, psp_code
                FROM app_users 
                WHERE email = $1 AND UPPER(COALESCE(psp_code, '')) = UPPER($2)
                LIMIT 1
            `, [email, psp_code]);

            const user = result.rows[0];

            if (!user || user.status !== 'active') {
                return Response.json({
                    success: false,
                    error: 'Invalid credentials'
                });
            }

            // For demo: accept any password (in production, verify password_hash)
            return Response.json({
                success: true,
                session: {
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    user_id: user.id,
                    psp_code: user.psp_code,
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
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});